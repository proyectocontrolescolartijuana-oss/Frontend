import api from "./api";

export const obtenerKardexPorMatricula = async (matricula) => {
  const response = await api.get("/kardex", {
    params: { matricula },
  });

  return response.data;
};

export const obtenerKardexPorBusqueda = async (q) => {
  const response = await api.get("/kardex", {
    params: { q },
  });

  return response.data;
};

export const buscarAlumnosKardex = async (q) => {
  const response = await api.get("/kardex/buscar", {
    params: { q },
  });

  return response.data;
};

export const obtenerMiKardex = async () => {
  const response = await api.get("/kardex/me");

  return response.data;
};
