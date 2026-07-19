import { Edit2, Trash2 } from "lucide-react";
import PeriodoFilters from "./PeriodoFilters";

const badgeStyles = {
  ACTIVOS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FUTUROS: "bg-blue-50 text-blue-700 ring-blue-200",
  VENCIDOS: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function PeriodoListCard({
  periodos,
  busqueda,
  setBusqueda,
  filtro,
  setFiltro,
  conteos,
  onEditar,
  onEliminar,
  formatDate,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Catalogo de periodos
        </h2>

        <PeriodoFilters
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtro={filtro}
          setFiltro={setFiltro}
          conteos={conteos}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Periodo
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Inicio
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Fin
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Estado
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {periodos.map((periodo) => (
              <tr key={periodo.id_periodo} className="border-t border-slate-100">
                <td className="px-6 py-5">
                  <div className="font-medium text-slate-900">
                    {periodo.nombre}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {periodo.estado === "CERRADO" ? "Cerrado" : "Disponible"}
                  </div>
                </td>

                <td className="px-6 py-5 text-slate-700">
                  {formatDate(periodo.fecha_inicio)}
                </td>

                <td className="px-6 py-5 text-slate-700">
                  {formatDate(periodo.fecha_fin)}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                      badgeStyles[periodo.etapa.key]
                    }`}
                  >
                    {periodo.etapa.label}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEditar(periodo)}
                      aria-label={`Editar ${periodo.nombre}`}
                      className="text-blue-500 transition hover:text-blue-700"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEliminar(periodo)}
                      aria-label={`Eliminar ${periodo.nombre}`}
                      className="text-red-500 transition hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {periodos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No hay periodos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
