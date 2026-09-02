export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`rounded-lg border border-white/10 bg-black/20 px-4 py-8 text-center sm:py-10 ${className}`.trim()}
    >
      {Icon ? <Icon size={26} className="mx-auto text-gray-600" /> : null}
      {title ? (
        <h3 className="mt-3 text-sm font-semibold text-white">
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-gold-light/30 bg-gold-light/10 px-4 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-light/20 hover:text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
