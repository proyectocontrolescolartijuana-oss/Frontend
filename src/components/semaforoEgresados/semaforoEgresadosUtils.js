export const COLUMNAS = [
  { key: "promedio_general", label: "PROMEDIO", tipo: "promedio" },
  { key: "servicio_social_liberado", label: "SERVICIO SOCIAL", tipo: "bool" },
  {
    key: "practicas_liberadas",
    label: "PRACTICAS PROFESIONALES",
    tipo: "bool",
  },
  { key: "certificado_emitido", label: "CERTIFICADO", tipo: "bool" },
  {
    key: "pagos_titulacion_completos",
    label: "PAGOS DE TITULACION",
    tipo: "bool",
  },
  {
    key: "numero_autorizacion",
    label: "NUMERO DE AUTORIZACION",
    tipo: "texto",
  },
  { key: "acta_examen", label: "ACTA DE EXAMEN", tipo: "texto" },
  { key: "titulo_emitido", label: "TITULO", tipo: "bool" },
];

export const COLOR_ESTATUS = {
  SI: { bg: "#4f7942", color: "#ffffff" },
  NO: { bg: "#d94f4f", color: "#ffffff" },
  TRAMITE: { bg: "#f0e4d7", color: "#5a4a3a" },
};

export const valorCelda = (raw, tipo) => {
  if (tipo === "vacio") return "";
  if (tipo === "promedio") {
    const value = Number(raw);

    return Number.isFinite(value) ? value.toFixed(2) : "";
  }
  if (tipo === "bool") return raw ? "SI" : "NO";
  if (!raw) return "NO";

  const value = String(raw).trim().toUpperCase();

  if (COLOR_ESTATUS[value]) return value;

  return String(raw);
};

export const colorCelda = (raw, tipo) => {
  if (tipo === "vacio") return { bg: "#ffffff", color: "#111" };
  if (tipo === "promedio") return { bg: "#ffffff", color: "#111" };
  if (tipo === "bool") return raw ? COLOR_ESTATUS.SI : COLOR_ESTATUS.NO;
  if (!raw) return COLOR_ESTATUS.NO;

  const value = String(raw).trim().toUpperCase();

  return COLOR_ESTATUS[value] || COLOR_ESTATUS.SI;
};

export const formatearFechaConsulta = (date = new Date()) =>
  date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const getGrupoCarreraId = (grupo) =>
  grupo?.id_carrera || grupo?.carrera?.id_carrera || "";

export const getCarreraNombre = (carrera) => carrera?.nombre || "";

export const getGrupoNombre = (grupo) => grupo?.nombre || "";

export const combinarTitulacionesAlumnos = ({
  alumnosDetalle,
  carreraId,
  grupoId,
  titulaciones,
}) => {
  const infoPorAlumno = new Map(
    (alumnosDetalle || []).map((alumno) => [alumno.id_alumno, alumno]),
  );

  return (titulaciones || [])
    .map((titulacion) => {
      const info = infoPorAlumno.get(titulacion.id_alumno) || {};
      const nombreOrdenado = [
        info.apellido_paterno,
        info.apellido_materno,
        info.nombres,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...titulacion,
        nombre: nombreOrdenado || info.nombre || `Alumno ${titulacion.id_alumno}`,
        matricula: info.matricula || "",
        numero_control: info.numero_control || "",
        id_carrera: info.id_carrera || info.carrera?.id_carrera || "",
        carrera: info.carrera?.nombre || "",
        id_grupo: info.grupo?.id_grupo || "",
        grupo: info.grupo?.nombre || "",
      };
    })
    .filter((alumno) => {
      const matchCarrera =
        !carreraId || String(alumno.id_carrera) === String(carreraId);
      const matchGrupo = !grupoId || String(alumno.id_grupo) === String(grupoId);

      return matchCarrera && matchGrupo;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map((alumno, index) => ({ ...alumno, no: index + 1 }));
};

export const filtrarPorBusqueda = (alumnos, busqueda) => {
  const termino = busqueda.trim().toLowerCase();

  if (!termino) return alumnos;

  return alumnos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(termino) ||
      (alumno.matricula || "").toLowerCase().includes(termino) ||
      (alumno.numero_control || "").toLowerCase().includes(termino),
  );
};

export const calcularPromedioKardex = (kardex) => {
  const materias = (kardex?.historial || []).flatMap(
    (cuatrimestre) => cuatrimestre.materias || [],
  );
  const calificaciones = materias
    .map((materia) => Number(materia.calificacion_final))
    .filter((calificacion) => Number.isFinite(calificacion) && calificacion > 0);

  if (!calificaciones.length) return null;

  return (
    calificaciones.reduce((total, calificacion) => total + calificacion, 0) /
    calificaciones.length
  );
};
