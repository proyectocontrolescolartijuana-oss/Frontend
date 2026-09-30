import api from "./api";

export const obtenerAlumnos = async () => {
  const response = await api.get("/alumnos");

  return response.data;
};

export const obtenerTiposDocumento = async () => {
  const response = await api.get("/tipos-documento");

  return response.data;
};

export const obtenerDocumentosAlumno = async (params = {}) => {
  const response = await api.get("/documentos-alumno", { params });

  return response.data;
};

export const subirDocumentoAlumno = async ({
  idAlumno,
  idTipoDocumento,
  archivo,
  validado = true,
  observaciones = "",
}) => {
  const formData = new FormData();

  formData.append("id_alumno", idAlumno);
  formData.append("id_tipo_documento", idTipoDocumento);
  formData.append("validado", String(validado));
  formData.append("observaciones", observaciones);
  formData.append("archivo", archivo);

  const response = await api.post("/documentos-alumno/upload", formData);

  return response.data;
};

export const eliminarDocumentoAlumno = async (idDocumento) => {
  const response = await api.delete(`/documentos-alumno/${idDocumento}`);

  return response.data;
};

export const obtenerRecepcionesDocumento = async (params = {}) => {
  const response = await api.get("/recepciones-documento", { params });

  return response.data;
};

export const crearRecepcionDocumento = async (data) => {
  const response = await api.post("/recepciones-documento", data);

  return response.data;
};

export const actualizarRecepcionDocumento = async (idRecepcion, data) => {
  const response = await api.patch(`/recepciones-documento/${idRecepcion}`, data);

  return response.data;
};
