import api from "./api";
import { normalizarLogos } from "./urlUtils";

export const obtenerKardexPorMatricula = async (matricula) => {
  const response = await api.get("/kardex", {
    params: { matricula },
  });

  return normalizarLogos(response.data);
};

export const obtenerKardexPorBusqueda = async (q) => {
  const response = await api.get("/kardex", {
    params: { q },
  });

  return normalizarLogos(response.data);
};

export const buscarAlumnosKardex = async (q) => {
  const response = await api.get("/kardex/buscar", {
    params: { q },
  });

  return normalizarLogos(response.data);
};

export const obtenerMiKardex = async () => {
  const response = await api.get("/kardex/me");

  return normalizarLogos(response.data);
};
