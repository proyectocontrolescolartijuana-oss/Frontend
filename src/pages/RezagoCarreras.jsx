import { useEffect, useMemo, useState } from "react";
import { Download, BookOpen } from "lucide-react";

import { obtenerCarreras } from "../services/carrerasService";
import api from "../services/api";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

export default function RezagoCarreras() {
  const [carreras, setCarreras] = useState([]);
  const [carreraActiva, setCarreraActiva] = useState(null);

  const [rezago, setRezago] = useState({
    periodo: "",
    alumnos: [],
  });

  useEffect(() => {
    obtenerCarreras()
      .then(setCarreras)
      .catch(() => setCarreras([]));
  }, []);

  useEffect(() => {
    if (!carreraActiva) return;

    api
      .get("/historiales-academicos/", {
        params: {
          carrera_id: carreraActiva,
          resultado: "REPROBADO",
        },
      })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        const alumnos = items.map((it) => ({
          nombre: nombreAlumnoApellidosPrimero(it?.alumno, ""),
          cuatrimestre: it?.alumno?.cuatrimestre || it?.periodo?.nombre || "",
          grupo: it?.grupo?.nombre || it?.materia?.clave || "",
          materia: it?.materia?.nombre || "",
        }));

        const periodoNombre = items[0]?.periodo?.nombre || "";
        setRezago({ periodo: periodoNombre, alumnos });
      })
      .catch(() => setRezago({ periodo: "", alumnos: [] }));
  }, [carreraActiva]);

  const carrera = useMemo(
    () =>
      carreras.find(
        (c) => c.id_carrera === carreraActiva || c.id === carreraActiva,
      ),
    [carreras, carreraActiva],
  );

  const lista = rezago.alumnos;
  const periodo = rezago.periodo;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 p-6">
      <style>{`
        .rezago-doc {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          color: #111;
          line-height: 1.3;
          box-sizing: border-box;
        }
        .rezago-doc * { box-sizing: border-box; }

        .rezago-hoja {
          width: 8.5in;
          min-height: 11in;
          padding: 0.4in 0.5in 0.3in;
          background: #fff;
        }

        .rezago-inst {
          text-align: center;
          font-size: 10pt;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.5;
        }
        .rezago-dept {
          text-align: center;
          font-size: 9pt;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0 0 0.1in;
        }

        .rezago-carrera-titulo {
          text-align: center;
          font-size: 13pt;
          font-weight: 900;
          text-decoration: underline;
          text-transform: uppercase;
          margin: 0 0 0.05in;
        }

        .rezago-fecha {
          text-align: right;
          font-size: 10pt;
          font-weight: 900;
          margin: 0 0 0.15in;
        }

        .rezago-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .rezago-table .row-titulo td {
          background: #548235;
          color: #fff;
          font-size: 12pt;
          font-weight: 900;
          text-align: center;
          letter-spacing: 0.06em;
          padding: 0.09in 0.1in;
          border: 1.5px solid #548235;
        }

        .rezago-table .row-sep td {
          background: #a9d18e;
          border: 1.5px solid #548235;
          height: 0.1in;
          padding: 0;
        }

        .rezago-table .row-head th {
          background: #a9d18e;
          color: #1a1a1a;
          font-size: 9pt;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          padding: 0.07in 0.08in;
          border: 1.5px solid #548235;
        }

        .rezago-table tbody tr td {
          border: 1.5px solid #548235;
          padding: 0.055in 0.08in;
          height: 0.28in;
          font-size: 9.5pt;
          color: #111;
        }

        .rezago-td-nombre {
          font-weight: 700;
          text-transform: uppercase;
        }
        .rezago-td-grupo {
          text-align: center;
          font-weight: 700;
        }
        .rezago-td-cuatri {
          text-align: center;
          font-weight: 700;
        }
        .rezago-td-materia {
          font-weight: 400;
          text-transform: uppercase;
        }

        .rezago-footer {
          margin-top: 0.2in;
          border-top: 1.6px solid #548235;
          padding-top: 0.05in;
          text-align: center;
          font-size: 7.2pt;
          font-weight: 700;
        }

        @media print {
          html, body, #root { margin: 0; overflow: hidden; }
          body * { visibility: hidden; }
          #rezago-preview, #rezago-preview * { visibility: visible; }
          #rezago-preview {
            position: absolute;
            top: 0; left: 0;
            width: 8.5in;
            min-height: 11in;
            margin: 0;
            box-shadow: none;
          }
          @page { size: letter; margin: 0; }
        }
      `}</style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Rezago por carrera
            </h1>
            <p className="mt-1 text-slate-500">
              Selecciona una carrera para ver los alumnos con materias
              reprobadas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!carreraActiva}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Carreras</h2>

          <div className="mt-4 flex flex-col gap-1">
            {carreras.map((c) => {
              const id = c.id_carrera ?? c.id;
              const nombre = c.nombre;
              const activa = carreraActiva === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCarreraActiva(id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    activa
                      ? "border-green-300 bg-green-50"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${activa ? "text-green-800" : "text-slate-800"}`}
                  >
                    {nombre}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {activa ? lista.length : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          {!carreraActiva ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              <p className="text-sm">
                Selecciona una carrera para ver el formato
              </p>
            </div>
          ) : (
            <article
              id="rezago-preview"
              className="rezago-hoja rezago-doc mx-auto shadow-sm"
            >
              <p className="rezago-inst">
                CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA, UNIFRONT
              </p>
              <p className="rezago-dept">DEPARTAMENTO DE CONTROL ESCOLAR</p>

              <h1 className="rezago-carrera-titulo">
                LICENCIATURA EN {carrera?.nombre || ""}
              </h1>
              <div className="rezago-fecha">{periodo}</div>

              <table className="rezago-table">
                <colgroup>
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "34%" }} />
                </colgroup>
                <thead>
                  <tr className="row-titulo">
                    <td colSpan={4}>REZAGO&nbsp;&nbsp; ALUMNOS ACTIVOS</td>
                  </tr>
                  <tr className="row-sep">
                    <td colSpan={4}></td>
                  </tr>
                  <tr className="row-head">
                    <th>Alumno</th>
                    <th>Cuatrimestre</th>
                    <th>Grupo</th>
                    <th>Materia</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((a, i) => (
                    <tr key={i}>
                      <td className="rezago-td-nombre">{a.nombre}</td>
                      <td className="rezago-td-cuatri">{a.cuatrimestre}</td>
                      <td className="rezago-td-grupo">{a.grupo}</td>
                      <td className="rezago-td-materia">{a.materia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <footer className="rezago-footer">
                BOULEVARD BERNARDO O' HIGGINS #6050 3RA. ETAPA ZONA
                RIO&nbsp;&nbsp; TEL. + 52 (664) 660.1989
              </footer>
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
