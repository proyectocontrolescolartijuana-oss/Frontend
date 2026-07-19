import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";

const initialForm = {
  sexo: "hombre",
  nombreAlumno: "",
  matricula: "",
  carrera: "",
  planEstudios: "",
  departamento: "Control Escolar",
  asunto: "Constancia de Estudios",
  horario: "lunes a viernes",
  periodoVacacional: "acuerdo al calendario escolar vigente",
  fechaEmision: new Date().toISOString().slice(0, 10),
  ciudad: "Tijuana",
  estado: "B.C.",
  director: "MTRA. MARIA DEL CARMEN GONZALEZ",
  cargoDirector: "DIRECTORA GENERAL",
  campus: "Campus Los Alamos",
  telefono: "Tel. 660-19-23 y 903-43-07",
  correo: "control.escolar@unifront.edu.mx",
  direccion: "Blvd. Bernardo O'Higgins No. 6050, Los Alamos",
  sitioWeb: "www.unifront.mx",
};

const textosPorSexo = {
  hombre: {
    alumno: "el alumno",
    alumnoCapitalizado: "El alumno",
    inscrito: "inscrito",
    peticion: "del interesado",
  },
  mujer: {
    alumno: "la alumna",
    alumnoCapitalizado: "La alumna",
    inscrito: "inscrita",
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

export default function ConstanciaEstudios() {
  const [form, setForm] = useState(initialForm);

  const fechaLegible = useMemo(
    () => formatDate(form.fechaEmision),
    [form.fechaEmision],
  );

  const textos = textosPorSexo[form.sexo];

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

  const nombreAlumno = form.nombreAlumno || "NOMBRE COMPLETO DEL ALUMNO";
  const matricula = form.matricula || "MATRICULA";
  const carrera = form.carrera || "NOMBRE DE LA CARRERA";

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

          .lineas-geometricas {
            position: absolute;
            inset: -0.48in -0.58in auto -0.61in;
            height: 2.85in;
            overflow: hidden;
            z-index: 0;
          }

          .linea {
            position: absolute;
            height: 1px;
            background: #245d69;
            transform-origin: left center;
          }

          .linea-1 {
            left: 0.1in;
            top: 2.18in;
            width: 8.4in;
            transform: rotate(-11deg);
          }

          .linea-2 {
            left: 2.0in;
            top: 0.1in;
            width: 2.2in;
            transform: rotate(34deg);
          }

          .linea-3 {
            left: 4.65in;
            top: 0.04in;
            width: 2.55in;
            transform: rotate(34deg);
          }

          .linea-4 {
            left: 5.1in;
            top: 0;
            width: 1.8in;
            transform: rotate(89deg);
          }

          .linea-5 {
            left: 6.35in;
            top: 1.35in;
            width: 2.15in;
            transform: rotate(-21deg);
          }

          .marca-institucional {
            position: relative;
            z-index: 1;
            min-height: 1.62in;
          }

          .logo-unifront {
            position: absolute;
            left: 0.33in;
            top: 0.75in;
            width: 2.82in;
            height: auto;
          }

          .datos-institucion {
            position: absolute;
            top: 0.33in;
            left: 1.64in;
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
              Constancia de estudios
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Matricula
                </span>
                <input
                  name="matricula"
                  value={form.matricula}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. 20231001"
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
            </div>

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
                placeholder="Ej. Lic. en Derecho"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Plan de estudios
              </span>
              <input
                name="planEstudios"
                value={form.planEstudios}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Opcional"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Horario
              </span>
              <input
                name="horario"
                value={form.horario}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Periodo vacacional
              </span>
              <input
                name="periodoVacacional"
                value={form.periodoVacacional}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Fecha de emision
              </span>
              <input
                type="date"
                name="fechaEmision"
                value={form.fechaEmision}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

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
            className="documento-hoja constancia-documento constancia mx-auto shadow-sm"
          >
            <div className="documento-borde" />

            <header className="constancia-encabezado">
              <div className="lineas-geometricas" aria-hidden="true">
                <span className="linea linea-1" />
                <span className="linea linea-2" />
                <span className="linea linea-3" />
                <span className="linea linea-4" />
                <span className="linea linea-5" />
              </div>

              <section className="marca-institucional">
                <img
                  className="logo-unifront"
                  src={logoUnifront}
                  alt="UNIFRONT"
                />

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
              <p className="destinatario">A QUIEN CORRESPONDA</p>

              <p>
                Por medio de la presente hago constar que segun comprobantes
                que obran en el archivo general del plantel, {textos.alumno}:
              </p>

              <h2 className="nombre-alumno">{nombreAlumno.toUpperCase()}</h2>

              <p>
                Cuya fotografia se muestra en el margen superior derecho, es
                estudiante en esta Institucion con la matricula{" "}
                <strong>{matricula}</strong>, se encuentra {textos.inscrito} a
                esta Institucion en la carrera de{" "}
                <strong>{carrera.toUpperCase()}</strong>
                {form.planEstudios
                  ? ` con el plan de estudios ${form.planEstudios}`
                  : ""}
                . {textos.alumnoCapitalizado} curso el periodo escolar con
                horario de {form.horario} y con un periodo vacacional del{" "}
                {form.periodoVacacional}.
              </p>

              <p>
                Se extiende la presente constancia a peticion{" "}
                {textos.peticion} y para los usos legales a que haya lugar, en
                la Ciudad de {form.ciudad} {form.estado} al dia {fechaLegible}.
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
                <p>Tijuana B.C. Mexico</p>
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
