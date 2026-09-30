export const ESCUELA = {
  nombre: "CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA UNIFRONT",
  clave: "02PSU0015M",
  oficio: "BC-053-M2/14, de fecha 07 de julio del 2014",
  ubicacion: "BLVD. BERNARDO O'HIGGINS No. 6050, LOS ALAMOS, C.P 22214.",
  ciudad: "TIJUANA BAJA CALIFORNIA",
};

export const FIRMAS = {
  directora: "NORMA LETICIA AYALA CAMACHO",
  controlEscolar: "VICTOR HUGO BORZANI RODRIGUEZ",
  coordinadora: "GLENDA LAURA ESCANDON SIQUEIROS",
};

export const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

export const formatearFechaHoy = () => {
  const hoy = new Date();

  return `TIJUANA, B. C., A ${hoy.getDate()} DE ${
    MESES[hoy.getMonth()]
  } DEL ${hoy.getFullYear()}`;
};

export const promedio = (calif = []) => {
  const valores = calif.filter((valor) => Number.isFinite(Number(valor)));
  if (!valores.length) return "";

  const valor = valores.reduce((a, b) => a + Number(b), 0) / valores.length;

  return valor.toFixed(2).replace(".", ",");
};

const obtenerIdCarreraGrupo = (grupo) =>
  grupo?.id_carrera ??
  grupo?.carrera?.id_carrera ??
  grupo?.cuatrimestre?.id_carrera ??
  grupo?.cuatrimestre?.carrera?.id_carrera ??
  "";

export const grupoPerteneceACarrera = (grupo, carreraId) => {
  if (!carreraId) return true;

  return String(obtenerIdCarreraGrupo(grupo)) === String(carreraId);
};

export const calcularCalificacionMateria = (registros) => {
  const validos = registros.filter(({ calificacion }) =>
    Number.isFinite(Number(calificacion)),
  );
  if (!validos.length) return "";

  const totalPorcentaje = validos.reduce(
    (total, item) => total + (Number(item.parcial?.porcentaje) || 0),
    0,
  );
  const valor =
    totalPorcentaje > 0
      ? validos.reduce(
          (total, item) =>
            total +
            Number(item.calificacion) * (Number(item.parcial?.porcentaje) || 0),
          0,
        ) / totalPorcentaje
      : validos.reduce((total, item) => total + Number(item.calificacion), 0) /
        validos.length;

  return Number(valor.toFixed(2));
};

export const mapearCalificaciones = (calificaciones) => {
  const primerRegistro = calificaciones[0];
  const materiasPorId = new Map();
  const alumnosPorId = new Map();

  calificaciones.forEach((registro) => {
    const { alumno, materia } = registro;
    if (!alumno || !materia) return;
    materiasPorId.set(materia.id_materia, materia);
    if (!alumnosPorId.has(alumno.id_alumno)) {
      alumnosPorId.set(alumno.id_alumno, { alumno, registros: [] });
    }
    alumnosPorId.get(alumno.id_alumno).registros.push(registro);
  });

  const materiasApi = [...materiasPorId.values()];
  const alumnos = [...alumnosPorId.values()].map(
    ({ alumno, registros }, indice) => {
      const partesNombre = (alumno.nombre || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      return {
        no: indice + 1,
        control: alumno.numero_control || alumno.matricula || "",
        apP: partesNombre.shift() || "",
        apM: partesNombre.shift() || "",
        nombre: partesNombre.join(" "),
        calif: materiasApi.map((materia) =>
          calcularCalificacionMateria(
            registros.filter(
              ({ materia: item }) => item?.id_materia === materia.id_materia,
            ),
          ),
        ),
      };
    },
  );

  const grupo = primerRegistro?.grupo;
  const periodoApi = primerRegistro?.periodo;

  return {
    escuela: ESCUELA,
    periodo: {
      cuatrimestre: grupo?.cuatrimestre?.nombre || "",
      grupo: grupo?.nombre || "",
      ciclo: periodoApi?.nombre || "",
      periodo: periodoApi?.nombre || "",
      turno: grupo?.turno || "",
      carrera:
        grupo?.cuatrimestre?.carrera?.nombre || grupo?.carrera?.nombre || "",
    },
    materias: materiasApi.map(({ clave, nombre }) => clave || nombre),
    descripciones: materiasApi.map(({ clave, nombre }) => ({
      clave: clave || nombre,
      desc: nombre,
    })),
    alumnos,
    firmas: FIRMAS,
    fecha: formatearFechaHoy(),
  };
};
