export const DOCUMENTOS_TITULACION = [
  {
    key: "servicio_social_liberado",
    label: "Servicio social",
    descripcion: "Carta o constancia de liberación.",
    tipo: "boolean",
  },
  {
    key: "practicas_liberadas",
    label: "Prácticas profesionales",
    descripcion: "Documento de liberación de prácticas.",
    tipo: "boolean",
  },
  {
    key: "certificado_emitido",
    label: "Certificado",
    descripcion: "Certificado emitido para titulación.",
    tipo: "boolean",
  },
  {
    key: "pagos_titulacion_completos",
    label: "Pagos de titulación",
    descripcion: "Comprobantes de pago completos.",
    tipo: "boolean",
  },
  {
    key: "numero_autorizacion",
    label: "Número de autorización",
    descripcion: "Oficio o referencia de autorización.",
    tipo: "text",
  },
  {
    key: "acta_examen",
    label: "Acta de examen",
    descripcion: "Acta o estatus del examen profesional.",
    tipo: "text",
  },
  {
    key: "titulo_emitido",
    label: "Título",
    descripcion: "Título emitido o evidencia final.",
    tipo: "boolean",
  },
];

export const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const nombreAlumno = (alumno) =>
  [
    alumno?.apellido_paterno,
    alumno?.apellido_materno,
    alumno?.nombres || alumno?.nombre,
  ]
    .filter(Boolean)
    .join(" ") || `Alumno #${alumno?.id_alumno}`;

export const titulacionBase = (idAlumno) => ({
  id_alumno: Number(idAlumno),
  modalidad: "PROMEDIO",
  cumple_promedio: false,
  servicio_social_liberado: false,
  practicas_liberadas: false,
  certificado_emitido: false,
  pagos_titulacion_completos: false,
  numero_autorizacion: "",
  acta_examen: "",
  titulo_emitido: false,
  fecha_titulacion: null,
  observaciones: "",
});

export const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.loc?.join("."))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo completar la operación.";
};

export const archivoAEstatus = (archivo) => {
  if (!archivo) return "";

  return archivo.name || "Documento cargado";
};

export const documentoEntregado = (titulacion, documento) => {
  const value = titulacion?.[documento.key];

  if (documento.tipo === "boolean") return Boolean(value);

  return Boolean(String(value || "").trim());
};
