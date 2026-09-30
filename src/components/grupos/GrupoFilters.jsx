import { Search } from "lucide-react";

const turnos = [
  { key: "TODOS", label: "Todos" },
  { key: "MATUTINO", label: "Matutino" },
  { key: "VESPERTINO", label: "Vespertino" },
];

export default function GrupoFilters({
  busqueda,
  setBusqueda,
  carreraFiltro,
  setCarreraFiltro,
  turnoFiltro,
  setTurnoFiltro,
  carreras,
  conteosTurno,
}) {
  return (
    <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />

        <input
          type="text"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar grupo..."
          className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 md:w-72"
        />
      </div>

      <select
        value={carreraFiltro}
        onChange={(event) => setCarreraFiltro(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 md:w-72"
      >
        <option value="TODAS">Todas las carreras</option>

        {carreras.map((carrera) => (
          <option key={carrera.id_carrera} value={carrera.id_carrera}>
            {carrera.nombre}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {turnos.map((item) => {
          const activo = turnoFiltro === item.key;
          const total = conteosTurno[item.key] ?? 0;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTurnoFiltro(item.key)}
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
