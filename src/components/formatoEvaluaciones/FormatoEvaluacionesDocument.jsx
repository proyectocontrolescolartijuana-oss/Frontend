import { promedio } from "./formatoEvaluacionesUtils";

export default function FormatoEvaluacionesDocument({ data, logoUrl }) {
  return (
    <article
      id="evaluaciones-preview"
      className="evaluaciones-hoja evaluaciones-documento mx-auto shadow-sm"
    >
      <header className="evaluaciones-header">
        <div className="evaluaciones-logo">
          <img src={logoUrl} alt="Sello Unifront" />
        </div>

        <div className="evaluaciones-title">
          <p className="nombre">{data.escuela.nombre}</p>
          <p>
            Escuela Particular Incorporada a la Secretaría de Educación y
            Bienestar Social,
          </p>
          <p>
            según Oficial de estudios {data.escuela.oficio}, con Clave:{" "}
            {data.escuela.clave}
          </p>
          <p className="depto">DEPARTAMENTO DE CONTROL ESCOLAR</p>
          <p className="formato">FORMATO DE EVALUACIONES</p>
        </div>
      </header>

      <div className="evaluaciones-badge">{data.periodo.cuatrimestre}</div>

      <table className="evaluaciones-meta-table">
        <tbody>
          <tr>
            <td className="label">Escuela:</td>
            <td>{data.escuela.nombre}</td>
            <td className="label">Grupo:</td>
            <td className="center">{data.periodo.grupo}</td>
          </tr>
          <tr>
            <td className="label">Clave:</td>
            <td>{data.escuela.clave}</td>
            <td className="label">Ciclo:</td>
            <td className="center">{data.periodo.ciclo}</td>
          </tr>
          <tr>
            <td className="label">Ubicación:</td>
            <td>{data.escuela.ubicacion}</td>
            <td className="label">Periodo:</td>
            <td className="center">{data.periodo.periodo}</td>
          </tr>
          <tr>
            <td className="label">Ciudad:</td>
            <td>{data.escuela.ciudad}</td>
            <td className="label">Turno:</td>
            <td className="center">{data.periodo.turno}</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td className="label">Carrera:</td>
            <td className="center">{data.periodo.carrera}</td>
          </tr>
        </tbody>
      </table>

      <table className="evaluaciones-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>No. de control</th>
            <th colSpan={3}>Nombre</th>
            {data.materias.map((materia) => (
              <th key={materia}>{materia}</th>
            ))}
            <th>Prom.</th>
          </tr>
        </thead>
        <tbody>
          {data.alumnos.map((alumno) => (
            <tr key={alumno.control || alumno.no}>
              <td className="center">{alumno.no}</td>
              <td className="center">{alumno.control}</td>
              <td>{alumno.apP}</td>
              <td>{alumno.apM}</td>
              <td>{alumno.nombre}</td>
              {alumno.calif.map((calificacion, index) => (
                <td key={index} className="center">
                  {calificacion}
                </td>
              ))}
              <td className="center prom">{promedio(alumno.calif)}</td>
            </tr>
          ))}
          <tr>
            <td className="nota" colSpan={5 + data.materias.length}>
              EQ: Equivalencia RV: Revalidación PC: Materia pendiente por cursar
              NP: No presentó S: Sí N: No
            </td>
          </tr>
        </tbody>
      </table>

      <p className="evaluaciones-escala">
        La escala de calificaciones es del 60 al 100 y la calificación mínima
        aprobatoria es 70
      </p>
      <p className="evaluaciones-fecha">{data.fecha}</p>

      <table className="evaluaciones-claves">
        <thead>
          <tr>
            <th>Clave</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {data.descripciones.map((descripcion) => (
            <tr key={descripcion.clave}>
              <td className="center clave">{descripcion.clave}</td>
              <td>{descripcion.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="evaluaciones-signatures">
        <div>
          <p className="titulo">DIRECTORA ACADÉMICA</p>
          <p className="nombre-firma">{data.firmas.directora}</p>
        </div>
        <div>
          <p className="titulo">DEPARTAMENTO DE CONTROL ESCOLAR</p>
          <p className="nombre-firma">{data.firmas.controlEscolar}</p>
        </div>
      </section>

      <section className="evaluaciones-coordinadora">
        <p className="titulo">
          COORDINADORA DEL DEPARTAMENTO DE CONTROL ESCOLAR
          <br />
          DE EDUCACIÓN MEDIA SUPERIOR Y SUPERIOR
        </p>
        <p className="nombre-firma">{data.firmas.coordinadora}</p>
      </section>
    </article>
  );
}
