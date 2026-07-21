export const ORDINALES = [
  "primero",
  "segundo",
  "tercero",
  "cuarto",
  "quinto",
  "sexto",
  "septimo",
  "octavo",
  "noveno",
  "decimo",
  "decimo primero",
  "decimo segundo",
];

export const periodoATexto = (periodo) => {
  const numero = Number(periodo);

  if (Number.isInteger(numero) && numero >= 1 && numero <= ORDINALES.length) {
    return ORDINALES[numero - 1];
  }

  return periodo;
};

export const formatCreditos = (value) => {
  const numero = Number(value);

  if (!Number.isFinite(numero)) return "";

  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 3,
  }).format(numero);
};

export const getRvoeCarrera = (datos) => datos?.rvoe || "";

export const getAlumno = (datos) => {
  if (!datos) return null;

  return {
    curp: datos.curp || "",
    nombre: [datos.primer_apellido, datos.segundo_apellido, datos.nombre]
      .filter(Boolean)
      .join(" "),
    matricula: datos.matricula || "",
    numeroControl: datos.numero_control || "",
  };
};

export const getHistorial = (datos) =>
  Array.isArray(datos?.historial) ? datos.historial : [];

export const getMaterias = (historial) =>
  historial.flatMap((cuatrimestre) => cuatrimestre.materias || []);

export const getCertificado = (datos, historial) => {
  if (!datos) return null;

  const todasMaterias = getMaterias(historial);
  const totalCreditos = todasMaterias.reduce(
    (suma, materia) => suma + (Number(materia.creditos) || 0),
    0,
  );
  const promedio = todasMaterias.length
    ? todasMaterias.reduce(
        (suma, materia) => suma + (Number(materia.calificacion_final) || 0),
        0,
      ) / todasMaterias.length
    : 0;

  return {
    licenciatura: datos.carrera || "",
    claveLicenciatura: getRvoeCarrera(datos),
    asignaturasCursadas: todasMaterias.length,
    totalAsignaturas: todasMaterias.length,
    creditosCursados: formatCreditos(totalCreditos),
    totalCreditos: formatCreditos(totalCreditos),
    promedioGeneral: promedio.toFixed(2),
    folioSep: "-",
    documento: "Certificado Parcial de Estudios",
    tipoPlan: "Cuatrimestral",
    modalidad: "Escolarizada",
    fechaExpedicion: new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};

export const getGruposCuatrimestre = (historial) => {
  const grupos = new Map();

  historial.forEach((cuatrimestre) => {
    const periodoNum = cuatrimestre.cuatrimestre || 0;
    const key = String(periodoNum);

    if (!grupos.has(key)) {
      grupos.set(key, {
        periodoNum,
        periodo: periodoATexto(periodoNum),
        filas: [],
      });
    }

    (cuatrimestre.materias || []).forEach((materia) => {
      grupos.get(key).filas.push({
        periodoNum,
        periodo: periodoATexto(periodoNum),
        ciclo: cuatrimestre.periodo_escolar,
        asignatura: materia.asignatura,
        creditos: materia.creditos,
        calificacion: materia.calificacion_final,
      });
    });
  });

  return [...grupos.values()].sort(
    (a, b) => Number(a.periodoNum) - Number(b.periodoNum),
  );
};

export const getCuatrimestreClassName = (periodoNum) =>
  Number(periodoNum) % 2 === 1
    ? "certificado-cuatrimestre-azul"
    : "certificado-cuatrimestre-blanco";
