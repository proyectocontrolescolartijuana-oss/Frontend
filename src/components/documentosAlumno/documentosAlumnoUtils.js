import api from "../../services/api";

export const RECEPCION_CAMPOS = [
  "ficha_inscripcion",
  "acta_original",
  "acta_copias",
  "certificado_original",
  "constancia_terminacion",
  "curp_documento",
];

const RECEPCION_REGLAS = [
  { campo: "curp_documento", coincide: (texto) => texto.includes("curp") },
  {
    campo: "certificado_original",
    coincide: (texto) => texto.includes("certificado"),
  },
  {
    campo: "constancia_terminacion",
    coincide: (texto) => texto.includes("constancia"),
  },
  { campo: "ficha_inscripcion", coincide: (texto) => texto.includes("ficha") },
  {
    campo: "acta_copias",
    coincide: (texto) => texto.includes("acta") && texto.includes("copia"),
  },
  { campo: "acta_original", coincide: (texto) => texto.includes("acta") },
];

export const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const fechaLocal = () => {
  const fecha = new Date();
  const month = `${fecha.getMonth() + 1}`.padStart(2, "0");
  const day = `${fecha.getDate()}`.padStart(2, "0");

  return `${fecha.getFullYear()}-${month}-${day}`;
};

export const nombreCompleto = (usuario) =>
  [usuario?.nombre, usuario?.apellido_paterno, usuario?.apellido_materno]
    .filter(Boolean)
    .join(" ");

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

export const obtenerIdTipoDocumento = (documento) =>
  documento?.tipo_documento?.id_tipo_documento;

export const obtenerDocumentoPorTipo = (documentos, idTipoDocumento) => {
  return documentos
    .filter(
      (documento) =>
        Number(obtenerIdTipoDocumento(documento)) === Number(idTipoDocumento),
    )
    .sort((a, b) => Number(b.id_documento) - Number(a.id_documento))[0];
};

export const obtenerCampoRecepcion = (tipoDocumento) => {
  const texto = normalizar(tipoDocumento?.nombre);
  const regla = RECEPCION_REGLAS.find((item) => item.coincide(texto));

  return regla?.campo;
};

export const obtenerDocumentoProtegido = async (rutaArchivo) => {
  if (!rutaArchivo) {
    return "";
  }

  try {
    const response = await api.get(rutaArchivo, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error al obtener documento protegido:", error);
    return "";
  }
};

export const esImagen = (documento) => {
  const nombre = normalizar(
    documento?.nombre_archivo || documento?.ruta_archivo,
  );

  return /\.(png|jpg|jpeg|webp)$/i.test(nombre);
};

export const esPdf = (documento) => {
  const nombre = normalizar(
    documento?.nombre_archivo || documento?.ruta_archivo,
  );

  return /\.pdf$/i.test(nombre);
};
