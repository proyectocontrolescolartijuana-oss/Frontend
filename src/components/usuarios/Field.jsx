export default function Field({
  label,
  children,
  required = false,
  hideRequirement = false,
}) {
  const requirementClass = required
    ? "bg-red-50 text-red-700 ring-red-100"
    : "bg-slate-100 text-slate-500 ring-slate-200";

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {!hideRequirement && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${requirementClass}`}
          >
            {required ? "Obligatorio" : "Opcional"}
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
