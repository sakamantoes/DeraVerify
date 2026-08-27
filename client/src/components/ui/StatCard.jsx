export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg = "bg-white/10",
  iconColor = "text-white",
  changeBg = "bg-white/8 text-gray-300 border-white/10",
}) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-5 shadow-md transition-all hover:-translate-y-1 hover:border-red-light/40 hover:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
          >
            <Icon size={19} />
          </div>
        ) : null}
        {change ? (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${changeBg}`}
          >
            {change}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
