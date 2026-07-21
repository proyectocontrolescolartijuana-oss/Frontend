import api from "./api";
 
// GET /titulaciones/  → arreglo completo de registros de titulación
export async function obtenerTitulaciones() {
  const { data } = await api.get("/titulaciones/");
  return data;
}
 
// GET /titulaciones/?alumno_id=X → registro(s) de titulación de un alumno
// (útil si más adelante quieres filtrar desde el backend en vez de en el cliente)
export async function obtenerTitulacionPorAlumno(idAlumno) {
  const { data } = await api.get("/titulaciones/", {
    params: { alumno_id: idAlumno },
  });
  return data;
}