import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, ImagePlus, X } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoAzul.png";

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_FOTO_MB = 5;

// Solo dos formatos de constancia
const FORMATOS = [
  ["sin_foto", "Sin fotografía"],
  ["con_foto", "Con fotografía"],
];

// Fecha local de la computadora en formato YYYY-MM-DD
// (toISOString usa UTC y puede adelantar el día).
const hoyLocal = () => {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

// Función (no constante) para que la fecha se calcule al abrir la página
const crearFormInicial = () => ({
  formato: "sin_foto",
  sexo: "hombre",
  nombreAlumno: "",
  carrera: "Licenciatura en Criminología",
  fechaInicioEstudios: "2007-10-04",
  fechaFinEstudios: "2010-09-20",
  departamento: "Control Escolar",
  asunto: "Constancia de Terminación",
  fechaEmision: hoyLocal(),
  ciudad: "Tijuana",
  estado: "Baja California",
  director: "MTRA. MARIA DEL CARMEN GONZALEZ",
  cargoDirector: "DIRECTORA GENERAL",
  campus: "Campus Los Alamos",
  telefono: "Tel. 660-19-23 y 903-43-07",
  correo: "control.escolar@unifront.edu.mx",
  direccion: "Blvd. Bernardo O'Higgins No. 6050, Los Alamos",
  sitioWeb: "www.unifront.mx",
});

const textosPorSexo = {
  hombre: {
    alumno: "el alumno",
    peticion: "del interesado",
  },
  mujer: {
    alumno: "la alumna",
    peticion: "de la interesada",
  },
};

const formatDate = (value) => {
  if (!value) return "___ de __________ de ____";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const formatIssueDate = (value) => {
  if (!value) return "a los ___ días del mes de __________ de ____";

  const date = new Date(`${value}T00:00:00`);
  const day = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
  }).format(date);
  const month = new Intl.DateTimeFormat("es-MX", {
    month: "long",
  }).format(date);
  const year = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
  }).format(date);

  // "al día 1" para el primer día; "a los N días" para el resto
  if (Number(day) === 1) return `al día ${day} del mes de ${month} de ${year}`;

  return `a los ${day} días del mes de ${month} de ${year}`;
};

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

// Selector de dos o más opciones tipo "pastilla" (radio accesible)
function Segmented({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>

      <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {options.map(([optionValue, label]) => (
          <label
            key={optionValue}
            className={`cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition focus-within:ring-2 focus-within:ring-blue-300 ${
              value === optionValue
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={onChange}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Zona para elegir la foto desde la computadora o arrastrarla
function FotoDropzone({ fotoUrl, fotoNombre, onFoto, onQuitar }) {
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState("");

  const procesarArchivo = (archivo) => {
    if (!archivo) return;

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setError("Usa una imagen JPG, PNG o WEBP.");
      return;
    }

    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      setError(`La imagen no debe pesar más de ${MAX_FOTO_MB} MB.`);
      return;
    }

    setError("");
    onFoto(archivo);
  };

  const handleInputChange = (event) => {
    procesarArchivo(event.target.files?.[0]);
    // Permite volver a elegir el mismo archivo después de quitarlo
    event.target.value = "";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setArrastrando(false);

    // Archivo arrastrado desde el explorador de archivos
    const archivo = event.dataTransfer.files?.[0];
    if (archivo) {
      procesarArchivo(archivo);
      return;
    }

    // Imagen arrastrada desde otra página o pestaña
    const url =
      event.dataTransfer.getData("text/uri-list") ||
      event.dataTransfer.getData("text/plain");

    if (!/^https?:\/\//i.test(url)) {
      setError("No se reconoció la imagen. Descárgala y súbela desde tu computadora.");
      return;
    }

    try {
      const respuesta = await fetch(url);
      const blob = await respuesta.blob();
      procesarArchivo(new File([blob], "foto", { type: blob.type }));
    } catch (fetchError) {
      console.error(fetchError);
      setError(
        "Ese sitio no permite usar la imagen. Descárgala y selecciónala desde tu computadora.",
      );
    }
  };

  return (
    <div>
      <span className="text-sm font-medium text-slate-700">
        Fotografía del alumno
      </span>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setArrastrando(false);
        }}
        onDrop={handleDrop}
        className={`mt-1 flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-3 transition focus-within:ring-2 focus-within:ring-blue-100 ${
          arrastrando
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400"
        }`}
      >
        <input
          type="file"
          accept={TIPOS_IMAGEN.join(",")}
          onChange={handleInputChange}
          className="sr-only"
        />

        <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-400">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Vista previa de la fotografía"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus size={22} />
          )}
        </div>

        <div className="min-w-0 text-sm">
          <p className="font-semibold text-slate-700">
            {fotoUrl ? "Cambiar fotografía" : "Elegir o arrastrar fotografía"}
          </p>
          <p className="mt-0.5 truncate text-slate-500">
            {fotoUrl
              ? fotoNombre
              : `JPG, PNG o WEBP, hasta ${MAX_FOTO_MB} MB`}
          </p>
        </div>
      </label>

      {fotoUrl && (
        <button
          type="button"
          onClick={() => {
            setError("");
            onQuitar();
          }}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
        >
          <X size={14} />
          Quitar fotografía
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ConstanciaTerminacion() {
  const [form, setForm] = useState(crearFormInicial);
  const [foto, setFoto] = useState(null); // { url, nombre } | null
  const fotoUrlRef = useRef(null);

  // Libera la URL temporal de la foto al salir de la página
  useEffect(
    () => () => {
      if (fotoUrlRef.current) URL.revokeObjectURL(fotoUrlRef.current);
    },
    [],
  );

  const handleFoto = (archivo) => {
    if (fotoUrlRef.current) URL.revokeObjectURL(fotoUrlRef.current);

    const url = URL.createObjectURL(archivo);
    fotoUrlRef.current = url;
    setFoto({ url, nombre: archivo.name });
  };

  const handleQuitarFoto = () => {
    if (fotoUrlRef.current) URL.revokeObjectURL(fotoUrlRef.current);

    fotoUrlRef.current = null;
    setFoto(null);
  };


  const fechaLegible = useMemo(
    () => formatIssueDate(form.fechaEmision),
    [form.fechaEmision],
  );

  const textos = textosPorSexo[form.sexo];
  const conFoto = form.formato === "con_foto";

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

  const nombreAlumno = form.nombreAlumno || "[NOMBRE COMPLETO DEL ALUMNO]";
  const carrera = form.carrera || "[NOMBRE DE LA CARRERA]";
  const fechaInicioEstudios = formatDate(form.fechaInicioEstudios);
  const fechaFinEstudios = formatDate(form.fechaFinEstudios);

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .constancia-documento {
            color: #111;
            font-family: "Times New Roman", Times, serif;
            font-size: 13.8pt;
            line-height: 1.18;
          }

          .constancia-documento,
          .constancia-documento * {
            box-sizing: border-box;
          }

          .documento-hoja {
            position: relative;
            width: 8.5in;
            min-height: 11in;
            padding: 0.54in 0.66in 0.45in;
            background: #fff;
            overflow: hidden;
          }

          .documento-borde {
            position: absolute;
            inset: 0.06in;
            border: 3px solid #0f6375;
            box-shadow:
              inset 0 0 0 1px #043e4b,
              inset 0 0 0 5px #d6eef0,
              inset 0 0 0 7px #0f6375;
            pointer-events: none;
          }

          .constancia-encabezado {
            position: relative;
            min-height: 2.65in;
          }

          .marca-institucional {
            position: relative;
            z-index: 1;
            min-height: 1.62in;
          }

          .logo-unifront {
            position: absolute;
            left: 0.0in;
            top: 1.2in;
            width: 2.82in;
            height: auto;
          }

          .datos-institucion {
            position: absolute;
            top: 0.33in;
            left: 0.7in;
            right: 0.52in;
            text-align: center;
            font-size: 9.8pt;
            font-weight: 700;
            line-height: 1.03;
          }

          .datos-institucion h1,
          .datos-institucion p {
            margin: 0;
          }

          .datos-institucion h1 {
            font-size: 12.5pt;
            white-space: nowrap;
          }

          .documento-meta {
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

          .documento-meta p {
            margin: 0;
          }

          /* Fotografía (solo en el formato "con fotografía"):
             va debajo del logo, alineada a la derecha. */
          .documento-hoja--foto .marca-institucional {
            padding-top: 1.2in;
            padding-bottom: 0.18in;
          }

          .documento-hoja--foto .logo-unifront {
            position: static;
            display: block;
          }

          .documento-hoja--foto .constancia-cuerpo > .destinatario {
            margin-bottom: 0.3in !important;
          }

          .foto-alumno {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5cm;
            height: 3cm;
            margin: 0.22in 0 0 auto;
            border: 1.5px solid #222;
            background: #fff;
            overflow: hidden;
          }

          .foto-alumno img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .foto-vacia {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            color: #777;
            text-align: center;
          }

          .constancia-cuerpo {
            position: relative;
            z-index: 1;
            margin-top: 0.08in;
          }

          .constancia-cuerpo p {
            margin: 0 0 0.31in;
            text-align: justify;
          }

          .destinatario {
            margin-bottom: 0.42in !important;
            font-size: 12pt;
            font-style: italic;
            font-weight: 700;
          }

          .nombre-alumno {
            margin: -0.08in 0 0.25in;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 19pt;
            font-weight: 800;
            letter-spacing: 0;
            text-align: center;
          }

          .firma {
            margin-top: 0.02in;
            text-align: center;
          }

          .firma p {
            margin: 0;
            text-align: center;
          }

          .atentamente {
            margin-bottom: 0.36in !important;
            font-size: 12.5pt;
            letter-spacing: 0.12in;
          }

          .firma-linea {
            width: 2.35in;
            height: 0.22in;
            margin: 0 auto 0.02in;
          }

          .nombre-director {
            text-transform: uppercase;
          }

          .constancia-pie {
            position: absolute;
            left: 0.58in;
            right: 0.55in;
            bottom: 0.28in;
            z-index: 1;
            min-height: 0.95in;
            font-family: Arial, Helvetica, sans-serif;
          }

          .contacto-campus {
            position: absolute;
            left: 0;
            bottom: 0.03in;
            width: 2.15in;
            color: #174e63;
            font-size: 9pt;
            font-weight: 700;
            line-height: 1.06;
          }

          .contacto-campus p {
            margin: 0;
          }

          .contacto-campus .campus {
            color: #d1bc28;
          }

          .copias {
            position: absolute;
            right: 0;
            bottom: 0.54in;
            font-family: "Times New Roman", Times, serif;
            font-size: 7.2pt;
            line-height: 1.06;
          }

          .copias p {
            margin: 0;
          }

          .sitio-web {
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

            /* El texto "Fotografía" del recuadro vacío no se imprime */
            .foto-vacia {
              display: none;
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
              Constancia de terminación
            </h1>

            <p className="mt-1 text-slate-500">
              Captura los datos y revisa el documento antes de descargarlo.
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
            Datos de la constancia
          </h2>

          <div className="mt-5 space-y-4">
            <Segmented
              legend="Formato de la constancia"
              name="formato"
              options={FORMATOS}
              value={form.formato}
              onChange={handleChange}
            />

            {conFoto && (
              <FotoDropzone
                fotoUrl={foto?.url}
                fotoNombre={foto?.nombre}
                onFoto={handleFoto}
                onQuitar={handleQuitarFoto}
              />
            )}

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">
                Sexo del alumno
              </legend>

              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {[
                  ["hombre", "Hombre"],
                  ["mujer", "Mujer"],
                ].map(([value, label]) => (
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

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Nombre completo
              </span>
              <input
                name="nombreAlumno"
                value={form.nombreAlumno}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ej. Isabella Perez Torres"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Departamento
              </span>
              <input
                name="departamento"
                value={form.departamento}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Asunto
              </span>
              <input
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Carrera
              </span>
              <input
                name="carrera"
                value={form.carrera}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ej. Licenciatura en Criminología"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Inicio de estudios
                </span>
                <input
                  type="date"
                  name="fechaInicioEstudios"
                  value={form.fechaInicioEstudios}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Fin de estudios
                </span>
                <input
                  type="date"
                  name="fechaFinEstudios"
                  value={form.fechaFinEstudios}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Fecha de emisión
              </span>
              <input
                type="date"
                name="fechaEmision"
                value={form.fechaEmision}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Ciudad
                </span>
                <input
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Estado
                </span>
                <input
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div> */}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Director
              </span>
              <input
                name="director"
                value={form.director}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Cargo del director
              </span>
              <input
                name="cargoDirector"
                value={form.cargoDirector}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="constancia-preview"
            className={`documento-hoja constancia-documento constancia mx-auto shadow-sm ${
              conFoto ? "documento-hoja--foto" : ""
            }`}
          >
            <div className="documento-borde" />

            <header className="constancia-encabezado">
              <section className="marca-institucional">
                <img
                  className="logo-unifront"
                  src={logoUnifront}
                  alt="UNIFRONT"
                />

                {conFoto && (
                  <div className="foto-alumno">
                    {foto?.url ? (
                      <img src={foto.url} alt="Fotografía del alumno" />
                    ) : (
                      <span className="foto-vacia">Fotografía</span>
                    )}
                  </div>
                )}

                <div className="datos-institucion">
                  <h1>CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA</h1>
                  <p>Blvd. Bernardo O'Higgins No. 6050, Los Alamos</p>
                  <p>TELS. 660-19-23 Y 903-43-07</p>
                  <p>Clave Incorp. 02PSU0015M</p>
                  <p>RVOE-BC-L009-M2/17</p>
                </div>
              </section>

              <section className="documento-meta">
                <p>
                  <strong>Departamento:</strong> {form.departamento}
                </p>
                <p>
                  <strong>Asunto:</strong> {form.asunto}
                </p>
              </section>
            </header>

            <main className="constancia-cuerpo">
              <p className="destinatario">A QUIEN CORRESPONDA:</p>

              <p>
                Por medio de la presente hago constar que, según los
                documentos que obran en el archivo general del plantel,{" "}
                {textos.alumno}:
              </p>

              <h2 className="nombre-alumno">{nombreAlumno.toUpperCase()}</h2>

              <p>
                culminó satisfactoriamente el plan de estudios de la{" "}
                <strong>{carrera.toUpperCase()}</strong> de esta institución,
                en el periodo comprendido del {fechaInicioEstudios} al{" "}
                {fechaFinEstudios}.
              </p>

              <p>
                Se extiende la presente constancia a petición{" "}
                {textos.peticion} y para los usos legales a que haya lugar, en
                la ciudad de {form.ciudad}, {form.estado}, {fechaLegible}.
              </p>

              <section className="firma">
                <p className="atentamente">A T E N T A M E N T E</p>
                <div className="firma-linea" />
                <p className="nombre-director">{form.director}</p>
                <p>{form.cargoDirector}</p>
              </section>
            </main>

            <footer className="constancia-pie">
              <section className="contacto-campus">
                <p className="campus">{form.campus}</p>
                <p>{form.telefono}</p>
                <p>{form.correo}</p>
                <p>{form.direccion}</p>
                <p>Tijuana, B.C., México</p>
              </section>

              <section className="copias">
                <p>C.c.p. Archivo alumno</p>
                <p>C.c.p. Minutario.</p>
              </section>

              <p className="sitio-web">{form.sitioWeb}</p>
            </footer>
          </article>
        </section>
      </div>
    </div>
  );
}