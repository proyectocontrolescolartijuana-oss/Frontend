import { Search } from "lucide-react";

export default function MateriaFilters({
  busqueda,
  setBusqueda,
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      {/* Buscar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar materia..."
          className="w-72 rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500"
        />
      </div>
    </div>
  );
}
