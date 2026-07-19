import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { obtenerAlumnosDetalle } from "../services/usuariosService";
import { formatDateDDMMYYYY } from "../utils/fechas";

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const initialForm = {
  idAlumno: "",
  fecha: "",
  periodo: "",
  direccionEscuela: "",
  nombreAlumno: "",
  licenciatura: "",
  matricula: "",
  cuatrimestre: "",
  grupo: "",
  materia: "",
  clave: "",
  calificacionLetra: "",
  calificacionNumero: "",
};

export default function ActaExamenExtraordinario() {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
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
        const alumnosResponse = await obtenerAlumnosDetalle();

        if (!activo) return;

        setAlumnos(alumnosResponse);
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

  const alumnosDetalle = useMemo(() => {
    return [...alumnos].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || ""),
    );
  }, [alumnos]);

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

  const handleAlumnoChange = (idAlumno) => {
    const alumno = alumnosDetalle.find(
      (item) => Number(item.id_alumno) === Number(idAlumno),
    );

    setForm((currentForm) => ({
      ...currentForm,
      idAlumno,
      nombreAlumno: alumno?.nombre || "",
      licenciatura: alumno?.carrera?.nombre || "",
      matricula: alumno?.matricula || "",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleDownload = () => {
    window.print();
  };

  const lineValue = (value) => value || "";
  const fechaLineValue = (value) => formatDateDDMMYYYY(value);

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .acta-documento {
            color: #2a2a2a;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12.4pt;
            font-weight: 700;
            line-height: 1.28;
          }

          .acta-documento,
          .acta-documento * {
            box-sizing: border-box;
          }

          .acta-hoja {
            position: relative;
            width: 8.5in;
            min-height: 11in;
            padding: 0.28in 0.86in 0.55in;
            background: #fff;
            overflow: hidden;
          }

          .acta-encabezado {
            text-align: center;
          }

          .acta-logo {
            width: 2.98in;
            height: auto;
            margin: 0 auto 0.06in;
          }

          .acta-titulo {
            margin: 0;
            font-size: 15pt;
            font-weight: 800;
            letter-spacing: 0;
          }

          .acta-meta {
            display: grid;
            grid-template-columns: 1fr 1.85in;
            gap: 0.14in;
            margin-top: 0.2in;
            margin-bottom: 0.1in;
          }

          .acta-meta-derecha {
            display: grid;
            gap: 0.16in;
          }

          .acta-cuerpo {
            margin-top: 0.08in;
          }

          .acta-row {
            display: flex;
            align-items: flex-end;
            gap: 0.06in;
            margin-bottom: 0.15in;
          }

          .acta-row-tight {
            margin-bottom: 0.07in;
          }

          .acta-label {
            flex: 0 0 auto;
            white-space: nowrap;
          }

          .acta-linea {
            display: inline-block;
            min-width: 1.1in;
            height: 0.2in;
            border-bottom: 1.5px solid #555;
            font-weight: 600;
            text-align: center;
            line-height: 0.18in;
          }

          .acta-linea-full {
            flex: 1 1 auto;
            min-width: 0;
          }

          .acta-linea-nombre {
            min-width: 2.1in;
          }

          .acta-linea-carrera {
            flex: 1 1 auto;
            min-width: 2.5in;
          }

          .acta-linea-materia {
            flex: 1 1 auto;
            min-width: 2.3in;
          }

          .acta-linea-corta {
            min-width: 0.95in;
          }

          .acta-atencion {
            margin: 0.23in 0 0.28in;
            text-align: center;
          }

          .acta-aviso {
            margin: 0.23in 0 0.62in;
            font-weight: 700;
            text-align: left;
          }

          .acta-firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0.75in;
            row-gap: 0.65in;
            margin-top: 0.22in;
          }

          .acta-firma {
            text-align: center;
          }

          .acta-firma-profesor {
            grid-column: 1 / -1;
            width: 3.05in;
            margin: 0 auto;
          }

          .acta-firma-linea {
            height: 0.18in;
            border-bottom: 1.5px solid #555;
          }

          .acta-firma p {
            margin: 0.02in 0 0;
            font-size: 11pt;
          }

          .acta-copias {
            margin-top: 0.3in;
            font-size: 8.5pt;
          }

          .acta-sublinea {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 0.01in;
            font-size: 10pt;
            text-align: center;
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

            #acta-preview,
            #acta-preview * {
              visibility: visible;
            }

            #acta-preview {
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
              Acta de examen extraordinario
            </h1>
            <p className="mt-1 text-slate-500">
              Captura los datos y revisa el acta antes de descargarla.
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
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <label className="relative block">
              <span className="text-sm font-medium text-slate-700">
                Alumno
              </span>
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
                    : "Busca por nombre o matricula"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Fecha
                </span>
                <input
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Periodo
                </span>
                <input
                  name="periodo"
                  value={form.periodo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            {[
              ["direccionEscuela", "Direccion de la escuela"],
              ["nombreAlumno", "Nombre del alumno"],
              ["licenciatura", "Licenciatura"],
              ["materia", "Materia"],
              ["clave", "Clave"],
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["matricula", "Matricula"],
                ["cuatrimestre", "Cuatrimestre"],
                ["grupo", "Grupo"],
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Calificacion letra
                </span>
                <input
                  name="calificacionLetra"
                  value={form.calificacionLetra}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Calificacion numero
                </span>
                <input
                  name="calificacionNumero"
                  value={form.calificacionNumero}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="acta-preview"
            className="acta-hoja acta-documento mx-auto shadow-sm"
          >
            <header className="acta-encabezado">
              <img className="acta-logo" src={logoUnifront} alt="UNIFRONT" />
              <h2 className="acta-titulo">ACTA DE EXAMEN EXTRAORDINARIO</h2>
            </header>

            <section className="acta-meta">
              <div />
              <div className="acta-meta-derecha">
                <div className="acta-row acta-row-tight">
                  <span className="acta-label">Fecha:</span>
                  <span className="acta-linea acta-linea-full">
                    {fechaLineValue(form.fecha)}
                  </span>
                </div>

                <div className="acta-row acta-row-tight">
                  <span className="acta-label">Periodo:</span>
                  <span className="acta-linea acta-linea-full">
                    {lineValue(form.periodo)}
                  </span>
                </div>
              </div>
            </section>

            <main className="acta-cuerpo">
              <div className="acta-row">
                <span className="acta-label">DIRECCION DE LA ESCUELA:</span>
                <span className="acta-linea acta-linea-full">
                  {lineValue(form.direccionEscuela)}
                </span>
              </div>

              <p className="acta-atencion">
                ATENCION: DEPARTAMENTO DE CONTROL ESCOLAR
              </p>

              <div className="acta-row">
                <span className="acta-label">
                  Por medio de la presente, le informo que el alumno (a)
                </span>
                <span className="acta-linea acta-linea-nombre">
                  {lineValue(form.nombreAlumno)}
                </span>
              </div>

              <div className="acta-row">
                <span className="acta-linea acta-linea-full" />
              </div>

              <div className="acta-row">
                <span className="acta-label">De la Licenciatura de</span>
                <span className="acta-linea acta-linea-carrera">
                  {lineValue(form.licenciatura)}
                </span>
              </div>

              <div className="acta-row">
                <span className="acta-label">Matricula:</span>
                <span className="acta-linea acta-linea-corta">
                  {lineValue(form.matricula)}
                </span>
                <span className="acta-label">Cuatrimestre:</span>
                <span className="acta-linea acta-linea-corta">
                  {lineValue(form.cuatrimestre)}
                </span>
                <span className="acta-label">Grupo:</span>
                <span className="acta-linea acta-linea-corta">
                  {lineValue(form.grupo)}
                </span>
              </div>

              <div className="acta-row">
                <span className="acta-label">Presento</span>
                <span className="acta-label">Examen</span>
                <span className="acta-label">Extraordinario</span>
                <span className="acta-label">de</span>
                <span className="acta-label">la</span>
                <span className="acta-label">materia</span>
                <span className="acta-label">de:</span>
              </div>

              <div className="acta-row">
                <span className="acta-linea acta-linea-materia">
                  {lineValue(form.materia)}
                </span>
                <span className="acta-label">Clave:</span>
                <span className="acta-linea acta-linea-corta">
                  {lineValue(form.clave)}
                </span>
              </div>

              <div className="acta-row acta-row-tight">
                <span className="acta-label">Obteniendo la calificacion</span>
                <span className="acta-linea acta-linea-full">
                  {lineValue(form.calificacionLetra)}
                </span>
                <span className="acta-label">(</span>
                <span className="acta-linea acta-linea-corta">
                  {lineValue(form.calificacionNumero)}
                </span>
                <span className="acta-label">)</span>
              </div>

              <div className="acta-sublinea">
                <span>LETRA</span>
                <span>NUMERO</span>
              </div>

              <p className="acta-aviso">
                Se informa lo anterior, para todos los efectos legales a que
                haya lugar, con fundamento en los articulos 115 al 119, 121 y
                demas relativos del Reglamento Institucional
              </p>

              <section className="acta-firmas">
                <div className="acta-firma acta-firma-profesor">
                  <div className="acta-firma-linea" />
                  <p>Nombre y firma del Profesor Titular</p>
                </div>

                <div className="acta-firma">
                  <div className="acta-firma-linea" />
                  <p>Nombre y Firma del alumno</p>
                </div>

                <div className="acta-firma">
                  <div className="acta-firma-linea" />
                  <p>Nombre y firma del coordinador</p>
                </div>
              </section>

              <p className="acta-copias">c.c.p Archivo</p>
            </main>
          </article>
        </section>
      </div>
    </div>
  );
}
// import { useEffect, useMemo, useState } from "react";
// import { Download, FileText } from "lucide-react";
// import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
// import { obtenerAlumnosDetalle } from "../services/usuariosService";

// const normalizar = (value = "") =>
//   value
//     .toString()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .toLowerCase()
//     .trim();

// const initialForm = {
//   idAlumno: "",
//   fecha: "",
//   periodo: "",
//   direccionEscuela: "",
//   nombreAlumno: "",
//   licenciatura: "",
//   matricula: "",
//   cuatrimestre: "",
//   grupo: "",
//   materia: "",
//   clave: "",
//   calificacionLetra: "",
//   calificacionNumero: "",
// };

// export default function ActaExamenExtraordinario() {
//   const [form, setForm] = useState(initialForm);
//   const [alumnos, setAlumnos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [busquedaAlumno, setBusquedaAlumno] = useState("");
//   const [mostrarOpciones, setMostrarOpciones] = useState(false);

//   useEffect(() => {
//     let activo = true;

//     const cargarDatos = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const alumnosResponse = await obtenerAlumnosDetalle();

//         if (!activo) return;

//         setAlumnos(alumnosResponse);
//       } catch (requestError) {
//         console.error(requestError);

//         if (activo) {
//           setError("No se pudo cargar la lista de alumnos.");
//         }
//       } finally {
//         if (activo) {
//           setLoading(false);
//         }
//       }
//     };

//     cargarDatos();

//     return () => {
//       activo = false;
//     };
//   }, []);

//   const alumnosDetalle = useMemo(() => {
//     return [...alumnos].sort((a, b) =>
//       (a.nombre || "").localeCompare(b.nombre || ""),
//     );
//   }, [alumnos]);

//   const alumnosFiltrados = useMemo(() => {
//     const texto = normalizar(busquedaAlumno);

//     if (!texto) return alumnosDetalle;

//     return alumnosDetalle.filter((alumno) => {
//       const datos = normalizar(
//         [alumno.nombre, alumno.matricula].filter(Boolean).join(" "),
//       );

//       return datos.includes(texto);
//     });
//   }, [alumnosDetalle, busquedaAlumno]);

//   const handleAlumnoChange = (idAlumno) => {
//     const alumno = alumnosDetalle.find(
//       (item) => Number(item.id_alumno) === Number(idAlumno),
//     );

//     setForm((currentForm) => ({
//       ...currentForm,
//       idAlumno,
//       nombreAlumno: alumno?.nombre || "",
//       licenciatura: alumno?.carrera?.nombre || "",
//       matricula: alumno?.matricula || "",
//     }));
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((currentForm) => ({
//       ...currentForm,
//       [name]: value,
//     }));
//   };

//   const handleDownload = () => {
//     window.print();
//   };

//   const lineValue = (value) => value || "";

//   return (
//     <div className="space-y-6 p-6">
//       <style>
//         {`
//           .acta-documento {
//             color: #2a2a2a;
//             font-family: Arial, Helvetica, sans-serif;
//             font-size: 12.4pt;
//             font-weight: 700;
//             line-height: 1.28;
//           }

//           .acta-documento,
//           .acta-documento * {
//             box-sizing: border-box;
//           }

//           .acta-hoja {
//             position: relative;
//             width: 8.5in;
//             min-height: 11in;
//             padding: 0.28in 0.86in 0.55in;
//             background: #fff;
//             overflow: hidden;
//           }

//           .acta-encabezado {
//             text-align: center;
//           }

//           .acta-logo {
//             width: 2.98in;
//             height: auto;
//             margin: 0 auto 0.06in;
//           }

//           .acta-titulo {
//             margin: 0;
//             font-size: 15pt;
//             font-weight: 800;
//             letter-spacing: 0;
//           }

//           .acta-meta {
//             display: grid;
//             grid-template-columns: 1fr 1.85in;
//             gap: 0.14in;
//             margin-top: 0.2in;
//             margin-bottom: 0.1in;
//           }

//           .acta-meta-derecha {
//             display: grid;
//             gap: 0.16in;
//           }

//           .acta-cuerpo {
//             margin-top: 0.08in;
//           }

//           .acta-row {
//             display: flex;
//             align-items: flex-end;
//             gap: 0.06in;
//             margin-bottom: 0.15in;
//           }

//           .acta-row-tight {
//             margin-bottom: 0.07in;
//           }

//           .acta-label {
//             flex: 0 0 auto;
//             white-space: nowrap;
//           }

//           .acta-linea {
//             display: inline-block;
//             min-width: 1.1in;
//             height: 0.2in;
//             border-bottom: 1.5px solid #555;
//             font-weight: 600;
//             text-align: center;
//             line-height: 0.18in;
//           }

//           .acta-linea-full {
//             flex: 1 1 auto;
//             min-width: 0;
//           }

//           .acta-linea-nombre {
//             min-width: 2.1in;
//           }

//           .acta-linea-carrera {
//             flex: 1 1 auto;
//             min-width: 2.5in;
//           }

//           .acta-linea-materia {
//             flex: 1 1 auto;
//             min-width: 2.3in;
//           }

//           .acta-linea-corta {
//             min-width: 0.95in;
//           }

//           .acta-atencion {
//             margin: 0.23in 0 0.28in;
//             text-align: center;
//           }

//           .acta-aviso {
//             margin: 0.23in 0 0.62in;
//             font-weight: 700;
//             text-align: left;
//           }

//           .acta-firmas {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             column-gap: 0.75in;
//             row-gap: 0.65in;
//             margin-top: 0.22in;
//           }

//           .acta-firma {
//             text-align: center;
//           }

//           .acta-firma-profesor {
//             grid-column: 1 / -1;
//             width: 3.05in;
//             margin: 0 auto;
//           }

//           .acta-firma-linea {
//             height: 0.18in;
//             border-bottom: 1.5px solid #555;
//           }

//           .acta-firma p {
//             margin: 0.02in 0 0;
//             font-size: 11pt;
//           }

//           .acta-copias {
//             margin-top: 0.3in;
//             font-size: 8.5pt;
//           }

//           .acta-sublinea {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             margin-top: 0.01in;
//             font-size: 10pt;
//             text-align: center;
//           }

//           @media print {
//             html,
//             body,
//             #root {
//               width: 8.5in;
//               height: 11in;
//               margin: 0;
//               overflow: hidden;
//             }

//             body * {
//               visibility: hidden;
//             }

//             #acta-preview,
//             #acta-preview * {
//               visibility: visible;
//             }

//             #acta-preview {
//               position: absolute;
//               top: 0;
//               left: 0;
//               width: 8.5in;
//               height: 11in;
//               min-height: 11in;
//               margin: 0;
//               box-shadow: none;
//             }

//             @page {
//               size: letter;
//               margin: 0;
//             }
//           }
//         `}
//       </style>

//       <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//         <div className="flex items-center gap-3">
//           <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
//             <FileText size={22} />
//           </div>

//           <div>
//             <h1 className="text-4xl font-bold text-slate-900">
//               Acta de examen extraordinario
//             </h1>
//             <p className="mt-1 text-slate-500">
//               Captura los datos y revisa el acta antes de descargarla.
//             </p>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={handleDownload}
//           className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
//         >
//           <Download size={18} />
//           Descargar PDF
//         </button>
//       </div>

//       <div className="h-px w-full bg-slate-200" />

//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
//         <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h2 className="text-xl font-semibold text-slate-900">
//             Datos del acta
//           </h2>

//           <div className="mt-5 space-y-4">
//             {error && (
//               <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
//                 {error}
//               </p>
//             )}

//             <label className="relative block">
//               <span className="text-sm font-medium text-slate-700">
//                 Alumno
//               </span>
//               <input
//                 type="text"
//                 value={
//                   mostrarOpciones
//                     ? busquedaAlumno
//                     : form.nombreAlumno || busquedaAlumno
//                 }
//                 onChange={(event) => {
//                   setBusquedaAlumno(event.target.value);
//                   setMostrarOpciones(true);
//                 }}
//                 onFocus={() => {
//                   setBusquedaAlumno("");
//                   setMostrarOpciones(true);
//                 }}
//                 onBlur={() => {
//                   setTimeout(() => setMostrarOpciones(false), 150);
//                 }}
//                 disabled={loading}
//                 placeholder={
//                   loading
//                     ? "Cargando alumnos..."
//                     : "Busca por nombre o matricula"
//                 }
//                 className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
//               />

//               {mostrarOpciones && (
//                 <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
//                   {alumnosFiltrados.length === 0 && (
//                     <div className="px-3 py-2 text-sm text-slate-500">
//                       Sin resultados
//                     </div>
//                   )}

//                   {alumnosFiltrados.map((alumno) => (
//                     <button
//                       key={alumno.id_alumno}
//                       type="button"
//                       onMouseDown={(event) => event.preventDefault()}
//                       onClick={() => {
//                         handleAlumnoChange(alumno.id_alumno);
//                         setBusquedaAlumno("");
//                         setMostrarOpciones(false);
//                       }}
//                       className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
//                     >
//                       {alumno.nombre}
//                       {alumno.matricula ? ` - ${alumno.matricula}` : ""}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </label>

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <label className="block">
//                 <span className="text-sm font-medium text-slate-700">
//                   Fecha
//                 </span>
//                 <input
//                   name="fecha"
//                   value={form.fecha}
//                   onChange={handleChange}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 />
//               </label>

//               <label className="block">
//                 <span className="text-sm font-medium text-slate-700">
//                   Periodo
//                 </span>
//                 <input
//                   name="periodo"
//                   value={form.periodo}
//                   onChange={handleChange}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 />
//               </label>
//             </div>

//             {[
//               ["direccionEscuela", "Direccion de la escuela"],
//               ["nombreAlumno", "Nombre del alumno"],
//               ["licenciatura", "Licenciatura"],
//               ["materia", "Materia"],
//               ["clave", "Clave"],
//             ].map(([name, label]) => (
//               <label key={name} className="block">
//                 <span className="text-sm font-medium text-slate-700">
//                   {label}
//                 </span>
//                 <input
//                   name={name}
//                   value={form[name]}
//                   onChange={handleChange}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 />
//               </label>
//             ))}

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//               {[
//                 ["matricula", "Matricula"],
//                 ["cuatrimestre", "Cuatrimestre"],
//                 ["grupo", "Grupo"],
//               ].map(([name, label]) => (
//                 <label key={name} className="block">
//                   <span className="text-sm font-medium text-slate-700">
//                     {label}
//                   </span>
//                   <input
//                     name={name}
//                     value={form[name]}
//                     onChange={handleChange}
//                     className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </label>
//               ))}
//             </div>

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <label className="block">
//                 <span className="text-sm font-medium text-slate-700">
//                   Calificacion letra
//                 </span>
//                 <input
//                   name="calificacionLetra"
//                   value={form.calificacionLetra}
//                   onChange={handleChange}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 />
//               </label>

//               <label className="block">
//                 <span className="text-sm font-medium text-slate-700">
//                   Calificacion numero
//                 </span>
//                 <input
//                   name="calificacionNumero"
//                   value={form.calificacionNumero}
//                   onChange={handleChange}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                 />
//               </label>
//             </div>
//           </div>
//         </section>

//         <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
//           <article
//             id="acta-preview"
//             className="acta-hoja acta-documento mx-auto shadow-sm"
//           >
//             <header className="acta-encabezado">
//               <img className="acta-logo" src={logoUnifront} alt="UNIFRONT" />
//               <h2 className="acta-titulo">ACTA DE EXAMEN EXTRAORDINARIO</h2>
//             </header>

//             <section className="acta-meta">
//               <div />
//               <div className="acta-meta-derecha">
//                 <div className="acta-row acta-row-tight">
//                   <span className="acta-label">Fecha:</span>
//                   <span className="acta-linea acta-linea-full">
//                     {lineValue(form.fecha)}
//                   </span>
//                 </div>

//                 <div className="acta-row acta-row-tight">
//                   <span className="acta-label">Periodo:</span>
//                   <span className="acta-linea acta-linea-full">
//                     {lineValue(form.periodo)}
//                   </span>
//                 </div>
//               </div>
//             </section>

//             <main className="acta-cuerpo">
//               <div className="acta-row">
//                 <span className="acta-label">DIRECCION DE LA ESCUELA:</span>
//                 <span className="acta-linea acta-linea-full">
//                   {lineValue(form.direccionEscuela)}
//                 </span>
//               </div>

//               <p className="acta-atencion">
//                 ATENCION: DEPARTAMENTO DE CONTROL ESCOLAR
//               </p>

//               <div className="acta-row">
//                 <span className="acta-label">
//                   Por medio de la presente, le informo que el alumno (a)
//                 </span>
//                 <span className="acta-linea acta-linea-nombre">
//                   {lineValue(form.nombreAlumno)}
//                 </span>
//               </div>

//               <div className="acta-row">
//                 <span className="acta-linea acta-linea-full" />
//               </div>

//               <div className="acta-row">
//                 <span className="acta-label">De la Licenciatura de</span>
//                 <span className="acta-linea acta-linea-carrera">
//                   {lineValue(form.licenciatura)}
//                 </span>
//               </div>

//               <div className="acta-row">
//                 <span className="acta-label">Matricula:</span>
//                 <span className="acta-linea acta-linea-corta">
//                   {lineValue(form.matricula)}
//                 </span>
//                 <span className="acta-label">Cuatrimestre:</span>
//                 <span className="acta-linea acta-linea-corta">
//                   {lineValue(form.cuatrimestre)}
//                 </span>
//                 <span className="acta-label">Grupo:</span>
//                 <span className="acta-linea acta-linea-corta">
//                   {lineValue(form.grupo)}
//                 </span>
//               </div>

//               <div className="acta-row">
//                 <span className="acta-label">Presento</span>
//                 <span className="acta-label">Examen</span>
//                 <span className="acta-label">Extraordinario</span>
//                 <span className="acta-label">de</span>
//                 <span className="acta-label">la</span>
//                 <span className="acta-label">materia</span>
//                 <span className="acta-label">de:</span>
//               </div>

//               <div className="acta-row">
//                 <span className="acta-linea acta-linea-materia">
//                   {lineValue(form.materia)}
//                 </span>
//                 <span className="acta-label">Clave:</span>
//                 <span className="acta-linea acta-linea-corta">
//                   {lineValue(form.clave)}
//                 </span>
//               </div>

//               <div className="acta-row acta-row-tight">
//                 <span className="acta-label">Obteniendo la calificacion</span>
//                 <span className="acta-linea acta-linea-full">
//                   {lineValue(form.calificacionLetra)}
//                 </span>
//                 <span className="acta-label">(</span>
//                 <span className="acta-linea acta-linea-corta">
//                   {lineValue(form.calificacionNumero)}
//                 </span>
//                 <span className="acta-label">)</span>
//               </div>

//               <div className="acta-sublinea">
//                 <span>LETRA</span>
//                 <span>NUMERO</span>
//               </div>

//               <p className="acta-aviso">
//                 Se informa lo anterior, para todos los efectos legales a que
//                 haya lugar, con fundamento en los articulos 115 al 119, 121 y
//                 demas relativos del Reglamento Institucional
//               </p>

//               <section className="acta-firmas">
//                 <div className="acta-firma acta-firma-profesor">
//                   <div className="acta-firma-linea" />
//                   <p>Nombre y firma del Profesor Titular</p>
//                 </div>

//                 <div className="acta-firma">
//                   <div className="acta-firma-linea" />
//                   <p>Nombre y Firma del alumno</p>
//                 </div>

//                 <div className="acta-firma">
//                   <div className="acta-firma-linea" />
//                   <p>Nombre y firma del coordinador</p>
//                 </div>
//               </section>

//               <p className="acta-copias">c.c.p Archivo</p>
//             </main>
//           </article>
//         </section>
//       </div>
//     </div>
//   );
// }

