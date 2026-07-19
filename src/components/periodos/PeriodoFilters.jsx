import { Search } from "lucide-react";

const filtros = [
  { key: "TODOS", label: "Todos" },
  { key: "ACTIVOS", label: "Activos" },
  { key: "FUTUROS", label: "Futuros" },
  { key: "VENCIDOS", label: "Vencidos" },
];

export default function PeriodoFilters({
  busqueda,
  setBusqueda,
  filtro,
  setFiltro,
  conteos,
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar periodo..."
          className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 md:w-72"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filtros.map((item) => {
          const activo = filtro === item.key;
          const total = conteos[item.key] ?? 0;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFiltro(item.key)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                activo
                  ? "border-[#0B245B] bg-[#0B245B] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label} {total}
            </button>
          );
        })}
      </div>
    </div>
  );
}
