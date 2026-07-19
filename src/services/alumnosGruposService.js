import api from "./api";

export const obtenerAlumnosDetalle = async () => {
  const response = await api.get("/alumnos/detalle");

  return response.data;
};

export const obtenerGruposMaterias = async () => {
  const response = await api.get("/grupos-materias");

  return response.data;
};

export const obtenerGrupos = async () => {
  const response = await api.get("/grupos");

  return response.data;
};

export const obtenerPeriodos = async () => {
  const response = await api.get("/periodos");

  return response.data;
};

export const obtenerCatalogosCargaAcademica = async () => {
  const [grupos, materias, docentes, periodos, planes] = await Promise.all([
    api.get("/grupos"),
    api.get("/materias"),
    api.get("/docentes"),
    api.get("/periodos"),
    api.get("/planes-estudio"),
  ]);

  return {
    grupos: grupos.data,
    materias: materias.data,
    docentes: docentes.data,
    periodos: periodos.data,
    planes: planes.data,
  };
};

export const obtenerCargasAcademicas = async (params = {}) => {
  const response = await api.get("/cargas-academicas", {
    params,
  });

  return response.data;
};

export const crearCargaAcademica = async (data) => {
  const response = await api.post("/cargas-academicas", data);

  return response.data;
};

export const crearGrupoMateria = async (data) => {
  const response = await api.post("/grupos-materias", data);

  return response.data;
};

export const eliminarCargaAcademica = async (idCarga) => {
  const response = await api.delete(`/cargas-academicas/${idCarga}`);

  return response.data;
};
