import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Search,
  Server,
  Smartphone,
  Wallet,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState.jsx";
import useWallet from "../../hooks/useWallet.js";
import {
  buyNumber,
  getAvailableCountries,
  getAvailableServices,
} from "../../service/number.js";
import { formatCurrency } from "../../utils/transaction.js";
import { toast } from "react-toastify";
import { formatServiceName } from "../../utils/serviceCode.js";

const PhoneNumber = () => {
  const navigate = useNavigate();
  const {
    balance,
    isLoading: isWalletLoading,
    isError: isWalletError,
  } = useWallet();
  const [showBalance, setShowBalance] = useState(false);

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  // Mobile-only: the country/service pickers are two separate panels on
  // desktop but collapse into a single tab-switched panel on small screens.
  const [mobilePanel, setMobilePanel] = useState("country");
  const [serviceSummaries, setServiceSummaries] = useState([]);
  // Which service row has its Buy button pinned open — hover does this on
  // desktop for free, this state is the tap-to-reveal fallback for touch.
  const [revealedService, setRevealedService] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);
  const [buyingService, setBuyingService] = useState("");
  const [servicesError, setServicesError] = useState("");

  // The country list is fetched once, independent of any selection — it's
  // the first, required step: pick a country, THEN services in that
  // country become visible.
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);

      const response = await getAvailableCountries();
      setCountries(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => {
    void fetchCountries();
  }, []);

  // One service listing (the admin-flagged isVisible one) per service in
  // this country — its price is what the user buys at, no separate
  // route-picking step.
  const fetchServices = async () => {
    if (!selectedCountry) return;

    try {
      setLoadingServices(true);
      setServicesError("");

      const response = await getAvailableServices({ country: selectedCountry });
      setServiceSummaries(
        Array.isArray(response?.services) ? response.services : [],
      );
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServicesError(
        err?.response?.data?.message || "Failed to load services",
      );
    } finally {
      setLoadingServices(false);
    }
  };

  // Gated behind selectedCountry: nothing is fetched, and the service list
  // stays empty, until a country has been chosen.
  useEffect(() => {
    if (!selectedCountry) {
      setServiceSummaries([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchServices();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const serviceOptions = useMemo(
    () =>
      serviceSummaries
        .map((item) => ({
          code: item.internalService,
          name: formatServiceName(item.internalService),
          price: item.sellingPrice != null ? Number(item.sellingPrice) : null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [serviceSummaries],
  );

  // Both list panels filter purely client-side over the already-loaded
  // arrays — no network round trip for typing into "Find country"/"Find a
  // service".
  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((item) =>
      item.internalCountry.toLowerCase().includes(query),
    );
  }, [countries, countryQuery]);

  const filteredServiceOptions = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase();
    if (!query) return serviceOptions;
    return serviceOptions.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query),
    );
  }, [serviceOptions, serviceQuery]);

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry((current) =>
      current === countryCode ? current : countryCode,
    );
    setRevealedService("");
    setServiceQuery("");
    setMobilePanel("service");
  };

  const toggleRevealService = (code) => {
    setRevealedService((current) => (current === code ? "" : code));
  };

  const handleBuyNumber = async (serviceCode) => {
    if (!selectedCountry || !serviceCode) return;

    try {
      setBuyingService(serviceCode);

      const response = await buyNumber({
        country: selectedCountry,
        service: serviceCode,
      });

      const otpOrder = response?.data?.otpOrder || response?.data;
      toast.success(response?.message || "Number purchased successfully");
      navigate("/f/otp-box", {
        state: { orderId: otpOrder?._id },
      });
    } catch (err) {
      console.error("Failed to purchase number:", err);
      toast.error(err?.response?.data?.message || "Failed to purchase number");
    } finally {
      setBuyingService("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
      {/* Slim header strip — wallet balance + one action, no decoration */}
      <section className="flex items-center justify-end gap-4 rounded-xl  bg-black/30 px-4 py-3 shadow-md sm:px-5">
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 sm:flex">
            <Wallet size={14} className="text-gold-light" />
            <span className="text-xs font-semibold text-white sm:text-sm">
              {isWalletLoading
                ? "..."
                : isWalletError
                  ? "N/A"
                  : showBalance
                    ? formatCurrency(balance)
                    : "NGN ******"}
            </span>
            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              className="text-gray-500 transition-colors hover:text-white"
              aria-label={
                showBalance ? "Hide wallet balance" : "Show wallet balance"
              }
            >
              {showBalance ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/f/fund-account", {
                state: { from: "/f/numbers" },
              })
            }
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark px-4 text-xs font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95 sm:h-10 sm:px-5 sm:text-sm"
          >
            <Wallet size={14} />
            Fund Wallet
          </button>
        </div>
      </section>

      {/* Unified workspace — pick a country, then a service, then buy. */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
        <div className="px-4 py-4 sm:px-5">
          {/* Mobile tab switcher — the two panels below collapse into one
              tab-switched view under the lg breakpoint. */}
          <div className="flex rounded-full border border-white/10 bg-black/30 p-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMobilePanel("country")}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                mobilePanel === "country"
                  ? "bg-gold-light text-ink"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Countries
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel("service")}
              disabled={!selectedCountry}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                mobilePanel === "service"
                  ? "bg-gold-light text-ink"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Services
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Country panel */}
            <div
              className={`overflow-hidden rounded-xl border border-white/10 bg-black/20 ${
                mobilePanel === "country" ? "block" : "hidden"
              } lg:block`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-gold-light" />
                  <h3 className="text-sm font-semibold text-white">
                    Select Country
                  </h3>
                </div>
                <span className="shrink-0 rounded-full border border-gold-light/20 bg-gold-light/10 px-2.5 py-0.5 text-[11px] font-medium text-gold-light">
                  {countries.length} Countries
                </span>
              </div>

              <div className="p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  <input
                    value={countryQuery}
                    onChange={(event) => setCountryQuery(event.target.value)}
                    placeholder="Find country"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
                  />
                </div>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                {loadingCountries ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Loading countries...
                  </div>
                ) : filteredCountries.length === 0 ? (
                  <p className="px-2 py-8 text-center text-sm text-gray-500">
                    No countries match your search.
                  </p>
                ) : (
                  filteredCountries.map((item) => {
                    const isSelected = item.internalCountry === selectedCountry;

                    return (
                      <button
                        key={item.internalCountry}
                        type="button"
                        onClick={() =>
                          handleCountrySelect(item.internalCountry)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-gold-light/40 bg-gold-light/10 text-white"
                            : "border-white/10 bg-black/20 text-gray-300 hover:border-gold-light/25 hover:bg-white/5"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            isSelected
                              ? "bg-gold-light/20 text-gold-light"
                              : "bg-white/5 text-gray-500"
                          }`}
                        >
                          <Globe size={14} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.internalCountry}
                        </span>
                        {isSelected && (
                          <CheckCircle2
                            size={16}
                            className="shrink-0 text-gold-light"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Service panel — gated behind selectedCountry, each row shows
                its resolved price so picking a service is the last step
                before buying. */}
            <div
              className={`overflow-hidden rounded-xl border border-white/10 bg-black/20 ${
                mobilePanel === "service" ? "block" : "hidden"
              } lg:block`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={15} className="text-gold-light" />
                  <h3 className="text-sm font-semibold text-white">
                    Select Service
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-gold-light/20 bg-gold-light/10 px-2.5 py-0.5 text-[11px] font-medium text-gold-light">
                    {serviceOptions.length} Services
                  </span>
                  {selectedCountry && (
                    <button
                      type="button"
                      onClick={() => void fetchServices()}
                      disabled={loadingServices}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Refresh available services"
                    >
                      <RefreshCw
                        size={12}
                        className={loadingServices ? "animate-spin" : ""}
                      />
                    </button>
                  )}
                </div>
              </div>

              {!selectedCountry ? (
                <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-600">
                    <Globe size={22} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">
                    Step 1: Select Country
                  </p>
                  <p className="mt-1 max-w-[220px] text-xs text-gray-500">
                    Please select a country to see the services available there.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                      <input
                        value={serviceQuery}
                        onChange={(event) =>
                          setServiceQuery(event.target.value)
                        }
                        placeholder="Find a service"
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
                      />
                    </div>
                  </div>

                  {servicesError && (
                    <div className="mx-3 mb-2 flex items-start gap-2 rounded-lg border border-gold-light/20 bg-gold-light/10 p-3 text-xs text-gold-light">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{servicesError}</span>
                    </div>
                  )}

                  <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                    {loadingServices ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading services...
                      </div>
                    ) : filteredServiceOptions.length === 0 ? (
                      <EmptyState
                        icon={Server}
                        title="No services available"
                        description="The admin hasn't made any services live for this country yet."
                      />
                    ) : (
                      filteredServiceOptions.map((service) => {
                        const isRevealed = revealedService === service.code;
                        const isBuying = buyingService === service.code;
                        const hasPrice = service.price != null;

                        return (
                          <div
                            key={service.code}
                            onClick={() => toggleRevealService(service.code)}
                            className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                              isRevealed
                                ? "border-gold-light/40 bg-gold-light/10 text-white"
                                : "border-white/10 bg-black/20 text-gray-300 hover:border-gold-light/25 hover:bg-white/5"
                            }`}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-gray-500 transition-colors group-hover:bg-gold-light/20 group-hover:text-gold-light">
                              <Server size={14} />
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-gray-300 group-hover:text-white">
                              {service.name}
                            </span>

                            {hasPrice && (
                              <span
                                className={`shrink-0 text-sm font-semibold text-white ${
                                  isRevealed
                                    ? "hidden"
                                    : "block group-hover:hidden"
                                }`}
                              >
                                {formatCurrency(service.price)}
                              </span>
                            )}

                            <button
                              type="button"
                              disabled={!hasPrice || isBuying}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleBuyNumber(service.code);
                              }}
                              className={`shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${
                                isRevealed ? "flex" : "hidden group-hover:flex"
                              }`}
                            >
                              {isBuying ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <>
                                  <Smartphone size={13} />
                                  Buy
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhoneNumber;
