import { useEffect, useMemo, useState } from "react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import SemaforoEgresadosHeader from "../components/semaforoEgresados/SemaforoEgresadosHeader";
import SemaforoEgresadosPreview from "../components/semaforoEgresados/SemaforoEgresadosPreview";
import SemaforoEgresadosStyles from "../components/semaforoEgresados/SemaforoEgresadosStyles";
import {
  calcularPromedioKardex,
  formatearFechaConsulta,
} from "../components/semaforoEgresados/semaforoEgresadosUtils";
import { obtenerMiExpediente } from "../services/authService";
import { obtenerMiKardex } from "../services/kardexService";

const nombreAlumno = (usuario, fallback = "") => {
  return [
    usuario?.apellido_paterno,
    usuario?.apellido_materno,
    usuario?.nombre,
  ]
    .filter(Boolean)
    .join(" ") || fallback;
};

const grupoActual = (inscripciones = []) => {
  return [...inscripciones]
    .filter((inscripcion) => inscripcion.grupo)
    .sort((a, b) => {
      const fechaA = a.fecha_inscripcion || "";
      const fechaB = b.fecha_inscripcion || "";

      return fechaB.localeCompare(fechaA);
    })[0]?.grupo;
};

export default function MiSemaforoEgresados() {
  const [alumno, setAlumno] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [titulacion, setTitulacion] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [promedioGeneral, setPromedioGeneral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaConsulta, setFechaConsulta] = useState(formatearFechaConsulta());

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError("");

      try {
        const [expediente, kardex] = await Promise.all([
          obtenerMiExpediente(),
          obtenerMiKardex(),
        ]);

        if (!activo) return;

        const expedienteAlumno = expediente.expediente_alumno || {};

        setAlumno(expediente.alumno);
        setUsuario(expediente.usuario);
        setTitulacion(expedienteAlumno.titulaciones?.[0] || null);
        setGrupo(grupoActual(expedienteAlumno.inscripciones || []));
        setPromedioGeneral(calcularPromedioKardex(kardex));
        setFechaConsulta(formatearFechaConsulta());
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError("No se pudo cargar tu semaforo de egreso.");
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const alumnos = useMemo(() => {
    if (!alumno) return [];

    return [
      {
        ...(titulacion || {}),
        id_alumno: alumno.id_alumno,
        matricula: alumno.matricula || "",
        no: 1,
        nombre: nombreAlumno(usuario, alumno.matricula || "Alumno"),
        numero_control: alumno.numero_control || "",
        promedio_general: promedioGeneral,
      },
    ];
  }, [alumno, promedioGeneral, titulacion, usuario]);

  const handleDownload = () => {
    const previousTitle = document.title;

    document.title = "mi_semaforo_egresado";
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <div className="space-y-6 p-6">
      <SemaforoEgresadosStyles />

      <SemaforoEgresadosHeader
        disabled={loading || alumnos.length === 0}
        hideDownload
        onDownload={handleDownload}
        subtitle="Consulta tu avance personal de requisitos de egreso."
        title="Mi semaforo de egreso"
      />

      <div className="h-px w-full bg-slate-200" />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <SemaforoEgresadosPreview
        alumnos={alumnos}
        busqueda=""
        carreraNombre={alumno?.carrera?.nombre || ""}
        fechaConsulta={fechaConsulta}
        grupoNombre={grupo?.nombre || ""}
        loading={loading}
        logoUrl={logoUnifront}
        reporteGenerado={!loading}
      />
    </div>
  );
}
