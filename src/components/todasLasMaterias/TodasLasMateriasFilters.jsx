import { Search } from "lucide-react";

export default function TodasLasMateriasFilters({
  busqueda,
  error,
  loading,
  loadingSugerencias,
  mostrarSugerencias,
  onBuscar,
  onBusquedaChange,
  onFocusBusqueda,
  onKeyDown,
  onLimpiar,
  onSeleccionarSugerencia,
  sugerencias,
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
              <input
                type="text"
                value={busqueda}
                onChange={(event) => onBusquedaChange(event.target.value)}
                onFocus={onFocusBusqueda}
                onKeyDown={onKeyDown}
                autoComplete="off"
                placeholder="Busca por matricula, no. de control o nombre"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {mostrarSugerencias && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {loadingSugerencias && (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      Buscando coincidencias...
                    </div>
                  )}
                  {!loadingSugerencias && sugerencias.length === 0 && (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      Sin coincidencias
                    </div>
                  )}
                  {!loadingSugerencias &&
                    sugerencias.map((alumnoSug) => (
                      <button
                        key={alumnoSug.id_alumno}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSeleccionarSugerencia(alumnoSug)}
                        className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        <span className="block text-sm font-semibold text-slate-900">
                          {alumnoSug.nombre}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {alumnoSug.matricula || "Sin matricula"} | No.
                          control: {alumnoSug.numero_control || "Sin dato"} |{" "}
                          {alumnoSug.carrera}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBuscar}
              disabled={loading}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={16} />
              {loading ? "Buscando..." : "Buscar"}
            </button>

            <button
              type="button"
              onClick={onLimpiar}
              className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpiar ficha
            </button>
          </div>
        </label>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
