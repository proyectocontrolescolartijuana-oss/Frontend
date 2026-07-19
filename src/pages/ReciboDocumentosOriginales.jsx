import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { obtenerCarreras } from "../services/carrerasService";
import {
  obtenerAlumnos,
  obtenerDocumentosAlumno,
} from "../services/documentosAlumnoService";
import { obtenerUsuarios } from "../services/usuariosService";

const documentosIniciales = [
  {
    key: "ficha",
    label: "FICHA DE INSCRIPCION",
    recibido: true,
    coincide: (texto) => texto.includes("ficha"),
  },
  {
    key: "acta",
    label: "ACTA DE NACIMIENTO ORIGINAL Y DOS COPIAS",
    recibido: true,
    coincide: (texto) => texto.includes("acta") && texto.includes("nacimiento"),
  },
  {
    key: "certificado",
    label: "CERTIFICADO PREPARATORIA ORIGINAL",
    recibido: true,
    coincide: (texto) => texto.includes("certificado"),
  },
  {
    key: "constancia",
    label: "CONSTANCIA DE TERMINACION DE ESTUDIOS",
    recibido: true,
    coincide: (texto) => texto.includes("constancia"),
  },
  {
    key: "fotografias",
    label: "FOTOGRAFIAS",
    recibido: true,
    coincide: (texto) => texto.includes("fotografia") || texto.includes("foto"),
  },
  {
    key: "curp",
    label: "CURP",
    recibido: true,
    coincide: (texto) => texto.includes("curp"),
  },
];

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const clonarDocumentosIniciales = () =>
  documentosIniciales.map(({ key, label, recibido }) => ({
    key,
    label,
    recibido,
  }));

const nombreCompleto = (usuario) =>
  [
    usuario?.nombre,
    usuario?.apellido_paterno,
    usuario?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");

const initialForm = {
  idAlumno: "",
  dia: "",
  mes: "",
  anio: "",
  nombreAlumno: "",
  licenciatura: "",
  observaciones: "",
  documentos: clonarDocumentosIniciales(),
};

export default function ReciboDocumentosOriginales() {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [error, setError] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError("");

      try {
        const [alumnosResponse, usuariosResponse, carrerasResponse] =
          await Promise.all([
            obtenerAlumnos(),
            obtenerUsuarios(),
            obtenerCarreras(),
          ]);

        if (!activo) return;

        setAlumnos(alumnosResponse);
        setUsuarios(usuariosResponse);
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

  const usuariosPorId = useMemo(
    () => new Map(usuarios.map((usuario) => [usuario.id_usuario, usuario])),
    [usuarios],
  );

  const carrerasPorId = useMemo(
    () => new Map(carreras.map((carrera) => [carrera.id_carrera, carrera])),
    [carreras],
  );

  const alumnosDetalle = useMemo(() => {
    return alumnos
      .map((alumno) => {
        const usuario = usuariosPorId.get(alumno.id_usuario);
        const carrera = carrerasPorId.get(alumno.id_carrera);
        const nombre =
          alumno.nombre || nombreCompleto(usuario) || `Alumno #${alumno.id_alumno}`;

        return {
          ...alumno,
          nombre,
          carrera,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [alumnos, carrerasPorId, usuariosPorId]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busquedaAlumno);

    if (!texto) return alumnosDetalle;

    return alumnosDetalle.filter((alumno) => {
      const datos = normalizar(
        [alumno.nombre, alumno.matricula].filter(Boolean).join(" "),
      );

      return datos.includes(texto);
    });
  }, [alumnosDetalle, busquedaAlumno]);

  const documentosPreview = useMemo(() => form.documentos, [form.documentos]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleDocumentoChange = (index, value) => {
    setForm((currentForm) => {
      const documentos = [...currentForm.documentos];
      documentos[index] = {
        ...documentos[index],
        label: value,
      };

      return {
        ...currentForm,
        documentos,
      };
    });
  };

  const handleDocumentoToggle = (index, checked) => {
    setForm((currentForm) => {
      const documentos = [...currentForm.documentos];
      documentos[index] = {
        ...documentos[index],
        recibido: checked,
      };

      return {
        ...currentForm,
        documentos,
      };
    });
  };

  const handleAlumnoChange = async (idAlumno) => {
    const alumno = alumnosDetalle.find(
      (item) => Number(item.id_alumno) === Number(idAlumno),
    );

    setForm((currentForm) => ({
      ...currentForm,
      idAlumno,
      nombreAlumno: alumno?.nombre || "",
      licenciatura: alumno?.carrera?.nombre || "",
      observaciones: "",
      documentos: clonarDocumentosIniciales().map((documento) => ({
        ...documento,
        recibido: !idAlumno,
      })),
    }));

    if (!idAlumno) return;

    setLoadingDocumentos(true);
    setError("");

    try {
      const documentosAlumno = await obtenerDocumentosAlumno({
        alumno_id: idAlumno,
      });
      const alumnoDocumento = documentosAlumno[0]?.alumno;

      setForm((currentForm) => ({
        ...currentForm,
        nombreAlumno: alumnoDocumento?.nombre || alumno?.nombre || "",
        documentos: documentosIniciales.map((documentoBase) => {
          const recibido = documentosAlumno.some((documentoAlumno) => {
            const texto = normalizar(
              [
                documentoAlumno.tipo_documento?.nombre,
                documentoAlumno.nombre_archivo,
              ]
                .filter(Boolean)
                .join(" "),
            );

            return documentoBase.coincide(texto);
          });

          return {
            key: documentoBase.key,
            label: documentoBase.label,
            recibido,
          };
        }),
      }));
    } catch (requestError) {
      console.error(requestError);
      setError("No se pudieron cargar los documentos del alumno.");
    } finally {
      setLoadingDocumentos(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const lineValue = (value) => value || "";

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .recibo-documento {
            color: #1d1d1d;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12.2pt;
            line-height: 1.25;
          }

          .recibo-documento,
          .recibo-documento * {
            box-sizing: border-box;
          }

          .recibo-hoja {
            position: relative;
            width: 8.5in;
            min-height: 11in;
            padding: 0.28in 0.38in;
            background: #fff;
            overflow: hidden;
          }

          .recibo-marco {
            position: relative;
            min-height: 10.44in;
            padding: 1.52in 0.48in 0.28in;
            border: 7px solid #0d4354;
          }

          .recibo-logo {
            display: block;
            position: absolute;
            top: 0.68in;
            right: 0.33in;
            width: 2.35in;
            height: auto;
            margin: 0;
          }

          .recibo-institucion {
            margin: 0;
            font-size: 14pt;
            font-weight: 800;
            text-align: center;
          }

          .recibo-departamento {
            margin: 0.05in 0 0.82in;
            font-size: 14pt;
            font-weight: 800;
            text-align: center;
          }

          .recibo-titulo {
            margin: 0 0 0.58in;
            font-size: 14pt;
            font-weight: 800;
            text-align: center;
            text-decoration: underline;
          }

          .recibo-row {
            display: flex;
            align-items: flex-end;
            gap: 0.05in;
            margin-bottom: 0.24in;
          }

          .recibo-label {
            flex: 0 0 auto;
            font-weight: 700;
            white-space: nowrap;
          }

          .recibo-linea {
            display: inline-block;
            min-width: 0.72in;
            height: 0.2in;
            border-bottom: 1.5px solid #333;
            font-weight: 600;
            text-align: center;
            line-height: 0.17in;
          }

          .recibo-linea-full {
            flex: 1 1 auto;
            min-width: 0;
          }

          .recibo-linea-nombre {
            flex: 1 1 auto;
            min-width: 4.6in;
          }

          .recibo-linea-carrera {
            flex: 1 1 auto;
            min-width: 3.8in;
          }

          .recibo-linea-observaciones {
            flex: 1 1 auto;
            min-width: 3.2in;
          }

          .recibo-intro {
            margin: 0.16in 0 0.62in;
            font-weight: 700;
          }

          .recibo-lista {
            margin: 0 0 0.28in 0.24in;
            padding-left: 0.22in;
            list-style-type: circle;
          }

          .recibo-lista li {
            margin-bottom: 0.04in;
            padding-left: 0.06in;
            font-size: 10.5pt;
            font-weight: 800;
          }

          .recibo-observaciones {
            margin-bottom: 0.56in;
          }

          .recibo-firmas-titulos,
          .recibo-firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 1.45in;
          }

          .recibo-firmas-titulos {
            margin: 0 0 0.72in;
            font-size: 10.5pt;
            font-weight: 800;
            text-align: center;
          }

          .recibo-firma {
            text-align: center;
          }

          .recibo-firma-linea {
            height: 0.25in;
            border-bottom: 1.5px solid #333;
          }

          .recibo-firma p {
            margin: 0.06in 0 0;
            font-size: 10.5pt;
            font-weight: 800;
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

            #recibo-preview,
            #recibo-preview * {
              visibility: visible;
            }

            #recibo-preview {
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
              Recibo de documentos originales
            </h1>
            <p className="mt-1 text-slate-500">
              Captura los datos y revisa el recibo antes de descargarlo.
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
            Datos del recibo
          </h2>

          <div className="mt-5 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <label className="relative block">
              <span className="text-sm font-medium text-slate-700">
                Alumno
              </span>
              <input
                type="text"
                value={
                  mostrarOpciones ? busquedaAlumno : form.nombreAlumno || busquedaAlumno
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
                  loading ? "Cargando alumnos..." : "Busca por nombre o matrícula"
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
                      {alumno.matricula ? ` - ${alumno.matricula}` : ""}
                    </button>
                  ))}
                </div>
              )}
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["dia", "Dia"],
                ["mes", "Mes"],
                ["anio", "Año"],
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
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Nombre del alumno
              </span>
              <input
                name="nombreAlumno"
                value={form.nombreAlumno}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Licenciatura
              </span>
              <input
                name="licenciatura"
                value={form.licenciatura}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Documentos
                </h3>
                {loadingDocumentos && (
                  <span className="text-xs font-semibold text-blue-600">
                    Consultando documentos...
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {form.documentos.map((documento, index) => (
                  <div
                    key={documento.key}
                    className={`rounded-xl border px-3 py-2 ${
                      documento.recibido
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={documento.recibido}
                        onChange={(event) =>
                          handleDocumentoToggle(index, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        value={documento.label}
                        onChange={(event) =>
                          handleDocumentoChange(index, event.target.value)
                        }
                        className="w-full bg-transparent text-sm font-semibold outline-none"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Observaciones
              </span>
              <input
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="recibo-preview"
            className="recibo-hoja recibo-documento mx-auto shadow-sm"
          >
            <div className="recibo-marco">
              <img className="recibo-logo" src={logoUnifront} alt="UNIFRONT" />

              <h2 className="recibo-institucion">
                CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA, UNIFRONT
              </h2>
              <h3 className="recibo-departamento">
                DEPARTAMENTO DE CONTROL ESCOLAR
              </h3>

              <h1 className="recibo-titulo">RECIBO DE DOCUMENTOS ORIGINALES</h1>

              <div className="recibo-row">
                <span className="recibo-label">Tijuana, B.C. a</span>
                <span className="recibo-linea">{lineValue(form.dia)}</span>
                <span className="recibo-label">de</span>
                <span className="recibo-linea">
                  {lineValue(form.mes)}
                </span>
                <span className="recibo-label">del 20</span>
                <span className="recibo-linea">
                  {lineValue(form.anio)}
                </span>
              </div>

              <div className="recibo-row">
                <span className="recibo-label">C:</span>
                <span className="recibo-linea recibo-linea-nombre">
                  {lineValue(form.nombreAlumno)}
                </span>
              </div>

              <div className="recibo-row">
                <span className="recibo-label">de la licenciatura en</span>
                <span className="recibo-linea recibo-linea-carrera">
                  {lineValue(form.licenciatura)}
                </span>
              </div>

              <p className="recibo-intro">
                Control Escolar recibe los documentos originales que a
                continuacion se describen:
              </p>

              <ul className="recibo-lista">
                {documentosPreview.map((documento) => (
                  <li key={documento.key}>
                    {documento.label}
                    {!documento.recibido && " (NO ENTREGADO)"}
                  </li>
                ))}
              </ul>

              <div className="recibo-row recibo-observaciones">
                <span className="recibo-label">OBSERVACIONES:</span>
                <span className="recibo-linea recibo-linea-observaciones">
                  {lineValue(form.observaciones)}
                </span>
              </div>

              <section className="recibo-firmas-titulos">
                <span>RECIBI</span>
                <span>ENTREGA</span>
              </section>

              <section className="recibo-firmas">
                <div className="recibo-firma">
                  <div className="recibo-firma-linea" />
                  <p>CONTROL ESCOLAR</p>
                </div>

                <div className="recibo-firma">
                     
                  <div className="recibo-firma-linea" />
                  {lineValue(form.nombreAlumno)}
                  <p>NOMBRE Y FIRMA</p>
                </div>
              </section>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
