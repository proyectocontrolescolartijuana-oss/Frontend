import { Trash2, Pencil } from "lucide-react";

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";

  const [year, month, day] = fecha.split("-");

  if (!year || !month || !day) return fecha;

  return `${day}/${month}/${year}`;
};

export default function CarreraListCard({ carreras, onEliminar, onEditar }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Programas activos
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Logo
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Clave
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                RVOE
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Nombre
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Autorización
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {carreras.map((carrera) => (
              <tr
                key={carrera.id_carrera}
                className="border-t border-slate-100"
              >
                <td className="px-6 py-5">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {carrera.logo ? (
                      <img
                        src={carrera.logo}
                        alt={`Logo de ${carrera.nombre}`}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        S/L
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">
                      {carrera.clave}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <span className="font-medium text-slate-700">
                    {carrera.rvoe || "Sin RVOE"}
                  </span>
                </td>

                <td className="px-6 py-5 font-medium text-slate-900">
                  {carrera.nombre}
                </td>

                <td className="px-6 py-5 font-medium text-slate-700">
                  {formatearFecha(carrera.fecha_autorizacion)}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-3">
                    {/* Editar */}
                    <button
                      onClick={() => onEditar(carrera)}
                      className="text-blue-500 transition hover:text-blue-700"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => onEliminar(carrera)}
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
    </div>
  );
}
