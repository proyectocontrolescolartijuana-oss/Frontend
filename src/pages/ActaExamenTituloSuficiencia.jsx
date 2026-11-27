import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoAzul.png";
import { obtenerGrupos, obtenerPeriodos } from "../services/alumnosGruposService";
import { obtenerCuatrimestres } from "../services/planesEstudioService";
import { obtenerAlumnosDetalle } from "../services/usuariosService";

const DIRECCION_ESCUELA = "Blvd. Bernardo O'Higgins No. 6050, Los Álamos";

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Fecha local en formato YYYY-MM-DD (lo que espera <input type="date">)
const hoy = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

// YYYY-MM-DD -> DD/MM/YYYY sin pasar por new Date (evita el desfase de un día)
const formatearFecha = (value) => {
  if (!value) return "";
  const [anio, mes, dia] = value.split("-");
  if (!anio || !mes || !dia) return "";
  return `${dia}/${mes}/${anio}`;
};

const NUMEROS_LETRA = [
  "CERO",
  "UNO",
  "DOS",
  "TRES",
  "CUATRO",
  "CINCO",
  "SEIS",
  "SIETE",
  "OCHO",
  "NUEVE",
  "DIEZ",
];

// 8 -> "OCHO", 8.5 -> "OCHO PUNTO CINCO"
const calificacionALetra = (value) => {
  if (value === "" || value === null || value === undefined) return "";

  const numero = Number(value);
  if (Number.isNaN(numero) || numero < 0 || numero > 10) return "";

  const [entero, decimal] = String(value).split(".");
  const letraEntero = NUMEROS_LETRA[Number(entero)];

  if (!letraEntero) return "";
  if (!decimal || Number(decimal) === 0) return letraEntero;

  const letraDecimal = decimal
    .split("")
    .map((digito) => NUMEROS_LETRA[Number(digito)])
    .join(" ");

  return `${letraEntero} PUNTO ${letraDecimal}`;
};

const initialForm = {
  idAlumno: "",
  fecha: hoy(),
  periodo: "",
  direccionEscuela: DIRECCION_ESCUELA,
  nombreAlumno: "",
  licenciatura: "",
  matricula: "",
  cuatrimestre: "",
  grupo: "",
  materia: "",
  clave: "",
  calificacionLetra: "",
  calificacionNumero: "",
  sinodalUno: "",
  sinodalDos: "",
  sinodalTres: "",
};

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ActaExamenTituloSuficiencia() {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [cuatrimestres, setCuatrimestres] = useState([]);
  const [periodos, setPeriodos] = useState([]);
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
        const [
          alumnosResponse,
          gruposResponse,
          cuatrimestresResponse,
          periodosResponse,
        ] = await Promise.all([
          obtenerAlumnosDetalle(),
          obtenerGrupos(),
          obtenerCuatrimestres(),
          obtenerPeriodos(),
        ]);

        if (!activo) return;

        setAlumnos(alumnosResponse);
        setGrupos(gruposResponse);
        setCuatrimestres(cuatrimestresResponse);
        setPeriodos(periodosResponse);
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

  const gruposPorId = useMemo(
    () => new Map(grupos.map((grupo) => [Number(grupo.id_grupo), grupo])),
    [grupos],
  );

  const cuatrimestresPorId = useMemo(
    () =>
      new Map(
        cuatrimestres.map((cuatrimestre) => [
          Number(cuatrimestre.id_cuatrimestre),
          cuatrimestre,
        ]),
      ),
    [cuatrimestres],
  );

  const alumnosDetalle = useMemo(() => {
    return alumnos
      .map((alumno) => {
        const grupoCatalogo = gruposPorId.get(Number(alumno.grupo?.id_grupo));
        const cuatrimestre = cuatrimestresPorId.get(
          Number(grupoCatalogo?.id_cuatrimestre),
        );

        return {
          ...alumno,
          grupoCatalogo,
          cuatrimestre,
        };
      })
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [alumnos, cuatrimestresPorId, gruposPorId]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busquedaAlumno);

    if (!texto) return alumnosDetalle;

    return alumnosDetalle.filter((alumno) => {
      const datos = normalizar(
        [alumno.nombre, alumno.matricula, alumno.numero_control]
          .filter(Boolean)
          .join(" "),
      );

      return datos.includes(texto);
    });
  }, [alumnosDetalle, busquedaAlumno]);

  const periodoActivo = useMemo(() => {
    return (
      periodos.find((periodo) => periodo.estado === "ACTIVO") ||
      periodos[0] ||
      null
    );
  }, [periodos]);

  const handleAlumnoChange = (idAlumno) => {
    const alumno = alumnosDetalle.find(
      (item) => Number(item.id_alumno) === Number(idAlumno),
    );

    setForm((currentForm) => ({
      ...currentForm,
      idAlumno,
      periodo: periodoActivo?.nombre || "",
      direccionEscuela: DIRECCION_ESCUELA,
      nombreAlumno: alumno?.nombre || "",
      licenciatura: alumno?.carrera?.nombre || "",
      matricula: alumno?.matricula || "",
      cuatrimestre: alumno?.cuatrimestre?.nombre || "",
      grupo: alumno?.grupo?.nombre || alumno?.grupoCatalogo?.nombre || "",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  // Al capturar el número, la letra se llena sola (sigue siendo editable)
  const handleCalificacionNumeroChange = (event) => {
    const { value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      calificacionNumero: value,
      calificacionLetra: calificacionALetra(value),
    }));
  };

  const handleDownload = () => {
    window.print();
  };

  const lineValue = (value) => value || "";
  const fechaLineValue = (value) => formatearFecha(value);

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .acta-titulo-documento {
            color: #222;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10.5pt;
            font-weight: 700;
            line-height: 1.2;
          }

          .acta-titulo-documento,
          .acta-titulo-documento * {
            box-sizing: border-box;
          }

          .acta-titulo-hoja {
            position: relative;
            width: 8.5in;
            min-height: 11in;
            padding: 0.28in 1.0in 0.5in;
            background: #fff;
            overflow: hidden;
          }

          .acta-titulo-encabezado {
            text-align: center;
          }

          .acta-titulo-logo {
            width: 2.98in;
            height: auto;
            margin: 0 auto 0.18in;
          }

          .acta-titulo-principal {
            margin: 0;
            font-size: 15pt;
            font-weight: 800;
          }

          /* Columna derecha más ancha para que quepan fecha y periodo completos */
          .acta-titulo-meta {
            display: grid;
            grid-template-columns: 1fr 2.6in;
            gap: 0.14in;
            margin: 0.17in 0 0.1in;
          }

          .acta-titulo-meta-derecha {
            display: grid;
            gap: 0.12in;
          }

          .acta-titulo-cuerpo {
            margin-top: 0.08in;
          }

          .acta-titulo-row {
            display: flex;
            align-items: flex-end;
            gap: 0.05in;
            margin-bottom: 0.1in;
          }

          .acta-titulo-row-tight {
            margin-bottom: 0.05in;
          }

          .acta-titulo-row-leyenda {
            margin-bottom: 0.26in;
          }

          .acta-titulo-label {
            flex: 0 0 auto;
            white-space: nowrap;
          }

          /* Mismo tipo de letra que el cuerpo del acta (igual que el extraordinario) */
          .acta-titulo-linea {
            display: inline-block;
            min-width: 0.85in;
            height: 0.2in;
            border-bottom: 1.5px solid #555;
            font-weight: 600;
            text-align: center;
            line-height: 0.18in;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .acta-titulo-linea-full {
            flex: 1 1 auto;
            min-width: 0;
          }

          .acta-titulo-linea-carrera {
            flex: 1 1 auto;
            min-width: 2.45in;
          }

          .acta-titulo-linea-materia {
            flex: 1 1 auto;
            min-width: 2.3in;
          }

          .acta-titulo-linea-corta {
            min-width: 0.85in;
          }

          /* Campo con leyenda debajo de la línea (LETRA / NÚMERO) */
          .acta-titulo-campo {
            position: relative;
            display: flex;
          }

          .acta-titulo-campo-full {
            flex: 1 1 auto;
            min-width: 0;
          }

          .acta-titulo-campo .acta-titulo-linea {
            width: 100%;
          }

          .acta-titulo-campo-leyenda {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 0.02in;
            font-size: 9pt;
            text-align: center;
          }

          .acta-titulo-atencion {
            margin: 0.14in 0 0.2in;
            text-align: center;
          }

          /* Espacio entre el texto legal y las firmas */
          .acta-titulo-aviso {
            margin: 0.1in 0 0.5in;
            font-weight: 700;
            text-align: justify;
          }

          .acta-titulo-firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0.8in;
            row-gap: 0.42in;
            margin-top: 0.1in;
          }

          .acta-titulo-firma {
            text-align: center;
          }

          .acta-titulo-firma-centro {
            grid-column: 1 / -1;
            width: 2.9in;
            margin: 0 auto;
          }

          .acta-titulo-firma-linea {
            height: 0.22in;
            border-bottom: 1.5px solid #555;
            font-weight: 600;
            line-height: 0.2in;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .acta-titulo-firma p {
            margin: 0.02in 0 0;
            font-size: 9.5pt;
          }

          .acta-titulo-firmas-finales {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0.8in;
            margin-top: 0.5in;
          }

          .acta-titulo-copias {
            margin: 0.08in 0 0;
            font-size: 7.5pt;
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

            #acta-titulo-preview,
            #acta-titulo-preview * {
              visibility: visible;
            }

            #acta-titulo-preview {
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
              Acta de examen a título de suficiencia
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
                    : "Busca por nombre o matrícula"
                }
                className={`${inputClass} disabled:bg-slate-100`}
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
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  className={inputClass}
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
                  className={inputClass}
                />
              </label>
            </div>

            {[
              ["direccionEscuela", "Dirección de la escuela"],
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
                  className={inputClass}
                />
              </label>
            ))}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["matricula", "Matrícula"],
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
                    className={inputClass}
                  />
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Calificación con número
                </span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  name="calificacionNumero"
                  value={form.calificacionNumero}
                  onChange={handleCalificacionNumeroChange}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Calificación con letra
                </span>
                <input
                  name="calificacionLetra"
                  value={form.calificacionLetra}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
            </div>

            {[
              ["sinodalUno", "Sinodal 1"],
              ["sinodalDos", "Sinodal 2"],
              ["sinodalTres", "Sinodal 3"],
            ].map(([name, label]) => (
              <label key={name} className="block">
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="acta-titulo-preview"
            className="acta-titulo-hoja acta-titulo-documento mx-auto shadow-sm"
          >
            <header className="acta-titulo-encabezado">
              <img
                className="acta-titulo-logo"
                src={logoUnifront}
                alt="UNIFRONT"
              />
              <h2 className="acta-titulo-principal">
                ACTA DE EXAMEN A TÍTULO DE SUFICIENCIA
              </h2>
            </header>

            <section className="acta-titulo-meta">
              <div />
              <div className="acta-titulo-meta-derecha">
                <div className="acta-titulo-row acta-titulo-row-tight">
                  <span className="acta-titulo-label">Fecha:</span>
                  <span className="acta-titulo-linea acta-titulo-linea-full">
                    {fechaLineValue(form.fecha)}
                  </span>
                </div>
                <div className="acta-titulo-row acta-titulo-row-tight">
                  <span className="acta-titulo-label">Periodo:</span>
                  <span className="acta-titulo-linea acta-titulo-linea-full">
                    {lineValue(form.periodo)}
                  </span>
                </div>
              </div>
            </section>

            <main className="acta-titulo-cuerpo">
              <div className="acta-titulo-row">
                <span className="acta-titulo-label">
                  DIRECCIÓN DE LA ESCUELA:
                </span>
                <span className="acta-titulo-linea acta-titulo-linea-full">
                  {lineValue(form.direccionEscuela)}
                </span>
              </div>

              <p className="acta-titulo-atencion">
                ATENCIÓN: DEPARTAMENTO DE CONTROL ESCOLAR
              </p>

              <div className="acta-titulo-row acta-titulo-row-tight">
                <span className="acta-titulo-label">
                  Por medio de la presente, le informo que el alumno (a):
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-linea acta-titulo-linea-full">
                  {lineValue(form.nombreAlumno).toUpperCase()}
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">De la Licenciatura en:</span>
                <span className="acta-titulo-linea acta-titulo-linea-carrera">
                  {lineValue(form.licenciatura)}
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">Matrícula:</span>
                <span className="acta-titulo-linea acta-titulo-linea-corta">
                  {lineValue(form.matricula)}
                </span>
                <span className="acta-titulo-label">Cuatrimestre:</span>
                <span className="acta-titulo-linea acta-titulo-linea-corta">
                  {lineValue(form.cuatrimestre)}
                </span>
                <span className="acta-titulo-label">Grupo:</span>
                <span className="acta-titulo-linea acta-titulo-linea-corta">
                  {lineValue(form.grupo)}
                </span>
              </div>

              <div className="acta-titulo-row acta-titulo-row-tight">
                <span className="acta-titulo-label">
                  Presentó Examen a título de suficiencia de la materia de:
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-linea acta-titulo-linea-materia">
                  {lineValue(form.materia)}
                </span>
                <span className="acta-titulo-label">Clave:</span>
                <span className="acta-titulo-linea acta-titulo-linea-corta">
                  {lineValue(form.clave)}
                </span>
              </div>

              <div className="acta-titulo-row acta-titulo-row-leyenda">
                <span className="acta-titulo-label">
                  Obteniendo la calificación
                </span>

                <span className="acta-titulo-campo acta-titulo-campo-full">
                  <span className="acta-titulo-linea">
                    {lineValue(form.calificacionLetra)}
                  </span>
                  <span className="acta-titulo-campo-leyenda">LETRA</span>
                </span>

                <span className="acta-titulo-label">(</span>

                <span className="acta-titulo-campo">
                  <span className="acta-titulo-linea acta-titulo-linea-corta">
                    {lineValue(form.calificacionNumero)}
                  </span>
                  <span className="acta-titulo-campo-leyenda">NÚMERO</span>
                </span>

                <span className="acta-titulo-label">)</span>
              </div>

              <p className="acta-titulo-aviso">
                Se informa lo anterior, para todos los efectos legales a que
                haya lugar, con fundamento en los artículos 120 al 123 y demás
                relativos del Reglamento Institucional.
              </p>

              <section className="acta-titulo-firmas">
                <div className="acta-titulo-firma">
                  <div className="acta-titulo-firma-linea">
                    {lineValue(form.sinodalUno)}
                  </div>
                  <p>Nombre y firma de sinodal</p>
                </div>

                <div className="acta-titulo-firma">
                  <div className="acta-titulo-firma-linea">
                    {lineValue(form.sinodalDos)}
                  </div>
                  <p>Nombre y firma de sinodal</p>
                </div>

                <div className="acta-titulo-firma acta-titulo-firma-centro">
                  <div className="acta-titulo-firma-linea">
                    {lineValue(form.sinodalTres)}
                  </div>
                  <p>Nombre y firma de sinodal</p>
                </div>
              </section>

              <section className="acta-titulo-firmas-finales">
                <div className="acta-titulo-firma">
                  <div className="acta-titulo-firma-linea" />
                  <p>Nombre y firma del alumno</p>
                </div>

                <div className="acta-titulo-firma">
                  <div className="acta-titulo-firma-linea" />
                  <p>Nombre y firma del coordinador</p>
                </div>
              </section>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <p className="acta-titulo-copias">c.c.p. Archivo</p>
            </main>
          </article>
        </section>
      </div>
    </div>
  );
}