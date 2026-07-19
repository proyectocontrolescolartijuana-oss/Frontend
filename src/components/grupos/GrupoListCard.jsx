import { Edit2, Trash2 } from "lucide-react";
import EmptyState from "./EmptyState";
import GrupoFilters from "./GrupoFilters";

const turnoStyles = {
  MATUTINO: "bg-amber-50 text-amber-700 ring-amber-200",
  VESPERTINO: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export default function GrupoListCard({
  grupos,
  carreras,
  busqueda,
  setBusqueda,
  carreraFiltro,
  setCarreraFiltro,
  turnoFiltro,
  setTurnoFiltro,
  conteosTurno,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Catalogo de grupos
        </h2>

        <GrupoFilters
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          carreraFiltro={carreraFiltro}
          setCarreraFiltro={setCarreraFiltro}
          turnoFiltro={turnoFiltro}
          setTurnoFiltro={setTurnoFiltro}
          carreras={carreras}
          conteosTurno={conteosTurno}
        />
      </div>

      {grupos.length === 0 ? (
        <div className="p-6">
          <EmptyState mensaje="No hay grupos para mostrar." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Grupo
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Carrera
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Cuatrimestre
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Turno
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {grupos.map((grupo) => (
                <tr key={grupo.id_grupo} className="border-t border-slate-100">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-slate-900">
                      {grupo.nombre || `Grupo ${grupo.id_grupo}`}
                    </div>

                    {/* <div className="mt-1 text-sm text-slate-500">
                      ID {grupo.id_grupo}
                    </div> */}
                  </td>

                  <td className="px-6 py-5">
                    <div className="font-medium text-slate-700">
                      {grupo.carreraNombre}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {grupo.cuatrimestreNombre}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        turnoStyles[grupo.turno] ||
                        "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {grupo.turno || "Sin turno"}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEditar(grupo)}
                        aria-label={`Editar ${grupo.nombre || "grupo"}`}
                        className="text-blue-500 transition hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEliminar(grupo)}
                        aria-label={`Eliminar ${grupo.nombre || "grupo"}`}
                        className="text-red-500 transition hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
