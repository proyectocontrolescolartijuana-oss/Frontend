import api from "./api";

export const obtenerPeriodos = async () => {
  const response = await api.get("/periodos");

  return response.data;
};

export const crearPeriodo = async (data) => {
  const response = await api.post("/periodos", data);

  return response.data;
};

export const actualizarPeriodo = async (id, data) => {
  const response = await api.patch(`/periodos/${id}`, data);

  return response.data;
};

export const eliminarPeriodo = async (id) => {
  const response = await api.delete(`/periodos/${id}`);

  return response.data;
};
