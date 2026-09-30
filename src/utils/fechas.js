export const formatDateDDMMYYYY = (value, fallback = "") => {
  if (!value) return fallback;

  const [datePart] = String(value).split("T");
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};
