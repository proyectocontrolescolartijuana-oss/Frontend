import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  RefreshCw,
  Save,
  Users,
} from "lucide-react";
import {
  guardarCapturaCalificaciones,
  obtenerCapturaGrupo,
  obtenerGruposCaptura,
} from "../services/calificacionesService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

const getCellKey = (idCarga, idParcial) => `${idCarga}-${idParcial}`;

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

  return "No se pudo completar la operacion.";
};

const extraerValores = (captura) => {
  const valores = {};

  captura.alumnos?.forEach((alumno) => {
    alumno.calificaciones?.forEach((calificacion) => {
      valores[getCellKey(alumno.id_carga, calificacion.id_parcial)] =
        calificacion.calificacion ?? "";
    });
  });

  return valores;
};

const getGrupoTitulo = (grupoMateria) => {
  return [grupoMateria?.grupo?.nombre, grupoMateria?.materia?.nombre]
    .filter(Boolean)
    .join(" - ");
};

const getGrupoMeta = (grupoMateria) => {
  return [
    grupoMateria?.periodo?.nombre,
    grupoMateria?.grupo?.turno,
    grupoMateria?.aula ? `Aula ${grupoMateria.aula}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
};

export default function CapturaCalificacionesPage() {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState("");
  const [capturaRefreshKey, setCapturaRefreshKey] = useState(0);
  const [captura, setCaptura] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCaptura, setLoadingCaptura] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarGrupos = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await obtenerGruposCaptura();
      const existeSeleccionActual = response.some(
        (grupo) =>
          String(grupo.id_grupo_materia) === String(grupoSeleccionadoId),
      );
      const siguienteGrupoId = existeSeleccionActual
        ? grupoSeleccionadoId
        : response[0]?.id_grupo_materia || "";

      setGrupos(response);
      setGrupoSeleccionadoId(siguienteGrupoId);

      if (siguienteGrupoId) {
        setLoadingCaptura(true);

        if (String(siguienteGrupoId) === String(grupoSeleccionadoId)) {
          setCapturaRefreshKey((prev) => prev + 1);
        }
      } else {
        setCaptura(null);
        setFormValues({});
        setLoadingCaptura(false);
      }
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activo = true;

    obtenerGruposCaptura()
      .then((response) => {
        if (!activo) return;

        const primerGrupoId = response[0]?.id_grupo_materia || "";

        setGrupos(response);
        setGrupoSeleccionadoId(primerGrupoId);

        if (primerGrupoId) {
          setLoadingCaptura(true);
        }
      })
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError(obtenerMensajeError(requestError));
        }
      })
      .finally(() => {
        if (activo) {
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!grupoSeleccionadoId) {
      return;
    }

    let activo = true;

    obtenerCapturaGrupo(grupoSeleccionadoId)
      .then((response) => {
        if (!activo) return;

        setCaptura(response);
        setFormValues(extraerValores(response));
      })
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError(obtenerMensajeError(requestError));
        }
      })
      .finally(() => {
        if (activo) {
          setLoadingCaptura(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [grupoSeleccionadoId, capturaRefreshKey]);

  const resumen = useMemo(() => {
    const totalAlumnos = captura?.alumnos?.length || 0;
    const totalParciales = captura?.parciales?.length || 0;
    const totalCeldas = totalAlumnos * totalParciales;
    const capturadas = Object.values(formValues).filter(
      (value) => String(value).trim() !== "",
    ).length;

    return {
      totalAlumnos,
      totalParciales,
      pendientes: Math.max(totalCeldas - capturadas, 0),
    };
  }, [captura, formValues]);

  const handleChangeCalificacion = (idCarga, idParcial, value) => {
    setFormValues((prev) => ({
      ...prev,
      [getCellKey(idCarga, idParcial)]: value,
    }));
  };

  const calcularPromedio = (alumno) => {
    if (!captura?.parciales?.length) return "-";

    let total = 0;
    let pesoTotal = 0;

    captura.parciales.forEach((parcial) => {
      const value = formValues[getCellKey(alumno.id_carga, parcial.id_parcial)];
      const calificacion = Number(value);

      if (String(value).trim() === "" || Number.isNaN(calificacion)) return;

      const peso = Number(parcial.porcentaje) || 0;

      total += calificacion * peso;
      pesoTotal += peso;
    });

    if (pesoTotal === 0) return "-";

    return (total / pesoTotal).toFixed(1);
  };

  const calcularPromedioPrimerosParciales = (alumno) => {
    const primerosParciales = captura?.parciales?.slice(0, 2) || [];

    if (primerosParciales.length < 2) return "-";

    const calificaciones = primerosParciales.map((parcial) => {
      const value = formValues[getCellKey(alumno.id_carga, parcial.id_parcial)];
      const calificacion = Number(value);

      if (String(value).trim() === "" || Number.isNaN(calificacion)) {
        return null;
      }

      return calificacion;
    });

    if (calificaciones.some((calificacion) => calificacion === null)) {
      return "-";
    }

    return (
      calificaciones.reduce((total, calificacion) => total + calificacion, 0) /
      calificaciones.length
    ).toFixed(1);
  };

  const validarCalificaciones = () => {
    for (const value of Object.values(formValues)) {
      if (String(value).trim() === "") continue;

      const calificacion = Number(value);

      if (
        Number.isNaN(calificacion) ||
        calificacion < 0 ||
        calificacion > 100
      ) {
        return false;
      }
    }

    return true;
  };

  const handleGuardar = async () => {
    if (!captura || saving) return;

    setMensaje("");
    setError("");

    if (!validarCalificaciones()) {
      setError("Las calificaciones deben estar entre 0 y 100.");
      return;
    }

    const calificaciones = captura.alumnos.flatMap((alumno) =>
      captura.parciales.map((parcial) => {
        const value =
          formValues[getCellKey(alumno.id_carga, parcial.id_parcial)];
        const valueLimpio = String(value).trim();

        return {
          id_carga: alumno.id_carga,
          id_parcial: parcial.id_parcial,
          calificacion: valueLimpio === "" ? null : Number(valueLimpio),
        };
      }),
    );

    try {
      setSaving(true);

      const response = await guardarCapturaCalificaciones(
        captura.grupo_materia.id_grupo_materia,
        calificaciones,
      );

      setCaptura(response);
      setFormValues(extraerValores(response));
      setMensaje("Calificaciones guardadas correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setSaving(false);
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
            Captura de calificaciones
          </h1>

          <p className="mt-1 text-slate-500">
            Selecciona un grupo asignado y registra las calificaciones de sus
            alumnos.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarGrupos}
          disabled={loadingCaptura || saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {mensaje && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Grupos asignados
              </h2>
              <p className="text-sm text-slate-500">Solo tus materias</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
              {grupos.length}
            </span>
          </div>

          {grupos.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-500">
              No tienes grupos asignados para captura.
            </div>
          ) : (
            <div className="max-h-[calc(100vh-260px)] divide-y divide-slate-100 overflow-y-auto">
              {grupos.map((grupoMateria) => {
                const seleccionado =
                  String(grupoSeleccionadoId) ===
                  String(grupoMateria.id_grupo_materia);

                return (
                  <button
                    type="button"
                    key={grupoMateria.id_grupo_materia}
                    onClick={() => {
                      setError("");
                      setMensaje("");
                      setLoadingCaptura(true);

                      if (
                        String(grupoSeleccionadoId) ===
                        String(grupoMateria.id_grupo_materia)
                      ) {
                        setCapturaRefreshKey((prev) => prev + 1);
                        return;
                      }

                      setGrupoSeleccionadoId(grupoMateria.id_grupo_materia);
                    }}
                    className={`w-full px-5 py-4 text-left transition ${
                      seleccionado
                        ? "bg-blue-50 text-blue-900"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          seleccionado
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">
                          {grupoMateria.materia?.nombre || "Materia sin nombre"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {grupoMateria.grupo?.nombre || "Grupo sin nombre"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {getGrupoMeta(grupoMateria)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="space-y-4">
          {loadingCaptura && (
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
            </div>
          )}

          {!loadingCaptura && captura && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Alumnos
                    </p>
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {resumen.totalAlumnos}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Parciales
                    </p>
                    <ClipboardCheck size={18} className="text-blue-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {resumen.totalParciales}
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
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {getGrupoTitulo(captura.grupo_materia)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {getGrupoMeta(captura.grupo_materia)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={saving || captura.alumnos.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />
                    {saving ? "Guardando..." : "Guardar captura"}
                  </button>
                </div>

                {captura.alumnos.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-500">
                    Este grupo aun no tiene alumnos en carga academica.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="w-72 px-5 py-4 text-left text-sm font-semibold text-slate-600">
                            Alumno
                          </th>
                          <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                            Matricula
                          </th>
                          {captura.parciales.map((parcial) => (
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
                            <span className="block whitespace-nowrap">
                              Prom. 1er y 2do
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                              Parcial
                            </span>
                          </th>
                          <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                            Promedio
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {captura.alumnos.map((alumno) => (
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
                                {alumno.alumno?.numero_control || "Sin dato"}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {alumno.alumno?.matricula || "Sin matricula"}
                            </td>
                            {captura.parciales.map((parcial) => {
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

                                      // Permitir vacío para borrar el campo
                                      if (value === "") {
                                        handleChangeCalificacion(
                                          alumno.id_carga,
                                          parcial.id_parcial,
                                          "",
                                        );
                                        return;
                                      }

                                      // Convertir a entero
                                      value = parseInt(value, 10);

                                      // Evitar NaN
                                      if (isNaN(value)) return;

                                      // Limitar entre 0 y 100
                                      if (value < 0) value = 0;
                                      if (value > 100) value = 100;

                                      handleChangeCalificacion(
                                        alumno.id_carga,
                                        parcial.id_parcial,
                                        value,
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      // Bloquear caracteres para decimales
                                      if (
                                        e.key === "." ||
                                        e.key === "," ||
                                        e.key === "e" ||
                                        e.key === "-"
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    aria-label={`Calificacion ${
                                      parcial.nombre
                                    } de ${nombreAlumnoApellidosPrimero(
                                      alumno,
                                      "alumno",
                                    )}`}
                                    className="h-10 w-24 rounded-md border border-slate-300 px-3 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                  />
                                </td>
                              );
                            })}

                            <td className="px-5 py-4 text-center text-sm font-bold text-blue-700">
                              {calcularPromedioPrimerosParciales(alumno)}
                            </td>

                            <td className="px-5 py-4 text-center text-sm font-bold text-slate-900">
                              {calcularPromedio(alumno)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {!loadingCaptura && !captura && grupos.length > 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
              Selecciona un grupo para iniciar la captura.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
