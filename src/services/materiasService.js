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
