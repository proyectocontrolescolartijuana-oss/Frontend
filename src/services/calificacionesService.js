import api from "./api";

export const obtenerGruposCaptura = async () => {
  const response = await api.get("/calificaciones/captura/grupos");

  return response.data;
};

export const obtenerCapturaGrupo = async (grupoMateriaId) => {
  const response = await api.get(
    `/calificaciones/captura/grupos/${grupoMateriaId}`,
  );

  return response.data;
};

export const guardarCapturaCalificaciones = async (
  grupoMateriaId,
  calificaciones,
) => {
  const response = await api.post("/calificaciones/captura", {
    grupo_materia_id: grupoMateriaId,
    calificaciones,
  });

  return response.data;
};

export const obtenerBoletaFinal = async ({ alumnoId, periodoId }) => {
  const response = await api.get("/calificaciones/boleta-final", {
    params: {
      alumno_id: alumnoId,
      periodo_id: periodoId,
    },
  });

  return response.data;
};

export const obtenerMiBoletaFinal = async ({ periodoId }) => {
  const response = await api.get("/calificaciones/boleta-final/me", {
    params: {
      periodo_id: periodoId,
    },
  });

  return response.data;
};

export const obtenerCuadroHonor = async ({ cuatrimestre, egresados }) => {
  const response = await api.get("/calificaciones/cuadro-honor", {
    params: egresados
      ? { egresados: true }
      : { cuatrimestre, egresados: false },
  });

  return response.data;
};

export const obtenerCalificacionesAlumno = async (alumnoId) => {
  const response = await api.get("/calificaciones/", {
    params: {
      alumno_id: alumnoId,
    },
  });

  return response.data;
};

export const obtenerCalificacionesGrupo = async (grupoId) => {
  const response = await api.get("/calificaciones/", {
    params: { grupo_id: grupoId },
  });

  return response.data;
};
