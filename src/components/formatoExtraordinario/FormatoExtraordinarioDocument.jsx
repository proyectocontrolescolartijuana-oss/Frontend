export default function FormatoExtraordinarioDocument({ data, logoUrl }) {
  const { escuela, periodo, materias, descripciones, alumno, firmas, fecha } =
    data;

  return (
    <article
      id="extraord-preview"
      className="extraord-hoja extraord-documento mx-auto shadow-sm"
    >
      <header className="extraord-header">
        <div className="extraord-logo">
          <img src={logoUrl} alt="Sello Unifront" />
        </div>
        <div className="extraord-title">
          <p className="nombre">{escuela.nombre}</p>
          <p>
            Escuela Particular Incorporada a la Secretaria de Educacion y
            Bienestar Social,
          </p>
          <p>
            segun Oficial de estudios {escuela.oficio}, con Clave:{" "}
            {escuela.clave}
          </p>
          <p className="depto">DEPARTAMENTO DE CONTROL ESCOLAR</p>
          <p className="formato">FORMATO DE EVALUACIONES EXTRAORDINARIAS</p>
        </div>
      </header>

      <div className="extraord-badge">{periodo.cuatrimestre}</div>

      <table className="extraord-meta-table">
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

      <table className="extraord-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>No. de control</th>
            <th colSpan={3}>Nombre</th>
            {materias.map((materia) => (
              <th key={materia}>{materia}</th>
            ))}
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
          </tr>
          <tr>
            <td className="nota" colSpan={5 + materias.length}>
              EQ: Equivalencia RV: Revalidacion PC: Materia pendiente por cursar
              NP: No presento S: Si N: No
            </td>
          </tr>
        </tbody>
      </table>

      <p className="extraord-escala">
        La escala de calificaciones es del 60 al 100 y la calificacion minima
        aprobatoria es 70
      </p>

      <table className="extraord-claves">
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

      <p className="extraord-fecha">{fecha}</p>

      <section className="extraord-signatures">
        <div>
          <p className="titulo">DIRECTORA ACADEMICA</p>
          <p className="nombre-firma">{firmas.directora}</p>
        </div>
        <div>
          <p className="titulo">DEPARTAMENTO DE CONTROL ESCOLAR</p>
          <p className="nombre-firma">{firmas.controlEscolar}</p>
        </div>
      </section>

      <section className="extraord-coordinadora">
        <p className="titulo">
          COORDINADORA DEL DEPARTAMENTO DE CONTROL ESCOLAR
          <br />
          DE EDUCACION MEDIA SUPERIOR Y SUPERIOR
        </p>
        <p className="nombre-firma">{firmas.coordinadora}</p>
      </section>
    </article>
  );
}
