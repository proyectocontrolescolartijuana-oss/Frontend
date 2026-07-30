import { FileCheck2, FileText, RefreshCcw, Search } from "lucide-react";
import FormAlert from "../usuarios/FormAlert";
import TitulacionBadge from "./TitulacionBadge";
import { DOCUMENTOS_TITULACION, documentoEntregado } from "./titulacionesUtils";

export default function TitulacionesLista({
  alumnos,
  carreras,
  busqueda,
  setBusqueda,
  carreraFiltro,
  setCarreraFiltro,
  mensaje,
  error,
  onRefresh,
  onSelectAlumno,
}) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Titulaciones</h1>
          <p className="mt-1 text-slate-500">
            {alumnos.length} alumnos encontrados
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCcw size={18} />
          Actualizar
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
      {error && <FormAlert type="error">{error}</FormAlert>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileCheck2 size={20} />
            </span>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recepción de evidencias
              </h2>

              <p className="text-sm text-slate-500">
                Cada registro actualiza los campos del Semáforo egresados
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar alumno"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 lg:w-80"
              />
            </div>

            <select
              value={carreraFiltro}
              onChange={(event) => setCarreraFiltro(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="TODAS">Todas las carreras</option>
              {carreras.map((carrera) => (
                <option key={carrera.id_carrera} value={carrera.id_carrera}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {alumnos.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No hay alumnos que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Alumno
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Carrera / Grupo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Matrícula / Control
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Avance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Semáforo
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {alumnos.map((alumno) => {
                  const entregados = DOCUMENTOS_TITULACION.filter((documento) =>
                    documentoEntregado(alumno.titulacion, documento),
                  ).length;

                  return (
                    <tr
                      key={alumno.id_alumno}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-900">
                          {alumno.nombre}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          ID alumno #{alumno.id_alumno}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-slate-800">
                          {alumno.carrera?.nombre || alumno.carrera || "Sin carrera"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {alumno.grupo?.nombre || alumno.grupo || "Sin grupo"}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-slate-800">
                          {alumno.matricula || "Sin matrícula"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {alumno.numero_control || "Sin número de control"}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-slate-900">
                          {entregados}/{DOCUMENTOS_TITULACION.length}
                        </div>
                        <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{
                              width: `${(entregados / DOCUMENTOS_TITULACION.length) * 100}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="max-w-xl px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {DOCUMENTOS_TITULACION.map((documento) => (
                            <TitulacionBadge
                              key={documento.key}
                              label={documento.label}
                              entregado={documentoEntregado(
                                alumno.titulacion,
                                documento,
                              )}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onSelectAlumno(alumno.id_alumno)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#0B245B] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900"
                          >
                            <FileText size={17} />
                            Gestionar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
