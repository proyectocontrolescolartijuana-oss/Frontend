export default function PeriodoHeader({ total, activos, futuros, vencidos }) {
  const resumen = [
    { label: "Activos", value: activos, className: "bg-emerald-50 text-emerald-700" },
    { label: "Futuros", value: futuros, className: "bg-blue-50 text-blue-700" },
    { label: "Vencidos", value: vencidos, className: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Periodos escolares
        </h1>

        <p className="mt-1 text-slate-500">
          {total} periodos registrados
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {resumen.map((item) => (
          <span
            key={item.label}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${item.className}`}
          >
            {item.value} {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
