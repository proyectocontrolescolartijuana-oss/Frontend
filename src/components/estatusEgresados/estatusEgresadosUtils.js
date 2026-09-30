export const COLUMNAS_ESTATUS = [
  { key: "numero", label: "NÚMERO" },
  { key: "numero_control", label: "NO. CONTROL" },
  { key: "nombre", label: "NOMBRE" },
  { key: "grupo", label: "GRUPO" },
  { key: "cuatrimestre", label: "CUATRIMESTRE" },
  { key: "materias_no_acreditadas", label: "MATERIAS NO ACREDITADAS" },
  { key: "oficio_servicio_campo", label: "OFICIO DE SERVICIO DE CAMPO", tipo: "booleanoSiNo" },
  { key: "servicio_campo_horas", label: "HORAS" },
  { key: "servicio_campo_lugar", label: "LUGAR" },
  { key: "servicio_campo_fecha", label: "FECHA", tipo: "fecha" },
  { key: "carta_liberacion_unifront", label: "CARTA DE LIBERACIÓN UNIFRONT", tipo: "booleanoSiNo" },
  { key: "carta_liberacion_procedencia", label: "CARTA DE LIBERACIÓN INSTITUTO DE PROCEDENCIA", tipo: "booleanoSiNo" },
  { key: "liberacion_horas", label: "HORAS" },
  { key: "liberacion_lugar", label: "LUGAR" },
  { key: "liberacion_fecha", label: "FECHA", tipo: "fecha" },
  { key: "promedio_general", label: "PROMEDIO", tipo: "promedio" },
  { key: "certificado_emitido", label: "CERTIFICADO", tipo: "booleano" },
  { key: "numero_autorizacion", label: "NÚM. DE AUTORIZACIÓN", tipo: "estatus" },
  { key: "acta_examen", label: "ACTA DE EXAMEN", tipo: "estatus" },
  { key: "titulo_emitido", label: "TÍTULO", tipo: "booleano" },
];

const colores = {
  SI: { backgroundColor: "#dcefd8", color: "#173b16" },
  LIBERADO: { backgroundColor: "#dcefd8", color: "#173b16" },
  LIBERADA: { backgroundColor: "#dcefd8", color: "#173b16" },
  VALIDADO: { backgroundColor: "#dcefd8", color: "#173b16" },
  TIMBRADO: { backgroundColor: "#dcefd8", color: "#173b16" },
  NO: { backgroundColor: "#f7d3d3", color: "#6b1717" },
  TRAMITE: { backgroundColor: "#fff0a8", color: "#5a4700" },
  "EN PROCESO": { backgroundColor: "#fff0a8", color: "#5a4700" },
};

export const valorEstatus = (valor, tipo) => {
  if (valor == null || valor === "") return "";
  if (tipo === "booleanoSiNo") return valor ? "SI" : "NO";
  if (tipo === "booleano") return valor ? "TIMBRADO" : "";
  if (tipo === "promedio") {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero.toFixed(2) : "";
  }
  if (tipo === "fecha") {
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime())
      ? valor
      : fecha.toLocaleDateString("es-MX");
  }
  return String(valor);
};

export const estiloEstatus = (valor, tipo) => {
  if (valor == null || valor === "") return {};
  if (tipo === "booleanoSiNo") return valor ? colores.SI : colores.NO;
  if (tipo === "booleano") return valor ? colores.TIMBRADO : {};
  if (tipo !== "estatus") return {};
  return colores[String(valor).trim().toUpperCase()] || {};
};

export const formatearFechaConsulta = (fecha = new Date()) =>
  fecha.toLocaleDateString("es-MX");

export const getGrupoCarreraId = (grupo) =>
  grupo?.id_carrera ??
  grupo?.carrera?.id_carrera ??
  grupo?.cuatrimestre?.carrera?.id_carrera ??
  "";

const nombreAlumno = (alumno) =>
  [alumno.apellido_paterno, alumno.apellido_materno, alumno.nombres]
    .filter(Boolean)
    .join(" ") ||
  alumno.nombre ||
  "";

export const combinarEstatusAlumnos = ({
  alumnosDetalle,
  carreraId,
  grupoCatalogo,
  grupoId,
  practicasProfesionales,
  serviciosSociales,
  titulaciones,
}) => {
  const titulacionPorAlumno = new Map(
    (titulaciones || []).map((item) => [String(item.id_alumno), item]),
  );
  const practicaPorAlumno = new Map(
    (practicasProfesionales || []).map((item) => [
      String(item.alumno?.id_alumno ?? item.id_alumno),
      item,
    ]),
  );
  const servicioPorAlumno = new Map(
    (serviciosSociales || []).map((item) => [
      String(item.alumno?.id_alumno ?? item.id_alumno),
      item,
    ]),
  );

  return (alumnosDetalle || [])
    .filter((alumno) => {
      const idCarrera =
        alumno.id_carrera ??
        alumno.carrera?.id_carrera ??
        alumno.grupo?.id_carrera ??
        alumno.grupo?.cuatrimestre?.carrera?.id_carrera;
      const idGrupo = alumno.id_grupo ?? alumno.grupo?.id_grupo;
      return (
        String(idCarrera) === String(carreraId) &&
        String(idGrupo) === String(grupoId)
      );
    })
    .map((alumno) => {
      const titulacion = titulacionPorAlumno.get(String(alumno.id_alumno)) || {};
      const practica = practicaPorAlumno.get(String(alumno.id_alumno)) || {};
      const servicio = servicioPorAlumno.get(String(alumno.id_alumno)) || {};
      return {
        ...titulacion,
        id_alumno: alumno.id_alumno,
        matricula: alumno.matricula || "",
        numero_control: alumno.numero_control || alumno.matricula || "",
        nombre: nombreAlumno(alumno),
        grupo: alumno.grupo?.nombre || "",
        cuatrimestre:
          alumno.grupo?.cuatrimestre?.nombre ||
          alumno.grupo?.id_cuatrimestre ||
          grupoCatalogo?.cuatrimestre?.nombre ||
          grupoCatalogo?.cuatrimestre?.numero ||
          grupoCatalogo?.id_cuatrimestre ||
          "",
        materias_no_acreditadas: "",
        promedio_general: null,
        oficio_servicio_campo: practica.oficio_campo ?? false,
        servicio_campo_horas: practica.horas_campo ?? "",
        servicio_campo_lugar: practica.empresa?.nombre || "",
        servicio_campo_fecha: practica.fecha_fin || "",
        liberacion_horas: servicio.horas_completadas ?? "",
        liberacion_lugar: servicio.empresa?.nombre || "",
        liberacion_fecha: servicio.fecha_fin || "",
        carta_liberacion_unifront: servicio.carta_unifront ?? false,
        carta_liberacion_procedencia: servicio.carta_procedencia ?? false,
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map((alumno, index) => ({ ...alumno, numero: index + 1 }));
};

export const aplicarDatosManuales = (alumnos, valoresPorAlumno) =>
  alumnos.map((alumno) => ({
    ...alumno,
    ...(valoresPorAlumno[String(alumno.id_alumno)] || {}),
  }));

export const completarDatosKardex = (alumno, kardex) => {
  const materias = (kardex?.historial || []).flatMap(
    (cuatrimestre) => cuatrimestre.materias || [],
  );
  const calificaciones = materias
    .map((materia) => Number(materia.calificacion_final))
    .filter((calificacion) => Number.isFinite(calificacion) && calificacion > 0);
  const noAcreditadas = materias.filter((materia) => {
    const calificacion = Number(materia.calificacion_final);
    return Number.isFinite(calificacion) && calificacion > 0 && calificacion < 60;
  }).length;

  return {
    ...alumno,
    materias_no_acreditadas: noAcreditadas,
    promedio_general: calificaciones.length
      ? calificaciones.reduce((total, valor) => total + valor, 0) /
        calificaciones.length
      : null,
  };
};

export const filtrarEgresados = (alumnos, busqueda) => {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return alumnos;
  return alumnos.filter((alumno) =>
    [alumno.nombre, alumno.matricula, alumno.numero_control].some((valor) =>
      String(valor || "").toLowerCase().includes(termino),
    ),
  );
};
