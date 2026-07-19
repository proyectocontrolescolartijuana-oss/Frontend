import { useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { formatDateDDMMYYYY } from "../utils/fechas";

const initialForm = {
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
  sinodalUno: "",
  sinodalDos: "",
  sinodalTres: "",
};

export default function ActaExamenTituloSuficiencia() {
  const [form, setForm] = useState(initialForm);

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
            padding: 0.28in 1.0in 0.55in;
            background: #fff;
            overflow: hidden;
          }

          .acta-titulo-encabezado {
            text-align: center;
          }

          .acta-titulo-logo {
            width: 2.98in;
            height: auto;
            margin: 0 auto 0.12in;
          }

          .acta-titulo-principal {
            margin: 0;
            font-size: 15pt;
            font-weight: 800;
          }

          .acta-titulo-meta {
            display: grid;
            grid-template-columns: 1fr 2.0in;
            gap: 0.16in;
            margin: 0.17in 0 0.12in;
          }

          .acta-titulo-meta-derecha {
            display: grid;
            gap: 0.09in;
          }

          .acta-titulo-cuerpo {
            margin-top: 0.08in;
          }

          .acta-titulo-row {
            display: flex;
            align-items: flex-end;
            gap: 0.05in;
            margin-bottom: 0.08in;
          }

          .acta-titulo-label {
            flex: 0 0 auto;
            white-space: nowrap;
          }

          .acta-titulo-linea {
            display: inline-block;
            min-width: 0.85in;
            height: 0.19in;
            border-bottom: 1.5px solid #444;
            font-family: "Segoe Print", "Comic Sans MS", cursive;
            font-size: 11pt;
            font-weight: 600;
            text-align: center;
            line-height: 0.16in;
          }

          .acta-titulo-linea-full {
            flex: 1 1 auto;
            min-width: 0;
          }

          .acta-titulo-linea-nombre {
            min-width: 2.05in;
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
            min-width: 0.72in;
          }

          .acta-titulo-atencion {
            margin: 0.17in 0 0.18in;
            text-align: center;
          }

          .acta-titulo-aviso {
            margin: 0.22in 0 0.22in;
            font-weight: 700;
            text-align: justify;
          }

          .acta-titulo-sublinea {
            display: grid;
            grid-template-columns: 1fr 0.95in;
            margin-top: -0.05in;
            padding-left: 2.7in;
            font-size: 9pt;
            text-align: center;
          }

          .acta-titulo-firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0.8in;
            row-gap: 0.22in;
            margin-top: 0.08in;
          }

          .acta-titulo-firma {
            min-height: 0.55in;
            text-align: center;
          }

          .acta-titulo-firma-centro {
            grid-column: 1 / -1;
            width: 2.55in;
            margin: 0 auto;
          }

          .acta-titulo-firma-linea {
            height: 0.22in;
            border-bottom: 1.5px solid #444;
            font-family: "Segoe Print", "Comic Sans MS", cursive;
            font-size: 10.5pt;
            font-weight: 600;
            line-height: 0.18in;
            text-align: center;
          }

          .acta-titulo-firma p {
            margin: 0.01in 0 0;
            font-size: 9.5pt;
          }

          .acta-titulo-firmas-finales {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 0.78in;
            margin-top: 0.26in;
          }

          .acta-titulo-copias {
            margin: 0.03in 0 0;
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
              Acta de examen a titulo de suficiencia
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["fecha", "Fecha"],
                ["periodo", "Periodo"],
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
              {[
                ["calificacionLetra", "Calificacion letra"],
                ["calificacionNumero", "Calificacion numero"],
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
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}
            </div>
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
                ACTA DE EXAMEN A TITULO DE SUFICIENCIA
              </h2>
            </header>

            <section className="acta-titulo-meta">
              <div />
              <div className="acta-titulo-meta-derecha">
                <div className="acta-titulo-row">
                  <span className="acta-titulo-label">Fecha:</span>
                  <span className="acta-titulo-linea acta-titulo-linea-full">
                    {fechaLineValue(form.fecha)}
                  </span>
                </div>
                <div className="acta-titulo-row">
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

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">
                  Por medio de la presente, le informo que el alumno (a)
                </span>
                <span className="acta-titulo-linea acta-titulo-linea-nombre">
                  {lineValue(form.nombreAlumno)}
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-linea acta-titulo-linea-full" />
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">De la Licenciatura en</span>
                <span className="acta-titulo-linea acta-titulo-linea-carrera">
                  {lineValue(form.licenciatura)}
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">Matricula:</span>
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

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">
                  Presentó Examen a título de suficiencia de la materia de:
                </span>
                <span className="acta-titulo-linea acta-titulo-linea-full">
                  {lineValue(form.materia)}
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-linea acta-titulo-linea-materia" />
                <span className="acta-titulo-label">Clave:</span>
                <span className="acta-titulo-linea acta-titulo-linea-corta">
                  {lineValue(form.clave)}
                </span>
              </div>

              <div className="acta-titulo-row">
                <span className="acta-titulo-label">
                  Obteniendo la calificacion
                </span>
                <span className="acta-titulo-linea acta-titulo-linea-full">
                  {lineValue(form.calificacionLetra)}
                </span>
                <span className="acta-titulo-label">(</span>
                <span className="acta-titulo-linea acta-titulo-linea-corta">
                  {lineValue(form.calificacionNumero)}
                </span>
                <span className="acta-titulo-label">)</span>
              </div>

              <div className="acta-titulo-sublinea">
                <span>LETRA</span>
                <span>NÚMERO</span>
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
                  <p>Nombre y Firma del alumno</p>
                  <p className="acta-titulo-copias">c.c.p Archivo</p>
                </div>

                <div className="acta-titulo-firma">
                  <div className="acta-titulo-firma-linea" />
                  <p>Nombre y firma del coordinador</p>
                </div>
              </section>
            </main>
          </article>
        </section>
      </div>
    </div>
  );
}
