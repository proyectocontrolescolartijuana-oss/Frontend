import api from "./api";

export const obtenerGrupos = async () => {
  const response = await api.get("/grupos");

  return response.data;
};

export const crearGrupo = async (data) => {
  const response = await api.post("/grupos", data);

  return response.data;
};

export const actualizarGrupo = async (id, data) => {
  const response = await api.patch(`/grupos/${id}`, data);

  return response.data;
};

export const eliminarGrupo = async (id) => {
  const response = await api.delete(`/grupos/${id}`);

  return response.data;
};
