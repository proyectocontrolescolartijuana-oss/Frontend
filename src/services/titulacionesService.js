import api from "./api";

export async function obtenerTitulaciones() {
  const { data } = await api.get("/titulaciones/");
  return data;
}

export async function crearTitulacion(payload) {
  const { data } = await api.post("/titulaciones/", payload);
  return data;
}

export async function actualizarTitulacion(idTitulacion, payload) {
  const { data } = await api.patch(`/titulaciones/${idTitulacion}`, payload);
  return data;
}

export async function obtenerDocumentosTitulacion(params = {}) {
  const { data } = await api.get("/titulaciones/documentos", { params });
  return data;
}

export async function subirDocumentoTitulacion({
  idTitulacion,
  requisito,
  archivo,
  observaciones,
}) {
  const formData = new FormData();

  formData.append("requisito", requisito);
  formData.append("archivo", archivo);

  if (observaciones) {
    formData.append("observaciones", observaciones);
  }

  const { data } = await api.post(
    `/titulaciones/${idTitulacion}/documentos/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

export async function eliminarDocumentoTitulacion(idDocumentoTitulacion) {
  await api.delete(`/titulaciones/documentos/${idDocumentoTitulacion}`);
}
