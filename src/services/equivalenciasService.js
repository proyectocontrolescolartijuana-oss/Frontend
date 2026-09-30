import api from "./api";

export const obtenerHistorialesAcademicos = async (params = {}) => {
  const response = await api.get("/historiales-academicos", {
    params,
  });

  return response.data;
};

export const registrarEquivalenciasAlumno = async (idAlumno, data) => {
  const response = await api.post(
    `/historiales-academicos/alumnos/${idAlumno}/equivalencias`,
    data,
  );

  return response.data;
};
