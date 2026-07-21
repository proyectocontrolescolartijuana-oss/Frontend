import InfoLine from "./InfoLine";
import {
  formatCreditos,
  getCuatrimestreClassName,
} from "./todasLasMateriasUtils";

export default function TodasLasMateriasDocument({
  alumno,
  certificado,
  datos,
  gruposCuatrimestre,
  loading,
}) {
  return (
    <article
      id="certificado-preview"
      className="certificado-hoja certificado-documento mx-auto shadow-sm"
    >
      <header className="certificado-header">
        <div className="certificado-header-right">
          <div className="certificado-header-title">
            {certificado?.licenciatura || "Certificado Alumno"}
          </div>
          <div className="certificado-header-sub">
            {certificado?.claveLicenciatura || ""}
          </div>
        </div>
      </header>

      {!datos && (
        <div className="certificado-empty">
          {loading ? "Cargando..." : "Busca un alumno para ver el certificado."}
        </div>
      )}

      {datos && (
        <>
          <div className="certificado-info-grid">
            <div className="certificado-info-col">
              <div className="certificado-info-col-title">DATOS DEL ALUMNO</div>
              <InfoLine label="CURP" value={alumno.curp} />
              <InfoLine label="NOMBRE" value={alumno.nombre} />
              <InfoLine label="MATRICULA" value={alumno.matricula} />
              <InfoLine label="NO. CONTROL" value={alumno.numeroControl} />
            </div>

            <div className="certificado-info-col">
              <div className="certificado-info-col-title">
                DATOS DEL CERTIFICADO
              </div>
              <InfoLine
                label="ASIGNATURAS CURSADAS"
                value={certificado.asignaturasCursadas}
              />
              <InfoLine
                label="TOTAL DE ASIGNATURAS"
                value={certificado.totalAsignaturas}
              />
              <InfoLine
                label="CREDITOS CURSADOS"
                value={certificado.creditosCursados}
              />
              <InfoLine
                label="TOTAL DE CREDITOS"
                value={certificado.totalCreditos}
              />
              <InfoLine
                label="PROM. GRAL."
                value={certificado.promedioGeneral}
              />
            </div>

            <div className="certificado-info-col">
              <div className="certificado-info-col-title-hidden">&nbsp;</div>
              <InfoLine label="DOCUMENTO" value={certificado.documento} />
              <InfoLine label="TIPO PLAN" value={certificado.tipoPlan} />
              <InfoLine label="MODALIDAD" value={certificado.modalidad} />
              <InfoLine
                label="FECHA DE EXPEDICION"
                value={certificado.fechaExpedicion}
              />
            </div>
          </div>

          <table className="certificado-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>PERIODO</th>
                <th style={{ width: "16%" }}>CICLO ESCOLAR</th>
                <th style={{ width: "42%", textAlign: "left" }}>ASIGNATURAS</th>
                <th style={{ width: "10%" }}>CREDITOS</th>
                <th style={{ width: "12%" }}>CALIFICACION</th>
                <th style={{ width: "8%" }}>OBSERVACION</th>
              </tr>
            </thead>
            <tbody>
              {gruposCuatrimestre.map((grupo) => {
                const className = getCuatrimestreClassName(grupo.periodoNum);

                return (
                  <GroupRows
                    key={grupo.periodoNum}
                    className={className}
                    grupo={grupo}
                  />
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </article>
  );
}

function GroupRows({ className, grupo }) {
  return (
    <>
      {grupo.filas.map((fila, index) => (
        <tr
          key={`${fila.periodoNum}-${fila.asignatura}-${index}`}
          className={className}
        >
          <td className="center">{fila.periodo}</td>
          <td className="center">{fila.ciclo}</td>
          <td className="left">{fila.asignatura}</td>
          <td className="center">{formatCreditos(fila.creditos)}</td>
          <td className="center">{fila.calificacion}</td>
          <td className="center"></td>
        </tr>
      ))}
    </>
  );
}
