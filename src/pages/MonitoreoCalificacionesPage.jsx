import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Save,
  Search,
  Users,
} from "lucide-react";
import {
  guardarCapturaMonitoreoCalificaciones,
  obtenerMonitoreoCalificacionesPeriodoActual,
} from "../services/calificacionesService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.loc?.join("."))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo cargar el monitoreo de calificaciones.";
};

const normalizarTexto = (valor) =>
  String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getGrupoTitulo = (grupoMateria) =>
  [
    grupoMateria?.grupo?.nombre || "Grupo sin nombre",
    grupoMateria?.materia?.nombre || "Materia sin nombre",
  ].join(" - ");

const getGrupoMeta = (grupoMateria) =>
  [
    grupoMateria?.docente?.nombre || "Docente sin asignar",
    grupoMateria?.grupo?.turno,
    grupoMateria?.aula ? `Aula ${grupoMateria.aula}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

const getPorcentaje = (capturadas, total) => {
  if (!total) return 0;

  return Math.round((capturadas / total) * 100);
};

const getBadgeClass = (pendientes, total) => {
  if (!total) return "bg-slate-100 text-slate-600";
  if (pendientes === 0) return "bg-emerald-100 text-emerald-700";

  return "bg-amber-100 text-amber-800";
};

const getCellKey = (idCarga, idParcial) => `${idCarga}-${idParcial}`;

const extraerValores = (datos) => {
  const valores = {};

  datos?.grupos_materia?.forEach((grupo) => {
    grupo.alumnos?.forEach((alumno) => {
      alumno.calificaciones?.forEach((calificacion) => {
        valores[getCellKey(alumno.id_carga, calificacion.id_parcial)] =
          calificacion.calificacion ?? "";
      });
    });
  });

  return valores;
};

export default function MonitoreoCalificacionesPage() {
  const [data, setData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingGrupoId, setSavingGrupoId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");

  const cargarMonitoreo = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await obtenerMonitoreoCalificacionesPeriodoActual();
      setData(response);
      setFormValues(extraerValores(response));
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
      setData(null);
      setFormValues({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargarMonitoreo();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const gruposFiltrados = useMemo(() => {
    const grupos = data?.grupos_materia || [];
    const busquedaNormalizada = normalizarTexto(busqueda);

    return grupos.filter((grupo) => {
      if (estado === "pendientes" && grupo.pendientes === 0) return false;
      if (estado === "completos" && grupo.pendientes > 0) return false;

      if (!busquedaNormalizada) return true;

      const grupoMateria = grupo.grupo_materia;
      const texto = normalizarTexto(
        [
          grupoMateria?.grupo?.nombre,
          grupoMateria?.materia?.nombre,
          grupoMateria?.docente?.nombre,
          grupoMateria?.periodo?.nombre,
        ].join(" "),
      );

      return texto.includes(busquedaNormalizada);
    });
  }, [data, busqueda, estado]);

  const resumen = useMemo(() => {
    const total = data?.total_calificaciones || 0;
    const capturadas = data?.capturadas || 0;
    const pendientes = data?.pendientes || 0;
    const gruposCompletos = (data?.grupos_materia || []).filter(
      (grupo) => grupo.completo,
    ).length;

    return {
      total,
      capturadas,
      pendientes,
      avance: getPorcentaje(capturadas, total),
      gruposCompletos,
    };
  }, [data]);

  const handleChangeCalificacion = (idCarga, idParcial, value) => {
    setFormValues((prev) => ({
      ...prev,
      [getCellKey(idCarga, idParcial)]: value,
    }));
  };

  const validarGrupo = (grupo) => {
    for (const alumno of grupo.alumnos) {
      for (const parcial of data.parciales) {
        const value = formValues[getCellKey(alumno.id_carga, parcial.id_parcial)];

        if (String(value ?? "").trim() === "") continue;

        const calificacion = Number(value);

        if (
          Number.isNaN(calificacion) ||
          calificacion < 0 ||
          calificacion > 100
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const handleGuardarGrupo = async (grupo) => {
    if (savingGrupoId) return;

    setMensaje("");
    setError("");

    if (!validarGrupo(grupo)) {
      setError("Las calificaciones deben estar entre 0 y 100.");
      return;
    }

    const calificaciones = grupo.alumnos.flatMap((alumno) =>
      data.parciales.map((parcial) => {
        const value = formValues[getCellKey(alumno.id_carga, parcial.id_parcial)];
        const valueLimpio = String(value ?? "").trim();

        return {
          id_carga: alumno.id_carga,
          id_parcial: parcial.id_parcial,
          calificacion: valueLimpio === "" ? null : Number(valueLimpio),
        };
      }),
    );

    try {
      setSavingGrupoId(grupo.grupo_materia.id_grupo_materia);

      const response = await guardarCapturaMonitoreoCalificaciones(
        grupo.grupo_materia.id_grupo_materia,
        calificaciones,
      );

      setData(response);
      setFormValues(extraerValores(response));
      setMensaje("Calificaciones guardadas correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setSavingGrupoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[var(--background)] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Monitoreo de calificaciones
          </h1>
          <p className="mt-1 text-slate-500">
            Periodo actual: {data?.periodo?.nombre || "Sin periodo activo"}
          </p>
        </div>

        <button
          type="button"
          onClick={cargarMonitoreo}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {mensaje && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {mensaje}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Avance</p>
                <ClipboardList size={18} className="text-blue-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumen.avance}%
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${resumen.avance}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Capturadas
                </p>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumen.capturadas}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                de {resumen.total} celdas
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Pendientes
                </p>
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumen.pendientes}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                por revisar antes del cierre
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Materias-grupo
                </p>
                <Users size={18} className="text-blue-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {resumen.gruposCompletos}/{data.total_grupos_materia}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                completas en el periodo
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar grupo, materia o docente"
                className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {[
                ["todos", "Todos"],
                ["pendientes", "Pendientes"],
                ["completos", "Completos"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEstado(value)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    estado === value
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {gruposFiltrados.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
              No hay materias-grupo que coincidan con los filtros.
            </div>
          ) : (
            <div className="space-y-4">
              {gruposFiltrados.map((grupo) => {
                const grupoMateria = grupo.grupo_materia;
                const avance = getPorcentaje(
                  grupo.capturadas,
                  grupo.total_calificaciones,
                );

                return (
                  <section
                    key={grupoMateria.id_grupo_materia}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-slate-900">
                            {getGrupoTitulo(grupoMateria)}
                          </h2>
                          <span
                            className={`rounded-md px-2.5 py-1 text-xs font-bold ${getBadgeClass(
                              grupo.pendientes,
                              grupo.total_calificaciones,
                            )}`}
                          >
                            {grupo.total_calificaciones === 0
                              ? "Sin alumnos"
                              : grupo.pendientes === 0
                                ? "Completo"
                                : `${grupo.pendientes} pendientes`}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {getGrupoMeta(grupoMateria)}
                        </p>
                      </div>

                      <div className="min-w-[220px]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-600">
                            {grupo.capturadas}/{grupo.total_calificaciones}
                          </span>
                          <span className="font-bold text-slate-900">
                            {avance}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${
                              grupo.pendientes === 0
                                ? "bg-emerald-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${avance}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGuardarGrupo(grupo)}
                        disabled={
                          savingGrupoId !== null || grupo.alumnos.length === 0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={18} />
                        {savingGrupoId === grupoMateria.id_grupo_materia
                          ? "Guardando..."
                          : "Guardar"}
                      </button>
                    </div>

                    {grupo.alumnos.length === 0 ? (
                      <div className="px-5 py-8 text-sm text-slate-500">
                        Esta materia-grupo no tiene alumnos cargados.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="w-80 px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                Alumno
                              </th>
                              <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                Matricula
                              </th>
                              {data.parciales.map((parcial) => (
                                <th
                                  key={parcial.id_parcial}
                                  className="px-5 py-4 text-center text-sm font-semibold text-slate-600"
                                >
                                  <span className="block whitespace-nowrap">
                                    {parcial.nombre}
                                  </span>
                                  <span className="text-xs font-medium text-slate-400">
                                    {parcial.porcentaje}%
                                  </span>
                                </th>
                              ))}
                              <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                                Estado
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {grupo.alumnos.map((alumno) => (
                              <tr
                                key={alumno.id_carga}
                                className="border-t border-slate-100"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-slate-900">
                                    {nombreAlumnoApellidosPrimero(alumno)}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    Control:{" "}
                                    {alumno.alumno?.numero_control ||
                                      "Sin dato"}
                                  </p>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600">
                                  {alumno.alumno?.matricula ||
                                    "Sin matricula"}
                                </td>
                                {data.parciales.map((parcial) => {
                                  const calificacion =
                                    alumno.calificaciones.find(
                                      (item) =>
                                        item.id_parcial ===
                                        parcial.id_parcial,
                                    );
                                  const key = getCellKey(
                                    alumno.id_carga,
                                    parcial.id_parcial,
                                  );

                                  return (
                                    <td
                                      key={parcial.id_parcial}
                                      className="px-5 py-4 text-center"
                                    >
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={formValues[key] ?? ""}
                                        onChange={(event) => {
                                          let value = event.target.value;

                                          if (value === "") {
                                            handleChangeCalificacion(
                                              alumno.id_carga,
                                              parcial.id_parcial,
                                              "",
                                            );
                                            return;
                                          }

                                          value = parseInt(value, 10);

                                          if (Number.isNaN(value)) return;

                                          if (value < 0) value = 0;
                                          if (value > 100) value = 100;

                                          handleChangeCalificacion(
                                            alumno.id_carga,
                                            parcial.id_parcial,
                                            value,
                                          );
                                        }}
                                        onKeyDown={(event) => {
                                          if (
                                            event.key === "." ||
                                            event.key === "," ||
                                            event.key === "e" ||
                                            event.key === "-"
                                          ) {
                                            event.preventDefault();
                                          }
                                        }}
                                        aria-label={`Calificacion ${
                                          parcial.nombre
                                        } de ${nombreAlumnoApellidosPrimero(
                                          alumno,
                                        )}`}
                                        className={`h-10 w-24 rounded-md border px-3 text-center text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                          calificacion?.calificacion === null ||
                                          calificacion?.calificacion ===
                                            undefined
                                            ? "border-amber-300 bg-amber-50 text-amber-800"
                                            : "border-slate-300 bg-white text-slate-900"
                                        }`}
                                      />
                                    </td>
                                  );
                                })}
                                <td className="px-5 py-4 text-center">
                                  <span
                                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${getBadgeClass(
                                      alumno.pendientes,
                                      data.parciales.length,
                                    )}`}
                                  >
                                    {alumno.pendientes === 0
                                      ? "Completo"
                                      : `${alumno.pendientes} pendientes`}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
