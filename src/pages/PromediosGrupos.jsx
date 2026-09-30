import { useEffect, useMemo, useState } from "react";
import { Download, Users } from "lucide-react";

import {
  obtenerGrupos,
  prepararPromediosPorGrupo,
} from "../services/promediosGruposService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

export default function PromediosGrupo() {
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataGrupo, setDataGrupo] = useState(null);

  useEffect(() => {
    let mounted = true;
    obtenerGrupos()
      .then((res) => {
        if (!mounted) return;
        setGrupos(res || []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("No se pudieron cargar los grupos");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const grupo = useMemo(
    () => grupos.find((g) => g.id_grupo === grupoActivo),
    [grupos, grupoActivo]
  );

  const lista = dataGrupo?.alumnosPromedios || [];
  const fechaStr = dataGrupo?.meta?.fechaStr || "";

  const handlePrint = () => window.print();

  const onSelectGrupo = async (idGrupo) => {
    setGrupoActivo(idGrupo);
    setLoading(true);
    setError("");
    setDataGrupo(null);

    try {
      const res = await prepararPromediosPorGrupo({ grupoId: idGrupo });
      setDataGrupo(res);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los promedios del grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .promedios-documento {
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.3;
          }

          .promedios-documento,
          .promedios-documento * {
            box-sizing: border-box;
          }

          .promedios-hoja {
            width: 8.5in;
            min-height: 11in;
            padding: 0.4in 0.45in 0.3in;
            background: #fff;
          }

          /* ── Título principal ── */
          .promedios-titulo {
            text-align: center;
            font-size: 14pt;
            font-weight: 900;
            color: #111;
            margin: 0 0 0.05in;
            text-transform: uppercase;
          }

          .promedios-periodo {
            text-align: center;
            font-size: 12pt;
            font-weight: 700;
            color: #111;
            margin: 0 0 0.22in;
          }

          /* ── Fila de meta (Cuatrimestre / Grupo) ── */
          .promedios-meta {
            display: flex;
            align-items: baseline;
            gap: 0.55in;
            margin-bottom: 0.22in;
          }

          .promedios-meta-item {
            display: flex;
            align-items: baseline;
            gap: 0.08in;
            font-size: 10pt;
            font-weight: 700;
            color: #111;
          }

          .promedios-meta-item span.valor {
            display: inline-block;
            min-width: 1.1in;
            border-bottom: 1.4px solid #111;
            font-size: 11pt;
            font-weight: 900;
            padding-bottom: 1px;
            text-align: center;
          }

          /* ── Fecha ── */
          .promedios-fecha {
            text-align: right;
            font-size: 11pt;
            font-weight: 900;
            color: #111;
            margin-bottom: 0.18in;
          }

          /* ── Tabla ── */
          .promedios-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .promedios-table th,
          .promedios-table td {
            border: 1.5px solid #5b9bd5;
            padding: 0.06in 0.08in;
          }

          /* Cabecera: azul medio, texto azul oscuro negrita */
          .promedios-table thead tr {
            background: #9dc3e6;
          }

          .promedios-table th {
            font-size: 9pt;
            font-weight: 900;
            color: #1f3864;
            text-align: center;
            text-transform: uppercase;
          }

          /* Filas impares = azul muy claro, pares = blanco */
          .promedios-table tbody tr:nth-child(odd) {
            background: #deeaf1;
          }

          .promedios-table tbody tr:nth-child(even) {
            background: #fff;
          }

          .promedios-table td {
            font-size: 10pt;
            height: 0.27in;
            color: #1f3864;
          }

          .promedios-td-no {
            text-align: center;
            font-weight: 700;
          }

          .promedios-td-nombre {
            font-weight: 700;
            text-transform: uppercase;
          }

          .promedios-td-promedio {
            text-align: center;
            font-weight: 900;
            font-size: 11pt;
          }

          .promedios-td-modalidad {
            text-align: center;
            font-weight: 700;
          }

          .promedios-td-obs {
            font-size: 8.5pt;
            font-weight: 600;
          }

          .promedios-footer-line {
            margin-top: 0.2in;
            border-top: 1.6px solid #5b9bd5;
            padding-top: 0.05in;
            text-align: center;
            font-size: 7.2pt;
            font-weight: 700;
          }

          @media print {
            html, body, #root {
              width: 8.5in;
              height: 11in;
              margin: 0;
              overflow: hidden;
            }

            body * {
              visibility: hidden;
            }

            #promedios-preview,
            #promedios-preview * {
              visibility: visible;
            }

            #promedios-preview {
              position: absolute;
              top: 0;
              left: 0;
              width: 8.5in;
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

      {/* ── Encabezado de página ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Promedios por grupo
            </h1>
            <p className="mt-1 text-slate-500">
              Selecciona un grupo para generar el formato de promedios.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={!grupoActivo || !dataGrupo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      {/* ── Layout: sidebar + preview ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">

        {/* Sidebar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Grupos disponibles
          </h2>

          <div className="mt-4 flex flex-col gap-1">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {grupos.length === 0 && !error && (
              <p className="text-sm text-slate-400 px-1 py-2">
                Cargando grupos…
              </p>
            )}

            {grupos.map((g) => (
              <button
                key={g.id_grupo}
                type="button"
                onClick={() => onSelectGrupo(g.id_grupo)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  grupoActivo === g.id_grupo
                    ? "border-blue-300 bg-blue-50"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    grupoActivo === g.id_grupo
                      ? "text-blue-800"
                      : "text-slate-800"
                  }`}
                >
                  {g.nombre}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {g.carrera} · {g.cuatrimestre} · {g.turno}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Preview */}
        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          {!grupoActivo ? (
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
                Selecciona un grupo para ver el formato
              </p>
            </div>
          ) : loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <p className="text-sm">Cargando promedios…</p>
            </div>
          ) : (
            <article
              id="promedios-preview"
              className="promedios-hoja promedios-documento mx-auto shadow-sm"
            >
              {/* Título */}
              <h1 className="promedios-titulo">
                PROMEDIOS DE LA LICENCIATURA EN {(grupo?.carrera || "").toUpperCase()}
              </h1>
              <p className="promedios-periodo">{grupo?.periodo}</p>

              {/* Meta: Cuatrimestre + Grupo + Carrera */}
              <div className="promedios-meta">
                <div className="promedios-meta-item">
                  CUATRIMESTRE:&nbsp;<span className="valor">{grupo?.cuatrimestre}</span>
                </div>
                <div className="promedios-meta-item">
                  GRUPO:&nbsp;<span className="valor" style={{ minWidth: "1.5in" }}>{grupo?.nombre}</span>
                </div>
                <div className="promedios-meta-item">
                  CARRERA:&nbsp;<span className="valor" style={{ minWidth: "1.5in" }}>{grupo?.carrera}</span>
                </div>
              </div>

              {/* Fecha */}
              <div className="promedios-fecha">{fechaStr}</div>

              {/* Tabla */}
              <table className="promedios-table">
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "22%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nombre de alumno</th>
                    <th>Promedio general</th>
                    <th>Modalidad</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((a) => (
                    <tr key={a.no}>
                      <td className="promedios-td-no">{a.no}</td>
                      <td className="promedios-td-nombre">
                        {nombreAlumnoApellidosPrimero(a)}
                      </td>
                      <td className="promedios-td-promedio">{a.promedio.toFixed(2)}</td>
                      <td className="promedios-td-modalidad">{a.modalidad}</td>
                      <td className="promedios-td-obs">{a.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <footer className="promedios-footer-line">
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

// import { useEffect, useMemo, useState } from "react";
// import { Download, Users } from "lucide-react";

// import {
//   obtenerGrupos,
//   prepararPromediosPorGrupo,
// } from "../services/promediosGruposService";

// export default function PromediosGrupo() {
//   const [grupoActivo, setGrupoActivo] = useState(null);
//   const [grupos, setGrupos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [dataGrupo, setDataGrupo] = useState(null);

//   useEffect(() => {
//     let mounted = true;
//     obtenerGrupos()
//       .then((res) => {
//         if (!mounted) return;
//         setGrupos(res || []);
//       })
//       .catch((e) => {
//         console.error(e);
//         if (!mounted) return;
//         setError("No se pudieron cargar los grupos");
//       });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const grupo = useMemo(
//     () => grupos.find((g) => g.id_grupo === grupoActivo),
//     [grupos, grupoActivo]
//   );

//   const lista = dataGrupo?.alumnosPromedios || [];
//   const fechaStr = dataGrupo?.meta?.fechaStr || "";

//   const handlePrint = () => window.print();

//   const onSelectGrupo = async (idGrupo) => {
//     setGrupoActivo(idGrupo);
//     setLoading(true);
//     setError("");
//     setDataGrupo(null);

//     try {
//       const res = await prepararPromediosPorGrupo({ grupoId: idGrupo });
//       setDataGrupo(res);
//     } catch (e) {
//       console.error(e);
//       setError("No se pudieron cargar los promedios del grupo");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <style>
//         {`
//           .promedios-documento {
//             color: #111;
//             font-family: Arial, Helvetica, sans-serif;
//             font-size: 10pt;
//             line-height: 1.18;
//           }

//           .promedios-documento,
//           .promedios-documento * {
//             box-sizing: border-box;
//           }

//           .promedios-hoja {
//             width: 8.5in;
//             min-height: 11in;
//             padding: 0.3in 0.35in 0.25in;
//             background: #fff;
//           }

//           .promedios-header {
//             background: #0f78a5;
//             color: #fff;
//             padding: 0.18in 0.22in;
//             text-align: center;
//             margin-bottom: 0.18in;
//           }

//           .promedios-header-title {
//             font-size: 13pt;
//             font-weight: 700;
//             letter-spacing: 0.03em;
//             margin: 0;
//           }

//           .promedios-header-sub {
//             font-size: 9pt;
//             opacity: 0.85;
//             margin: 0.04in 0 0;
//           }

//           .promedios-meta {
//             display: flex;
//             gap: 0.4in;
//             padding: 0.1in 0.14in;
//             border: 1.5px solid #e0e0e0;
//             background: #f8f9fb;
//             margin-bottom: 0.1in;
//           }

//           .promedios-meta-field {
//             display: flex;
//             flex-direction: column;
//             gap: 2px;
//           }

//           .promedios-meta-label {
//             font-size: 7pt;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 0.07em;
//             color: #888;
//           }

//           .promedios-meta-value {
//             font-size: 10pt;
//             font-weight: 600;
//             color: #111;
//           }

//           .promedios-fecha {
//             text-align: right;
//             font-size: 8pt;
//             font-weight: 700;
//             color: #555;
//             margin-bottom: 0.14in;
//             padding-bottom: 0.08in;
//             border-bottom: 1px solid #e0e0e0;
//           }

//           .promedios-table {
//             width: 100%;
//             border-collapse: collapse;
//             table-layout: fixed;
//           }

//           .promedios-table th,
//           .promedios-table td {
//             border: 1.6px solid #111;
//             padding: 0.06in 0.09in;
//           }

//           .promedios-table thead tr {
//             background: #0f78a5;
//           }

//           .promedios-table th {
//             font-size: 7.5pt;
//             font-weight: 800;
//             font-style: italic;
//             color: #111;
//             text-align: center;
//             text-transform: uppercase;
//             letter-spacing: 0.04em;
//           }

//           .promedios-table td {
//             font-size: 10pt;
//             height: 0.29in;
//           }

//           .promedios-table tbody tr:nth-child(even) {
//             background: #f0f6ff;
//           }

//           .promedios-td-no {
//             text-align: center;
//             color: #888;
//             font-weight: 500;
//             font-size: 9pt;
//           }

//           .promedios-td-nombre {
//             font-weight: 500;
//           }

//           .promedios-td-promedio {
//             text-align: center;
//             font-weight: 700;
//             font-size: 11pt;
//             color: #0c447c;
//           }

//           .promedios-td-modalidad {
//             text-align: center;
//           }

//           .promedios-td-obs {
//             font-size: 8.5pt;
//             color: #888;
//           }

//           .badge-promedio {
//             display: inline-block;
//             padding: 1px 7px;
//             border-radius: 20px;
//             font-size: 7.8pt;
//             font-weight: 700;
//             background: #dff0c8;
//             color: #2d5a08;
//             border: 1px solid #a8d97b;
//           }

//           .badge-tesis {
//             display: inline-block;
//             padding: 1px 7px;
//             border-radius: 20px;
//             font-size: 7.8pt;
//             font-weight: 700;
//             background: #ddeeff;
//             color: #0c447c;
//             border: 1px solid #7db8eb;
//           }

//           .promedios-footer-line {
//             margin-top: 0.18in;
//             border-top: 1.6px solid #0f78a5;
//             padding-top: 0.04in;
//             text-align: center;
//             font-size: 7.2pt;
//             font-weight: 700;
//           }

//           @media print {
//             html, body, #root {
//               width: 8.5in;
//               height: 11in;
//               margin: 0;
//               overflow: hidden;
//             }

//             body * {
//               visibility: hidden;
//             }

//             #promedios-preview,
//             #promedios-preview * {
//               visibility: visible;
//             }

//             #promedios-preview {
//               position: absolute;
//               top: 0;
//               left: 0;
//               width: 8.5in;
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

//       {/* ── Encabezado de página ── */}
//       <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//         <div className="flex items-center gap-3">
//           <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
//             <Users size={22} />
//           </div>
//           <div>
//             <h1 className="text-4xl font-bold text-slate-900">
//               Promedios por grupo
//             </h1>
//             <p className="mt-1 text-slate-500">
//               Selecciona un grupo para generar el formato de promedios.
//             </p>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={handlePrint}
//           disabled={!grupoActivo || !dataGrupo}
//           className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <Download size={18} />
//           Descargar PDF
//         </button>
//       </div>

//       <div className="h-px w-full bg-slate-200" />

//       {/* ── Layout: sidebar + preview ── */}
//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">

//         {/* Sidebar */}
//         <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h2 className="text-xl font-semibold text-slate-900">
//             Grupos disponibles
//           </h2>

//           <div className="mt-4 flex flex-col gap-1">
//             {error && (
//               <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
//                 {error}
//               </div>
//             )}

//             {grupos.length === 0 && !error && (
//               <p className="text-sm text-slate-400 px-1 py-2">
//                 Cargando grupos…
//               </p>
//             )}

//             {grupos.map((g) => (
//               <button
//                 key={g.id_grupo}
//                 type="button"
//                 onClick={() => onSelectGrupo(g.id_grupo)}
//                 className={`w-full rounded-xl border px-3 py-2 text-left transition ${
//                   grupoActivo === g.id_grupo
//                     ? "border-blue-300 bg-blue-50"
//                     : "border-transparent hover:bg-slate-50"
//                 }`}
//               >
//                 <p
//                   className={`text-sm font-medium ${
//                     grupoActivo === g.id_grupo
//                       ? "text-blue-800"
//                       : "text-slate-800"
//                   }`}
//                 >
//                   {g.nombre}
//                 </p>
//                 <p className="mt-0.5 text-xs text-slate-400">
//                   {g.carrera} · {g.cuatrimestre} · {g.turno}
//                 </p>
//               </button>
//             ))}
//           </div>
//         </section>

//         {/* Preview */}
//         <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
//           {!grupoActivo ? (
//             <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-slate-400">
//               <svg
//                 width="48"
//                 height="48"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M3 7h18M3 12h18M3 17h18" />
//               </svg>
//               <p className="text-sm">
//                 Selecciona un grupo para ver el formato
//               </p>
//             </div>
//           ) : loading ? (
//             <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-slate-400">
//               <p className="text-sm">Cargando promedios…</p>
//             </div>
//           ) : (
//             <article
//               id="promedios-preview"
//               className="promedios-hoja promedios-documento mx-auto shadow-sm"
//             >
//               {/* Encabezado del documento */}
//               <header className="promedios-header">
//                 <h1 className="promedios-header-title">
//                   PROMEDIOS DE LA LICENCIATURA EN{" "}
//                   {(grupo?.carrera || "").toUpperCase()}
//                 </h1>
//                 <p className="promedios-header-sub">{grupo?.periodo}</p>
//               </header>

//               {/* Meta */}
//               <div className="promedios-meta">
//                 {[
//                   ["Cuatrimestre", grupo?.cuatrimestre],
//                   ["Grupo", grupo?.nombre],
//                   ["Turno", grupo?.turno],
//                   ["Total alumnos", lista.length],
//                 ].map(([label, value]) => (
//                   <div key={label} className="promedios-meta-field">
//                     <span className="promedios-meta-label">{label}</span>
//                     <span className="promedios-meta-value">{value}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* Fecha */}
//               <div className="promedios-fecha">{fechaStr}</div>

//               {/* Tabla */}
//               <table className="promedios-table">
//                 <colgroup>
//                   <col style={{ width: "5%" }} />
//                   <col style={{ width: "35%" }} />
//                   <col style={{ width: "15%" }} />
//                   <col style={{ width: "25%" }} />
//                   <col style={{ width: "20%" }} />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th>No.</th>
//                     <th style={{ textAlign: "left" }}>Nombre de alumno</th>
//                     <th>Promedio general</th>
//                     <th>Modalidad de titulación</th>
//                     <th style={{ textAlign: "left" }}>Observaciones</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {lista.map((a) => (
//                     <tr key={a.no}>
//                       <td className="promedios-td-no">{a.no}</td>
//                       <td className="promedios-td-nombre">{a.nombre}</td>
//                       <td className="promedios-td-promedio">
//                         {a.promedio.toFixed(2)}
//                       </td>
//                       <td className="promedios-td-modalidad">
//                         <span
//                           className={
//                             a.modalidad === "POR PROMEDIO"
//                               ? "badge-promedio"
//                               : "badge-tesis"
//                           }
//                         >
//                           {a.modalidad}
//                         </span>
//                       </td>
//                       <td className="promedios-td-obs">{a.obs}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               <footer className="promedios-footer-line">
//                 BOULEVARD BERNARDO O' HIGGINS #6050 3RA. ETAPA ZONA
//                 RIO&nbsp;&nbsp; TEL. + 52 (664) 660.1989
//               </footer>
//             </article>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }
