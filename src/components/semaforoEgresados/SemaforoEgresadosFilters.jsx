export default function SemaforoEgresadosFilters({
  busqueda,
  carreras,
  carreraId,
  error,
  grupoId,
  gruposFiltrados,
  loadingCatalogos,
  loadingReporte,
  onBuscar,
  onBusquedaChange,
  onCarreraChange,
  onGrupoChange,
  onLimpiarBusqueda,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Datos para consulta
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Carrera</span>
          <select
            value={carreraId}
            onChange={(event) => onCarreraChange(event.target.value)}
            disabled={loadingCatalogos || loadingReporte}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {loadingCatalogos ? "Cargando carreras..." : "Selecciona carrera"}
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
          <select
            value={grupoId}
            onChange={(event) => onGrupoChange(event.target.value)}
            disabled={!carreraId || loadingCatalogos || loadingReporte}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {!carreraId ? "Selecciona carrera primero" : "Selecciona grupo"}
            </option>
            {gruposFiltrados.map((grupo) => (
              <option key={grupo.id_grupo} value={grupo.id_grupo}>
                {grupo.nombre}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onBuscar}
          disabled={!carreraId || !grupoId || loadingCatalogos || loadingReporte}
          className="self-end rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingReporte ? "Consultando..." : "Consultar"}
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Filtrar por nombre, matricula o no. de control..."
          value={busqueda}
          onChange={(event) => onBusquedaChange(event.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={onLimpiarBusqueda}
          className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
