import { useEffect, useState } from "react";
import { BookOpen, Download } from "lucide-react";
import {
  buscarAlumnosKardex,
  obtenerMiKardex,
  obtenerKardexPorBusqueda,
  obtenerKardexPorMatricula,
} from "../services/kardexService";
import unifrontLogoColor from "../assets/UnifrontLogoAzul.png";
import logoCriminologia from "../assets/logo_criminologia.png";
import logoGastronomia from "../assets/logo_gastronomia.png";
import logoNutricion from "../assets/logo_nutricion.png";


const obtenerLogoCarrera = (carrera, logoBackend) => {
  const nombre = String(carrera || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (nombre.includes("crimin")) return logoCriminologia;
  if (nombre.includes("gastro")) return logoGastronomia;
  if (nombre.includes("nutri")) return logoNutricion;

  return logoBackend || unifrontLogoColor;
};

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

  // Solo presentación: totales para el pie del kardex.
  const materiasKardex = (kardex?.historial || []).flatMap((c) => c.materias || []);
  const totalAsignaturas = materiasKardex.length;
  const totalCreditos = materiasKardex.reduce((s, m) => s + (Number(m.creditos) || 0), 0);
  const totalCreditosTexto = String(Number(totalCreditos.toFixed(3)));
  const calificaciones = materiasKardex
    .map((m) => Number(m.calificacion_final))
    .filter((n) => Number.isFinite(n) && n > 0);
  const promedioGeneral = calificaciones.length
    ? calificaciones.reduce((s, n) => s + n, 0) / calificaciones.length
    : 0;

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
          padding: 10mm;
          box-sizing: border-box;
          font-family: "Times New Roman", Times, serif;
          color: #000;
          box-shadow: 0 0 10px rgba(0,0,0,.15);
        }

        /* Cabecera institucional formal dinámicamente alineada */
        .kd-hdr {
          display: grid;
          grid-template-columns: 140px 1fr 110px;
          align-items: center;
          margin-bottom: 6px;
        }
        .kd-logo-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .kd-logo-img-left {
          width: 80px;
          height: auto;
          object-fit: contain;
          display: block;
          margin: 0 0 4px;
        }
        .kd-logo-text {
          font-size: 7pt;
          font-weight: bold;
          text-transform: uppercase;
          line-height: 1.1;
          display: block;
          max-width: 130px;
          word-break: break-word;
        }
        .kd-hdr-c { text-align: center; padding: 0 4px; }
        .kd-inst {
          font-size: 11.5pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: 0.2px;
          line-height: 1.15;
          white-space: nowrap;
        }
        .kd-doctitle {
          font-size: 9pt;
          font-weight: bold;
          text-align: center;
          margin: 3px 0 2px;
          line-height: 1.1;
        }
        .kd-doccode {
          font-size: 8pt;
          text-align: center;
          margin: 0;
        }
        .kd-logo-r {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .kd-logo-img-right {
          width: 100px;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .kd-rule { border: none; border-top: 1.5px solid #000; margin: 6px 0 8px; }

        /* Estilos generales de Celdas y Etiquetas con respiro institucional */
        .kd-lbl {
          font-size: 7pt;
          color: #222;
          display: block;
          margin-top: 3px;
          line-height: 1.1;
        }
        .kd-val {
          display: block;
          font-size: 10pt;
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          line-height: 1.2;
        }

        /* Escuela | Clave */
        .kd-school {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 5px 0;
          border-bottom: 1px solid #000;
        }
        .kd-school-name {
          font-size: 9pt;
          font-weight: bold;
          text-transform: uppercase;
          display: block;
        }
        .kd-clave-val {
          font-size: 9pt;
          font-weight: bold;
          border: 1px solid #000;
          padding: 2px 8px;
          display: inline-block;
        }

        /* Municipio | Entidad | CURP */
        .kd-loc {
          display: grid;
          grid-template-columns: 1.5in 1.5in 1fr;
          border-bottom: 1px solid #000;
        }
        .kd-cell {
          padding: 5px 6px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 38px;
          box-sizing: border-box;
        }
        .kd-cell + .kd-cell {
          border-left: 1px solid #000;
        }

        /* Apellidos | Nombre */
        .kd-names {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid #000;
        }

        /* Carrera | Matrícula */
        .kd-carrera {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1.5px solid #000;
          padding: 6px 0;
          margin-bottom: 12px;
        }
        .kd-carrera-title {
          font-size: 9.5pt;
          font-weight: bold;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .kd-carrera-sub {
          font-size: 7pt;
          color: #222;
          display: block;
          margin-top: 2px;
        }
        .kd-mat-val {
          font-size: 10pt;
          font-weight: bold;
          display: block;
          text-align: right;
        }
        .kd-mat-lbl {
          font-size: 7pt;
          color: #222;
          display: block;
          text-align: right;
          margin-top: 2px;
        }

        /* Bloque cuatrimestre */
        .kd-block {
          margin-bottom: 16px;
          break-inside: avoid;
        }

        /* Título Cuatrimestre */
        .kd-cuatrimestre-row {
          width: 80px;
          text-align: center;
          margin-bottom: 3px;
        }
        .kd-cuatri-num {
          display: block;
          font-size: 11.5pt;
          line-height: 1;
          font-weight: bold;
        }
        .kd-cuatri-label {
          display: block;
          font-size: 7pt;
          line-height: 1;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Cabecera del bloque escolar unificada y cerrada */
        .kd-cuatri-hdr {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          border: 1px solid #000;
          border-bottom: none;
          padding: 5px 8px;
          background: #fff;
          box-sizing: border-box;
        }
        .kd-pe {
          font-size: 7.5pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .kd-pe-val {
          font-size: 8pt;
          font-weight: normal;
        }
        .kd-grupo-box {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
        }
        .kd-fechabaja {
          display: flex;
          gap: 0;
          justify-content: flex-end;
        }
        .kd-fb-cell {
          text-align: center;
          min-width: 75px;
          border-left: 1px solid #000;
          padding: 3px 4px;
          font-size: 7pt;
          font-weight: bold;
          line-height: 1.1;
        }

        /* Tabla de Materias (Completamente cerrada, bordes unificados) */
        .kd-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 8pt;
        }
        .kd-table th,
        .kd-table td {
          border: 1px solid #000;
          padding: 5px 4px;
          vertical-align: middle;
          height: 22px;
          box-sizing: border-box;
        }
        .kd-table th {
          font-size: 7.5pt;
          font-weight: bold;
          text-align: center;
          background: #fff;
          line-height: 1.2;
        }
        .kd-tc {
          text-align: center;
          font-size: 8pt;
        }
        .kd-tr {
          text-align: center;
          font-size: 8pt;
        }
        .kd-ta {
          text-transform: uppercase;
          font-size: 8pt;
          font-weight: normal;
          line-height: 1.2;
          white-space: normal;
          word-break: break-word;
          padding-left: 6px !important;
        }
        .kd-tq {
          text-align: center;
          font-size: 8.5pt;
          font-weight: bold;
        }
        .kd-prom td {
          font-size: 8pt;
          font-weight: bold;
          text-align: right;
          padding-right: 8px;
          height: 22px;
        }
        .kd-prom-val {
          font-size: 9pt;
          font-weight: bold;
          text-align: center !important;
        }

        /* Pie: escala, director, sello y promedio general */
        .kd-foot {
          margin-top: 6px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .kd-foot-note {
          font-size: 8pt;
          line-height: 1.5;
          text-transform: uppercase;
          margin: 0 0 34px;
        }
        .kd-foot-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          column-gap: 16px;
        }
        .kd-firma {
          display: flex;
          flex-direction: column;
          max-width: 62mm;
        }
        .kd-firma-nombre {
          text-align: center;
          font-size: 9pt;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
        }
        .kd-firma-cargo {
          text-align: center;
          font-size: 9pt;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .kd-sello {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .kd-sello-corner {
          display: block;
          width: 14px;
          height: 30px;
          border-bottom: 1.5px solid #000;
        }
        .kd-sello-corner-l { border-left: 1.5px solid #000; }
        .kd-sello-corner-r { border-right: 1.5px solid #000; }
        .kd-sello-text {
          font-size: 7pt;
          font-weight: bold;
          text-align: center;
          line-height: 1.2;
          text-transform: uppercase;
        }
        .kd-prom-gral {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        .kd-prom-gral-lbl {
          font-size: 8.5pt;
          font-weight: bold;
          text-align: center;
          line-height: 1.2;
        }
        .kd-prom-gral-box {
          min-width: 26mm;
          border: 1.5px solid #000;
          padding: 10px 8px;
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
        }

        /* Print Override */
        @page {
          size: A4 portrait;
          margin: 5mm;
        }
        @media print {
          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: auto;
          }
          body * { visibility: hidden !important; }
          .kx-page-header, .kx-search, .kx-error, .h-px { display: none !important; }
          .kd, .kd * { visibility: visible !important; }
          .kd {
            width: 100%;
            min-height: auto;
            margin: 0;
            padding: 5mm;
            box-shadow: none;
            position: absolute;
            left: 0;
            top: 0;
          }
          body *:not(.kd):not(.kd *):not(:has(.kd)) { display: none !important; }
          *:has(.kd) {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .kd-block { page-break-inside: avoid; }
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

        {/* Cabecera institucional con logo dinámico por carrera */}
        <div className="kd-hdr">
          <div className="kd-logo-left">
            <img
              className="kd-logo-img-left"
              src={obtenerLogoCarrera(kardex?.carrera, kardex?.logo)}
              alt="Logo de la carrera"
            />
            <span className="kd-logo-text">{kardex?.carrera || ""}</span>
          </div>

          <div className="kd-hdr-c">
            <p className="kd-inst">CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA, A.C.</p>
            <p className="kd-doctitle">Kardex del Alumno<br />Modalidad Escolarizada</p>
            <p className="kd-doccode">RVOE-BC-053-M2/14</p>
          </div>

          <div className="kd-logo-r">
            <img className="kd-logo-img-right" src={unifrontLogoColor} alt="Logo UNIFRONT" />
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

                    <div className="kd-grupo-box">
                      <span className="kd-pe">GRUPO</span>
                      <span className="kd-pe-val">{cuatri.grupo}</span>
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

                  {/* Tabla con bordes unificados y cerrados */}
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
                          <td className="kd-tr">{m.tipo_acreditacion || "OR"}</td>
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

            {/* Pie del documento: escala, director, sello y promedio general */}
            <div className="kd-foot">
              <p className="kd-foot-note">
                ESCALA DE CALIFICACIONES ES DE 60 AL 100, MÍNIMA APROBATORIA 70.
                <br />
                EL KARDEX AMPARA {totalAsignaturas} ASIGNATURAS, {totalCreditosTexto} CRÉDITOS.
              </p>

              <div className="kd-foot-row">
                <div className="kd-firma">
                  <span className="kd-firma-nombre">Javier Virgen Alcaraz</span>
                  <span className="kd-firma-cargo">Director (a) de la escuela</span>
                </div>

                <div className="kd-sello">
                  <span className="kd-sello-corner kd-sello-corner-l" />
                  <span className="kd-sello-text">
                    SELLO<br />DE LA<br />ESCUELA
                  </span>
                  <span className="kd-sello-corner kd-sello-corner-r" />
                </div>

                <div className="kd-prom-gral">
                  <span className="kd-prom-gral-lbl">
                    PROMEDIO GENERAL<br />DE APROVECHAMIENTO
                  </span>
                  <span className="kd-prom-gral-box">{promedioGeneral.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Kardex;