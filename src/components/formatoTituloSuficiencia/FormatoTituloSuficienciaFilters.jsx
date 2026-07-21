import { Loader2, Search, X } from "lucide-react";

import {
  CAMPOS_EDITABLES,
  obtenerNombreAlumno,
} from "./formatoTituloSuficienciaUtils";

export default function FormatoTituloSuficienciaFilters({
  alumnoSeleccionado,
  alumnosFiltrados,
  busqueda,
  campos,
  cargandoAlumnos,
  cargandoCargas,
  cargas,
  cuatrimestreFiltro,
  cuatrimestresDisponibles,
  errorAlumnos,
  errorCargas,
  materias,
  onBusquedaChange,
  onCampoChange,
  onCuatrimestreChange,
  onLimpiar,
  onSeleccionarAlumno,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Datos para autollenado
      </h2>

      <div className="mt-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Alumno</span>
          <div className="mt-1 flex gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(event) => onBusquedaChange(event.target.value)}
                placeholder="Busca por matricula, no. de control o nombre"
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="button"
              onClick={onLimpiar}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <X size={14} />
              Limpiar ficha
            </button>
          </div>
        </label>

        {cargandoAlumnos && (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Cargando alumnos...
          </p>
        )}
        {errorAlumnos && (
          <p className="mt-2 text-sm text-red-600">
            No se pudo cargar /alumnos/detalle ({errorAlumnos})
          </p>
        )}

        {busqueda.trim() && alumnosFiltrados.length > 0 && (
          <ul className="mt-2 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {alumnosFiltrados.map((alumno) => (
              <li key={alumno.id_alumno}>
                <button
                  type="button"
                  onClick={() => onSeleccionarAlumno(alumno)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">
                    {obtenerNombreAlumno(alumno)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {alumno.matricula || "Sin matricula"} | No. control:{" "}
                    {alumno.numero_control || "Sin dato"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {busqueda.trim() && !cargandoAlumnos && alumnosFiltrados.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            Sin coincidencias para "{busqueda}".
          </p>
        )}
      </div>

      {alumnoSeleccionado && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              Alumno seleccionado:{" "}
              <span className="font-semibold text-slate-900">
                {campos.nombre} {campos.apP} {campos.apM}
              </span>{" "}
              - control {campos.control}
            </p>
            {cargandoCargas && (
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" /> Cargando
                materias...
              </span>
            )}
          </div>

          {errorCargas && (
            <p className="mt-2 text-sm text-red-600">
              No se pudieron cargar las cargas academicas ({errorCargas})
            </p>
          )}

          {cuatrimestresDisponibles.length > 0 && (
            <label className="mt-3 block max-w-xs">
              <span className="text-sm font-medium text-slate-700">
                Cuatrimestre
              </span>
              <select
                value={cuatrimestreFiltro}
                onChange={(event) => onCuatrimestreChange(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {cuatrimestresDisponibles.map((cuatrimestre) => (
                  <option
                    key={cuatrimestre.id_cuatrimestre}
                    value={cuatrimestre.id_cuatrimestre}
                  >
                    {cuatrimestre.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          {cargas.length > 0 && materias.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              El alumno no tiene materias cargadas en este cuatrimestre.
            </p>
          )}
          {cargas.length === 0 && !cargandoCargas && !errorCargas && (
            <p className="mt-2 text-sm text-slate-500">
              Este alumno no tiene cargas academicas registradas.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAMPOS_EDITABLES.map((campo) => (
              <label key={campo.key} className="block">
                <span className="text-xs font-medium text-slate-600">
                  {campo.label}
                </span>
                <input
                  type={campo.type || "text"}
                  value={campos[campo.key]}
                  onChange={(event) => onCampoChange(campo.key, event.target.value)}
                  placeholder={campo.placeholder}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
