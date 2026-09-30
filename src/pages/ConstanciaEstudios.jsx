import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoAzul.png";
import { obtenerAlumnosDetalle } from "../services/usuariosService";

/* ========================================================================
 * Datos fijos (no se editan desde el formulario)
 * ====================================================================== */

const TELEFONOS = "660-19-23 y 903-43-07";

const INSTITUCION = {
  nombre: "CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA",
  direccion: "Blvd. Bernardo O'Higgins No. 6050, Los Alamos",
  claveIncorporacion: "Clave Incorp. 02PSU0015M",
  rvoe: "RVOE-BC-L009-M2/17",
};

const CAMPUS = {
  nombre: "Campus Los Alamos",
  correo: "control.escolar@unifront.edu.mx",
  ubicacion: "Tijuana, B.C., México",
  sitioWeb: "www.unifront.mx",
};

const HORARIO = "lunes a viernes";
const PERIODO_VACACIONAL = "de acuerdo al calendario escolar vigente";

const SEXOS = [
  ["hombre", "Hombre"],
  ["mujer", "Mujer"],
];

const TEXTOS_POR_SEXO = {
  hombre: {
    alumno: "el alumno",
    inscrito: "inscrito",
    peticion: "del interesado",
  },
  mujer: {
    alumno: "la alumna",
    inscrito: "inscrita",
    peticion: "de la interesada",
  },
};

const MAX_OPCIONES = 50;

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";



// Fecha local en formato YYYY-MM-DD (toISOString usa UTC y puede adelantar el día).
const hoyLocal = () => {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const crearFormInicial = () => ({
  sexo: "hombre",
  nombreAlumno: "",
  matricula: "",
  carrera: "",
  planEstudios: "",
  periodoEscolar: "",
  gradoEscolar: "",
  departamento: "Control Escolar",
  asunto: "Constancia de Estudios",
  fechaEmision: hoyLocal(),
  ciudad: "Tijuana",
  estado: "B.C.",
  director: "MTRA. MARIA DEL CARMEN GONZALEZ",
  cargoDirector: "DIRECTORA GENERAL",
});

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// "mujer" también empieza con "m", por eso se evalúa primero.
const detectarSexo = (valor) => {
  const sexo = normalizar(valor);

  if (!sexo) return null;
  if (sexo.startsWith("f") || sexo.startsWith("mujer")) return "mujer";
  if (sexo.startsWith("m") || sexo.startsWith("h")) return "hombre";

  return null;
};

const ordenarPorNombre = (lista) =>
  [...lista].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || "", "es"),
  );

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatDate = (value) => {
  if (!value) return "___ de __________ de ____";

  return formateadorFecha.format(new Date(`${value}T00:00:00`));
};

const conPlaceholder = (valor, placeholder) => valor?.trim() || placeholder;


const nombreArchivo = ({ matricula, fechaEmision }) => {
  const matriculaLimpia = matricula.trim().replace(/[^\w-]/g, "") || "SIN_MATRICULA";

  return `CE_${matriculaLimpia}_${fechaEmision || hoyLocal()}`;
};

// Quita acentos y caracteres no válidos para nombres de archivo; espacios -> "_".
const limpiarParaArchivo = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

// Constancia_Estudios_{matricula}_{nombre_completo} (el navegador agrega .pdf)//NO FUNCIONA AHORITA
const crearNombreArchivo = ({ matricula, nombreAlumno }) =>
  ["Constancia_Estudios", limpiarParaArchivo(matricula), limpiarParaArchivo(nombreAlumno)]
    .filter(Boolean)
    .join("_");


/* ========================================================================
 * Estilos del documento (prefijo cd- para evitar choques con otros estilos)
 * ====================================================================== */

const ESTILOS = `
  .cd-hoja {
    position: relative;
    width: 8.5in;
    min-height: 11in;
    padding: 0.54in 0.66in 0.45in;
    background: #fff;
    overflow: hidden;
    color: #111;
    font-family: "Times New Roman", Times, serif;
    font-size: 13.8pt;
    line-height: 1.18;
  }

  .cd-borde {
    position: absolute;
    inset: 0.06in;
    border: 3px solid #0f6375;
    box-shadow:
      inset 0 0 0 1px #043e4b,
      inset 0 0 0 5px #d6eef0,
      inset 0 0 0 7px #0f6375;
    pointer-events: none;
  }

  /* Encabezado */
  .cd-encabezado {
    position: relative;
    min-height: 2.65in;
  }

  .cd-lineas {
    position: absolute;
    inset: -0.48in -0.58in auto -0.61in;
    height: 2.85in;
    overflow: hidden;
    z-index: 0;
  }

  .cd-linea {
    position: absolute;
    height: 1px;
    background: #245d69;
    transform-origin: left center;
  }

  .cd-linea-1 { left: 0.1in;  top: 2.18in; width: 8.4in;  transform: rotate(-11deg); }
  .cd-linea-2 { left: 2in;    top: 0.1in;  width: 2.2in;  transform: rotate(34deg); }
  .cd-linea-3 { left: 4.65in; top: 0.04in; width: 2.55in; transform: rotate(34deg); }
  .cd-linea-4 { left: 5.1in;  top: 0;      width: 1.8in;  transform: rotate(89deg); }
  .cd-linea-5 { left: 6.35in; top: 1.35in; width: 2.15in; transform: rotate(-21deg); }

  .cd-marca {
    position: relative;
    z-index: 1;
    min-height: 1.62in;
  }

  .cd-logo {
    position: absolute;
    left: 0;
    top: 1.2in;
    width: 2.82in;
    height: auto;
  }

  .cd-institucion {
    position: absolute;
    top: 0.33in;
    left: 0.7in;
    right: 0.52in;
    text-align: center;
    font-size: 9.8pt;
    font-weight: 700;
    line-height: 1.03;
  }

  .cd-institucion p {
    margin: 0;
  }

  .cd-institucion-nombre {
    font-size: 12.5pt;
    white-space: nowrap;
  }

  .cd-meta {
    position: absolute;
    top: 1.54in;
    right: 0.02in;
    z-index: 1;
    width: 3.46in;
    padding: 0.08in 0.13in;
    border: 1.6px dashed #222;
    font-size: 12pt;
    line-height: 1.14;
  }

  .cd-meta p {
    margin: 0;
  }

  /* Cuerpo */
  .cd-cuerpo {
    position: relative;
    z-index: 1;
    margin-top: 0.08in;
  }

  .cd-cuerpo > p {
    margin: 0 0 0.31in;
    text-align: justify;
  }

  .cd-cuerpo > .cd-destinatario {
    margin-bottom: 0.42in;
    font-size: 12pt;
    font-style: italic;
    font-weight: 700;
  }

  .cd-alumno {
    margin: -0.08in 0 0.25in;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 19pt;
    font-weight: 800;
    text-align: center;
  }

  /* Firma */
  .cd-firma {
    margin-top: 0.02in;
    text-align: center;
  }

  .cd-firma p {
    margin: 0;
  }

  .cd-firma .cd-atentamente {
    margin-bottom: 0.36in;
    font-size: 12.5pt;
    letter-spacing: 0.12in;
  }

  .cd-firma-linea {
    width: 2.35in;
    height: 0.22in;
    margin: 0 auto 0.02in;
  }

  .cd-director {
    text-transform: uppercase;
  }

  /* Pie de página */
  .cd-pie {
    position: absolute;
    left: 0.58in;
    right: 0.55in;
    bottom: 0.28in;
    z-index: 1;
    min-height: 0.95in;
    font-family: Arial, Helvetica, sans-serif;
  }

  .cd-contacto {
    position: absolute;
    left: 0;
    bottom: 0.03in;
    width: 2.15in;
    color: #174e63;
    font-size: 9pt;
    font-weight: 700;
    line-height: 1.06;
  }

  .cd-contacto p {
    margin: 0;
  }

  .cd-contacto .cd-campus {
    color: #d1bc28;
  }

  .cd-copias {
    position: absolute;
    right: 0;
    bottom: 0.54in;
    font-family: "Times New Roman", Times, serif;
    font-size: 7.2pt;
    line-height: 1.06;
  }

  .cd-copias p {
    margin: 0;
  }

  .cd-web {
    position: absolute;
    right: 0;
    bottom: 0;
    margin: 0;
    color: #0b5a78;
    font-size: 16pt;
    font-weight: 800;
    line-height: 0.96;
    text-align: right;
  }

  /* Impresión: solo se imprime la hoja */
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

    #constancia-preview,
    #constancia-preview * {
      visibility: visible;
    }

    #constancia-preview {
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
`;

/* ========================================================================
 * Componentes
 * ====================================================================== */

function Field({ label, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input className={INPUT_CLASS} {...inputProps} />
    </label>
  );
}

function AlumnoSelect({ alumnos, loading, value, onTextChange, onSelect }) {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);

  // El texto normalizado de cada alumno se calcula una sola vez por carga de datos.
  const indice = useMemo(
    () =>
      alumnos.map((alumno) => ({
        alumno,
        texto: normalizar(
          [
            alumno.nombre,
            alumno.matricula,
            alumno.numero_control,
            alumno.carrera?.nombre,
          ]
            .filter(Boolean)
            .join(" "),
        ),
      })),
    [alumnos],
  );

  const { opciones, total } = useMemo(() => {
    const texto = normalizar(busqueda);
    const coincidencias = texto
      ? indice.filter((item) => item.texto.includes(texto))
      : indice;

    return {
      opciones: coincidencias.slice(0, MAX_OPCIONES).map((item) => item.alumno),
      total: coincidencias.length,
    };
  }, [indice, busqueda]);

  const seleccionar = (alumno) => {
    onSelect(alumno);
    setBusqueda("");
    setAbierto(false);
  };

  return (
    <div className="relative">
      <label
        htmlFor="nombreAlumno"
        className="text-sm font-medium text-slate-700"
      >
        Nombre completo
      </label>

      <input
        id="nombreAlumno"
        name="nombreAlumno"
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls="alumnos-lista"
        aria-autocomplete="list"
        autoComplete="off"
        value={abierto ? busqueda : value}
        onChange={(event) => {
          setBusqueda(event.target.value);
          setAbierto(true);
          onTextChange(event.target.value);
        }}
        onFocus={() => {
          setBusqueda("");
          setAbierto(true);
        }}
        onBlur={() => setAbierto(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setAbierto(false);
        }}
        disabled={loading}
        className={INPUT_CLASS}
        placeholder={
          loading ? "Cargando alumnos..." : "Busca por nombre o matrícula"
        }
      />

      {abierto && (
        <div
          id="alumnos-lista"
          role="listbox"
          // Evita que el input pierda el foco al hacer clic o arrastrar la barra de scroll.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {opciones.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">
              Sin resultados
            </div>
          )}

          {opciones.map((alumno) => (
            <button
              key={alumno.id_alumno}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => seleccionar(alumno)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
            >
              {alumno.nombre}
              {alumno.matricula ? ` - ${alumno.matricula}` : ""}
            </button>
          ))}

          {total > MAX_OPCIONES && (
            <div className="px-3 py-2 text-xs text-slate-500">
              Mostrando {MAX_OPCIONES} de {total}. Sigue escribiendo para
              filtrar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConstanciaPreview({ form }) {
  const textos = TEXTOS_POR_SEXO[form.sexo];

  const nombreAlumno = conPlaceholder(
    form.nombreAlumno,
    "[NOMBRE COMPLETO DEL ALUMNO]",
  ).toUpperCase();
  const matricula = conPlaceholder(form.matricula, "[MATRÍCULA]");
  const carrera = conPlaceholder(form.carrera, "[CARRERA]").toUpperCase();
  const grado = conPlaceholder(form.gradoEscolar, "[GRADO ESCOLAR]");
  const periodo = conPlaceholder(form.periodoEscolar, "[PERIODO]");
  const plan = form.planEstudios
    ? ` con el plan de estudios ${form.planEstudios}`
    : "";

  return (
    <article id="constancia-preview" className="cd-hoja mx-auto shadow-sm">
      <div className="cd-borde" />

      <header className="cd-encabezado">
        <div className="cd-lineas" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`cd-linea cd-linea-${n}`} />
          ))}
        </div>

        <div className="cd-marca">
          <img className="cd-logo" src={logoUnifront} alt="UNIFRONT" />

          <div className="cd-institucion">
            <p className="cd-institucion-nombre">{INSTITUCION.nombre}</p>
            <p>{INSTITUCION.direccion}</p>
            <p>TELS. {TELEFONOS.toUpperCase()}</p>
            <p>{INSTITUCION.claveIncorporacion}</p>
            <p>{INSTITUCION.rvoe}</p>
          </div>
        </div>

        <div className="cd-meta">
          <p>
            <strong>Departamento:</strong> {form.departamento}
          </p>
          <p>
            <strong>Asunto:</strong> {form.asunto}
          </p>
        </div>
      </header>

      <div className="cd-cuerpo">
        <p className="cd-destinatario">A QUIEN CORRESPONDA</p>

        <p>
          Por medio de la presente, se hace constar de acuerdo con los
          documentos que obran en el archivo general del plantel,{" "}
          {textos.alumno}:
        </p>

        <div className="cd-alumno">{nombreAlumno}</div>

        <p>
          es estudiante de esta institución, con matrícula{" "}
          <strong>{matricula}</strong>, y se encuentra {textos.inscrito} en el
          nivel <strong>{grado}</strong> correspondiente al periodo{" "}
          <strong>{periodo}</strong>, en la carrera de{" "}
          <strong>{carrera}</strong>
          {plan}. Asimismo, se hace constar que {textos.alumno} cursa su
          periodo escolar en un horario de {HORARIO}, y cuenta con periodos
          vacacionales establecidos {PERIODO_VACACIONAL}.
        </p>

        <p>
          Se extiende la presente constancia a petición {textos.peticion} y
          para los usos legales a que haya lugar, en la ciudad de {form.ciudad},{" "}
          {form.estado}, al día {formatDate(form.fechaEmision)}.
        </p>

        <div className="cd-firma">
          <p className="cd-atentamente">A T E N T A M E N T E</p>
          <div className="cd-firma-linea" />
          <p className="cd-director">{form.director}</p>
          <p>{form.cargoDirector}</p>
        </div>
      </div>

      <footer className="cd-pie">
        <div className="cd-contacto">
          <p className="cd-campus">{CAMPUS.nombre}</p>
          <p>Tel. {TELEFONOS}</p>
          <p>{CAMPUS.correo}</p>
          <p>{INSTITUCION.direccion}</p>
          <p>{CAMPUS.ubicacion}</p>
        </div>

        <div className="cd-copias">
          <p>C.c.p. Archivo alumno</p>
          <p>C.c.p. Minutario.</p>
        </div>

        <p className="cd-web">{CAMPUS.sitioWeb}</p>
      </footer>
    </article>
  );
}

/* ================================================================
 Página
====================================================================== */

export default function ConstanciaEstudios() {
  const [form, setForm] = useState(crearFormInicial);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarAlumnos = async () => {
      try {
        const lista = await obtenerAlumnosDetalle();

        if (activo) setAlumnos(ordenarPorNombre(lista));
      } catch (requestError) {
        console.error(requestError);

        if (activo) setErrorAlumnos("No se pudo cargar la lista de alumnos.");
      } finally {
        if (activo) setLoadingAlumnos(false);
      }
    };

    cargarAlumnos();

    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleAlumnoSelect = (alumno) => {
    setForm((actual) => ({
      ...actual,
      sexo: detectarSexo(alumno.sexo) ?? actual.sexo,
      nombreAlumno: alumno.nombre || "",
      matricula: alumno.matricula || "",
      carrera: alumno.carrera?.nombre || "",
      planEstudios: "",
      periodoEscolar: alumno.periodo_cursado || "",
      gradoEscolar: alumno.nivel_educativo || "",
    }));
  };

  const handleNombreChange = (nombreAlumno) => {
    setForm((actual) => ({ ...actual, nombreAlumno }));
  };

  // El navegador propone document.title como nombre del PDF al guardar. //AUN NO FUNCIONA
  const handleImprimir = () => {
    
    const tituloOriginal = document.title;

    const nombrePDF = crearNombreArchivo(form);
    document.title = nombrePDF;

    const restaurarTitulo = () => {
      document.title = tituloOriginal;
      window.removeEventListener("afterprint", restaurarTitulo);
    };

    window.addEventListener("afterprint", restaurarTitulo);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Props comunes de cada campo controlado
  const campo = (name) => ({ name, value: form[name], onChange: handleChange });

  return (
    <div className="space-y-6 p-6">

      <style>{ESTILOS}</style>


      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FileText size={22} />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Constancia de estudios
            </h1>

            <p className="mt-1 text-slate-500">
              Captura los datos y revisa el documento antes de imprimirlo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleImprimir}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Download size={18} />
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Datos de la constancia
          </h2>

          <div className="mt-5 space-y-4">
            {errorAlumnos && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {errorAlumnos}
              </div>
            )}

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">
                Sexo del alumno
              </legend>

              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {SEXOS.map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                      form.sexo === value
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value={value}
                      checked={form.sexo === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <AlumnoSelect
              alumnos={alumnos}
              loading={loadingAlumnos}
              value={form.nombreAlumno}
              onTextChange={handleNombreChange}
              onSelect={handleAlumnoSelect}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Matrícula"
                {...campo("matricula")}
                placeholder="Ej. 20231001"
              />
              <Field label="Departamento" {...campo("departamento")} />
            </div>

            <Field label="Asunto" {...campo("asunto")} />

            <Field
              label="Carrera"
              {...campo("carrera")}
              placeholder="Ej. Lic. en Derecho"
            />

            <Field
              label="Plan de estudios"
              {...campo("planEstudios")}
              placeholder="Opcional"
            />

            <Field
              label="Grado escolar"
              {...campo("gradoEscolar")}
              placeholder="Ej. Licenciatura"
            />

            <Field
              label="Periodo"
              {...campo("periodoEscolar")}
              placeholder="Ej. 2026-2"
            />

            <Field
              label="Fecha de emisión"
              type="date"
              {...campo("fechaEmision")}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ciudad" {...campo("ciudad")} />
              <Field label="Estado" {...campo("estado")} />
            </div>

            <Field label="Director" {...campo("director")} />
            <Field label="Cargo del director" {...campo("cargoDirector")} />
          </div>
        </section>

        <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <ConstanciaPreview form={form} />
        </div>
      </div>
    </div>
  );
}