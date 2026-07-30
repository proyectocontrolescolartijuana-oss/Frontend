import api from "./api";

const construirUrlApi = (ruta) => {
  if (!ruta || !ruta.startsWith("/")) return ruta;

  return new URL(ruta, api.defaults.baseURL).toString();
};

const normalizarCarrera = (carrera) => ({
  ...carrera,
  logo: construirUrlApi(carrera.logo),
});

export const obtenerCarreras = async () => {
  const response = await api.get("/carreras");

  return response.data.map(normalizarCarrera);
};

export const crearCarrera = async (data) => {
  const response = await api.post("/carreras", data);

  return normalizarCarrera(response.data);
};

export const actualizarCarrera = async (id, data) => {
  const response = await api.patch(`/carreras/${id}`, data);

  return normalizarCarrera(response.data);
};

export const eliminarCarrera = async (id) => {
  const response = await api.delete(`/carreras/${id}`);

  return response.data;
};

export const subirLogoCarrera = async (archivo) => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await api.post("/carreras/logos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    ...response.data,
    url: construirUrlApi(response.data.url),
  };
};
