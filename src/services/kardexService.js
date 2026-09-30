import api from "./api";
import { normalizarLogos } from "./urlUtils";

export const obtenerKardexPorMatricula = async (matricula, options = {}) => {
  const response = await api.get("/kardex", {
    params: { matricula, incluir_plan: options.incluirPlan || undefined },
  });

  return normalizarLogos(response.data);
};

export const obtenerKardexPorBusqueda = async (q, options = {}) => {
  const response = await api.get("/kardex", {
    params: { q, incluir_plan: options.incluirPlan || undefined },
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
