export default function FormatoEvaluacionesFilters({
  busquedaGrupo,
  carreras,
  carreraId,
  cargando,
  cargandoCatalogos,
  error,
  gruposFiltrados,
  onBuscar,
  onBuscarKeyDown,
  onCarreraChange,
  onGrupoChange,
  onLimpiar,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Datos para autollenado
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,320px)_1fr]">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Carrera</span>
          <select
            value={carreraId}
            onChange={onCarreraChange}
            disabled={cargandoCatalogos}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {cargandoCatalogos ? "Cargando carreras..." : "Selecciona carrera"}
            </option>
            {carreras.map((carrera) => (
              <option key={carrera.id_carrera} value={carrera.id_carrera}>
                {carrera.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Grupo</span>
          <div className="mt-1 flex gap-3">
            <input
              type="text"
              list="grupos-lista"
              value={busquedaGrupo}
              onChange={onGrupoChange}
              onKeyDown={onBuscarKeyDown}
              placeholder={
                !carreraId
                  ? "Primero selecciona una carrera"
                  : cargandoCatalogos
                    ? "Cargando grupos..."
                    : "Busca por grupo (ej. CRIM26)"
              }
              disabled={cargandoCatalogos || !carreraId}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
            <datalist id="grupos-lista">
              {gruposFiltrados.map((grupo) => (
                <option key={grupo.id_grupo} value={grupo.nombre} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={onBuscar}
              disabled={cargando || cargandoCatalogos || !carreraId}
              className="whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargando ? "Buscando..." : "Buscar"}
            </button>
            <button
              type="button"
              onClick={onLimpiar}
              className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </label>
      </div>

      {!cargandoCatalogos && carreraId && (
        <p className="mt-2 text-xs text-slate-400">
          {gruposFiltrados.length} grupo
          {gruposFiltrados.length === 1 ? "" : "s"} disponible
          {gruposFiltrados.length === 1 ? "" : "s"} para la carrera
          seleccionada
        </p>
      )}

      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </section>
  );
}
