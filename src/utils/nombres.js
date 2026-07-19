export const nombreApellidosPrimero = (persona, fallback = "") => {
  if (!persona) return fallback;

  const partes = [
    persona.apellido_paterno,
    persona.apellido_materno,
    persona.nombre_alumno,
    persona.nombre,
  ].filter(Boolean);

  return partes.length ? partes.join(" ") : fallback;
};

export const nombreAlumnoApellidosPrimero = (
  alumno,
  fallback = "Alumno sin nombre",
) => {
  const persona = alumno?.alumno || alumno?.usuario || alumno;

  return nombreApellidosPrimero(persona, alumno?.nombre || fallback);
};
