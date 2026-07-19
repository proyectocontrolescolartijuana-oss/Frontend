export default function GrupoHeader({ total, matutinos, vespertinos }) {
  const resumen = [
    {
      label: "Matutinos",
      value: matutinos,
      className: "bg-amber-50 text-amber-700",
    },
    {
      label: "Vespertinos",
      value: vespertinos,
      className: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Grupos</h1>

        <p className="mt-1 text-slate-500">
          {total} grupos registrados por carrera
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
