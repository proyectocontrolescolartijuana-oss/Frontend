import { useEffect, useState } from "react";
import { BookOpen, Download } from "lucide-react";
import {
  buscarAlumnosKardex,
  obtenerMiKardex,
  obtenerKardexPorBusqueda,
  obtenerKardexPorMatricula,
} from "../services/kardexService";
import unifrontLogoColor from "../assets/UnifrontLogoColorSinFondo.png";

const Kardex = ({ modoAlumno = false }) => {
  const [matriculaInput, setMatriculaInput] = useState("");
  const [kardex, setKardex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!modoAlumno) {
      return undefined;
    }

    let activo = true;

    const cargarMiKardex = async () => {
      try {
        setLoading(true);
        setError("");
        setMostrarSugerencias(false);

        const data = await obtenerMiKardex();

        if (!activo) return;

        setKardex(data);
        setMatriculaInput(data.matricula || "");
      } catch (err) {
        console.error(err);

        if (activo) {
          setKardex(null);
          setError("No se pudo cargar tu kardex.");
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarMiKardex();

    return () => {
      activo = false;
    };
  }, [modoAlumno]);

  useEffect(() => {
    if (modoAlumno) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return undefined;
    }

    const termino = String(matriculaInput || "").trim();

    if (termino.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoadingSugerencias(true);
        const data = await buscarAlumnosKardex(termino);
        setSugerencias(Array.isArray(data) ? data : []);
        setMostrarSugerencias(true);
      } catch {
        setSugerencias([]);
        setMostrarSugerencias(false);
      } finally {
        setLoadingSugerencias(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [matriculaInput, modoAlumno]);

  const handleBuscar = async (terminoForzado) => {
    if (modoAlumno) return;

    const termino = String(terminoForzado || matriculaInput || "").trim();
    setError("");
    setKardex(null);
    setMostrarSugerencias(false);
    if (!termino) { setError("Ingresa una matrícula o nombre válido."); return; }
    try {
      setLoading(true);
      const data = terminoForzado
        ? await obtenerKardexPorMatricula(termino)
        : await obtenerKardexPorBusqueda(termino);
      setKardex(data);
      setMatriculaInput(data.matricula || termino);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) { setError("No se encontró el alumno con esa matrícula o nombre."); return; }
      setError("Error al cargar el kardex. Verifica tu conexión o intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleBuscar(); };
  const handleSeleccionarSugerencia = (alumno) => {
    setMatriculaInput(alumno.matricula);
    setSugerencias([]);
    setMostrarSugerencias(false);
    handleBuscar(alumno.matricula);
  };
  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 p-6">
      <style>{`
        /* ── Encabezado de página ── */
        .kx-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .kx-page-left { display: flex; align-items: center; gap: 12px; }
        .kx-page-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #e6f4f1;
          color: #1a9e7a;
          flex-shrink: 0;
        }
        .kx-page-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }
        .kx-page-sub {
          font-size: 0.875rem;
          color: #64748b;
          margin: 2px 0 0;
        }
        .kx-btn-pdf {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background: #1a9e7a;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .kx-btn-pdf:hover { background: #158a6a; }
        .kx-btn-pdf:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Barra de búsqueda ── */
        .kx-search {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .kx-search-field {
          position: relative;
          flex: 1;
          min-width: 260px;
        }
        .kx-search input {
          width: 100%;
          min-width: 200px;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          font-family: Arial, Helvetica, sans-serif;
          outline: none;
        }
        .kx-search input:focus { border-color: #1a9e7a; }
        .kx-suggestions {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 20;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
        }
        .kx-suggestion {
          width: 100%;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          background: #fff;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          font-family: Arial, Helvetica, sans-serif;
        }
        .kx-suggestion:last-child { border-bottom: none; }
        .kx-suggestion:hover,
        .kx-suggestion:focus {
          background: #f0fdfa;
          outline: none;
        }
        .kx-suggestion-name {
          display: block;
          color: #0f172a;
          font-size: 14px;
          font-weight: 700;
        }
        .kx-suggestion-meta {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 12px;
        }
        .kx-suggestion-empty {
          padding: 10px 12px;
          color: #64748b;
          font-size: 13px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .kx-btn-buscar {
          padding: 9px 20px;
          border-radius: 10px;
          border: none;
          background: #0f172a;
          color: #fff;
          font-size: 14px;
          font-family: Arial, Helvetica, sans-serif;
          cursor: pointer;
          font-weight: 700;
        }
        .kx-btn-buscar:disabled { opacity: 0.6; cursor: not-allowed; }
        .kx-error {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #fca5a5;
          background: #5e5252;
          color: #b91c1c;
          font-size: 13px;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ══════════════════════════════════════
           DOCUMENTO (hoja imprimible)
        ══════════════════════════════════════ */
        .kd {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #fff;
  padding: 8mm;
  box-sizing: border-box;
  font-family: "Times New Roman", serif;
  font-size: 8px;
  color: #000;
  box-shadow: 0 0 10px rgba(0,0,0,.15);
}

        /* Cabecera institucional */
        .kd-hdr {
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  align-items: center;
  margin-bottom: 8px;
}
       .kd-logo {
  width: 90px;
  height: auto;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
        .kd-logo-r { margin-left: auto; }
        .kd-logo-img {
          width: 90px;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .kd-hdr-c { text-align: center; }
        .kd-inst {
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  margin: 0;
}
        .kd-doctitle {
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  margin: 0;
}
  .kd-doccode {
  font-size: 9px;
  text-align: center;
}
        .kd-rule { border: none; border-top: 1.5px solid #111; margin: 2px 0 0; }

        /* Escuela | Clave */
        .kd-school {
          display: flex; justify-content: space-between; align-items: flex-end;
          padding: 2px 0; border-bottom: 1px solid #111;
        }
        .kd-school-name { font-size: 6.5pt; font-weight: 900; text-transform: uppercase; }
        .kd-lbl { font-size: 5pt; color: #555; display: block; }
        .kd-clave-val { font-size: 7.5pt; font-weight: 900; border: 1px solid #111; padding: 1px 5px; display: inline-block; }

        /* Municipio | Entidad | CURP */
        .kd-loc {
          display: grid; grid-template-columns: 1.4in 1.4in 1fr;
          border-bottom: 1px solid #111; padding: 1px 0;
        }
        .kd-cell { padding-right: 6px; }
        .kd-cell + .kd-cell { border-left: 1px solid #111; padding-left: 4px; }
        .kd-val {
  display: block;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
}
        /* Apellidos | Nombre */
        .kd-names {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid #111; padding: 1px 0;
        }

        /* Carrera | Matrícula */
        .kd-carrera {
          display: flex; justify-content: space-between; align-items: flex-end;
          border-bottom: 1.5px solid #111; padding: 2px 0; margin-bottom: 0.09in;
        }
        .kd-carrera-title { font-size: 8.5pt; font-weight: 900; text-transform: uppercase; }
        .kd-carrera-sub { font-size: 5pt; color: #555; display: block; }
        .kd-mat-val { font-size: 9pt; font-weight: 900; display: block; text-align: right; }
        .kd-mat-lbl { font-size: 5pt; color: #555; display: block; text-align: right; }

        /* Bloque cuatrimestre */
.kd-block{
  margin-bottom:0.1in;
  break-inside:avoid;
}

/* Título Cuatrimestre */
.kd-cuatrimestre-row{
  width:60px;
  text-align:center;
  margin-bottom:2px;
}

.kd-cuatri-num{
  display:block;
  font-size:14px;
  line-height:1;
  font-weight:normal;
}

.kd-cuatri-label{
  display:block;
  font-size:7px;
  line-height:1;
  font-weight:normal;
  text-transform:uppercase;
}

/* Cabecera */
.kd-cuatri-hdr{
  display:grid;
  grid-template-columns:1fr auto auto;
  align-items:end;
  border:1px solid #000;
  border-bottom:none;
  padding:2px 4px;
  background:#fff;
}

.kd-pe{
  font-size:6px;
  font-weight:normal;
  text-transform:uppercase;
}

.kd-pe-val{
  font-size:8px;
  font-weight:normal;
}

.kd-fechabaja{
  display:flex;
  gap:0;
  justify-content:flex-end;
}

.kd-fb-cell{
  text-align:center;
  min-width:70px;
  border-left:1px solid #000;
  padding:2px;
  font-size:6px;
  font-weight:normal;
}

/* Tabla */
.kd-table{
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
  font-size:6px;
}

.kd-table th,
.kd-table td{
  border:1px solid #000;
  padding:1px;
  vertical-align:middle;
  height:18px;
}

.kd-table thead tr{
  background:#fff;
}

.kd-table th{
  font-size:6px;
  font-weight:normal;
  text-align:center;
}

.kd-tc{
  text-align:center;
  font-weight:normal;
}

.kd-tr{
  text-align:center;
  font-weight:normal;
}

.kd-ta{
  text-transform:uppercase;
  font-size:6px;
  font-weight:normal;
  line-height:1.1;
  white-space:normal;
  word-break:break-word;
}

.kd-tq{
  text-align:center;
  font-size:7px;
  font-weight:normal;
}

.kd-prom td{
  font-size:6px;
  font-weight:normal;
  text-align:right;
  padding-right:5px;
}

.kd-prom-val{
  font-size:7px;
  font-weight:normal;
  text-align:center !important;
}
  
        /* Print */
        @page {
  size: A4 portrait;
  margin: 4mm;
}

@media print {

  html,
  body {
    margin: 0;
    padding: 0;
    width: 210mm;
    height: 297mm;
  }

  body * {
    visibility: hidden !important;
  }

  .kx-page-header,
  .kx-search,
  .kx-error,
  .h-px {
    display: none !important;
  }

  .kd,
  .kd * {
    visibility: visible !important;
  }

  .kd {
    width: 100%;
    margin: 0;
    padding: 4mm;
    box-shadow: none;
    zoom: 0.90;
    position: absolute;
    left: 0;
    top: 0;
  }

  .kd-block {
    page-break-inside: avoid;
  }
}
      `}</style>

      {/* ── Encabezado de página ── */}
      <div className="kx-page-header">
        <div className="kx-page-left">
          <div className="kx-page-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="kx-page-title">
              {modoAlumno ? "Mi kardex" : "Kardex del alumno"}
            </h1>
            <p className="kx-page-sub">
              {modoAlumno
                ? "Consulta tu historial academico."
                : "Ingresa una matricula o nombre para consultar el kardex academico."}
            </p>
          </div>
        </div>
        {!modoAlumno && (
          <button className="kx-btn-pdf" onClick={handlePrint} disabled={!kardex}>
            <Download size={16} />
            Descargar PDF
          </button>
        )}
      </div>

      <div className="h-px w-full bg-slate-200" />

      {/* ── Barra de búsqueda ── */}
      {!modoAlumno && (
        <div className="kx-search">
        <div className="kx-search-field">
          <input
            type="text"
            placeholder="Busca por matricula o nombre"
            value={matriculaInput}
            onChange={(e) => setMatriculaInput(e.target.value)}
            onFocus={() => {
              if (sugerencias.length > 0 || loadingSugerencias) {
                setMostrarSugerencias(true);
              }
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {mostrarSugerencias && (
            <div className="kx-suggestions">
              {loadingSugerencias && (
                <div className="kx-suggestion-empty">Buscando coincidencias...</div>
              )}
              {!loadingSugerencias && sugerencias.length === 0 && (
                <div className="kx-suggestion-empty">Sin coincidencias</div>
              )}
              {!loadingSugerencias && sugerencias.map((alumno) => (
                <button
                  key={alumno.id_alumno}
                  type="button"
                  className="kx-suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSeleccionarSugerencia(alumno)}
                >
                  <span className="kx-suggestion-name">{alumno.nombre}</span>
                  <span className="kx-suggestion-meta">
                    {alumno.matricula} - {alumno.carrera}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="kx-btn-buscar" onClick={() => handleBuscar()} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
        </div>
      )}

      {error && <div className="kx-error">{error}</div>}

      {/* ── Documento ── */}
      <div className="kd">

        {/* Cabecera institucional */}
        <div className="kd-hdr">
          <div className="kd-logo">
            <img
              className="kd-logo-img"
              src={kardex?.logo || unifrontLogoColor}
              alt={kardex?.carrera || "Logo de la carrera"}
            />
          </div>

          <div className="kd-hdr-c">
            <p className="kd-inst">Centro de Estudios Superiores de la Frontera, A.C.</p>
            <p className="kd-doctitle">Kardex del Alumno<br />Modalidad Escolarizada</p>
            <p className="kd-doccode">RVOE-BC-053-M2/14</p>
          </div>

          <div className="kd-logo kd-logo-r">
            <img className="kd-logo-img" src={unifrontLogoColor} alt="Logo UNIFRONT" />
          </div>
        </div>

        <hr className="kd-rule" />

        {!kardex && !loading && (
          <div className="kd-empty">
            {modoAlumno ? (
              "No hay kardex disponible para tu perfil."
            ) : (
              <>
                Ingresa una matricula o nombre y presiona <b>Buscar</b> para ver el kardex.
              </>
            )}
          </div>
        )}
        {loading && (
          <div className="kd-empty">
            {modoAlumno ? "Cargando tu kardex..." : "Cargando..."}
          </div>
        )}

        {kardex && (
          <>
            {/* Escuela | Clave */}
            <div className="kd-school">
              <div>
                <span className="kd-school-name">Centro de Estudios Superiores de la Frontera, UNIFRONT</span>
                <span className="kd-lbl">Nombre de la escuela</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span className="kd-clave-val">02PSU0015M</span>
                <span className="kd-lbl">Clave de la escuela</span>
              </div>
            </div>

            {/* Municipio | Entidad | CURP */}
            <div className="kd-loc">
              <div className="kd-cell">
                <span className="kd-val">{kardex.municipio || "Tijuana"}</span>
                <span className="kd-lbl">Municipio o delegación política</span>
              </div>
              <div className="kd-cell">
                <span className="kd-val">{kardex.entidad || "Baja California"}</span>
                <span className="kd-lbl">Entidad federativa</span>
              </div>
              <div className="kd-cell">
                <span className="kd-val">{kardex.curp || ""}</span>
                <span className="kd-lbl">Clave única de registro de población (CURP)</span>
              </div>
            </div>

            {/* Apellidos | Nombre */}
            <div className="kd-names">
              <div className="kd-cell">
                <span className="kd-val">{kardex.primer_apellido}</span>
                <span className="kd-lbl">Primer Apellido</span>
              </div>
              <div className="kd-cell">
                <span className="kd-val">{kardex.segundo_apellido}</span>
                <span className="kd-lbl">Segundo Apellido</span>
              </div>
              <div className="kd-cell">
                <span className="kd-val">{kardex.nombre}</span>
                <span className="kd-lbl">Nombre(s)</span>
              </div>
            </div>

            {/* Carrera | Matrícula */}
            <div className="kd-carrera">
              <div>
                <span className="kd-carrera-title">{kardex.carrera}</span>
                <span className="kd-carrera-sub">Licenciatura y plan de estudios</span>
              </div>
              <div>
                <span className="kd-mat-val">{kardex.matricula}</span>
                <span className="kd-mat-lbl">Matrícula</span>
              </div>
            </div>

            {/* Bloques por cuatrimestre */}
            {kardex.historial.map((cuatri) => {
              const promedio = cuatri.materias.length
                ? cuatri.materias.reduce((s, m) => s + m.calificacion_final, 0) /
                  cuatri.materias.length
                : 0;

              return (
                <div key={cuatri.cuatrimestre} className="kd-block">

                  {/* Título del cuatrimestre */}
<div className="kd-cuatrimestre-row">
  <span className="kd-cuatri-num">
    {cuatri.cuatrimestre}
  </span>
  <span className="kd-cuatri-label">
    CUATRIMESTRE
  </span>
</div>

{/* Cabecera */}
<div className="kd-cuatri-hdr">

  <div>
    <span className="kd-pe">
      PERIODO ESCOLAR&nbsp;
      <span className="kd-pe-val">
        {cuatri.periodo_escolar}
      </span>
    </span>
  </div>

  <div>
    <span className="kd-pe">
      GRUPO&nbsp;
      <span className="kd-pe-val">
        {cuatri.grupo}
      </span>
    </span>
  </div>

  <div className="kd-fechabaja">
    <div className="kd-fb-cell">
      FECHA DE BAJA
      <br />
      TEMPORAL
    </div>

    <div className="kd-fb-cell">
      DEFINITIVA
    </div>
  </div>

</div>

                  {/* Tabla */}
                  <table className="kd-table">
                    <colgroup>
  <col style={{ width: "8%" }} />
  <col style={{ width: "5%" }} />
  <col style={{ width: "36%" }} />
  <col style={{ width: "6%" }} />
  <col style={{ width: "9%" }} />
  <col style={{ width: "5%" }} />
  <col style={{ width: "9%" }} />
  <col style={{ width: "5%" }} />
  <col style={{ width: "9%" }} />
  <col style={{ width: "5%" }} />
  <col style={{ width: "13%" }} />
</colgroup>
                    <thead>
                      <tr>
                        <th rowSpan={2}>Clave</th>
                        <th rowSpan={2}>Créd.</th>
                        <th rowSpan={2}>Asignatura</th>
                        <th rowSpan={2}>Calif.<br />Final</th>
                        <th colSpan={3}>Temporal</th>
                        <th colSpan={3}>Definitiva</th>
                        <th rowSpan={2}>Revisado</th>
                      </tr>
                      <tr>
                        <th>Fecha</th><th>Cal.</th><th>Fecha</th>
                        <th>Fecha</th><th>Cal.</th><th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuatri.materias.map((m, i) => (
                        <tr key={i}>
                          <td className="kd-tc">{m.clave}</td>
                          <td className="kd-tr">{m.creditos}</td>
                          <td className="kd-ta">{m.asignatura}</td>
                          <td className="kd-tq">{m.calificacion_final}</td>
                          <td className="kd-tr"></td>
                          <td className="kd-tr"></td>
                          <td className="kd-tr"></td>
                          <td className="kd-tr"></td>
                          <td className="kd-tr"></td>
                          <td className="kd-tr"></td>
                          <td className="kd-tr"></td>
                        </tr>
                      ))}
                      <tr className="kd-prom">
                        <td colSpan={10} style={{ textAlign: "right", fontWeight: 700 }}>
                          Promedio del cuatrimestre:
                        </td>
                        <td className="kd-prom-val">{promedio.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Kardex;
