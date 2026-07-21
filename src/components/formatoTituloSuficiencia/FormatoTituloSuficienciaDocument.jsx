import { promedio } from "./formatoTituloSuficienciaUtils";

export default function FormatoTituloSuficienciaDocument({ data, logoUrl }) {
  const { escuela, periodo, materias, descripciones, alumno, firmas, fecha } =
    data;

  return (
    <article
      id="suficiencia-preview"
      className="suficiencia-hoja suficiencia-documento mx-auto shadow-sm"
    >
      <header className="suficiencia-header">
        <div className="suficiencia-logo">
          <img src={logoUrl} alt="Sello Unifront" />
        </div>
        <div className="suficiencia-title">
          <p className="nombre">{escuela.nombre}</p>
          <p>
            Escuela Particular Incorporada a la Secretaria de Educacion y
            Bienestar Social,
          </p>
          <p>segun Oficial de estudios {escuela.oficio},</p>
          <p className="depto">DEPARTAMENTO DE CONTROL ESCOLAR</p>
          <p className="formato">
            FORMATO DE EVALUACIONES TITULO DE SUFICIENCIA
          </p>
        </div>
      </header>

      <div className="suficiencia-badge">{periodo.cuatrimestre}</div>

      <table className="suficiencia-meta-table">
        <tbody>
          <tr>
            <td className="label">Escuela:</td>
            <td>{escuela.nombre}</td>
            <td className="label">Grupo:</td>
            <td className="center">{periodo.grupo}</td>
          </tr>
          <tr>
            <td className="label">Clave:</td>
            <td>{escuela.clave}</td>
            <td className="label">Ciclo:</td>
            <td className="center">{periodo.ciclo}</td>
          </tr>
          <tr>
            <td className="label">Ubicacion:</td>
            <td>{escuela.ubicacion}</td>
            <td className="label">Periodo:</td>
            <td className="center">{periodo.periodo}</td>
          </tr>
          <tr>
            <td className="label">Ciudad:</td>
            <td>{escuela.ciudad}</td>
            <td className="label">Turno:</td>
            <td className="center">{periodo.turno}</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td className="label">Carrera:</td>
            <td className="center">{periodo.carrera}</td>
          </tr>
        </tbody>
      </table>

      <table className="suficiencia-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>No. de control</th>
            <th colSpan={3}>Nombre</th>
            {materias.map((materia) => (
              <th key={materia}>{materia}</th>
            ))}
            <th>Prom.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="center">{alumno.no}</td>
            <td className="center">{alumno.control}</td>
            <td>{alumno.apP}</td>
            <td>{alumno.apM}</td>
            <td>{alumno.nombre}</td>
            {alumno.calif.map((calificacion, index) => (
              <td key={index} className="center">
                {calificacion ?? ""}
              </td>
            ))}
            <td className="center prom">{promedio(alumno.calif)}</td>
          </tr>
          <tr>
            <td className="nota" colSpan={6 + materias.length}>
              EQ: Equivalencia RV: Revalidacion PC: Materia pendiente por cursar
              NP: No presento S: Si N: No
            </td>
          </tr>
        </tbody>
      </table>

      <p className="suficiencia-escala">
        La escala de calificaciones es del 60 al 100 y la calificacion minima
        aprobatoria es 70
      </p>
      <p className="suficiencia-fecha">{fecha}</p>

      <table className="suficiencia-claves">
        <thead>
          <tr>
            <th>Clave</th>
            <th>Descripcion</th>
          </tr>
        </thead>
        <tbody>
          {descripciones.map((descripcion) => (
            <tr key={descripcion.clave}>
              <td className="center clave">{descripcion.clave}</td>
              <td>{descripcion.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="suficiencia-signatures">
        <div>
          <p className="titulo">DIRECTORA ACADEMICA</p>
          <p className="nombre-firma">{firmas.directora}</p>
        </div>
        <div>
          <p className="titulo">DEPARTAMENTO DE CONTROL ESCOLAR</p>
          <p className="nombre-firma">{firmas.controlEscolar}</p>
        </div>
      </section>

      <section className="suficiencia-coordinadora">
        <p className="titulo">
          COORDINADOR DEL DEPARTAMENTO DE CONTROL ESCOLAR
          <br />
          DE EDUCACION MEDIA SUPERIOR Y SUPERIOR
        </p>
        <p className="nombre-firma">{firmas.coordinadora}</p>
      </section>
    </article>
  );
}
