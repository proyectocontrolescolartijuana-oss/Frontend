import { formatStudentNameLastNamesFirst } from "./concentradoCalificacionesUtils";

// Formato del concentrado para modalidades con una sola evaluacion (sabatina).
// Reproduce el formato impreso de la escuela: calificaciones y asistencias van
// lado a lado, y la calificacion final se repite como "Promedio".
// Tamanos de letra y filas alineados con ConcentradoCalificacionesStyles.

const formatCalificacion = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);

  if (Number.isNaN(numero)) return String(valor);

  // 90 -> "90.0"; 92.5 -> "92.5"; 92.25 -> "92.25"
  return Number.isInteger(numero) ? numero.toFixed(1) : String(numero);
};

const formatPorcentaje = (valor) =>
  valor === null || valor === undefined || valor === ""
    ? ""
    : `${Math.round(Number(valor))}%`;

const estilos = `
  .sab-hoja { font-family: Arial, Helvetica, sans-serif; color: #000; }
  .sab-hoja, .sab-hoja * {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .sab-titulos {
    text-align: center;
    font-weight: 900;
    font-size: 7.2pt;
    line-height: 1.3;
    text-transform: uppercase;
  }
  .sab-tabla {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 6.6pt;
    margin-top: 0.08in;
  }
  .sab-tabla td, .sab-tabla th {
    border: 1.2px solid #222;
    padding: 0.035in 0.04in;
    height: 0.18in;
    text-align: center;
    font-weight: 700;
    overflow: hidden;
  }
  .sab-tabla th { font-size: 5.7pt; font-weight: 900; }
  .sab-tabla .sab-sin-borde { border: none; background: transparent; }
  .sab-tabla .sab-izquierda { text-align: left; }
  .sab-tabla .sab-espacio td { border: none; height: 0.1in; padding: 0; }
  .sab-slate { background: #d5dce4; }
  .sab-verde { background: #b7e1cd; }
  .sab-amarillo { background: #ffff66; }
  .sab-cyan { background: #33ccff; }
  .sab-lavanda { background: #ccccff; }
  .sab-rojo { background: #ff9999; }
  .sab-promedio { font-size: 8pt; }
  .sab-firmas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.28in;
    margin: 0.36in 1.8in 0;
    font-size: 5.7pt;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
  }
  .sab-firmas div { border-top: 1.4px solid #222; padding-top: 0.04in; }
`;

export default function ConcentradoSabatinoPage({
  carrera,
  cuatrimestre,
  logoUnifront,
  materiaReporte,
}) {
  const docente = (materiaReporte.docente || "").toUpperCase();
  const asignatura = (materiaReporte.materia?.nombre || "").toUpperCase();

  return (
    <article className="concentrado-hoja concentrado-documento concentrado-page sab-hoja mx-auto shadow-sm">
      <style>{estilos}</style>

      <header className="concentrado-header">
        <img className="concentrado-logo-left" src={logoUnifront} alt="UNIFRONT" />
        <div className="sab-titulos">
          <div>Centro de Estudios Superiores de la Frontera, UNIFRONT</div>
          <div>Concentrado de calificaciones</div>
          <div>Departamento de control escolar</div>
        </div>
        <img
          className="concentrado-logo-right"
          src={carrera?.logo || logoUnifront}
          alt={carrera?.nombre || "UNIFRONT"}
        />
      </header>

      <table className="sab-tabla">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "29%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={5} className="sab-slate sab-izquierda">
              NOMBRE DEL DOCENTE: {docente}
            </td>
            <td colSpan={4} className="sab-sin-borde">
              {cuatrimestre?.nombre || ""}
            </td>
          </tr>
          <tr className="sab-espacio">
            <td colSpan={9} />
          </tr>
          <tr>
            <td colSpan={4} className="sab-verde sab-izquierda">
              ASIGNATURA: {asignatura}
            </td>
            <td>CLASES DADAS</td>
            <td colSpan={2} className="sab-amarillo">
              {materiaReporte.total_clases}
            </td>
            <td colSpan={2} className="sab-cyan">
              {materiaReporte.total_clases}
            </td>
          </tr>
          <tr className="sab-espacio">
            <td colSpan={9} />
          </tr>
          <tr>
            <th>No.</th>
            <th>NOMBRE DEL ALUMNO</th>
            <th className="sab-lavanda">CALIFICACIÓN FINAL</th>
            <th className="sab-rojo">PROMEDIO</th>
            <th className="sab-sin-borde" />
            <th className="sab-amarillo">ASISTENCIAS</th>
            <th className="sab-amarillo">%</th>
            <th className="sab-cyan">TOTAL DE ASISTENCIAS</th>
            <th className="sab-cyan">%</th>
          </tr>
          {materiaReporte.alumnos.map((alumno) => {
            const { asistencias, porcentaje } = alumno.asistencia_final;

            return (
              <tr key={alumno.id_alumno ?? alumno.no}>
                <td>{alumno.no}</td>
                <td className="sab-izquierda">
                  {formatStudentNameLastNamesFirst(alumno).toUpperCase()}
                </td>
                <td className="sab-lavanda">
                  {formatCalificacion(alumno.promedio_final)}
                </td>
                <td className="sab-rojo sab-promedio">
                  {formatCalificacion(alumno.promedio_final)}
                </td>
                <td className="sab-sin-borde" />
                <td className="sab-amarillo">{asistencias}</td>
                <td className="sab-amarillo">{formatPorcentaje(porcentaje)}</td>
                <td className="sab-cyan">{asistencias}</td>
                <td className="sab-cyan">{formatPorcentaje(porcentaje)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <footer className="sab-firmas">
        <div>Director (a) de la licenciatura</div>
        <div>Control escolar</div>
      </footer>
    </article>
  );
}