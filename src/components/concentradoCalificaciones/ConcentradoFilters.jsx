import { Search } from "lucide-react";

export default function ConcentradoFilters({
  carreras,
  error,
  form,
  grupoSeleccionado,
  gruposFiltrados,
  loadingCatalogos,
  loadingReporte,
  periodos,
  onChange,
  onGenerate,
  concentrado,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Datos del reporte
      </h2>

      <div className="mt-5 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Carrera</span>
          <select
            name="carreraId"
            value={form.carreraId}
            onChange={onChange}
            disabled={loadingCatalogos}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          >
            <option value="">
              {loadingCatalogos ? "Cargando carreras..." : "Selecciona una carrera"}
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
            name="grupoId"
            value={form.grupoId}
            onChange={onChange}
            disabled={loadingCatalogos || !form.carreraId}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          >
            <option value="">
              {loadingCatalogos
                ? "Cargando grupos..."
                : form.carreraId
                  ? "Selecciona un grupo"
                  : "Selecciona primero una carrera"}
            </option>
            {gruposFiltrados.map((grupo) => (
              <option key={grupo.id_grupo} value={grupo.id_grupo}>
                {grupo.nombre || `Grupo #${grupo.id_grupo}`}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Periodo</span>
          <select
            name="periodoId"
            value={form.periodoId}
            onChange={onChange}
            disabled={loadingCatalogos}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          >
            <option value="">
              {loadingCatalogos ? "Cargando periodos..." : "Periodo activo"}
            </option>
            {periodos.map((periodo) => (
              <option key={periodo.id_periodo} value={periodo.id_periodo}>
                {periodo.nombre}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loadingCatalogos || loadingReporte}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search size={18} />
          {loadingReporte ? "Generando..." : "Generar concentrado"}
        </button>

        {grupoSeleccionado && !concentrado && (
          <p className="text-sm text-slate-500">
            Grupo seleccionado: {grupoSeleccionado.nombre}
          </p>
        )}
      </div>
    </section>
  );
}
