import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import {
  obtenerAlumnosDetalle,
  obtenerPeriodos,
} from "../services/alumnosGruposService";
import {
  obtenerBoletaFinal,
  obtenerMiBoletaFinal,
} from "../services/calificacionesService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const numerosTexto = {
  0: "CERO",
  1: "UNA",
  2: "DOS",
  3: "TRES",
  4: "CUATRO",
  5: "CINCO",
  6: "SEIS",
  7: "SIETE",
  8: "OCHO",
  9: "NUEVE",
  10: "DIEZ",
  11: "ONCE",
  12: "DOCE",
  13: "TRECE",
  14: "CATORCE",
  15: "QUINCE",
  16: "DIECISEIS",
  17: "DIECISIETE",
  18: "DIECIOCHO",
  19: "DIECINUEVE",
  20: "VEINTE",
};

const initialForm = {
  alumnoId: "",
  periodoId: "",
};

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;

  return "No se pudo cargar la boleta final.";
};

const formatearCalificacion = (value) => {
  if (value === null || value === undefined) return "";

  return String(Math.round(Number(value)));
};

const formatearPromedio = (value) => {
  if (value === null || value === undefined) return "";

  return Number(value).toFixed(1);
};

const separarNombre = (nombre = "") => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return {
      nombres: "",
      primerApellido: "",
      segundoApellido: "",
    };
  }

  if (partes.length === 1) {
    return {
      nombres: partes[0],
      primerApellido: "",
      segundoApellido: "",
    };
  }

  if (partes.length === 2) {
    return {
      nombres: partes[1],
      primerApellido: partes[0],
      segundoApellido: "",
    };
  }

  return {
    nombres: partes.slice(2).join(" "),
    primerApellido: partes[0],
    segundoApellido: partes[1],
  };
};

const fechaDocumento = () => {
  const fecha = new Date();

  return `Tijuana B.C., a ${fecha.getDate()} de ${
    meses[fecha.getMonth()]
  } de ${fecha.getFullYear()}`;
};

const filasBoleta = (materias = []) => {
  const filas = materias.map((materia) => ({
    id: materia.id_materia,
    nombre: materia.nombre || "",
    clave: materia.clave || "",
    calificacion: formatearCalificacion(materia.calificacion_final),
  }));

  while (filas.length < 5) {
    filas.push({
      id: `empty-${filas.length}`,
      nombre: "",
      clave: "",
      calificacion: "",
    });
  }

  return filas;
};

export default function BoletaFinal({ modoAlumno = false }) {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [boleta, setBoleta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBoleta, setLoadingBoleta] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      setLoading(true);
      setError("");

      try {
        if (modoAlumno) {
          const periodosResponse = await obtenerPeriodos();

          if (!activo) return;

          setPeriodos(periodosResponse);
          return;
        }

        const [alumnosResponse, periodosResponse] = await Promise.all([
          obtenerAlumnosDetalle(),
          obtenerPeriodos(),
        ]);

        if (!activo) return;

        setAlumnos(
          alumnosResponse
            .slice()
            .sort((a, b) =>
              nombreAlumnoApellidosPrimero(a, "").localeCompare(
                nombreAlumnoApellidosPrimero(b, ""),
              ),
            ),
        );
        setPeriodos(periodosResponse);
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError(
            modoAlumno
              ? "No se pudieron cargar los periodos."
              : "No se pudieron cargar alumnos y periodos.",
          );
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
  }, [modoAlumno]);

  const nombreSeparado = useMemo(
    () => separarNombre(boleta?.alumno?.nombre),
    [boleta],
  );

  const materias = useMemo(
    () => filasBoleta(boleta?.materias),
    [boleta?.materias],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setBoleta(null);
  };

  const handleBuscar = async () => {
    if (!form.periodoId || (!modoAlumno && !form.alumnoId)) {
      setError(
        modoAlumno
          ? "Selecciona un ciclo escolar."
          : "Selecciona un alumno y un ciclo escolar.",
      );
      return;
    }

    setLoadingBoleta(true);
    setError("");

    try {
      const response = modoAlumno
        ? await obtenerMiBoletaFinal({
            periodoId: form.periodoId,
          })
        : await obtenerBoletaFinal({
            alumnoId: form.alumnoId,
            periodoId: form.periodoId,
          });

      setBoleta(response);
    } catch (requestError) {
      console.error(requestError);
      setBoleta(null);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoadingBoleta(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .boleta-documento {
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.18;
          }

          .boleta-documento,
          .boleta-documento * {
            box-sizing: border-box;
          }

          .boleta-hoja {
            width: 8.5in;
            min-height: 11in;
            padding: 0.22in 0.3in 0.18in;
            background: #fff;
          }

          .boleta-header {
            position: relative;
            min-height: 1.55in;
            text-align: center;
          }

          .boleta-logo-left {
            position: absolute;
            top: 0;
            left: 0;
            width: 1.72in;
            height: auto;
          }

          .boleta-logo-right {
            position: absolute;
            top: 0.04in;
            right: 0.08in;
            width: 1.05in;
            height: auto;
          }

          .boleta-title-school {
            margin: 0 1.1in;
            font-size: 18pt;
            font-weight: 500;
            line-height: 1.05;
          }

          .boleta-subtitle {
            margin: 0.3in 0 0;
            font-size: 8.1pt;
            font-weight: 700;
          }

          .boleta-main-title {
            margin: 0.1in 0 0.12in;
            font-size: 22pt;
            font-style: italic;
            font-weight: 900;
            text-align: center;
          }

          .boleta-blue {
            background: #0f78a5;
            color: #101010;
            font-size: 8pt;
            font-style: italic;
            font-weight: 800;
            text-align: center;
          }

          .boleta-top-grid {
            display: grid;
            grid-template-columns: 1fr 1.55fr 1fr;
            gap: 0.5in;
            margin: 0 0.18in 0.16in;
          }

          .boleta-box {
            border: 1.8px solid #111;
          }

          .boleta-box-value {
            min-height: 0.29in;
            padding: 0.04in 0.08in;
            font-size: 14pt;
            font-weight: 500;
            text-align: center;
          }

          .boleta-career {
            grid-column: 1 / span 2;
          }

          .boleta-career .boleta-box-value {
            font-size: 11pt;
            font-style: italic;
            font-weight: 900;
          }

          .boleta-name-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            margin: 0.02in 0.18in 0.31in;
            border: 1.8px solid #111;
          }

          .boleta-name-cell {
            min-height: 0.43in;
            padding: 0.06in 0.08in 0.02in;
            text-align: center;
          }

          .boleta-name-line {
            display: block;
            min-height: 0.18in;
            border-bottom: 1.4px solid #111;
            font-size: 8.8pt;
            font-weight: 500;
          }

          .boleta-name-label {
            display: block;
            margin-top: 0.02in;
            font-size: 6.7pt;
            font-weight: 900;
          }

          .boleta-period-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.58in;
            width: 4.72in;
            margin: 0 auto 0.36in;
          }

          .boleta-table {
            width: calc(100% - 0.36in);
            margin: 0 auto;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .boleta-table th,
          .boleta-table td {
            border: 1.7px solid #111;
            padding: 0.07in 0.07in;
          }

          .boleta-table th {
            height: 0.43in;
            font-size: 7.2pt;
            font-weight: 900;
          }

          .boleta-table td {
            height: 0.31in;
            font-size: 11pt;
          }

          .boleta-table td:nth-child(2),
          .boleta-table td:nth-child(3) {
            text-align: center;
            font-weight: 700;
          }

          .boleta-average {
            display: grid;
            grid-template-columns: 1fr 1in;
            align-items: center;
            gap: 0.24in;
            width: 3.05in;
            margin: 0.34in 0.18in 0.38in auto;
            font-size: 14pt;
          }

          .boleta-average-value {
            height: 0.34in;
            border: 1.8px solid #111;
            text-align: center;
            line-height: 0.31in;
          }

          .boleta-notes {
            margin: 0 0.18in;
            font-size: 8pt;
            font-weight: 700;
          }

          .boleta-footer-grid {
            display: grid;
            grid-template-columns: 1fr 1.85in;
            align-items: end;
            gap: 0.3in;
            margin: 0.1in 0.18in 0;
          }

          .boleta-date {
            margin-top: 0.3in;
            text-align: center;
            font-size: 7.2pt;
            font-weight: 700;
          }

          .boleta-signature {
            text-align: center;
            font-size: 6.8pt;
            font-weight: 900;
          }

          .boleta-signature-line {
            height: 0.18in;
            border-bottom: 1.6px solid #111;
          }

          .boleta-code {
            margin: 0.32in 0.18in 0;
            color: #a00000;
            font-size: 7.4pt;
            font-weight: 900;
          }

          .boleta-bottom-line {
            margin-top: 0.12in;
            border-top: 1.6px solid #0f78a5;
            padding-top: 0.04in;
            text-align: center;
            font-size: 7.2pt;
            font-weight: 700;
          }

          @media print {
            html,
            body,
            #root {
              width: 8.5in;
              height: 11in;
              margin: 0;
              overflow: hidden;
            }

            body * {
              visibility: hidden;
            }

            #boleta-preview,
            #boleta-preview * {
              visibility: visible;
            }

            #boleta-preview {
              position: absolute;
              top: 0;
              left: 0;
              width: 8.5in;
              height: 11in;
              min-height: 11in;
              margin: 0;
              box-shadow: none;
            }

            @page {
              size: letter;
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
              {modoAlumno ? "Mi boleta final" : "Boleta final"}
            </h1>
            <p className="mt-1 text-slate-500">
              {modoAlumno
                ? "Consulta tu boleta final por ciclo escolar."
                : "Selecciona el alumno y ciclo escolar para generar el formato."}
            </p>
          </div>
        </div>

        {!modoAlumno && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={!boleta}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={18} />
            Descargar PDF
          </button>
        )}
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

            {!modoAlumno && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Alumno
                </span>
                <select
                  name="alumnoId"
                  value={form.alumnoId}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {loading ? "Cargando alumnos..." : "Selecciona un alumno"}
                  </option>
                  {alumnos.map((alumno) => (
                    <option key={alumno.id_alumno} value={alumno.id_alumno}>
                      {nombreAlumnoApellidosPrimero(
                        alumno,
                        `Alumno #${alumno.id_alumno}`,
                      )}
                      {alumno.matricula ? ` - ${alumno.matricula}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Ciclo escolar
              </span>
              <select
                name="periodoId"
                value={form.periodoId}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loading ? "Cargando periodos..." : "Selecciona un periodo"}
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
              disabled={loading || loadingBoleta}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} />
              {loadingBoleta
                ? "Consultando..."
                : modoAlumno
                  ? "Consultar boleta"
                  : "Generar boleta"}
            </button>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="boleta-preview"
            className="boleta-hoja boleta-documento mx-auto shadow-sm"
          >
            <header className="boleta-header">
              <img
                className="boleta-logo-left"
                src={logoUnifront}
                alt="UNIFRONT"
              />
              <img
                className="boleta-logo-right"
                src={boleta?.carrera?.logo || logoUnifront}
                alt={boleta?.carrera?.nombre || "UNIFRONT"}
              />

              <h2 className="boleta-title-school">
                CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA UNIFRONT
              </h2>

              <p className="boleta-subtitle">
                Institucion particular Incorporada a la Secretaria de Educacion
                y Bienestar Social
                <br />
                Con Reconocimiento de Validez Oficial de estudios
                <br />
                de fecha, 07 de julio del 2014 con
                <br />
                Clave: 02PSU0015M
              </p>
            </header>

            <h1 className="boleta-main-title">BOLETA FINAL</h1>

            <section className="boleta-top-grid">
              <div className="boleta-box boleta-career">
                <div className="boleta-blue">LICENCIATURA EN :</div>
                <div className="boleta-box-value">
                  {(boleta?.carrera?.nombre || "").toUpperCase()}
                </div>
              </div>

              <div className="boleta-box">
                <div className="boleta-blue">MATRICULA</div>
                <div className="boleta-box-value">
                  {boleta?.alumno?.matricula || ""}
                </div>
              </div>
            </section>

            <section className="boleta-name-grid">
              <div className="boleta-name-cell">
                <span className="boleta-name-line">
                  {nombreSeparado.primerApellido?.toUpperCase()}
                </span>
                <span className="boleta-name-label">PRIMER APELLIDO</span>
              </div>

              <div className="boleta-name-cell">
                <span className="boleta-name-line">
                  {nombreSeparado.segundoApellido?.toUpperCase()}
                </span>
                <span className="boleta-name-label">SEGUNDO APELLIDO</span>
              </div>

              <div className="boleta-name-cell">
                <span className="boleta-name-line">
                  {nombreSeparado.nombres?.toUpperCase()}
                </span>
                <span className="boleta-name-label">NOMBRE (S)</span>
              </div>
            </section>

            <section className="boleta-period-grid">
              <div className="boleta-box">
                <div className="boleta-blue">CICLO ESCOLAR</div>
                <div className="boleta-box-value">
                  {boleta?.periodo?.nombre || ""}
                </div>
              </div>

              <div className="boleta-box">
                <div className="boleta-blue">CUATRIMESTRE</div>
                <div className="boleta-box-value">
                  {(boleta?.cuatrimestre?.nombre || "").toUpperCase()}
                </div>
              </div>
            </section>

            <table className="boleta-table">
              <colgroup>
                <col style={{ width: "66%" }} />
                <col style={{ width: "16.5%" }} />
                <col style={{ width: "17.5%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="boleta-blue">NOMBRE DE LA ASIGNATURA</th>
                  <th className="boleta-blue">CLAVE</th>
                  <th className="boleta-blue">CALIFICACION FINAL</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia.id}>
                    <td>{materia.nombre}</td>
                    <td>{materia.clave}</td>
                    <td>{materia.calificacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <section className="boleta-average">
              <span>Promedio General</span>
              <span className="boleta-average-value">
                {formatearPromedio(boleta?.promedio_general)}
              </span>
            </section>

            <section className="boleta-notes">
              <p>
                La calificacion es de 0 a 100 y la calificacion minima
                aprobatoria sera 70.
              </p>
              <p>
                Esta boleta ampara{" "}
                <strong>
                  {numerosTexto[boleta?.asignaturas_acreditadas] ||
                    boleta?.asignaturas_acreditadas ||
                    "CERO"}
                </strong>{" "}
                asignaturas acreditadas.
              </p>
            </section>

            <section className="boleta-footer-grid">
              <p className="boleta-date">{boleta ? fechaDocumento() : ""}</p>

              <div className="boleta-signature">
                <div className="boleta-signature-line" />
                <p>MARIA ESTHER LOPEZ</p>
                <p>MORENO</p>
                <p>DIRECTOR DE LA LICENCIATURA</p>
                <p>EN {(boleta?.carrera?.nombre || "").toUpperCase()}</p>
              </div>
            </section>

            <p className="boleta-code">
              {(boleta?.carrera?.clave || "").toUpperCase()}
            </p>

            <footer className="boleta-bottom-line">
              BOULEVARD BERNARDO O' HIGGINS #6050 3RA. ETAPA ZONA
              RIO&nbsp;&nbsp; TEL. + 52 (664) 660.1989
            </footer>
          </article>
        </section>
      </div>
    </div>
  );
}
