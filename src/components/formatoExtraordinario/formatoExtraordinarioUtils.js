export const datosEstaticos = {
  escuela: {
    nombre: "CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA, UNIFRONT",
    clave: "02PSU0015M",
    oficio: "BC-053-M2/14, de fecha 07 de julio del 2014",
    ubicacion: "BLVD. BERNARDO O'HIGGINS No. 6050, LOS ALAMOS, C.P 22214.",
    ciudad: "TIJUANA BAJA CALIFORNIA",
  },
  firmas: {
    directora: "NORMA LETICIA AYALA CAMACHO",
    controlEscolar: "VICTOR HUGO BORZANI RODRIGUEZ",
    coordinadora: "GLENDA LAURA ESCANDON SIQUEIROS",
  },
};

export const CAMPOS_VACIOS = {
  no: 1,
  control: "",
  apP: "",
  apM: "",
  nombre: "",
  carrera: "",
  grupo: "",
  ciclo: "",
  periodo: "",
  turno: "",
  fecha: "",
};

export const CAMPOS_EDITABLES = [
  { key: "apP", label: "Apellido paterno" },
  { key: "apM", label: "Apellido materno" },
  { key: "nombre", label: "Nombre(s)" },
  {
    key: "carrera",
    label: "Carrera",
    placeholder: "Ej. Licenciatura en Criminologia",
  },
  { key: "ciclo", label: "Ciclo", placeholder: "Ej. 2025-2026-1" },
  { key: "no", label: "No. en lista", type: "number" },
  {
    key: "fecha",
    label: "Fecha de consulta",
    placeholder: "TIJUANA, B. C., A 22 DE AGOSTO DEL 2025",
  },
];

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

export const formatearFechaConsulta = (date = new Date()) =>
  `TIJUANA, B. C., A ${date.getDate()} DE ${
    MESES[date.getMonth()]
  } DEL ${date.getFullYear()}`;

export const extraerNombre = (alumno) => {
  if (alumno.apellido_paterno || alumno.apellido_materno || alumno.nombres) {
    return {
      apP: alumno.apellido_paterno || "",
      apM: alumno.apellido_materno || "",
      nombre: alumno.nombres || alumno.nombre || "",
    };
  }

  const partes = (alumno.nombre || alumno.nombre_completo || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!partes.length) return { apP: "", apM: "", nombre: "" };
  if (partes.length <= 3) {
    const [nombre = "", apP = "", apM = ""] = partes;

    return { nombre, apP, apM };
  }

  return {
    nombre: partes.slice(0, -2).join(" "),
    apP: partes[partes.length - 2],
    apM: partes[partes.length - 1],
  };
};

export const textoAlumno = (alumno) =>
  [
    alumno.matricula,
    alumno.numero_control,
    alumno.nombre,
    alumno.nombre_completo,
    alumno.apellido_paterno,
    alumno.apellido_materno,
    alumno.nombres,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const obtenerNombreAlumno = (alumno) =>
  alumno.nombre ||
  alumno.nombre_completo ||
  [alumno.nombres, alumno.apellido_paterno, alumno.apellido_materno]
    .filter(Boolean)
    .join(" ") ||
  alumno.matricula ||
  `Alumno #${alumno.id_alumno}`;

export const obtenerCarreraAlumno = (alumno, carga) =>
  alumno?.carrera?.nombre ||
  alumno?.carrera ||
  alumno?.plan?.carrera?.nombre ||
  carga?.grupo_materia?.grupo?.cuatrimestre?.carrera?.nombre ||
  carga?.grupo_materia?.grupo?.carrera?.nombre ||
  "";

export const obtenerDatosCarga = (carga) => {
  const grupo = carga?.grupo_materia?.grupo;
  const periodo = carga?.grupo_materia?.periodo || carga?.periodo;

  return {
    grupo: grupo?.nombre || "",
    turno: grupo?.turno || "",
    periodo: periodo?.nombre || "",
    ciclo: periodo?.nombre || "",
    carrera:
      grupo?.cuatrimestre?.carrera?.nombre || grupo?.carrera?.nombre || "",
  };
};

export const obtenerCuatrimestres = (cargas) => {
  const mapa = new Map();

  cargas.forEach((carga) => {
    const cuatrimestre = carga.grupo_materia?.grupo?.cuatrimestre;

    if (cuatrimestre) {
      mapa.set(cuatrimestre.id_cuatrimestre, cuatrimestre);
    }
  });

  return [...mapa.values()];
};

export const obtenerMaterias = (cargas) => {
  const claves = [];

  cargas.forEach((carga) => {
    const clave = carga.grupo_materia?.materia?.clave;

    if (clave && !claves.includes(clave)) {
      claves.push(clave);
    }
  });

  return claves;
};

export const obtenerDescripciones = (cargas) => {
  const vistos = new Set();
  const descripciones = [];

  cargas.forEach((carga) => {
    const materia = carga.grupo_materia?.materia;

    if (materia?.clave && !vistos.has(materia.clave)) {
      vistos.add(materia.clave);
      descripciones.push({ clave: materia.clave, desc: materia.nombre || "" });
    }
  });

  return descripciones;
};
