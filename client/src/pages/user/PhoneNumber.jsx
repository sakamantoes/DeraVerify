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
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
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

  const fetchServices = async () => {
    try {
      setLoadingCatalog(true);
      setCatalogError("");

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
      setCatalogError(err?.response?.data?.message || "Failed to load services");
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

  // The service dropdown's own options come from an unfiltered, always-full
  // aggregate returned alongside the (filtered) route list — so the dropdown
  // never empties itself out based on the current search/service filter.
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

  const totalPages = Math.max(Number(pagination.totalPages || 1), 1);
  const totalListings = Number(pagination.total || 0);
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = totalListings === 0 ? 0 : (visiblePage - 1) * ROUTES_PER_PAGE;

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

  // Contextual stats — kept as compact inline chips rather than full stat
  // cards, since they're supporting context for the workspace below, not
  // primary actions in their own right.
  const statChips = [
    {
      label: "services",
      value: serviceOptions.length,
      icon: Server,
      iconBg: "bg-gold/15",
      iconColor: "text-gold",
    },
    {
      label: "countries live",
      value: activeCountries,
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
    },
    {
      label: "from",
      value: lowestPrice === null ? "N/A" : formatCurrency(lowestPrice),
      icon: CreditCard,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
  ];

  const hasActiveFilter = Boolean(selectedService || searchTerm.trim());

  const clearFilters = () => {
    setSelectedService("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
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
      {/* Compact hero — one line, one CTA */}
      <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gold-950/40 via-black to-black px-4 py-4 shadow-md sm:rounded-2xl sm:px-6 sm:py-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold-dark/10 blur-3xl sm:h-56 sm:w-56" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/40 bg-gold-light/10 px-3 py-1 text-[10px] font-semibold text-gold-light sm:text-xs">
              <Smartphone size={12} />
              Virtual Numbers
            </div>
            <h1 className="mt-2 text-lg font-bold leading-tight tracking-tight text-white sm:text-xl md:text-2xl">
              Buy a live number, then request your OTP.
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-gray-400 sm:text-sm">
              Filter the routes below, pick one, and purchase — the cost comes
              straight out of your wallet balance.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/f/fund-account", {
                state: { from: "/f/numbers" },
              })
            }
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold-dark px-5 text-sm font-semibold text-white shadow-lg shadow-gold-light/20 transition-transform hover:scale-[1.02] active:scale-95 sm:h-11"
          >
            <Wallet size={16} />
            Fund Wallet
          </button>
        </div>
      </section>

      {/* Contextual stat chips — supporting info, not primary actions */}
      <div className="flex flex-wrap items-center gap-2">
        {statChips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-xs shadow-md"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${chip.iconBg} ${chip.iconColor}`}
            >
              <chip.icon size={12} />
            </span>
            <span className="font-semibold text-white">{chip.value}</span>
            <span className="text-gray-500">{chip.label}</span>
          </span>
        ))}
      </div>

      {/* Unified workspace — one container, toolbar drives the grid,
          the grid feeds the purchase sidebar. */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-black/20 px-4 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Buy a Number
            </h2>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Filter live routes, pick one from the list, then confirm on the
              right.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedService}
              onChange={handleServiceChange}
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-4 text-sm text-white transition-all focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50 sm:w-56"
            >
              <option value="">All services</option>
              {serviceOptions.map((service) => (
                <option key={service.code} value={service.code}>
                  {service.name} - {service.countries} countries
                </option>
              ))}
            </select>

            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search country or provider"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                void fetchServices();
              }}
              disabled={loadingCatalog}
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
            {loadingCatalog ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-gold-light" />
              </div>
            ) : totalListings === 0 ? (
              hasActiveFilter ? (
                <EmptyState
                  icon={Search}
                  title="No routes match your filters"
                  description="No live routes for this service or search term. Try a different service or clear your filters."
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
            <WalletBalanceCard />

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
