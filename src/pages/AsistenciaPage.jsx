import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Download,
  RefreshCw,
  Save,
  Users,
  XCircle,
} from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import {
  guardarCapturaAsistencia,
  obtenerCapturaAsistencia,
  obtenerGruposAsistencia,
} from "../services/asistenciasService";
import { useAuth } from "../context/authStore";
import {
  nombreAlumnoApellidosPrimero,
  nombreApellidosPrimero,
} from "../utils/nombres";
import { formatDateDDMMYYYY } from "../utils/fechas";

const getCellKey = (idCarga, fecha) => `${idCarga}-${fecha}`;

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

const getFechaHoy = () => {
  const fecha = new Date();
  const fechaLocal = new Date(
    fecha.getTime() - fecha.getTimezoneOffset() * 60000,
  );

  return fechaLocal.toISOString().slice(0, 10);
};

const formatFecha = (fecha) => {
  return formatDateDDMMYYYY(fecha, "-");
};

const esFechaFutura = (fecha) => {
  return Boolean(fecha) && fecha > getFechaHoy();
};

const extraerValores = (captura) => {
  const valores = {};

  captura.alumnos?.forEach((alumno) => {
    alumno.asistencias?.forEach((asistencia) => {
      valores[getCellKey(alumno.id_carga, asistencia.fecha)] = Boolean(
        asistencia.asistencia,
      );
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

const formatPorcentaje = (value) => {
  if (value === null || value === undefined) return "-";

  return `${Number(value).toFixed(1)}%`;
};

const calcularPromedioAlumno = (alumno, fechas, valores) => {
  if (!fechas.length) return null;

  const asistencias = fechas.reduce((total, fecha) => {
    return total + (valores[getCellKey(alumno.id_carga, fecha)] ? 1 : 0);
  }, 0);

  return (asistencias / fechas.length) * 100;
};

const contarAsistencias = (alumno, fechas, valores) => {
  return fechas.reduce((total, fecha) => {
    return total + (valores[getCellKey(alumno.id_carga, fecha)] ? 1 : 0);
  }, 0);
};

const getAlumnoNombre = (alumno) => {
  return nombreAlumnoApellidosPrimero(alumno);
};

const getUsuarioNombre = (user) => {
  if (!user) return "Usuario";

  const nombreCompleto = nombreApellidosPrimero(user);

  return nombreCompleto || "Usuario";
};

const getCuatrimestreTexto = (grupoMateria) => {
  const cuatrimestre = grupoMateria?.grupo?.cuatrimestre;

  if (cuatrimestre?.nombre) {
    return cuatrimestre.nombre;
  }

  if (cuatrimestre?.numero != null) {
    return `Cuatrimestre ${cuatrimestre.numero}`;
  }

  const nombreGrupo = grupoMateria?.grupo?.nombre || "";
  const match = nombreGrupo.match(/\d+/);

  return match ? `Cuatrimestre ${match[0]}` : "";
};

const getPeriodoTexto = (captura) => {
  const parcial = captura?.parciales?.find(
    (item) => item.id_parcial === captura.parcial_seleccionado_id,
  );

  return parcial?.nombre || captura?.grupo_materia?.periodo?.nombre || "";
};

const getAsistenciaPdfMark = (mode, alumno, fecha, valores) => {
  if (mode !== "capturada") return "";

  return valores[getCellKey(alumno.id_carga, fecha)] ? "." : "/";
};

const buildPdfRows = (alumnos) => {
  const minRows = 15;
  const rows = [...(alumnos || [])];

  while (rows.length < minRows) {
    rows.push(null);
  }

  return rows;
};

const PDF_ACTIVITY_COLUMNS = 14;
const PDF_EMPTY_ATTENDANCE_COLUMNS = 15;
const PDF_EMPTY_ATTENDANCE_KEYS = Array.from(
  { length: PDF_EMPTY_ATTENDANCE_COLUMNS },
  (_, index) => `empty-attendance-${index + 1}`,
);

export default function AsistenciaPage() {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState("");
  const [parcialSeleccionadoId, setParcialSeleccionadoId] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(getFechaHoy);
  const [capturaRefreshKey, setCapturaRefreshKey] = useState(0);
  const [captura, setCaptura] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCaptura, setLoadingCaptura] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfMode, setPdfMode] = useState("vacio");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const cargarGrupos = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await obtenerGruposAsistencia();
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
        setParcialSeleccionadoId("");
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

    obtenerGruposAsistencia()
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
    if (!grupoSeleccionadoId || !fechaSeleccionada) {
      return;
    }

    let activo = true;

    obtenerCapturaAsistencia(
      grupoSeleccionadoId,
      fechaSeleccionada,
      parcialSeleccionadoId,
    )
      .then((response) => {
        if (!activo) return;

        setCaptura(response);
        setFormValues(extraerValores(response));

        if (!parcialSeleccionadoId && response.parcial_seleccionado_id) {
          setParcialSeleccionadoId(response.parcial_seleccionado_id);
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
          setLoadingCaptura(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [
    grupoSeleccionadoId,
    parcialSeleccionadoId,
    fechaSeleccionada,
    capturaRefreshKey,
  ]);

  const resumen = useMemo(() => {
    const totalAlumnos = captura?.alumnos?.length || 0;
    const totalClases = captura?.fechas?.length || 0;
    const presentesHoy =
      captura?.alumnos?.filter(
        (alumno) => formValues[getCellKey(alumno.id_carga, fechaSeleccionada)],
      ).length || 0;
    const alumnosEnRiesgo =
      captura?.alumnos?.filter((alumno) => {
        const promedio = calcularPromedioAlumno(
          alumno,
          captura?.fechas || [],
          formValues,
        );

        return promedio !== null && promedio < 80;
      }).length || 0;

    return {
      totalAlumnos,
      totalClases,
      presentesHoy,
      alumnosEnRiesgo,
    };
  }, [captura, fechaSeleccionada, formValues]);

  const pdfAttendanceColumns = useMemo(() => {
    if (pdfMode === "vacio") {
      return PDF_EMPTY_ATTENDANCE_KEYS;
    }

    return captura?.fechas || [];
  }, [captura?.fechas, pdfMode]);

  const handleChangeAsistencia = (idCarga, fecha, value) => {
    setFormValues((prev) => ({
      ...prev,
      [getCellKey(idCarga, fecha)]: value,
    }));
  };

  const handleMarcarFecha = (value) => {
    if (!captura) return;

    if (esFechaFutura(fechaSeleccionada)) {
      setError("No puedes capturar asistencia de dias futuros.");
      return;
    }

    setFormValues((prev) => {
      const next = { ...prev };

      captura.alumnos.forEach((alumno) => {
        next[getCellKey(alumno.id_carga, fechaSeleccionada)] = value;
      });

      return next;
    });
  };

  const handleGuardar = async () => {
    if (!captura || saving || !fechaSeleccionada) return;

    setMensaje("");
    setError("");

    if (esFechaFutura(fechaSeleccionada)) {
      setError("No puedes capturar asistencia de dias futuros.");
      return;
    }

    const fechasGuardables = (captura.fechas || []).filter(
      (fecha) => !esFechaFutura(fecha),
    );

    const asistencias = captura.alumnos.flatMap((alumno) =>
      fechasGuardables.map((fecha) => ({
        id_carga: alumno.id_carga,
        fecha,
        asistencia: Boolean(formValues[getCellKey(alumno.id_carga, fecha)]),
      })),
    );

    try {
      setSaving(true);

      const response = await guardarCapturaAsistencia(
        captura.grupo_materia.id_grupo_materia,
        parcialSeleccionadoId || captura.parcial_seleccionado_id,
        fechaSeleccionada,
        asistencias,
      );

      setCaptura(response);
      setFormValues(extraerValores(response));
      setMensaje("Asistencia guardada correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleImprimirPdf = (mode) => {
    if (!captura || captura.alumnos.length === 0) return;

    const tituloOriginal = document.title;

    setPdfMode(mode);
    document.title = "asistencia";

    const restaurarTitulo = () => {
      document.title = tituloOriginal;
      window.removeEventListener("afterprint", restaurarTitulo);
    };

    window.addEventListener("afterprint", restaurarTitulo);
    window.setTimeout(() => window.print(), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="asistencia-page-root min-h-screen space-y-6 bg-[var(--background)] p-6">
      <style>
        {`
          .asistencia-pdf-documento,
          .asistencia-pdf-documento * {
            box-sizing: border-box;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .asistencia-print-area {
            position: absolute;
            left: -9999px;
            top: 0;
          }

          .asistencia-pdf-hoja {
            width: 11in;
            min-height: 8.5in;
            padding: 0.22in 0.34in 0.18in;
            background: #fff;
            color: #000;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 7.2pt;
            line-height: 1.05;
          }

          .asistencia-pdf-header {
            display: grid;
            grid-template-columns: 1.9in 1fr 1.55in;
            align-items: start;
            gap: 0.15in;
          }

          .asistencia-pdf-logo {
            width: 1.55in;
            height: auto;
          }

          .asistencia-pdf-title {
            text-align: center;
            font-family: "Times New Roman", Times, serif;
            font-size: 8.5pt;
            line-height: 1.05;
            text-transform: uppercase;
          }

          .asistencia-pdf-title strong {
            display: block;
            font-size: 8pt;
          }

          .asistencia-pdf-career-logo {
            min-height: 0.65in;
            text-align: center;
            font-size: 6pt;
            color: #c2188f;
          }

          .asistencia-pdf-meta {
            display: grid;
            grid-template-columns: 1fr 2.7in 1fr;
            gap: 0.14in;
            margin-top: 0.06in;
          }

          .asistencia-pdf-box {
            min-height: 0.29in;
            border: 1.6px solid #000;
            padding: 0.07in 0.05in;
            font-weight: 700;
            font-style: italic;
          }

          .asistencia-pdf-periodo {
            display: grid;
            grid-template-rows: auto 1fr 1fr;
            gap: 0.05in;
            text-align: center;
            font-weight: 700;
            font-style: italic;
          }

          .asistencia-pdf-line {
            border-bottom: 1.2px solid #000;
            min-height: 0.17in;
          }

          .asistencia-pdf-table {
            width: 100%;
            margin-top: 0.11in;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .asistencia-pdf-table th,
          .asistencia-pdf-table td {
            border: 1.2px solid #000;
            padding: 0.025in;
            vertical-align: middle;
          }

          .asistencia-pdf-table th {
            background: #dedede;
            font-family: "Times New Roman", Times, serif;
            font-weight: 700;
            text-align: center;
          }

          .asistencia-pdf-no {
            /* Ancho de la columna "No." */
            width: 0.26in;
            text-align: center;
          }

          .asistencia-pdf-name {
            /* Ancho de la columna "Nombre del Alumno" */
            width: 1.85in;
            font-size: 6pt;
            text-transform: uppercase;
          }

          .asistencia-pdf-main-title {
            font-size: 14pt;
          }

          .asistencia-pdf-small-title {
            font-size: 6pt;
            line-height: 1.1;
          }

          .asistencia-pdf-date {
            /* Ancho y alto de las celdas verdes de asistencia */
            width: 0.5in;
            height: 0.43in;
            text-align: center;
            font-size: 7.5pt;
            font-weight: 700;
          }

          .asistencia-pdf-activity {
            /* Ancho de las celdas azules de actividades */
            width: 0.5in;
            text-align: center;
          }

          .asistencia-pdf-blue {
            text-align: center;
          }

          .asistencia-pdf-peach {
            text-align: center;
          }

          .asistencia-pdf-final {
            /* Ancho de la columna "CPFL" */
            width: 1.75in;
          }

          .asistencia-pdf-table th.asistencia-pdf-date,
          .asistencia-pdf-table td.asistencia-pdf-date {
            background: #d9f0cf;
          }

          .asistencia-pdf-table th.asistencia-pdf-activity,
          .asistencia-pdf-table td.asistencia-pdf-activity,
          .asistencia-pdf-table th.asistencia-pdf-blue,
          .asistencia-pdf-table td.asistencia-pdf-blue {
            background: #bfe5f2;
          }

          .asistencia-pdf-table th.asistencia-pdf-peach,
          .asistencia-pdf-table td.asistencia-pdf-peach {
            background: #f5dccd;
          }

          .asistencia-pdf-body td {
            /* Alto de las filas del listado de alumnos */
            height: 0.19in;
            font-size: 6pt;
          }

          .asistencia-pdf-mark {
            font-size: 9pt;
            font-weight: 700;
            text-align: center;
          }

          .asistencia-pdf-bottom {
            display: grid;
            grid-template-columns: 3.45in 1.72in 1fr;
            gap: 0.3in;
            margin-top: 0.13in;
          }

          .asistencia-pdf-bottom table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .asistencia-pdf-bottom th,
          .asistencia-pdf-bottom td {
            border: 1.2px solid #000;
            padding: 0.035in;
            font-size: 6.2pt;
            height: 0.18in;
          }

          .asistencia-pdf-bottom th {
            background: #dedede;
            text-align: center;
            font-weight: 700;
          }

          .asistencia-pdf-observaciones th {
            background: #47d24f;
          }

          .asistencia-pdf-observaciones td {
            font-size: 5.8pt;
            font-weight: 700;
          }

          .asistencia-pdf-firmas {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.65in;
            margin-top: 0.36in;
            text-align: center;
            font-size: 6.1pt;
            font-weight: 700;
          }

          .asistencia-pdf-firma-linea {
            border-top: 1.2px solid #000;
            padding-top: 0.04in;
          }

          @media print {
            html,
            body,
            #root {
              width: 11in;
              height: 8.5in;
              margin: 0;
              overflow: hidden;
            }

            .asistencia-page-root {
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }

            .asistencia-page-root > :not(style):not(.asistencia-print-area) {
              display: none !important;
            }

            body * {
              visibility: hidden;
            }

            .asistencia-print-area {
              position: static;
              left: auto;
              top: auto;
              width: 11in;
              height: 8.5in;
              overflow: hidden;
              display: block !important;
              page-break-after: avoid;
            }

            #asistencia-pdf-preview,
            #asistencia-pdf-preview * {
              visibility: visible;
            }

            #asistencia-pdf-preview {
              position: fixed;
              left: 0;
              top: 0;
              width: 11in;
              height: 8.5in;
              overflow: hidden;
              page-break-after: avoid;
            }

            @page {
              size: letter landscape;
              margin: 0;
            }
          }
        `}
      </style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Asistencia</h1>

          <p className="mt-1 text-slate-500">
            Controla la asistencia de tus materias y grupos activos.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                Usuario
              </span>
              <span className="mt-1 block text-base font-semibold text-slate-900">
                {getUsuarioNombre(user)}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                Cuatrimestre
              </span>
              <span className="mt-1 block text-base font-semibold text-slate-900">
                {getCuatrimestreTexto(captura?.grupo_materia) || "No disponible"}
              </span>
            </div>
          </div>
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
                Grupos activos
              </h2>
              <p className="text-sm text-slate-500">Solo tus materias</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
              {grupos.length}
            </span>
          </div>

          {grupos.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-500">
              No tienes grupos activos para asistencia.
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

          {captura?.parciales?.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-4">
              <label
                htmlFor="parcial-asistencia"
                className="text-sm font-semibold text-slate-700"
              >
                Parcial
              </label>
              <select
                id="parcial-asistencia"
                value={
                  parcialSeleccionadoId ||
                  captura.parcial_seleccionado_id ||
                  ""
                }
                onChange={(event) => {
                  setMensaje("");
                  setError("");
                  setLoadingCaptura(true);
                  setParcialSeleccionadoId(event.target.value);
                }}
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {captura.parciales.map((parcial) => (
                  <option key={parcial.id_parcial} value={parcial.id_parcial}>
                    {parcial.nombre || `Parcial ${parcial.id_parcial}`}
                  </option>
                ))}
              </select>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                      Dias del parcial
                    </p>
                    <CalendarCheck size={18} className="text-blue-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {resumen.totalClases}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Presentes
                    </p>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {resumen.presentesHoy}
                  </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-red-600">
                      Menos de 80%
                    </p>
                    <AlertCircle size={18} className="text-red-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-red-700">
                    {resumen.alumnosEnRiesgo}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {getGrupoTitulo(captura.grupo_materia)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {getGrupoMeta(captura.grupo_materia)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                      type="date"
                      value={fechaSeleccionada}
                      max={getFechaHoy()}
                      onChange={(event) => {
                        const nuevaFecha = event.target.value;

                        setMensaje("");
                        setError("");

                        if (esFechaFutura(nuevaFecha)) {
                          setError(
                            "No puedes capturar asistencia de dias futuros.",
                          );
                          return;
                        }

                        setLoadingCaptura(true);
                        setFechaSeleccionada(nuevaFecha);
                      }}
                      className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarcarFecha(true)}
                        disabled={
                          saving ||
                          captura.alumnos.length === 0 ||
                          esFechaFutura(fechaSeleccionada)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 size={18} />
                        Todos
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarcarFecha(false)}
                        disabled={
                          saving ||
                          captura.alumnos.length === 0 ||
                          esFechaFutura(fechaSeleccionada)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle size={18} />
                        Ninguno
                      </button>

                      <button
                        type="button"
                        onClick={handleGuardar}
                        disabled={
                          saving ||
                          captura.alumnos.length === 0 ||
                          esFechaFutura(fechaSeleccionada)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={18} />
                        {saving ? "Guardando..." : "Guardar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleImprimirPdf("vacio")}
                        disabled={captura.alumnos.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Download size={18} />
                        PDF vacio
                      </button>

                      <button
                        type="button"
                        onClick={() => handleImprimirPdf("capturada")}
                        disabled={captura.alumnos.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Download size={18} />
                        PDF asistencia
                      </button>
                    </div>
                  </div>
                </div>

                {captura.alumnos.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-500">
                    Este grupo aun no tiene alumnos activos.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="sticky left-0 z-10 w-72 bg-slate-50 px-5 py-4 text-left text-sm font-semibold text-slate-600">
                            Alumno
                          </th>
                          <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                            Matricula
                          </th>
                          {captura.fechas.map((fecha) => (
                            <th
                              key={fecha}
                              className={`px-5 py-4 text-center text-sm font-semibold ${
                                fecha === fechaSeleccionada
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-600"
                              }`}
                            >
                              <span className="block whitespace-nowrap">
                                {formatFecha(fecha)}
                              </span>
                            </th>
                          ))}
                          <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                            Promedio parcial
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {captura.alumnos.map((alumno) => {
                          const promedio = calcularPromedioAlumno(
                            alumno,
                            captura.fechas,
                            formValues,
                          );
                          const esRiesgo = promedio !== null && promedio < 80;
                          const asistencias = contarAsistencias(
                            alumno,
                            captura.fechas,
                            formValues,
                          );

                          return (
                            <tr
                              key={alumno.id_carga}
                              className={`border-t border-slate-100 ${
                                esRiesgo ? "bg-red-50/80" : "bg-white"
                              }`}
                            >
                              <td
                                className={`sticky left-0 z-10 px-5 py-4 ${
                                  esRiesgo ? "bg-red-50" : "bg-white"
                                }`}
                              >
                                <p
                                  className={`font-semibold ${
                                    esRiesgo ? "text-red-800" : "text-slate-900"
                                  }`}
                                >
                                  {getAlumnoNombre(alumno)}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Control:{" "}
                                  {alumno.alumno?.numero_control || "Sin dato"}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {alumno.alumno?.matricula || "Sin matricula"}
                              </td>

                              {captura.fechas.map((fecha) => {
                                const key = getCellKey(alumno.id_carga, fecha);
                                const checked = Boolean(formValues[key]);
                                const editable = !esFechaFutura(fecha);

                                return (
                                  <td
                                    key={fecha}
                                    className={`px-5 py-4 text-center ${
                                      fecha === fechaSeleccionada
                                        ? "bg-blue-50/60"
                                        : ""
                                    }`}
                                  >
                                    <label
                                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white transition ${
                                        editable
                                          ? "cursor-pointer hover:border-blue-300"
                                          : "cursor-not-allowed opacity-70"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={!editable || saving}
                                        onChange={(event) =>
                                          handleChangeAsistencia(
                                            alumno.id_carga,
                                            fecha,
                                            event.target.checked,
                                          )
                                        }
                                        aria-label={`Asistencia de ${getAlumnoNombre(
                                          alumno,
                                        )} en ${formatFecha(fecha)}`}
                                        className="sr-only"
                                      />
                                      {checked ? (
                                        <CheckCircle2
                                          size={20}
                                          className="text-emerald-600"
                                        />
                                      ) : (
                                        <XCircle
                                          size={20}
                                          className="text-slate-300"
                                        />
                                      )}
                                    </label>
                                  </td>
                                );
                              })}

                              <td className="px-5 py-4 text-center">
                                <span
                                  className={`inline-flex min-w-20 justify-center rounded-md px-3 py-1 text-sm font-bold ${
                                    esRiesgo
                                      ? "bg-red-100 text-red-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {formatPorcentaje(promedio)}
                                </span>
                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  {asistencias}/{captura.fechas.length}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {!loadingCaptura && !captura && grupos.length > 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
              Selecciona un grupo para iniciar la asistencia.
            </div>
          )}
        </section>
      </div>

      {captura && (
        <div className="asistencia-print-area" aria-hidden="true">
          <article
            id="asistencia-pdf-preview"
            className="asistencia-pdf-hoja asistencia-pdf-documento"
          >
            <header className="asistencia-pdf-header">
              <img
                className="asistencia-pdf-logo"
                src={logoUnifront}
                alt="UNIFRONT"
              />

              <div className="asistencia-pdf-title">
                <div>CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA, UNIFRONT</div>
                <div>DEPARTAMENTO DE CONTROL ESCOLAR</div>
                <div>
                  CONTROL DE ASISTENCIA Y REGISTRO DE ACTIVIDADES DE
                  APRENDIZAJE, CRITERIOS Y PROCEDIMIENTOS DE EVALUACION
                </div>
                <strong>
                  {captura.grupo_materia?.materia?.nombre ||
                    "LICENCIATURA / MATERIA"}
                </strong>
                <div>
                  RVOE-BC-
                  {captura.grupo_materia?.materia?.clave || ""}
                </div>
              </div>

              <div className="asistencia-pdf-career-logo">
                {captura.grupo_materia?.materia?.nombre || ""}
              </div>
            </header>

            <section className="asistencia-pdf-meta">
              <div className="asistencia-pdf-box">
                Maestro (a): {captura.grupo_materia?.docente?.nombre || ""}
              </div>
              <div className="asistencia-pdf-periodo">
                <span>Periodo correspondiente del</span>
                <span className="asistencia-pdf-line">
                  {getPeriodoTexto(captura)}
                </span>
                <span className="asistencia-pdf-line">al</span>
              </div>
              <div className="asistencia-pdf-box">
                {getCuatrimestreTexto(captura.grupo_materia)}
              </div>

              <div className="asistencia-pdf-box">
                Asignatura: {captura.grupo_materia?.materia?.nombre || ""}
              </div>
              <div />
              <div className="asistencia-pdf-box">
                Grupo: {captura.grupo_materia?.grupo?.nombre || ""}
              </div>
            </section>

            <table className="asistencia-pdf-table">
              <thead>
                <tr>
                  <th rowSpan="3" className="asistencia-pdf-no">
                    No.
                  </th>
                  <th rowSpan="3" className="asistencia-pdf-name">
                    Nombre del Alumno
                  </th>
                  <th
                    colSpan={pdfAttendanceColumns.length}
                    className="asistencia-pdf-main-title"
                  >
                    Control de Asistencia
                  </th>
                  <th
                    colSpan={PDF_ACTIVITY_COLUMNS}
                    className="asistencia-pdf-small-title"
                  >
                    Registro de Actividades de Aprendizajes, Criterios y
                    Procedimientos de Evaluacion (Evaluacion continua)
                  </th>
                  <th colSpan="8">Concentrado de Evaluacion</th>
                </tr>
                <tr>
                  <th
                    colSpan={PDF_ACTIVITY_COLUMNS}
                    className="asistencia-pdf-small-title"
                  />
                  <th
                    colSpan={pdfAttendanceColumns.length}
                    className="asistencia-pdf-small-title"
                  />
                  <th colSpan="6" className="asistencia-pdf-small-title">
                    Resumen de porcentajes establecidos
                  </th>
                  <th rowSpan="2" className="asistencia-pdf-peach">
                    CPF
                  </th>
                  <th rowSpan="2" className="asistencia-pdf-final">
                    CPFL
                  </th>
                </tr>
                <tr>
                  {pdfAttendanceColumns.map((fecha) => (
                    <th key={`asistencia-${fecha}`} className="asistencia-pdf-date">
                      {pdfMode === "capturada" ? formatFecha(fecha).slice(0, 5) : ""}
                    </th>
                  ))}
                  {Array.from({ length: PDF_ACTIVITY_COLUMNS }, (_, index) => (
                    <th
                      key={`actividad-${index + 1}`}
                      className="asistencia-pdf-activity"
                    />
                  ))}
                  {["C1", "C2", "C3", "C4", "C5", "EPA"].map((label) => (
                    <th key={label} className="asistencia-pdf-blue">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="asistencia-pdf-body">
                {buildPdfRows(captura.alumnos).map((alumno, index) => (
                  <tr key={alumno?.id_carga || `empty-${index}`}>
                    <td className="asistencia-pdf-no">{index + 1}</td>
                    <td className="asistencia-pdf-name">
                      {alumno ? getAlumnoNombre(alumno) : ""}
                    </td>
                    {pdfAttendanceColumns.map((fecha) => (
                      <td
                        key={`mark-${alumno?.id_carga || index}-${fecha}`}
                        className="asistencia-pdf-date asistencia-pdf-mark"
                      >
                        {alumno
                          ? getAsistenciaPdfMark(
                              pdfMode,
                              alumno,
                              fecha,
                              formValues,
                            )
                          : ""}
                      </td>
                    ))}
                    {Array.from({ length: PDF_ACTIVITY_COLUMNS }, (_, index) => (
                      <td
                        key={`act-${alumno?.id_carga || "empty"}-${index + 1}`}
                        className="asistencia-pdf-activity"
                      />
                    ))}
                    {["C1", "C2", "C3", "C4", "C5", "EPA"].map((label) => (
                      <td
                        key={`${label}-${alumno?.id_carga || index}`}
                        className="asistencia-pdf-blue"
                      />
                    ))}
                    <td className="asistencia-pdf-peach" />
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>

            <section className="asistencia-pdf-bottom">
              <table>
                <thead>
                  <tr>
                    <th>CRITERIOS DE EVALUACION</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {["C1:", "C2:", "C3:", "C4:", "C5:", "Examen Parcial:"].map(
                    (label) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td />
                      </tr>
                    ),
                  )}
                </tbody>
              </table>

              <table>
                <thead>
                  <tr>
                    <th>Nomenclatura</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>C1: Criterio Uno</td>
                  </tr>
                  <tr>
                    <td>EPA: Examen Parcial</td>
                  </tr>
                  <tr>
                    <td>CPF: Calificacion Parcial Final</td>
                  </tr>
                  <tr>
                    <td>CPFL: Calificacion Parcial Final con Letra</td>
                  </tr>
                </tbody>
              </table>

              <table className="asistencia-pdf-observaciones">
                <thead>
                  <tr>
                    <th>Observaciones Generales:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      1- El llenado del presente formato debera ser en tinta
                      azul exclusivamente.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      2-La asistencia debera anotarse con un punto (.),
                      la inasistencia con una diagonal (/) y el retardo con una
                      equis (x).
                    </td>
                  </tr>
                  <tr>
                    <td>3-El alumno debera contar con el 80% de asistencia.</td>
                  </tr>
                  <tr>
                    <td>
                      4-El alumno que no acredite el parcial debera utilizar con
                      tinta roja.
                    </td>
                  </tr>
                  <tr>
                    <td>5- El redondeo se aplica a partir del .6.</td>
                  </tr>
                  <tr>
                    <td>
                      Nota: La entrega de calificaciones es a mas tardar 2 dias
                      despues de haber realizado la evaluacion , de acuerdo a la
                      normatividad en el Art.87, en el inciso X.
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="asistencia-pdf-firmas">
              <div className="asistencia-pdf-firma-linea">
                DIRECTOR DE LA LICENCIATURA
              </div>
              <div className="asistencia-pdf-firma-linea">
                FIRMA DEL (A) PROFESOR (A)
              </div>
              <div className="asistencia-pdf-firma-linea">CONTROL ESCOLAR</div>
            </section>
          </article>
        </div>
      )}
    </div>
  );
}
