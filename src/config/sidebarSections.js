import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  ClipboardList,
  CalendarCheck,
  Award,
  GraduationCap,
  Library,
  User,
  FileText,
  FileStack,
  FileSpreadsheet,
  KeyRound,
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
    title: "Académico",

    items: [
      {
        icon: GraduationCap,
        label: "Carreras",
        path: "/carreras",
        roles: ["ADMIN"],
      },

      {
        icon: Library,
        label: "Materias",
        path: "/materias",
        roles: ["ADMIN"],
      },

      {
        icon: BookOpen,
        label: "Planes de estudio",
        path: "/planes-estudio",
        roles: ["ADMIN"],
      },
    ],
  },

  {
    title: "Escolar",

    items: [
      {
        icon: Users,
        label: "Grupos",
        path: "/grupos",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },

      {
        icon: Users,
        label: "Cargas academicas",
        path: "/alumnos",
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
        roles: ["ADMIN"],
      },
    ],
  },

  {
    title: "Docentes",

    items: [
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
    title: "Administración",

    items: [
      {
        icon: User,
        label: "Usuarios",
        path: "/usuarios",
        roles: ["ADMIN"],
      },
      {
        icon: FileSpreadsheet,
        label: "Reportes",
        path: "/reportes-fundamentales",
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
        label: "Constancias de terminación",
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
      {
        icon: BookOpen,
        label: "Ficha de inscripción",
        path: "/ficha-inscripcion",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
      {
        icon: FileStack,
        label: "Expediente digital",
        path: "/documentos-alumno",
        roles: ["ADMIN", "CONTROL_ESCOLAR"],
      },
    ],
  },
];
