import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import WalletBalanceCard from "../../components/WalletBalanceCard.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { buyNumber, getAvailableServices } from "../../service/number.js";
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

  const [catalog, setCatalog] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedListingId, setSelectedListingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [buying, setBuying] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceSummaries, setServiceSummaries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ROUTES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  const fetchServices = async () => {
    try {
      setLoadingCatalog(true);
      setError("");

      const response = await getAvailableServices({
        page: currentPage,
        limit: ROUTES_PER_PAGE,
        service: selectedService || undefined,
        search: searchTerm.trim() || undefined,
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
      setError(err?.response?.data?.message || "Failed to load services");
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchServices();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentPage, searchTerm, selectedService]);

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

  const filteredListings = catalog;
  const totalPages = Math.max(Number(pagination.totalPages || 1), 1);
  const totalListings = Number(pagination.total || 0);
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = totalListings === 0 ? 0 : (visiblePage - 1) * ROUTES_PER_PAGE;
  const paginatedListings = filteredListings;

  const selectedListing = useMemo(
    () => catalog.find((item) => item.id === selectedListingId),
    [catalog, selectedListingId],
  );

  const lowestPrice = catalog.reduce(
    (lowest, item) =>
      lowest === null || item.price < lowest ? item.price : lowest,
    null,
  );

  const liveListings = catalog.filter((item) => item.availabilityScore > 0).length;
  const activeCountries = new Set(catalog.map((item) => item.country)).size;

  const stats = [
    {
      label: "Available Services",
      value: serviceOptions.length,
      change: "Admin listed",
      icon: Server,
      iconBg: "bg-red/15",
      iconColor: "text-red",
    },
    {
      label: "Active Countries",
      value: activeCountries,
      change: `${liveListings} live listings`,
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      changeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Starting Price",
      value: lowestPrice === null ? "N/A" : formatCurrency(lowestPrice),
      change: "Live pricing",
      icon: CreditCard,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
  ];

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
    setSelectedListingId("");
    setCurrentPage(1);
  };

  const handleBuyNumber = async () => {
    if (!selectedListing) {
      setError("Please choose one available service and country");
      return;
    }

    try {
      setError("");
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
      };

      setPurchaseData(nextPurchaseData);
      toast.success(response?.message || "Number purchased successfully");
    } catch (err) {
      console.error("Failed to purchase number:", err);
      setError(err?.response?.data?.message || "Failed to purchase number");
    } finally {
      setBuying(false);
    }
  };

  const handleCopy = async (value, fallbackMessage) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError(fallbackMessage);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-light">
              <Smartphone size={13} />
              Virtual Numbers
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Buy from live admin-listed numbers
              <br className="hidden sm:block" /> then request OTP from your
              inbox.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Pick a service, choose an available country from the current
              routes, and purchase the number. After purchase, proceed to your
              OTP Box to see the purchased number and request your OTP when you
              are ready.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/f/fund-account", {
                state: { from: "/f/phone-number" },
              })
            }
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-700"
          >
            <Wallet size={16} />
            Fund Wallet
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <WalletBalanceCard />

          <section className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Purchase Setup
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Countries come from the live service list.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void fetchServices();
                }}
                disabled={loadingCatalog}
                className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Refresh available services"
              >
                <RefreshCw
                  size={16}
                  className={loadingCatalog ? "animate-spin" : ""}
                />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">
                  Service
                </span>
                <select
                  value={selectedService}
                  onChange={handleServiceChange}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-4 text-sm text-white transition-all focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                >
                  <option value="">All services</option>
                  {serviceOptions.map((service) => (
                    <option key={service.code} value={service.code}>
                      {service.name} - {service.countries} countries
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">
                  Search country or provider
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search available routes"
                    className="h-11 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                  />
                </div>
              </label>
            </div>

            {selectedListing && (
              <div className="mt-5 rounded-lg border border-red-light/10 bg-red-light/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Selected Number Route
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
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-light/20 bg-red-light/10 p-3 text-sm text-red-light">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleBuyNumber}
              disabled={buying || !selectedListing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-dark py-3 text-sm font-semibold text-white transition-all hover:bg-red-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

            <p className="mt-4 text-center text-[11px] text-gray-600">
              After purchase, go to OTP Box to see your number and request the
              OTP when you are ready to use it.
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/5 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Available Routes</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {totalListings} result
                  {totalListings === 1 ? "" : "s"}
                </p>
              </div>
              {loadingCatalog && (
                <Loader2 size={18} className="animate-spin text-red-light" />
              )}
            </div>

            {loadingCatalog ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-red-light" />
              </div>
            ) : totalListings === 0 ? (
              <div className="px-5 py-14 text-center">
                <Server size={42} className="mx-auto text-gray-600" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  No matching routes
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try another service or clear the search field.
                </p>
              </div>
            ) : (
              <div className="max-h-[30rem] overflow-y-auto p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {paginatedListings.map((item) => {
                    const isSelected = item.id === selectedListingId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedListingId(item.id)}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-red-light/50 bg-red-light/10"
                            : "border-white/10 bg-black/20 hover:border-red-light/30 hover:bg-white/8"
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
                              className="shrink-0 text-red-light"
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
                <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing {pageStart + 1}-
                    {Math.min(pageStart + ROUTES_PER_PAGE, totalListings)} of{" "}
                    {totalListings}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={visiblePage === 1}
                      className="h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white">
                      Page {visiblePage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(page + 1, totalPages))
                      }
                      disabled={visiblePage === totalPages}
                      className="h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-md">
            {purchaseData ? (
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">
                        Number Purchased
                      </h2>
                      <p className="text-xs text-gray-500">
                        {purchaseData.status || "Waiting for SMS"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/f/otp-box")}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-light/20 bg-red-light/10 px-3 text-xs font-semibold text-red-300 transition-colors hover:bg-red-light/20 hover:text-white"
                  >
                    Request OTP
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Phone Number
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="break-all font-mono text-lg font-bold text-white">
                        {purchaseData.phone}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            purchaseData.phone,
                            "Failed to copy phone number",
                          )
                        }
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Copy phone number"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Cost
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {formatCurrency(purchaseData.cost)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Provider
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {"smswinner"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Country
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {selectedListing?.countryName || purchaseData.country}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-red-light/20 bg-black/30 p-5 text-center">
                  <CheckCircle2
                    size={32}
                    className="mx-auto text-emerald-400"
                  />
                  <h3 className="mt-3 font-semibold text-white">
                    Purchase successful
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                    Go to your OTP Box to see this purchased number, then click
                    Get OTP when you are ready to request the code.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/f/otp-box")}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-light"
                  >
                    Open OTP Box
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  <Smartphone size={28} className="text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  No Active Session
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                  Select a listed service and country, then buy a number to
                  start receiving OTP codes.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
                  <CreditCard size={12} />
                  <span>Cost is deducted from wallet balance</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumber;
