import { Fragment } from "react";

import {
  formatStudentNameLastNamesFirst,
  formatPercent,
  formatValue,
  parcialColorClass,
  parcialLabel,
} from "./concentradoCalificacionesUtils";

export default function ConcentradoSubjectPage({
  carrera,
  cuatrimestre,
  logoUnifront,
  materiaReporte,
  parciales,
}) {
  return (
    <article className="concentrado-hoja concentrado-documento concentrado-page mx-auto shadow-sm">
      <header className="concentrado-header">
        <img className="concentrado-logo-left" src={logoUnifront} alt="UNIFRONT" />
        <div>
          <h2 className="concentrado-title">Concentrado de calificaciones</h2>
          <p className="concentrado-subtitle">
            Departamento de control escolar
          </p>
        </div>
        <img
          className="concentrado-logo-right"
          src={carrera?.logo || logoUnifront}
          alt={carrera?.nombre || "UNIFRONT"}
        />
      </header>

      <section className="concentrado-meta">
        <div>
          <div className="concentrado-meta-row">
            <span className="concentrado-meta-label">Nombre del docente:</span>
            <span className="concentrado-meta-value">
              {(materiaReporte.docente || "").toUpperCase()}
            </span>
          </div>
          <div className="concentrado-meta-row">
            <span className="concentrado-meta-label">Asignatura:</span>
            <span className="concentrado-meta-value">
              {(materiaReporte.materia?.nombre || "").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="concentrado-grade">
          <span>Grado:</span>
          <strong>{(cuatrimestre?.nombre || "").toUpperCase()}</strong>
        </div>
      </section>

      <section className="concentrado-body">
        <GradesTable materiaReporte={materiaReporte} parciales={parciales} />
        <AttendanceTables materiaReporte={materiaReporte} parciales={parciales} />
      </section>

      <section className="concentrado-signatures">
        <div className="concentrado-line">Director (a)</div>
        <div className="concentrado-line">Control escolar</div>
      </section>
    </article>
  );
}

function GradesTable({ materiaReporte, parciales }) {
  return (
    <table className="concentrado-table">
      <colgroup>
        <col style={{ width: "6%" }} />
        <col style={{ width: "35%" }} />
        {parciales.map((parcial) => (
          <col key={`cal-${parcial.id_parcial}`} />
        ))}
        <col style={{ width: "13%" }} />
        <col style={{ width: "12%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>No.</th>
          <th>Nombre del alumno</th>
          {parciales.map((parcial, index) => (
            <th
              key={parcial.id_parcial}
              className={parcialColorClass(index)}
            >
              {parcialLabel(parcial, index)}
            </th>
          ))}
          <th className="concentrado-gray">Promedio de 1er y 2do parcial</th>
          <th className="concentrado-yellow">Promedio</th>
        </tr>
      </thead>
      <tbody>
        {materiaReporte.alumnos.map((alumno) => (
          <tr key={`cal-${alumno.id_alumno}`}>
            <td className="concentrado-center">{alumno.no}</td>
            <td className="concentrado-name">
              {formatStudentNameLastNamesFirst(alumno)}
            </td>
            {alumno.calificaciones.map((calificacion, index) => (
              <td
                key={`${alumno.id_alumno}-cal-${index}`}
                className={`concentrado-center ${parcialColorClass(index)}`}
              >
                {formatValue(calificacion)}
              </td>
            ))}
            <td className="concentrado-center concentrado-gray">
              {formatValue(alumno.promedio_primeros_parciales)}
            </td>
            <td className="concentrado-center concentrado-yellow">
              {formatValue(alumno.promedio_final)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AttendanceTables({ materiaReporte, parciales }) {
  return (
    <div>
      <table className="concentrado-table concentrado-classes">
        <colgroup>
          <col style={{ width: "30%" }} />
          {parciales.map((parcial) => (
            <col key={`clase-${parcial.id_parcial}`} />
          ))}
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th>Clases dadas</th>
            {materiaReporte.clases_dadas.map((clases, index) => (
              <td
                key={`clases-${index}`}
                className={`concentrado-center ${parcialColorClass(index)}`}
              >
                {clases}
              </td>
            ))}
            <td className="concentrado-center concentrado-yellow">
              {materiaReporte.total_clases}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="concentrado-table">
        <colgroup>
          {parciales.map((parcial) => (
            <Fragment key={`asistencia-col-${parcial.id_parcial}`}>
              <col />
              <col />
            </Fragment>
          ))}
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            {parciales.map((parcial, index) => (
              <th
                key={`asistencia-head-${parcial.id_parcial}`}
                colSpan="2"
                className={parcialColorClass(index)}
              >
                {parcialLabel(parcial, index)}
              </th>
            ))}
            <th colSpan="2" className="concentrado-yellow">
              Final
            </th>
          </tr>
          <tr>
            {parciales.map((parcial, index) => (
              <Fragment key={`asistencia-sub-${parcial.id_parcial}`}>
                <th className={parcialColorClass(index)}>No.</th>
                <th className={parcialColorClass(index)}>%</th>
              </Fragment>
            ))}
            <th className="concentrado-yellow">No.</th>
            <th className="concentrado-yellow">%</th>
          </tr>
        </thead>
        <tbody>
          {materiaReporte.alumnos.map((alumno) => (
            <tr key={`asis-${alumno.id_alumno}`}>
              {alumno.asistencias.map((asistencia, index) => (
                <Fragment key={`${alumno.id_alumno}-asis-${index}`}>
                  <td className={`concentrado-center ${parcialColorClass(index)}`}>
                    {asistencia.asistencias}
                  </td>
                  <td className={`concentrado-center ${parcialColorClass(index)}`}>
                    {formatPercent(asistencia.porcentaje)}
                  </td>
                </Fragment>
              ))}
              <td className="concentrado-center concentrado-yellow">
                {alumno.asistencia_final.asistencias}
              </td>
              <td className="concentrado-center concentrado-yellow">
                {formatPercent(alumno.asistencia_final.porcentaje)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
