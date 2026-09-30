import api from "./api";

export const obtenerPracticasProfesionales = async () => {
  const response = await api.get("/practicas-profesionales/");
  return response.data;
};

export const obtenerServiciosSociales = async () => {
  const response = await api.get("/servicios-sociales/");
  return response.data;
};

export const guardarEstatusPractica = async (alumnoId, datos) => {
  const response = await api.patch(
    `/practicas-profesionales/alumno/${alumnoId}/estatus`,
    datos,
  );
  return response.data;
};

export const guardarEstatusServicioSocial = async (alumnoId, datos) => {
  const response = await api.patch(
    `/servicios-sociales/alumno/${alumnoId}/estatus`,
    datos,
  );
  return response.data;
};

export const obtenerDocumentosEgresado = async () => {
  const response = await api.get("/documentos-egresado/");
  return response.data;
};

export const subirDocumentoEgresado = async ({ alumnoId, tipo, archivo }) => {
  const formData = new FormData();
  formData.append("alumno_id", alumnoId);
  formData.append("tipo", tipo);
  formData.append("archivo", archivo);

  const response = await api.post("/documentos-egresado/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const eliminarDocumentoEgresado = async (documentoId) => {
  await api.delete(`/documentos-egresado/${documentoId}`);
};

export const descargarDocumentoEgresado = async (documento) => {
  const response = await api.get(documento.ruta_archivo, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = documento.nombre_archivo;
  enlace.click();
  URL.revokeObjectURL(url);
};

export const obtenerVistaPreviaDocumentoEgresado = async (documento) => {
  const response = await api.get(documento.ruta_archivo, {
    responseType: "blob",
  });
  return {
    nombre: documento.nombre_archivo,
    tipo: response.data.type,
    url: URL.createObjectURL(response.data),
  };
};
