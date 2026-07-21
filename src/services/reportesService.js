import api from "./api";

const obtenerNombreArchivo = (response, fallback) => {
  const disposition = response.headers["content-disposition"];

  if (!disposition) return fallback;

  const match = disposition.match(/filename="?([^"]+)"?/);

  return match?.[1] || fallback;
};

const descargarBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const obtenerReporteReinscripcionAlumnos = async ({
  grupoId,
  periodoId,
}) => {
  const response = await api.get(
    "/reportes/fundamentales/reinscripcion-alumnos",
    {
      params: {
        grupo_id: grupoId,
        periodo_id: periodoId || undefined,
      },
    },
  );

  return response.data;
};

export const obtenerConcentradoCalificaciones = async ({
  grupoId,
  periodoId,
  carreraId,
}) => {
  const response = await api.get(
    "/reportes/fundamentales/concentrado-calificaciones",
    {
      params: {
        grupo_id: grupoId,
        periodo_id: periodoId || undefined,
        carrera_id: carreraId || undefined,
      },
    },
  );

  return response.data;
};

export const descargarConcentradoCalificacionesExcel = async ({
  grupoId,
  periodoId,
  carreraId,
}) => {
  const response = await api.get(
    "/reportes/fundamentales/concentrado-calificaciones/excel",
    {
      params: {
        grupo_id: grupoId,
        periodo_id: periodoId || undefined,
        carrera_id: carreraId || undefined,
      },
      responseType: "blob",
    },
  );
  const filename = obtenerNombreArchivo(
    response,
    "concentrado_calificaciones.xlsx",
  );

  descargarBlob(response.data, filename);
};

