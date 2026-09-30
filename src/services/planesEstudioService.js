import api from "./api";

export const obtenerPlanesEstudio = async () => {
  const response = await api.get("/planes-estudio");

  return response.data;
};

export const obtenerCuatrimestres = async () => {
  const response = await api.get("/cuatrimestres");

  return response.data;
};

export const crearPlanEstudio = async (data) => {
  const response = await api.post("/planes-estudio", data);

  return response.data;
};

export const actualizarPlanEstudio = async (id, data) => {
  const response = await api.patch(`/planes-estudio/${id}`, data);

  return response.data;
};

export const eliminarPlanEstudio = async (id) => {
  const response = await api.delete(`/planes-estudio/${id}`);

  return response.data;
};

export const agregarMateriaAPlan = async (idPlan, data) => {
  const response = await api.post(`/planes-estudio/${idPlan}/materias`, data);

  return response.data;
};

export const actualizarMateriaDePlan = async (
  idPlan,
  idPlanMateria,
  data,
) => {
  const response = await api.patch(
    `/planes-estudio/${idPlan}/materias/${idPlanMateria}`,
    data,
  );

  return response.data;
};

export const eliminarMateriaDePlan = async (idPlan, idPlanMateria) => {
  const response = await api.delete(
    `/planes-estudio/${idPlan}/materias/${idPlanMateria}`,
  );

  return response.data;
};
