import { useEffect, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import {
  obtenerGruposMaterias,
  obtenerPeriodos,
} from "../services/alumnosGruposService";
import { obtenerReporteReinscripcionAlumnos } from "../services/reportesService";
import { formatDateDDMMYYYY } from "../utils/fechas";

const initialForm = {
  grupoId: "",
  periodoId: "",
};

const formatearFecha = (value) => {
  return formatDateDDMMYYYY(value);
};

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;

  return "No se pudo cargar el registro de reinscripcion.";
};

const gruposUnicos = (gruposMaterias = []) => {
  const map = new Map();

  gruposMaterias.forEach((item) => {
    if (item.grupo?.id_grupo && !map.has(item.grupo.id_grupo)) {
      map.set(item.grupo.id_grupo, item.grupo);
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || ""),
  );
};

export default function RegistroReinscripcionAlumnos() {
  const [form, setForm] = useState(initialForm);
  const [grupos, setGrupos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      setLoading(true);
      setError("");

      try {
        const [gruposMateriasResponse, periodosResponse] = await Promise.all([
          obtenerGruposMaterias(),
          obtenerPeriodos(),
        ]);

        if (!activo) return;

        setGrupos(gruposUnicos(gruposMateriasResponse));
        setPeriodos(periodosResponse);
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError("No se pudieron cargar grupos y periodos.");
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setReporte(null);
  };

  const handleBuscar = async () => {
    if (!form.grupoId) {
      setError("Selecciona un grupo.");
      return;
    }

    setLoadingReporte(true);
    setError("");

    try {
      const response = await obtenerReporteReinscripcionAlumnos({
        grupoId: form.grupoId,
        periodoId: form.periodoId,
      });

      setReporte(response);
    } catch (requestError) {
      console.error(requestError);
      setReporte(null);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const encabezado = reporte?.encabezado || {};
  const firmas = reporte?.firmas || {};
  const pie = reporte?.pie || {};
  const alumnos = reporte?.alumnos || [];

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .reinscripcion-documento {
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 7.2pt;
            line-height: 1.15;
          }

          .reinscripcion-documento,
          .reinscripcion-documento * {
            box-sizing: border-box;
          }

          .reinscripcion-hoja {
            width: 11in;
            min-height: 8.5in;
            padding: 0.28in 0.55in 0.16in;
            background: #fff;
          }

          .reinscripcion-header {
            display: grid;
            grid-template-columns: 1.9in 1fr 1.9in;
            align-items: start;
            min-height: 0.85in;
          }

          .reinscripcion-logo {
            width: 1.42in;
            height: 0.55in;
            border: 1px solid #777;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14pt;
            font-weight: 900;
          }

          .reinscripcion-title {
            text-align: center;
            font-weight: 700;
          }

          .reinscripcion-title p {
            margin: 0;
          }

          .reinscripcion-title .main {
            margin-top: 0.04in;
            font-size: 8pt;
          }

          .reinscripcion-meta {
            display: grid;
            grid-template-columns: 1fr 2.15in;
            gap: 0.45in;
            margin-top: 0.1in;
            font-size: 7.1pt;
            font-weight: 700;
          }

          .reinscripcion-meta p {
            margin: 0 0 0.015in;
          }

          .reinscripcion-table {
            width: 100%;
            margin-top: 0.08in;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .reinscripcion-table th,
          .reinscripcion-table td {
            border: 1px solid #333;
            padding: 0.025in 0.035in;
            vertical-align: middle;
          }

          .reinscripcion-table th {
            font-size: 6.4pt;
            font-weight: 900;
            text-align: center;
          }

          .reinscripcion-table td {
            height: 0.19in;
            font-size: 6.7pt;
          }

          .reinscripcion-table .center {
            text-align: center;
          }

          .reinscripcion-table .nombre {
            font-weight: 700;
          }

          .reinscripcion-spacer {
            min-height: 5.3in;
          }

          .reinscripcion-signatures {
            display: grid;
            grid-template-columns: 2.5in 1fr 2.25in;
            align-items: end;
            margin-top: 0.2in;
            font-size: 6.2pt;
            font-weight: 900;
            text-align: center;
          }

          .reinscripcion-signatures p {
            margin: 0;
          }

          .reinscripcion-footer {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            margin-top: 0.16in;
            border-top: 1px solid #999;
            padding-top: 0.04in;
            font-size: 6.2pt;
            font-weight: 900;
          }

          .reinscripcion-footer :nth-child(2) {
            text-align: center;
          }

          .reinscripcion-footer :nth-child(3) {
            text-align: right;
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

            body * {
              visibility: hidden;
            }

            #reinscripcion-preview,
            #reinscripcion-preview * {
              visibility: visible;
            }

            #reinscripcion-preview {
              position: absolute;
              top: 0;
              left: 0;
              width: 11in;
              min-height: 8.5in;
              margin: 0;
              box-shadow: none;
            }

            @page {
              size: letter landscape;
              margin: 0;
            }
          }
        `}
      </style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FileText size={22} />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Registro de reinscripcion
            </h1>
            <p className="mt-1 text-slate-500">
              Genera el listado oficial por grupo y periodo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!reporte}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Datos de consulta
          </h2>

          <div className="mt-5 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Grupo
              </span>
              <select
                name="grupoId"
                value={form.grupoId}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loading ? "Cargando grupos..." : "Selecciona un grupo"}
                </option>
                {grupos.map((grupo) => (
                  <option key={grupo.id_grupo} value={grupo.id_grupo}>
                    {grupo.nombre}
                    {grupo.turno ? ` - ${grupo.turno}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Periodo
              </span>
              <select
                name="periodoId"
                value={form.periodoId}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loading ? "Cargando periodos..." : "Periodo activo"}
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
              onClick={handleBuscar}
              disabled={loading || loadingReporte}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} />
              {loadingReporte ? "Consultando..." : "Generar registro"}
            </button>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="reinscripcion-preview"
            className="reinscripcion-hoja reinscripcion-documento mx-auto shadow-sm"
          >
            <header className="reinscripcion-header">
              <div className="reinscripcion-logo">EDUCACION</div>

              <div className="reinscripcion-title">
                <p>{encabezado.dependencia || "Secretaria de Educacion"}</p>
                <p>
                  {encabezado.subsecretaria ||
                    "Subsecretaria de Educacion Media Superior, Superior e Investigacion"}
                </p>
                <p className="main">
                  {reporte?.titulo || "Registro de Reinscripcion de Alumnos"}
                </p>
              </div>

              <div />
            </header>

            <section className="reinscripcion-meta">
              <div>
                <p>Escuela: {encabezado.escuela || ""}</p>
                <p>Ubicacion: {encabezado.ubicacion || ""}</p>
                <p>Ciudad: {encabezado.ciudad || ""}</p>
                <p>Carrera: {encabezado.carrera || ""}</p>
              </div>

              <div>
                <p>{encabezado.cuatrimestre || ""}</p>
                <p>Clave: {encabezado.clave || ""}</p>
                <p>RVOE: {encabezado.rvoe || ""}</p>
                <p>Ciclo: {encabezado.ciclo || ""}</p>
              </div>
            </section>

            <table className="reinscripcion-table">
              <colgroup>
                <col style={{ width: "0.35in" }} />
                <col style={{ width: "3.4in" }} />
                <col style={{ width: "0.35in" }} />
                <col style={{ width: "0.35in" }} />
                <col style={{ width: "0.35in" }} />
                <col style={{ width: "0.35in" }} />
                <col style={{ width: "2.55in" }} />
                <col style={{ width: "0.95in" }} />
                <col style={{ width: "0.72in" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                  <th>A.Nac.</th>
                  <th>C.Est</th>
                  <th>Observaciones</th>
                  <th>No.Control</th>
                  <th>Fec.Validacion</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.length > 0 ? (
                  alumnos.map((alumno) => (
                    <tr key={alumno.id_alumno || alumno.no}>
                      <td className="center">{alumno.no}</td>
                      <td className="nombre">{alumno.nombre}</td>
                      <td className="center">{alumno.edad ?? ""}</td>
                      <td className="center">{alumno.sexo}</td>
                      <td className="center">{alumno.a_nac}</td>
                      <td className="center">{alumno.c_est}</td>
                      <td>{alumno.observaciones}</td>
                      <td className="center">{alumno.numero_control}</td>
                      <td className="center">
                        {formatearFecha(alumno.fecha_validacion)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="center" colSpan={9}>
                      {reporte
                        ? "Sin alumnos registrados para este grupo y periodo."
                        : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="reinscripcion-spacer" />

            <section className="reinscripcion-signatures">
              <div>
                <p>COORDINADOR DE CONTROL ESCOLAR DE</p>
                <p>EDUCACION MEDIA SUPERIOR Y SUPERIOR</p>
                <br />
                <p>{firmas.coordinador_control_escolar || ""}</p>
              </div>

              <div />

              <div>
                <p>CONTROL ESCOLAR</p>
                <br />
                <p>{firmas.control_escolar || ""}</p>
              </div>
            </section>

            <footer className="reinscripcion-footer">
              <span>{pie.version || "IPES v 1.0.30"}</span>
              <span>FECHA: {formatearFecha(pie.fecha)}</span>
              <span>
                PAGINA {pie.pagina || 1} DE {pie.total_paginas || 1}
              </span>
            </footer>
          </article>
        </section>
      </div>
    </div>
  );
}
