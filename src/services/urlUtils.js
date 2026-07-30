import api from "./api";

export const construirUrlApi = (ruta) => {
  if (!ruta || typeof ruta !== "string" || !ruta.startsWith("/")) {
    return ruta;
  }

  return new URL(ruta, api.defaults.baseURL).toString();
};

export const normalizarLogos = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizarLogos);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      key === "logo" ? construirUrlApi(item) : normalizarLogos(item),
    ]),
  );
};
