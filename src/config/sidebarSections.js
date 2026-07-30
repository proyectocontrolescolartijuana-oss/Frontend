import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  ClipboardList,
  CalendarCheck,
  ClipboardCheck,
  ClipboardX,
  Award,
  GraduationCap,
  Library,
  User,
  UserRound,
  FileText,
  FileStack,
  FileSpreadsheet,
  KeyRound,
  ListChecks,
  TrafficCone,
} from "lucide-react";

export const sidebarSections = [
  {
    title: "General",
    items: [
      {
        icon: LayoutDashboard,
        label: "Panel",
        path: "/dashboard",
        roles: ["ADMIN", "DOCENTE", "CONTROL_ESCOLAR"],
      },
    ],
  },
  {
    title: "Academico",
    items: [
      {
        icon: GraduationCap,
        label: "Carreras",
        path: "/carreras",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Library,
        label: "Materias",
        path: "/materias",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Planes de estudio",
        path: "/planes-estudio",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: CalendarDays,
        label: "Periodos",
        path: "/periodos",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Users,
        label: "Grupos",
        path: "/grupos",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Users,
        label: "Carga académica",
        path: "/alumnos",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
    ],
  },
  {
    title: "Escolar",
    items: [
      {
        icon: Users,
        label: "Promedios",
        path: "/promedios",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Users,
        label: "Rezago",
        path: "/rezago",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Users,
        label: "Kardex",
        path: "/kardex",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Award,
        label: "Cuadro de honor",
        path: "/cuadro-honor",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
    ],
  },
  {
    title: "Docentes",
    items: [
      {
        icon: UserRound,
        label: "Mi perfil",
        path: "/docente/perfil",
        roles: ["DOCENTE"],
      },
      {
        icon: ClipboardList,
        label: "Calificaciones",
        path: "/captura",
        roles: ["DOCENTE"],
      },
      {
        icon: CalendarCheck,
        label: "Asistencia",
        path: "/asistencia",
        roles: ["DOCENTE"],
      },
    ],
  },
  {
    title: "Administracion",
    items: [
      {
        icon: User,
        label: "Usuarios",
        path: "/usuarios",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Ficha de inscripcion",
        path: "/ficha-inscripcion",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: FileStack,
        label: "Expediente digital",
        path: "/documentos-alumno",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Award,
        label: "Titulaciones",
        path: "/titulaciones",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
    ],
  },
  {
    title: "Reportes",
    items: [
      {
        icon: FileSpreadsheet,
        label: "Concentrado calificaciones",
        path: "/concentrado-calificaciones",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: ClipboardCheck,
        label: "Formato de evaluacion",
        path: "/formato-evaluacion",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: ClipboardX,
        label: "Formato de extraordinario",
        path: "/formato-extraordinario",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: Award,
        label: "Formato Titulo de Suficiencia",
        path: "/formato-titulo-sufi",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: ListChecks,
        label: "Listado Materias",
        path: "/listado-materias",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: TrafficCone,
        label: "Semaforo egresados",
        path: "/semaforo-egresados",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
    ],
  },
  {
    title: "Alumno",
    items: [
      {
        icon: KeyRound,
        label: "Mi perfil",
        path: "/alumno/perfil",
        roles: ["ALUMNO"],
      },
      {
        icon: FileText,
        label: "Mis calificaciones",
        path: "/alumno/mis-calificaciones",
        roles: ["ALUMNO"],
      },
      {
        icon: FileText,
        label: "Mi boleta final",
        path: "/alumno/boleta-final",
        roles: ["ALUMNO"],
      },
      {
        icon: BookOpen,
        label: "Mi kardex",
        path: "/alumno/kardex",
        roles: ["ALUMNO"],
      },
    ],
  },
  {
    title: "Documentos",
    items: [
      {
        icon: BookOpen,
        label: "Constancias de estudio",
        path: "/constancia-estudios",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Constancias de terminacion",
        path: "/constancia-terminacion",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Acta de examen extraordinario",
        path: "/acta-examen-extraordinario",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Acta de examen titulo suficiencia",
        path: "/acta-examen-titulo-suficiencia",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Acta de titulacion licenciatura",
        path: "/acta-titulacion-licenciatura",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Recibo documentos originales",
        path: "/recibo-documentos-originales",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Registro reinscripcion",
        path: "/registro-reinscripcion-alumnos",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: BookOpen,
        label: "Boleta final",
        path: "/boleta-final",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
    ],
  },
];
