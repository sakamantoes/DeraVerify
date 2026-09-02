import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
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
import Pagination from "../../components/ui/Pagination.jsx";
import useWallet from "../../hooks/useWallet.js";
import {
  buyNumber,
  getAvailableCountries,
  getAvailableServices,
} from "../../service/number.js";
import { formatCurrency } from "../../utils/transaction.js";
import { toast } from "react-toastify";
import { formatServiceName } from "../../utils/serviceCode.js";
import { getNumberAvailabilityInfo } from "../../utils/availability.js";

const ROUTES_PER_PAGE = 12;

const normalizeCatalog = (response) => {
  const services = Array.isArray(response?.data) ? response.data : [];

  return services
    .filter(
      (item) =>
        (item?.internalService || item?.service) &&
        (item?.internalCountry || item?.country),
    )
    .map((item) => {
      const availability = getNumberAvailabilityInfo(item);
      const serviceCode = item.internalService || item.service;
      const countryCode = item.internalCountry || item.country;

      return {
        id: item._id || `${item.provider}-${countryCode}-${serviceCode}`,
        service: serviceCode,
        serviceName: formatServiceName(serviceCode),
        country: countryCode,
        countryName: countryCode,
        provider: item.provider || "smswinner",
        providerLabel: "smswinner",
        stock: Number(item.stock || 0),
        availability: Boolean(item.availability),
        availabilityLabel: availability.label,
        availabilityDetail: availability.detail,
        availabilityScore: availability.score,
        availabilityClassName: availability.className,
        price: Number(item.sellingPrice || 0),
        updatedAt: item.lastFetchedAt || item.updatedAt,
      };
    })
    .sort((a, b) => {
      const serviceSort = a.serviceName.localeCompare(b.serviceName);
      if (serviceSort !== 0) return serviceSort;
      return a.countryName.localeCompare(b.countryName);
    });
};

const PhoneNumber = () => {
  const navigate = useNavigate();
  const { balance, isLoading: isWalletLoading, isError: isWalletError } = useWallet();
  const [showBalance, setShowBalance] = useState(false);

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  // Mobile-only: the country/service pickers are two separate panels on
  // desktop but collapse into a single tab-switched panel on small screens.
  const [mobilePanel, setMobilePanel] = useState("country");
  const [catalog, setCatalog] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedListingId, setSelectedListingId] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [buying, setBuying] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  // Two distinct error channels: a catalog/fetch error belongs to the
  // toolbar+grid side, a purchase error belongs to the buy action — they
  // used to share one banner shown in the wrong place.
  const [catalogError, setCatalogError] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceSummaries, setServiceSummaries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ROUTES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

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

  const fetchServices = async () => {
    if (!selectedCountry) return;

    try {
      setLoadingCatalog(true);
      setCatalogError("");

      const response = await getAvailableServices({
        page: currentPage,
        limit: ROUTES_PER_PAGE,
        country: selectedCountry,
        service: selectedService || undefined,
      });
      const nextCatalog = normalizeCatalog(response);
      setCatalog(nextCatalog);
      setServiceSummaries(
        Array.isArray(response?.services) ? response.services : [],
      );
      setPagination(
        response?.pagination || {
          page: currentPage,
          limit: ROUTES_PER_PAGE,
          total: nextCatalog.length,
          totalPages: 1,
        },
      );

      if (!nextCatalog.length) {
        setSelectedListingId("");
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setCatalogError(err?.response?.data?.message || "Failed to load services");
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Gated behind selectedCountry: nothing is fetched, and the service
  // dropdown stays empty, until a country has been chosen.
  useEffect(() => {
    if (!selectedCountry) {
      setCatalog([]);
      setServiceSummaries([]);
      setPagination({ page: 1, limit: ROUTES_PER_PAGE, total: 0, totalPages: 1 });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchServices();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, currentPage, selectedService]);

  // The service dropdown's own options come from an unfiltered (aside from
  // the selected country), always-full aggregate returned alongside the
  // route list — so the dropdown never empties itself out based on the
  // current search/service filter, only based on which country is picked.
  const serviceOptions = useMemo(() => {
    if (serviceSummaries.length > 0) {
      return serviceSummaries
        .map((item) => ({
          code: item.internalService,
          name: formatServiceName(item.internalService),
          stock: Number(item.liveRoutes || item.totalStock || 0),
          countries: Number(item.totalCountries || 0),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const services = new Map();
    catalog.forEach((item) => {
      if (!services.has(item.service)) {
        services.set(item.service, {
          code: item.service,
          name: item.serviceName,
          stock: 0,
          countries: new Set(),
        });
      }

      const service = services.get(item.service);
      service.stock += item.availabilityScore;
      service.countries.add(item.country);
    });

    return Array.from(services.values()).map((item) => ({
      ...item,
      countries: item.countries.size,
    }));
  }, [catalog, serviceSummaries]);

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

  const totalPages = Math.max(Number(pagination.totalPages || 1), 1);
  const totalListings = Number(pagination.total || 0);
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = totalListings === 0 ? 0 : (visiblePage - 1) * ROUTES_PER_PAGE;

  const selectedListing = useMemo(
    () => catalog.find((item) => item.id === selectedListingId),
    [catalog, selectedListingId],
  );

  // Lowest/highest price among the routes currently shown on this page —
  // a read-out, not a sort control.
  const priceRange = useMemo(() => {
    if (catalog.length === 0) return null;

    return catalog.reduce(
      (range, item) => ({
        lowest: Math.min(range.lowest, item.price),
        highest: Math.max(range.highest, item.price),
      }),
      { lowest: catalog[0].price, highest: catalog[0].price },
    );
  }, [catalog]);

  const hasActiveFilter = Boolean(selectedService);

  const clearFilters = () => {
    setSelectedService("");
    setCurrentPage(1);
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry((current) => (current === countryCode ? current : countryCode));
    setSelectedService("");
    setSearchTerm("");
    setServiceQuery("");
    setSelectedListingId("");
    setCurrentPage(1);
    setMobilePanel("service");
  };

  const handleServiceSelect = (code) => {
    setSelectedService(code);
    setSelectedListingId("");
    setCurrentPage(1);
  };

  const handleBuyNumber = async () => {
    if (!selectedListing) {
      setPurchaseError("Please choose one available service and country");
      return;
    }

    try {
      setPurchaseError("");
      setBuying(true);
      setPurchaseData(null);

      const response = await buyNumber({
        country: selectedListing.country,
        service: selectedListing.service,
        id: selectedListing.id,
      });

      const otpOrder = response?.data?.otpOrder || response?.data;
      const nextPurchaseData = {
        ...otpOrder,
        orderId: otpOrder?._id,
        phone: otpOrder?.phoneNumber,
        cost: otpOrder?.sellingPrice,
        country: selectedListing.countryName,
      };

      setPurchaseData(nextPurchaseData);
      toast.success(response?.message || "Number purchased successfully");
    } catch (err) {
      console.error("Failed to purchase number:", err);
      setPurchaseError(err?.response?.data?.message || "Failed to purchase number");
    } finally {
      setBuying(false);
    }
  };

  const handleCopy = async (value, successMessage) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleBuyAnother = () => {
    setPurchaseData(null);
    setPurchaseError("");
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
              aria-label={showBalance ? "Hide wallet balance" : "Show wallet balance"}
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

      {/* Unified workspace — one container, toolbar drives the grid,
          the grid feeds the purchase sidebar. */}
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

              <div className="max-h-72 overflow-y-auto px-2 pb-2">
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
                        onClick={() => handleCountrySelect(item.internalCountry)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-gold-light/15 text-white"
                            : "text-gray-300 hover:bg-white/5"
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

            {/* Service panel — gated behind selectedCountry */}
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
                <span className="shrink-0 rounded-full border border-gold-light/20 bg-gold-light/10 px-2.5 py-0.5 text-[11px] font-medium text-gold-light">
                  {serviceOptions.length} Services
                </span>
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
                    Please select a country to see the services available
                    there.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                      <input
                        value={serviceQuery}
                        onChange={(event) => setServiceQuery(event.target.value)}
                        placeholder="Find a service"
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto px-2 pb-2">
                    {loadingCatalog ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading services...
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleServiceSelect("")}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            selectedService === ""
                              ? "bg-gold-light/15 text-white"
                              : "text-gray-300 hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              selectedService === ""
                                ? "bg-gold-light/20 text-gold-light"
                                : "bg-white/5 text-gray-500"
                            }`}
                          >
                            <LayoutGrid size={14} />
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            All services
                          </span>
                          {selectedService === "" && (
                            <CheckCircle2
                              size={16}
                              className="shrink-0 text-gold-light"
                            />
                          )}
                        </button>

                        {filteredServiceOptions.length === 0 ? (
                          <p className="px-2 py-8 text-center text-sm text-gray-500">
                            No services match your search.
                          </p>
                        ) : (
                          filteredServiceOptions.map((service) => {
                            const isSelected = service.code === selectedService;

                            return (
                              <button
                                key={service.code}
                                type="button"
                                onClick={() => handleServiceSelect(service.code)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "bg-gold-light/15 text-white"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                    isSelected
                                      ? "bg-gold-light/20 text-gold-light"
                                      : "bg-white/5 text-gray-500"
                                  }`}
                                >
                                  <Server size={14} />
                                </span>
                                <span className="min-w-0 flex-1 truncate font-medium">
                                  {service.name}
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
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-white/10 bg-black/20 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-sm font-semibold text-white">Available Routes</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {priceRange && (
              <div className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-4 text-sm">
                <span className="text-gray-500">Lowest</span>
                <span className="font-semibold text-white">
                  {formatCurrency(priceRange.lowest)}
                </span>
                <span className="text-gray-700">—</span>
                <span className="text-gray-500">Highest</span>
                <span className="font-semibold text-white">
                  {formatCurrency(priceRange.highest)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void fetchServices();
              }}
              disabled={loadingCatalog || !selectedCountry}
              className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
              aria-label="Refresh available services"
            >
              <RefreshCw
                size={16}
                className={loadingCatalog ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {catalogError && (
          <div className="flex items-start gap-2 border-b border-gold-light/20 bg-gold-light/10 px-4 py-3 text-sm text-gold-light sm:px-5">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{catalogError}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px]">
          {/* Routes grid — output of the toolbar filters, input to the
              purchase sidebar. */}
          <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r sm:p-5">
            {!selectedCountry ? (
              <EmptyState
                icon={Globe}
                title="Pick a country to begin"
                description="Choose a country above to see the services and routes available there."
              />
            ) : loadingCatalog ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-gold-light" />
              </div>
            ) : totalListings === 0 ? (
              hasActiveFilter ? (
                <EmptyState
                  icon={Search}
                  title="No routes match your filters"
                  description="No live routes for this service. Try a different service or clear your filters."
                  actionLabel="Clear filters"
                  onAction={clearFilters}
                />
              ) : (
                <EmptyState
                  icon={Server}
                  title="No routes available right now"
                  description="The admin hasn't listed any live routes yet. Check back soon."
                  actionLabel="Refresh"
                  onAction={() => void fetchServices()}
                />
              )
            ) : (
              <>
                <p className="mb-3 text-xs text-gray-500">
                  {totalListings} result{totalListings === 1 ? "" : "s"}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {catalog.map((item) => {
                    const isSelected = item.id === selectedListingId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedListingId(item.id)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-gold-light/50 bg-gold-light/10"
                            : "border-white/10 bg-black/20 hover:border-gold-light/30 hover:bg-white/8"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {item.countryName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.serviceName}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2
                              size={18}
                              className="shrink-0 text-gold-light"
                            />
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.availabilityClassName}`}
                          >
                            {item.availabilityLabel}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            {item.availabilityDetail}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-gray-500 sm:text-sm">
                    Showing {pageStart + 1}-
                    {Math.min(pageStart + ROUTES_PER_PAGE, totalListings)} of{" "}
                    {totalListings}
                  </span>
                  <Pagination
                    page={visiblePage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>

          {/* Purchase sidebar — downstream of the grid selection. */}
          <div className="space-y-4 p-4 sm:p-5">
            {purchaseData ? (
              <div className="rounded-xl border border-gold-light/20 bg-black/30 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      Number Purchased
                    </h3>
                    <p className="text-xs text-gray-500">
                      {purchaseData.status || "Waiting for SMS"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Phone Number
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="break-all font-mono text-base font-bold text-white">
                        {purchaseData.phone}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(purchaseData.phone, "Phone number copied")
                        }
                        className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Copy phone number"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Cost
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {formatCurrency(purchaseData.cost)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Country
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-white">
                        {purchaseData.country}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/f/otp-box")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold-dark py-3 text-sm font-semibold text-white shadow-lg shadow-gold-light/20 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Open OTP Box
                </button>
                <button
                  type="button"
                  onClick={handleBuyAnother}
                  className="mt-2 w-full rounded-lg py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-white"
                >
                  Buy another number
                </button>
              </div>
            ) : selectedListing ? (
              <div className="rounded-xl border border-gold-light/10 bg-gold-light/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Selected Route
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Service</span>
                    <span className="text-right font-medium text-white">
                      {selectedListing.serviceName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Country</span>
                    <span className="text-right font-medium text-white">
                      {selectedListing.countryName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Price</span>
                    <span className="text-right font-semibold text-white">
                      {formatCurrency(selectedListing.price)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Availability</span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-right text-xs font-semibold ${selectedListing.availabilityClassName}`}
                    >
                      {selectedListing.availabilityLabel}
                    </span>
                  </div>
                </div>

                {purchaseError && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-gold-light/20 bg-gold-light/10 p-3 text-sm text-gold-light">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{purchaseError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBuyNumber}
                  disabled={buying}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold-dark py-3 text-sm font-semibold text-white shadow-lg shadow-gold-light/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {buying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Smartphone size={18} />
                      Buy Number
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-gray-600">
                  After purchase, go to OTP Box to request the code when
                  you're ready.
                </p>
              </div>
            ) : (
              <EmptyState
                icon={Smartphone}
                title="Pick a route to begin"
                description="Select an available route from the list to see pricing and purchase it."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhoneNumber;
