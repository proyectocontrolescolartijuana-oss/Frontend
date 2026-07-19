export const initialConcentradoForm = {
  carreraId: "",
  grupoId: "",
  periodoId: "",
};

export const obtenerMensajeErrorConcentrado = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;

  return "No se pudo generar el concentrado de calificaciones.";
};

export const formatValue = (value) => {
  if (value === null || value === undefined) return "";

  const number = Number(value);

  if (Number.isNaN(number)) return "";

  return Number.isInteger(number) ? String(number) : number.toFixed(1);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || value === "") return "0%";

  const number = Number(value);

  if (Number.isNaN(number)) return "0%";

  return Number.isInteger(number) ? `${number}%` : `${number.toFixed(2)}%`;
};

export const formatStudentNameLastNamesFirst = (alumno) => {
  const partes = [
    alumno?.apellido_paterno,
    alumno?.apellido_materno,
    alumno?.nombre_alumno,
  ].filter(Boolean);

  return partes.length ? partes.join(" ") : alumno?.nombre || "";
};

export const parcialLabel = (parcial, index) => {
  const nombre = parcial?.nombre || "";

  if (nombre.trim()) return nombre.toUpperCase();

  return `${index + 1} PARCIAL`;
};

export const getDefaultPeriodoId = (periodos) => {
  const activo = periodos.find((periodo) => periodo.estado === "ACTIVO");

  return activo?.id_periodo || periodos[0]?.id_periodo || "";
};

export const parcialColorClass = (index) => {
  if (index === 0) return "concentrado-blue";
  if (index === 1) return "concentrado-gray";
  if (index === 2) return "concentrado-orange";

  return "concentrado-blue";
};
