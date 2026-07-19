import { Trash2, Edit2 } from "lucide-react";
import MateriaFilters from "./MateriaFilters";

export default function MateriaListCard({
  materias,
  carreras,
  busqueda,
  setBusqueda,
  carreraFiltro,
  setCarreraFiltro,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Catálogo de materias
        </h2>

        <MateriaFilters
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          carreraFiltro={carreraFiltro}
          setCarreraFiltro={setCarreraFiltro}
          carreras={carreras}
        />
      </div>

      {/* Tabla */}
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Clave
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
              Nombre
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
              Créditos
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {materias.map((materia) => (
            <tr key={materia.id_materia} className="border-t border-slate-100">
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    {materia.clave}
                  </span>
                </div>
              </td>

              <td className="px-6 py-5 font-medium text-slate-900">
                {materia.nombre}
              </td>

              <td className="px-6 py-5 text-center">{materia.creditos}</td>

              <td className="px-6 py-5">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEditar(materia)}
                    className="text-blue-500 transition hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => onEliminar(materia)}
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
  );
}
