import { GraduationCap, IdCard, ShieldCheck } from "lucide-react";

export const DEFAULT_USER_PASSWORD = "Unifront2026";

export const usuarioInicial = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  correo: "",
  telefono: "",
  password: DEFAULT_USER_PASSWORD,
};

export const alumnoInicial = {
  matricula: "",
  numero_control: "",
  id_carrera: "",
  id_plan: "",
  id_grupo: "",
  id_periodo: "",
  fecha_nacimiento: "",
  ciudad_nacimiento: "",
  municipio_nacimiento: "",
  nacionalidad: "Mexicana",
  sexo: "",
  curp: "",
  direccion: "",
  ciudad: "Tijuana",
  estado: "Baja California",
  correo_contacto: "",
  fecha_ingreso: "",
};

export const docenteInicial = {
  numero_empleado: "",
  especialidad: "",
  grado_academico: "",
  fecha_ingreso: "",
};

export const tutorInicial = {
  nombre: "",
  parentesco: "",
  telefono: "",
  correo: "",
  ocupacion: "",
};

export const contactoEmergenciaInicial = {
  nombre: "",
  parentesco: "",
  telefono: "",
  correo: "",
  direccion: "",
  contacto_principal: true,
};

export const seguroMedicoInicial = {
  tiene_seguro: false,
  institucion: "",
  numero_poliza: "",
};

export const procedenciaAcademicaInicial = {
  escuela_procedencia: "",
  nivel_academico: "",
  estado_procedencia: "",
  promedio_general: "",
  fecha_egreso: "",
};

export const iconosRol = {
  ALUMNO: GraduationCap,
  DOCENTE: IdCard,
  CONTROL_ESCOLAR: ShieldCheck,
};

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
