import api from "./api";

export const obtenerGruposAsistencia = async () => {
  const response = await api.get("/asistencias/captura/grupos");

  return response.data;
};

export const obtenerCapturaAsistencia = async (
  grupoMateriaId,
  fecha,
  parcialId,
) => {
  const response = await api.get(
    `/asistencias/captura/grupos/${grupoMateriaId}`,
    {
      params: {
        fecha,
        parcial_id: parcialId || undefined,
      },
    },
  );

  return response.data;
};

export const guardarCapturaAsistencia = async (
  grupoMateriaId,
  parcialId,
  fecha,
  asistencias,
) => {
  const response = await api.post("/asistencias/captura", {
    grupo_materia_id: grupoMateriaId,
    id_parcial: parcialId,
    fecha,
    asistencias,
  });

  return response.data;
};
