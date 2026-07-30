import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifrontSello from "../assets/Unifront1954Sello.png";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerAlumnosDetalle } from "../services/usuariosService";

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const obtenerPartesFecha = (value) => {
  if (!value) return { dia: "", mes: "", anio: "" };

  const [datePart] = String(value).split("T");
  const [anio, mes, dia] = datePart.split("-");

  return {
    dia: dia || "",
    mes: mes || "",
    anio: anio || "",
  };
};

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const formatearFechaReconocimiento = (value) => {
  if (!value) return "";

  const [datePart] = String(value).split("T");
  const [year, month, day] = datePart.split("-");
  const mes = MESES[Number(month) - 1];

  if (!year || !month || !day || !mes) return value;

  return `${Number(day)} de ${mes} del ${year}`;
};

const initialForm = {
  idAlumno: "",
  actaTitulo: "ACTA DE TITULACIÓN DE LICENCIATURA",
  claveReconocimiento: "BC-L010-M2/17",
  fechaReconocimiento: "20 de marzo del 2017",
  claveInstitucion: "02PSU0015M",
  entidadFederativa: "Baja California",
  numeroAutorizacion: "2026-02-3674",
  ciudadActo: "Tijuana",
  horaActo: "15:00",
  diaActo: "",
  mesActo: "",
  anioActo: "",
  tipoActo: "Examen Profesional",
  domicilioInstitucion: "Blvd. Bernardo O'Higgins No. 6040, Los Álamos",
  presidente: "Nancy Aduna Aduna",
  secretaria: "Jacqueline Pulido Fernández",
  vocal: "Deisy Gabriela Castro Peñuelas",
  nombreAlumno: "",
  numeroControl: "",
  modalidadTitulacion: "Por Promedio",
  tituloObtenido: "",
  resultado: "Aprobada por Unanimidad",
  directoraAcademica: "Norma Leticia Ayala Camacho",
  coordinadoraControlEscolar: "Glenda Laura Escandón Siqueiros",
  ciudadAutenticacion: "Mexicali, B.C.",
  diaAutenticacion: "",
  mesAutenticacion: "",
  anioAutenticacion: "",
};

export default function ActaTitulacionLicenciatura() {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError("");

      try {
        const [alumnosResponse, carrerasResponse] = await Promise.all([
          obtenerAlumnosDetalle(),
          obtenerCarreras(),
        ]);

        if (!activo) return;

        setAlumnos(alumnosResponse);
        setCarreras(carrerasResponse);
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError("No se pudo cargar la lista de alumnos.");
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const alumnosOrdenados = useMemo(() => {
    return [...alumnos].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || ""),
    );
  }, [alumnos]);

  const carrerasPorId = useMemo(
    () =>
      new Map(
        carreras.map((carrera) => [Number(carrera.id_carrera), carrera]),
      ),
    [carreras],
  );

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busquedaAlumno);

    if (!texto) return alumnosOrdenados;

    return alumnosOrdenados.filter((alumno) => {
      const datos = normalizar(
        [alumno.nombre, alumno.matricula, alumno.numero_control]
          .filter(Boolean)
          .join(" "),
      );

      return datos.includes(texto);
    });
  }, [alumnosOrdenados, busquedaAlumno]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleDateChange = (event) => {
    const partes = obtenerPartesFecha(event.target.value);

    setForm((currentForm) => ({
      ...currentForm,
      diaActo: partes.dia,
      mesActo: partes.mes,
      anioActo: partes.anio,
    }));
  };

  const handleAuthDateChange = (event) => {
    const partes = obtenerPartesFecha(event.target.value);

    setForm((currentForm) => ({
      ...currentForm,
      diaAutenticacion: partes.dia,
      mesAutenticacion: partes.mes,
      anioAutenticacion: partes.anio,
    }));
  };

  const handleAlumnoChange = (idAlumno) => {
    const alumno = alumnosOrdenados.find(
      (item) => Number(item.id_alumno) === Number(idAlumno),
    );
    const carreraCatalogo = carrerasPorId.get(Number(alumno?.id_carrera));
    const carrera = alumno?.carrera?.nombre || "";
    const carreraLimpia = carrera.replace(/^licenciatura\s+en\s+/i, "");
    const rvoe = carreraCatalogo?.rvoe || alumno?.carrera?.rvoe || "";
    const fechaReconocimiento = formatearFechaReconocimiento(
      carreraCatalogo?.fecha_autorizacion,
    );

    setForm((currentForm) => ({
      ...currentForm,
      idAlumno,
      claveReconocimiento: rvoe,
      fechaReconocimiento,
      nombreAlumno: alumno?.nombre || "",
      numeroControl: alumno?.numero_control || alumno?.matricula || "",
      tituloObtenido: carreraLimpia ? `Licenciada en ${carreraLimpia}` : "",
    }));
  };

  const handleDownload = () => {
    window.print();
  };

  const value = (text) => text || "";

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .acta-titulacion {
            color: #181818;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.16;
          }

          .acta-titulacion,
          .acta-titulacion * {
            box-sizing: border-box;
          }

          .acta-titulacion-hoja {
            position: relative;
            width: 8.5in;
            min-height: 11in;
            padding: 0.22in 0.55in 0.42in;
            background: #fff;
            overflow: hidden;
          }

          .acta-titulacion-hoja + .acta-titulacion-hoja {
            margin-top: 0.28in;
          }

          .acta-titulacion-header {
            display: grid;
            grid-template-columns: 1.95in 1fr;
            column-gap: 0.2in;
            align-items: start;
          }

          .acta-titulacion-logo {
            width: 1.08in;
            height: auto;
            margin: 0.06in auto 0;
          }

          .acta-titulacion-title {
            margin: 0;
            font-size: 15.5pt;
            font-weight: 800;
            letter-spacing: 0;
            text-align: center;
          }

          .acta-titulacion-subtitle {
            margin: 0.04in 0 0;
            font-size: 9.6pt;
            text-align: center;
          }

          .acta-titulacion-main-title {
            margin: 0.08in 0 0.07in;
            font-size: 16.5pt;
            font-weight: 800;
            text-align: center;
          }

          .acta-titulacion-grid {
            display: grid;
            grid-template-columns: 2.22in 1fr;
            column-gap: 0.22in;
          }

          .acta-titulacion-photo {
            width: 1.9in;
            height: 3.05in;
            margin: 0.02in auto 0;
            border: 1.5px solid #777;
            border-radius: 50%;
          }

          .acta-titulacion-block {
            margin-top: 0.05in;
          }

          .acta-titulacion-row {
            display: flex;
            align-items: flex-end;
            gap: 0.04in;
            min-height: 0.2in;
          }

          .acta-titulacion-label {
            flex: 0 0 auto;
            white-space: nowrap;
          }

          .acta-titulacion-line {
            display: inline-block;
            min-width: 0.55in;
            min-height: 0.18in;
            border-bottom: 1.3px solid #333;
            font-weight: 700;
            text-align: center;
          }

          .acta-titulacion-wide-line {
            display: block;
            width: 100%;
            min-height: 0.24in;
            border-bottom: 1.3px solid #333;
            font-weight: 700;
            text-align: center;
          }

          .acta-titulacion-title-space {
            display: block;
            flex: 1 1 auto;
            min-height: 0.24in;
            font-weight: 700;
            text-align: center;
          }

          .acta-titulacion-full {
            flex: 1 1 auto;
            min-width: 0;
          }

          .acta-titulacion-editable {
            background: transparent;
            border-radius: 0;
            padding: 0;
          }

          .acta-titulacion-jurado {
            margin: 0.46in 0 0.24in;
            padding-left: 2.2in;
            font-weight: 700;
          }

          .acta-titulacion-jurado .acta-titulacion-row {
            margin-top: 0.02in;
          }

          .acta-titulacion-center-row {
            margin: 0.12in 0;
            text-align: center;
          }

          .acta-titulacion-text {
            margin: 0.1in 0;
            text-align: justify;
          }

          .acta-titulacion-ruled {
            height: 0.26in;
            border-bottom: 1.3px solid #333;
          }

          .acta-titulacion-back {
            padding: 0.28in 0.68in 0.45in;
            font-size: 13pt;
            line-height: 1.18;
          }

          .acta-titulacion-back-intro {
            margin: 0;
            text-align: justify;
          }

          .acta-titulacion-sign-title {
            margin: 0.5in 0 0.3in;
            font-size: 14pt;
            font-weight: 800;
            text-align: center;
          }

          .acta-titulacion-sign-line {
            height: 0.38in;
            border-bottom: 1.3px solid #333;
          }

          .acta-titulacion-jurado-table {
            display: grid;
            grid-template-columns: 1.45in 1fr 2.1in;
            column-gap: 0.14in;
            row-gap: 0.18in;
            align-items: end;
            margin-top: 0.3in;
          }

          .acta-titulacion-table-head {
            font-size: 11pt;
            font-weight: 800;
            text-align: center;
          }

          .acta-titulacion-directora {
            margin: 0.42in auto 0;
            width: 4.85in;
            text-align: center;
          }

          .acta-titulacion-certifica,
          .acta-titulacion-autentica {
            margin: 0.34in 0 0;
            text-align: justify;
          }

          .acta-titulacion-fecha-final {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 0.08in;
            margin-top: 0.52in;
          }

          .acta-titulacion-coordinadora {
            margin: 0.7in auto 0;
            width: 5.2in;
            text-align: center;
          }

          @media print {
            html,
            body,
            #root {
              width: 8.5in;
              margin: 0;
              background: #fff;
            }

            body * {
              visibility: hidden;
            }

            #acta-titulacion-preview,
            #acta-titulacion-preview * {
              visibility: visible;
            }

            #acta-titulacion-preview {
              position: absolute;
              top: 0;
              left: 0;
              width: 8.5in;
              margin: 0;
              box-shadow: none;
            }

            .acta-titulacion-hoja {
              width: 8.5in;
              height: 11in;
              min-height: 11in;
              margin: 0;
              box-shadow: none;
              break-after: page;
              page-break-after: always;
            }

            .acta-titulacion-hoja:last-child {
              break-after: auto;
              page-break-after: auto;
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
              Acta de titulación de licenciatura
            </h1>
            <p className="mt-1 text-slate-500">
              Captura los datos y revisa las dos hojas antes de descargar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Datos del acta
          </h2>

          <div className="mt-5 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <label className="relative block">
              <span className="text-sm font-medium text-slate-700">Alumno</span>
              <input
                type="text"
                value={
                  mostrarOpciones
                    ? busquedaAlumno
                    : form.nombreAlumno || busquedaAlumno
                }
                onChange={(event) => {
                  setBusquedaAlumno(event.target.value);
                  setMostrarOpciones(true);
                }}
                onFocus={() => {
                  setBusquedaAlumno("");
                  setMostrarOpciones(true);
                }}
                onBlur={() => {
                  setTimeout(() => setMostrarOpciones(false), 150);
                }}
                disabled={loading}
                placeholder={
                  loading
                    ? "Cargando alumnos..."
                    : "Busca por nombre, matrícula o control"
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              {mostrarOpciones && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {alumnosFiltrados.length === 0 && (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      Sin resultados
                    </div>
                  )}

                  {alumnosFiltrados.map((alumno) => (
                    <button
                      key={alumno.id_alumno}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        handleAlumnoChange(alumno.id_alumno);
                        setBusquedaAlumno("");
                        setMostrarOpciones(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                    >
                      {alumno.nombre}
                      {alumno.numero_control || alumno.matricula
                        ? ` - ${alumno.numero_control || alumno.matricula}`
                        : ""}
                    </button>
                  ))}
                </div>
              )}
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Fecha del acto
                </span>
                <input
                  type="date"
                  onChange={handleDateChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Hora
                </span>
                <input
                  name="horaActo"
                  value={form.horaActo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            {[
              ["numeroAutorizacion", "Número de autorización"],
              ["tipoActo", "Tipo de acto"],
              ["actaTitulo", "Título del acta"],
              ["nombreAlumno", "Nombre de sustentante"],
              ["numeroControl", "Número de control"],
              ["modalidadTitulacion", "Modalidad de titulación"],
              ["tituloObtenido", "Título de"],
              ["resultado", "Resultado"],
              ["presidente", "Presidente"],
              ["secretaria", "Secretaria"],
              ["vocal", "Vocal"],
              ["directoraAcademica", "Directora académica"],
              ["coordinadoraControlEscolar", "Coordinadora control escolar"],
            ].map(([name, label]) => (
              <label key={name} className="block">
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ))}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Ciudad certificación
                </span>
                <input
                  name="ciudadAutenticacion"
                  value={form.ciudadAutenticacion}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              
            </div>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <div id="acta-titulacion-preview" className="mx-auto w-fit shadow-sm">
            <article className="acta-titulacion-hoja acta-titulacion">
              <header className="acta-titulacion-header">
                <img
                  className="acta-titulacion-logo"
                  src={logoUnifrontSello}
                  alt="UNIFRONT"
                />

                <div>
                  <h2 className="acta-titulacion-title">
                    CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA UNIFRONT
                  </h2>
                  <p className="acta-titulacion-subtitle">
                    Institución Particular Incorporada a la Secretaría de
                    Educación y Bienestar Social
                    <br />
                    Con Reconocimiento de Validez Oficial de estudios{" "}
                    <span className="acta-titulacion-editable">
                      {value(form.claveReconocimiento)}
                    </span>
                    <br />
                    de fecha{" "}
                    <span className="acta-titulacion-editable">
                      {value(form.fechaReconocimiento)}
                    </span>
                    , con Clave: {value(form.claveInstitucion)}
                  </p>
                  <h1 className="acta-titulacion-main-title">
                    <span className="acta-titulacion-editable">
                      {value(form.actaTitulo)}
                    </span>
                  </h1>
                  <p className="acta-titulacion-subtitle">
                    <span className="acta-titulacion-editable">
                      {value(form.tipoActo)}
                    </span>
                  </p>
                </div>
              </header>

              <section className="acta-titulacion-grid">
                <aside>
                  <div className="acta-titulacion-photo" />
                </aside>

                <div className="acta-titulacion-block">
                  <div className="acta-titulacion-row">
                    <span>Entidad Federativa:</span>
                    <span>
                      {value(form.entidadFederativa)}, Número de Autorización:
                    </span>
                    <span className="acta-titulacion-editable">
                      {value(form.numeroAutorizacion)}
                    </span>
                  </div>
                  <div className="acta-titulacion-row">
                    <span>En {value(form.ciudadActo)} siendo las</span>
                    <span className="acta-titulacion-editable">
                      {value(form.horaActo)}
                    </span>
                    <span>horas del día</span>
                    <span className="acta-titulacion-editable">
                      {value(form.diaActo)}
                    </span>
                    <span>del mes de</span>
                    <span className="acta-titulacion-editable">
                      {value(form.mesActo)}
                    </span>
                    <span>del</span>
                    <span className="acta-titulacion-editable">
                      {value(form.anioActo)}
                    </span>
                  </div>
                  <div>
                    en el Centro de Estudios Superiores de la Frontera UNIFRONT
                    <br />
                    Ubicado en {value(form.domicilioInstitucion)}
                  </div>

                  <div className="acta-titulacion-jurado">
                    <div>Se reunió el jurado integrado por los C. C.</div>
                    <div className="acta-titulacion-row">
                      <span>Presidente:</span>
                      <span className="acta-titulacion-line acta-titulacion-full">
                        <span className="acta-titulacion-editable">
                          {value(form.presidente)}
                        </span>
                      </span>
                    </div>
                    <div className="acta-titulacion-row">
                      <span>Secretaria:</span>
                      <span className="acta-titulacion-line acta-titulacion-full">
                        <span className="acta-titulacion-editable">
                          {value(form.secretaria)}
                        </span>
                      </span>
                    </div>
                    <div className="acta-titulacion-row">
                      <span>Vocal:</span>
                      <span className="acta-titulacion-line acta-titulacion-full">
                        <span className="acta-titulacion-editable">
                          {value(form.vocal)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <p className="acta-titulacion-center-row">
                <strong>
                  Designados por la Dirección Académica, para tomar protesta de
                  la sustentante.
                </strong>
              </p>

              <div className="acta-titulacion-center-row acta-titulacion-wide-line">
                <span className="acta-titulacion-editable">
                  {value(form.nombreAlumno)}
                </span>
              </div>

              <div className="acta-titulacion-row">
                <span>Con número de control</span>
                <span className="acta-titulacion-line" style={{ minWidth: "1.45in" }}>
                  <span className="acta-titulacion-editable">
                    {value(form.numeroControl)}
                  </span>
                </span>
                <span>quien optó por la modalidad de titulación:</span>
              </div>

              <div className="acta-titulacion-center-row acta-titulacion-wide-line">
                <span className="acta-titulacion-editable">
                  {value(form.modalidadTitulacion)}
                </span>
              </div>
              <div className="acta-titulacion-ruled" />
              <div className="acta-titulacion-ruled" />
              <div className="acta-titulacion-ruled" />

              <div className="acta-titulacion-row" style={{ marginTop: "0.34in" }}>
                <span>
                  <strong>Para obtener el Título de:</strong>
                </span>
                <span className="acta-titulacion-title-space">
                  <span className="acta-titulacion-editable">
                    {value(form.tituloObtenido)}
                  </span>
                </span>
              </div>

              <p className="acta-titulacion-text">
                Se procedió a efectuar el acto de acuerdo con las normas
                establecidas por el reglamento vigente del CENTRO DE ESTUDIOS
                SUPERIORES DE LA FRONTERA UNIFRONT, una vez concluido, se
                declaró:
              </p>

              <div className="acta-titulacion-center-row acta-titulacion-wide-line" style={{ marginTop: "0.82in" }}>
                <span className="acta-titulacion-editable">
                  {value(form.resultado)}
                </span>
              </div>
            </article>

            <article className="acta-titulacion-hoja acta-titulacion acta-titulacion-back">
              <p className="acta-titulacion-back-intro">
                Terminado el acto se levanta para constancia, la presente acta
                que firman de conformidad la sustentante, los integrantes del
                jurado y la{" "}
                <span className="acta-titulacion-editable">
                  Directora Académica:
                </span>
              </p>

              <h2 className="acta-titulacion-sign-title">
                FIRMA DE LA SUSTENTANTE
              </h2>
              <div className="acta-titulacion-sign-line" />

              <h2 className="acta-titulacion-sign-title" style={{ marginTop: "0.36in" }}>
                JURADO
              </h2>

              <section className="acta-titulacion-jurado-table">
                <div />
                <div className="acta-titulacion-table-head">NOMBRE</div>
                <div className="acta-titulacion-table-head">FIRMA</div>

                <strong>Presidente :</strong>
                <div className="acta-titulacion-line acta-titulacion-full">
                  <span className="acta-titulacion-editable">
                    {value(form.presidente)}
                  </span>
                </div>
                <div className="acta-titulacion-line acta-titulacion-full" />

                <strong>Secretaria :</strong>
                <div className="acta-titulacion-line acta-titulacion-full">
                  <span className="acta-titulacion-editable">
                    {value(form.secretaria)}
                  </span>
                </div>
                <div className="acta-titulacion-line acta-titulacion-full" />

                <strong>Vocal:</strong>
                <div className="acta-titulacion-line acta-titulacion-full">
                  <span className="acta-titulacion-editable">
                    {value(form.vocal)}
                  </span>
                </div>
                <div className="acta-titulacion-line acta-titulacion-full" />
              </section>

              <p className="acta-titulacion-certifica">
                La suscrita{" "}
                <span className="acta-titulacion-editable">
                  Directora Académica
                </span>{" "}
                CERTIFICA que las firmas que anteceden son auténticas y
                corresponden a los miembros del jurado, cuyos nombres se
                encuentran en esta acta.
              </p>

              <section className="acta-titulacion-directora">
                <h2 className="acta-titulacion-sign-title" style={{ margin: "0 0 0.64in" }}>
                  DIRECTORA ACADEMICA
                </h2>
                <div className="acta-titulacion-line acta-titulacion-full">
                  <span className="acta-titulacion-editable">
                    {value(form.directoraAcademica)}
                  </span>
                </div>
              </section>

              <p className="acta-titulacion-autentica">
                La suscrita{" "}
                <span className="acta-titulacion-editable">Coordinadora</span>{" "}
                de Control Escolar de Educación Media Superior y Superior,
                AUTENTICA que la firma que antecede corresponde a la C.{" "}
                <span className="acta-titulacion-editable">
                  Directora Académica
                </span>
                , cuyo nombre aparece en esta acta, según registro del catálogo
                de firmas de la mencionada Institución Educativa que obra en los
                archivos de esta Coordinación.
              </p>

              <div className="acta-titulacion-fecha-final">
                <span>{value(form.ciudadAutenticacion)} a</span>
                <span className="acta-titulacion-line">
                  <span className="acta-titulacion-editable">
                    {value(form.diaAutenticacion)}
                  </span>
                </span>
                <span>de</span>
                <span className="acta-titulacion-line">
                  <span className="acta-titulacion-editable">
                    {value(form.mesAutenticacion)}
                  </span>
                </span>
                <span>del</span>
                <span className="acta-titulacion-line">
                  <span className="acta-titulacion-editable">
                    {value(form.anioAutenticacion)}
                  </span>
                </span>
                <span>.</span>
              </div>

              <section className="acta-titulacion-coordinadora">
                <div className="acta-titulacion-line acta-titulacion-full">
                  <span className="acta-titulacion-editable">
                    {value(form.coordinadoraControlEscolar)}
                  </span>
                </div>
              </section>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
