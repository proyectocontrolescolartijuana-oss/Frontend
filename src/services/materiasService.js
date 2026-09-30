import api from "./api";

export const obtenerMaterias = async () => {
  const response = await api.get("/materias");

  return response.data;
};

export const crearMateria = async (data) => {
  const response = await api.post("/materias", data);

  return response.data;
};

export const actualizarMateria = async (id, data) => {
  const response = await api.patch(`/materias/${id}`, data);

  return response.data;
};

export const eliminarMateria = async (id) => {
  const response = await api.delete(`/materias/${id}`);

  return response.data;
};

export const obtenerPrerrequisitosMateria = async (idMateria) => {
  const response = await api.get(`/materias/${idMateria}/prerrequisitos`);

  return response.data;
};

export const crearPrerrequisitoMateria = async (idMateria, data) => {
  const response = await api.post(
    `/materias/${idMateria}/prerrequisitos`,
    data,
  );

  return response.data;
};

export const actualizarPrerrequisitoMateria = async (
  idMateria,
  idPrerrequisito,
  data,
) => {
  const response = await api.patch(
    `/materias/${idMateria}/prerrequisitos/${idPrerrequisito}`,
    data,
  );

  return response.data;
};

export const eliminarPrerrequisitoMateria = async (
  idMateria,
  idPrerrequisito,
) => {
  const response = await api.delete(
    `/materias/${idMateria}/prerrequisitos/${idPrerrequisito}`,
  );

  return response.data;
};
