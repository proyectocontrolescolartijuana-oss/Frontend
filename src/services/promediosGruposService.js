import api from "./api";

const MESES = [
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

const getDefaultPeriodoId = (periodos) => {
  // Heurística: si el backend devuelve varios periodos, nos quedamos con el que esté ACTIVO.
  const activo = periodos?.find((p) => p.estado === "ACTIVO");
  return activo?.id_periodo ?? periodos?.[0]?.id_periodo;
};

export const obtenerGrupos = async () => {
  const { data } = await api.get("/grupos");
  return data;
};

export const obtenerPeriodos = async () => {
  const { data } = await api.get("/periodos");
  return data;
};

export const obtenerAlumnosPorGrupo = async ({ grupoId, periodoId }) => {
  // No existe endpoint directo de "promedios por grupo"; usaremos reinscripcion-alumnos
  // (que ya devuelve alumnos de un grupo y su `observaciones`).
  const { data } = await api.get("/reportes/fundamentales/reinscripcion-alumnos", {
    params: {
      grupo_id: grupoId,
      periodo_id: periodoId || undefined,
    },
  });

  // data.alumnos contiene: {no, id_alumno, nombre, observaciones, ...}
  // Para el promedio y modalidad, calcularemos después usando /calificaciones/boleta-final por alumno.
  return data;
};

export const obtenerPromedioAlumnoBoletaFinal = async ({ alumnoId, periodoId }) => {
  const { data } = await api.get("/calificaciones/boleta-final", {
    params: {
      alumno_id: alumnoId,
      periodo_id: periodoId,
    },
  });

  return data;
};

export const prepararPromediosPorGrupo = async ({ grupoId, periodoId }) => {
  const periodos = await obtenerPeriodos();
  const periodoFinalId = periodoId ?? getDefaultPeriodoId(periodos);

  const { alumnos } = await obtenerAlumnosPorGrupo({
    grupoId,
    periodoId: periodoFinalId,
  });

  // Calculamos promedio por alumno con boleta-final.
  // modalidad la inferimos con la nota final: si promedio >= 90 => POR PROMEDIO,
  // de lo contrario => TESIS/TESINA.
  // Este campo describe la modalidad de estudio prevista, no implica que el alumno ya se haya titulado.
  const resultados = [];

  for (const a of alumnos) {
    const boleta = await obtenerPromedioAlumnoBoletaFinal({
      alumnoId: a.id_alumno,
      periodoId: periodoFinalId,
    });

    const promedio = boleta?.promedio_general;

    let modalidad = "TESIS/TESINA";
    if (promedio !== null && promedio !== undefined && promedio >= 90) {
      modalidad = "POR PROMEDIO";
    }

    resultados.push({
      no: a.no,
      id_alumno: a.id_alumno,
      nombre: a.nombre,
      promedio: typeof promedio === "number" ? promedio : 0,
      modalidad,
      obs: a.observaciones || "",
    });
  }

  return {
    periodoId: periodoFinalId,
    alumnosPromedios: resultados,
    meta: {
      fechaStr: `${MESES[new Date().getMonth()]} DE ${new Date().getFullYear()}`,
    },
  };
};

