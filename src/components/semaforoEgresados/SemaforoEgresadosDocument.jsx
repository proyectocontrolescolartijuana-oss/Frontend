import {
  COLUMNAS,
  colorCelda,
  valorCelda,
} from "./semaforoEgresadosUtils";

export default function SemaforoEgresadosDocument({
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
      id="semaforo-preview"
      className="semaforo-documento semaforo-hoja mx-auto shadow-sm"
    >
      <header className="mb-6 border-b-2 border-blue-900 pb-3">
        <div className="flex items-center justify-between gap-6">
          <img className="semaforo-logo" src={logoUrl} alt="UNIFRONT" />

          <div className="text-right text-sm">
            <div className="font-semibold">
              {carreraNombre || "Carrera sin seleccionar"}
            </div>

            <div>{grupoNombre || "Grupo sin seleccionar"}</div>

            <div className="mt-1">Fecha de consulta: {fechaConsulta}</div>
          </div>
        </div>
      </header>

      {loading && (
        <div className="semaforo-empty">Cargando datos de titulacion...</div>
      )}

      {!loading && !reporteGenerado && (
        <div className="semaforo-empty">
          Selecciona carrera y grupo para consultar el semaforo.
        </div>
      )}

      {!loading && reporteGenerado && alumnos.length === 0 && (
        <div className="semaforo-empty">
          {busqueda
            ? "No se encontraron alumnos con esa busqueda."
            : "No hay registros de titulacion para la carrera y grupo seleccionados."}
        </div>
      )}

      {!loading && alumnos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="semaforo-table">
            <thead>
              <tr>
                <th style={{ width: "3%" }}>No.</th>
                <th style={{ width: "22%" }}>Nombre del Alumno</th>
                {COLUMNAS.map((columna) => (
                  <th key={columna.key}>{columna.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {alumnos.map((alumno, index) => (
                <tr
                  key={alumno.id_titulacion ?? alumno.id_alumno}
                  className={index % 2 === 0 ? "fila-par" : "fila-impar"}
                >
                  <td style={{ textAlign: "center", fontWeight: 600 }}>
                    {alumno.no}
                  </td>

                  <td>{alumno.nombre}</td>

                  {COLUMNAS.map((columna) => {
                    const raw = alumno[columna.key];
                    const estilo = colorCelda(raw, columna.tipo);
                    const texto = valorCelda(raw, columna.tipo);

                    return (
                      <td
                        key={columna.key}
                        style={{
                          backgroundColor: estilo.bg,
                          color: estilo.color,
                          textAlign: "center",
                          fontWeight: 700,
                          letterSpacing: ".3px",
                        }}
                      >
                        {texto}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
