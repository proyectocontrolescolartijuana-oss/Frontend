import {
  COLUMNAS_ESTATUS,
  estiloEstatus,
  valorEstatus,
} from "./estatusEgresadosUtils";

export default function EstatusEgresadosDocument({
  alumnos,
  busqueda,
  carreraNombre,
  fechaConsulta,
  grupoNombre,
  loading,
  logoUrl,
  reporteGenerado,
}) {
  return (
    <article
      id="estatus-egresados-preview"
      className="estatus-documento estatus-hoja mx-auto shadow-sm"
    >
      <header className="estatus-encabezado">
        <img className="estatus-logo" src={logoUrl} alt="UNIFRONT" />
        <div className="estatus-titulo">
          <h2>ESTATUS TITULADOS Y NO TITULADOS</h2>
          <p>{(carreraNombre || "CARRERA SIN SELECCIONAR").toUpperCase()}</p>
        </div>
        <div className="estatus-meta">
          <strong>{grupoNombre || "Grupo sin seleccionar"}</strong>
          <span>{fechaConsulta}</span>
        </div>
      </header>

      {loading && <div className="estatus-empty">Cargando egresados...</div>}
      {!loading && !reporteGenerado && (
        <div className="estatus-empty">
          Selecciona carrera y grupo para generar el documento.
        </div>
      )}
      {!loading && reporteGenerado && alumnos.length === 0 && (
        <div className="estatus-empty">
          {busqueda
            ? "No se encontraron alumnos con esa búsqueda."
            : "No hay egresados para la carrera y grupo seleccionados."}
        </div>
      )}
      {!loading && alumnos.length > 0 && (
        <table className="estatus-table">
          <thead>
            <tr>
              {COLUMNAS_ESTATUS.map((columna) => (
                <th key={columna.key}>{columna.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno, index) => (
              <tr key={alumno.id_alumno ?? alumno.id_titulacion ?? index}>
                {COLUMNAS_ESTATUS.map((columna) => {
                  const valor = alumno[columna.key];
                  return (
                    <td
                      key={columna.key}
                      className={columna.key === "nombre" ? "estatus-nombre" : ""}
                      style={estiloEstatus(valor, columna.tipo)}
                    >
                      {valorEstatus(valor, columna.tipo)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
