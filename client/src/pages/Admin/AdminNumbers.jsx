import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  MapPin,
  Package,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getAdminServiceGroups,
  getPlatformServiceNames,
  updatePlatformServiceActiveStatus,
} from "../../service/admin.js";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";
import AdminPriceSetting from "../../components/AdminPriceSetting.jsx";
import ServiceGroupModal from "../../components/Admin/ServiceGroupModal.jsx";

const GROUPS_PER_PAGE = 25;

const normalizeGroups = (response) => {
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows
    .filter((item) => item?.internalService && item?.internalCountry)
    .map((item) => ({
      service: item.internalService,
      serviceName: formatServiceName(item.internalService),
      country: item.internalCountry,
      providerCount: Number(item.providerCount || 0),
      liveProviderCount: Number(item.liveProviderCount || 0),
      visibleListing: item.visibleListing
        ? {
            provider: item.visibleListing.provider || "Auto",
            providerPrice: Number(item.visibleListing.providerPrice || 0),
            sellingPrice: Number(item.visibleListing.sellingPrice || 0),
          }
        : null,
    }));
};

export default function AdminNumbers() {
  const [groups, setGroups] = useState([]);
  const [serviceNames, setServiceNames] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState("");
  const [updatingService, setUpdatingService] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeGroup, setActiveGroup] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: GROUPS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      setError("");

      const [response, namesResponse] = await Promise.all([
        getAdminServiceGroups({
          page: currentPage,
          limit: GROUPS_PER_PAGE,
          service: selectedService || undefined,
          search: searchTerm.trim() || undefined,
        }),
        getPlatformServiceNames(),
      ]);
      const nextGroups = normalizeGroups(response);
      setGroups(nextGroups);
      setPagination(
        response?.pagination || {
          page: currentPage,
          limit: GROUPS_PER_PAGE,
          total: nextGroups.length,
          totalPages: 1,
        },
      );
      setServiceNames(
        Array.isArray(namesResponse?.data) ? namesResponse.data : [],
      );
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError(err?.response?.data?.message || "Failed to load services");
    } finally {
      setLoadingGroups(false);
    }
  }, [currentPage, searchTerm, selectedService]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const serviceOptions = useMemo(() => {
    if (serviceNames.length > 0) {
      return serviceNames
        .map((item) => ({
          code: item.internalService,
          name: formatServiceName(item.internalService),
          stock: Number(item.totalStock || 0),
          countries: Number(item.totalCountries || 0),
          active: Boolean(item.active),
          totalListings: Number(item.totalListings || 0),
          activeCount: Number(item.activeCount || 0),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const summaries = new Map();

    groups.forEach((item) => {
      if (!summaries.has(item.service)) {
        summaries.set(item.service, { stock: 0, countries: new Set() });
      }

      const summary = summaries.get(item.service);
      summary.stock += item.liveProviderCount;
      summary.countries.add(item.country);
    });

    return Array.from(summaries.entries()).map(([service, item]) => ({
      code: service,
      name: formatServiceName(service),
      stock: item.stock,
      countries: item.countries.size,
      totalListings: 0,
      activeCount: 0,
      active: false,
    }));
  }, [groups, serviceNames]);

  const totalPages = Math.max(Number(pagination.totalPages || 1), 1);
  const totalGroups = Number(pagination.total || 0);
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = totalGroups === 0 ? 0 : (visiblePage - 1) * GROUPS_PER_PAGE;

  const selectedServiceLabel = selectedService
    ? serviceOptions.find((item) => item.code === selectedService)?.name ||
      formatServiceName(selectedService)
    : "All Services";

  const handleServiceToggle = async (service) => {
    const nextActive = !service.active;

    try {
      setUpdatingService(service.code);
      await updatePlatformServiceActiveStatus(service.code, nextActive);

      setServiceNames((prev) =>
        prev.map((item) =>
          item.internalService === service.code
            ? {
                ...item,
                active: nextActive,
                activeCount: nextActive ? item.totalListings : 0,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to update service status:", err);
      setError(err?.response?.data?.message || "Failed to update service");
    } finally {
      setUpdatingService("");
    }
  };

  const liveGroups = groups.filter((item) => item.liveProviderCount > 0).length;
  const activeCountries = new Set(groups.map((item) => item.country)).size;
  const totalServices = serviceOptions.length;
  const visiblePrices = groups
    .filter((item) => item.visibleListing)
    .map((item) => item.visibleListing.sellingPrice);
  const averagePrice =
    visiblePrices.length > 0
      ? visiblePrices.reduce((sum, price) => sum + price, 0) / visiblePrices.length
      : 0;

  const stats = [
    {
      label: "Total Services",
      value: totalServices,
      change: "Available",
      icon: Server,
      iconBg: "bg-gold/15",
      iconColor: "text-gold",
    },
    {
      label: "Active Countries",
      value: activeCountries,
      change: `${liveGroups} live pairs`,
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      changeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Average Price",
      value: averagePrice === 0 ? "N/A" : formatCurrency(averagePrice),
      change: "Per number",
      icon: DollarSign,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 overflow-hidden">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gold-dark/40 via-black to-black p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-dark/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/40 bg-gold-light/10 px-3 py-1 text-xs font-semibold text-gold-light">
            <Smartphone size={13} />
            Number Inventory Management
          </div>
        </div>
      </section>

      {/* price setting */}
      <AdminPriceSetting />

      {/* Stats Cards */}
      <section className="grid min-w-0 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-white/10 shadow-md bg-white/5 p-4 sm:p-5 transition-all transform hover:-translate-y-1 hover:border-gold-light/40 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={16} className="sm:w-[19px] sm:h-[19px]" />
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium text-center ${
                  stat.changeBg || "bg-white/10 text-gray-300 border-white/10"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid w-full min-w-0 gap-5 md:grid-cols-[320px_minmax(0,1fr)]">
        <div className="min-w-0 max-h-screen overflow-y-auto rounded-xl border border-white/10 bg-white/5 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Service Names</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {serviceOptions.length} service
                {serviceOptions.length === 1 ? "" : "s"} available
              </p>
            </div>
            {loadingGroups && (
              <Loader2 size={18} className="animate-spin text-gold-light" />
            )}
          </div>

          <div className="space-y-2 overflow-y-auto p-4">
            <button
              type="button"
              onClick={() => {
                setSelectedService("");
                setCurrentPage(1);
              }}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-all ${
                selectedService === ""
                  ? "border-gold-light/40 bg-gold-light/10"
                  : "border-white/10 bg-black/20 hover:border-gold-light/25 hover:bg-white/5"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-white">
                  All Services
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  {activeCountries} countries
                </span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                {totalGroups}
              </span>
            </button>

            {serviceOptions.map((service) => (
              <div
                key={service.code}
                className={`rounded-lg border transition-all ${
                  selectedService === service.code
                    ? "border-gold-light/40 bg-gold-light/10"
                    : "border-white/10 bg-black/20 hover:border-gold-light/25 hover:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(service.code);
                    setCurrentPage(1);
                  }}
                  className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">
                      {service.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {service.countries} countr
                      {service.countries === 1 ? "y" : "ies"} | {service.stock}{" "}
                      live routes
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      service.active
                        ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                        : "border-gray-500/20 bg-white/10 text-gray-400"
                    }`}
                  >
                    {service.active ? "Active" : "Inactive"}
                  </span>
                </button>

                <div className="border-t border-white/10 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleServiceToggle(service)}
                    disabled={updatingService === service.code}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingService === service.code ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : service.active ? (
                      <ToggleRight size={16} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                    {service.active ? "Deactivate Service" : "Activate Service"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 max-h-screen overflow-y-auto rounded-xl border border-white/10 bg-white/5 shadow-md">
          <div className="flex min-w-0 flex-col gap-4 border-b border-white/10 bg-black/20 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white">
                {selectedServiceLabel}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {totalGroups} countr{totalGroups === 1 ? "y" : "ies"} found
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search country..."
                  className="h-10 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchGroups()}
                disabled={loadingGroups}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-gray-400 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loadingGroups ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-5 flex items-start gap-2 rounded-lg border border-gold-light/20 bg-gold-light/10 p-4 text-sm text-gold-light">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loadingGroups ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-gold-light" />
            </div>
          ) : totalGroups === 0 ? (
            <div className="px-5 py-14 text-center">
              <Package size={42} className="mx-auto text-gray-600" />
              <h3 className="mt-4 text-lg font-semibold text-white">
                No listings found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try another service or country search.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Service</th>
                    <th className="px-5 py-3 font-semibold">Country</th>
                    <th className="px-5 py-3 font-semibold">Providers</th>
                    <th className="px-5 py-3 font-semibold">Visible Price</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {groups.map((group) => (
                    <tr
                      key={`${group.service}__${group.country}`}
                      className="bg-black/10 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-light/10 px-2.5 py-1 text-xs font-semibold text-gold-light">
                          <Smartphone size={12} />
                          {group.serviceName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white">
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          {group.country}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-300">
                        {group.providerCount} provider
                        {group.providerCount === 1 ? "" : "s"}
                        <span className="ml-1.5 text-xs text-gray-500">
                          ({group.liveProviderCount} live)
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {group.visibleListing ? (
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {formatCurrency(group.visibleListing.sellingPrice)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {group.visibleListing.provider}
                            </p>
                          </div>
                        ) : (
                          <span className="rounded-full border border-gray-500/20 bg-white/10 px-2 py-1 text-xs font-semibold text-gray-400">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setActiveGroup(group)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white"
                        >
                          Manage
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {pageStart + 1}-
                  {Math.min(pageStart + GROUPS_PER_PAGE, totalGroups)}{" "}
                  of {totalGroups}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={visiblePage === 1}
                    className="h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {activeGroup && (
        <ServiceGroupModal
          group={activeGroup}
          onClose={() => setActiveGroup(null)}
          onChanged={fetchGroups}
        />
      )}
    </div>
  );
}
