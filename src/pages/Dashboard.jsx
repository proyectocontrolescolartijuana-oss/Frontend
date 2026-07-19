import { useEffect, useMemo, useState } from "react";
import StatsCard from "../components/StatsCard";
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  RefreshCcw,
  Users,
} from "lucide-react";
import { obtenerCarreras } from "../services/carrerasService";
import {
  obtenerCalificacionesAlumno,
  obtenerCuadroHonor,
} from "../services/calificacionesService";
import { obtenerAlumnosDetalle } from "../services/usuariosService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

const CUATRIMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ESTATUS_EGRESADO = new Set(["EGRESADO", "TITULADO"]);

const normalizarEstatus = (estatus = "") => estatus.toString().toUpperCase();

const formatearNumero = (valor, decimales = 2) => {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "-";
  }

  return Number(valor).toFixed(decimales);
};

const porcentaje = (valor, total) => {
  if (!total) return "0%";

  return `${Math.round((valor / total) * 100)}%`;
};

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo cargar la información del panel.";
};

function Dashboard() {
  const [alumnos, setAlumnos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [cuadroHonor, setCuadroHonor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [alumnosResponse, carrerasResponse, calificacionesResponse] =
        await Promise.all([
          obtenerAlumnosDetalle(),
          obtenerCarreras(),
          obtenerCalificacionesAlumno(),
        ]);

      const cuadrosResponse = await Promise.all(
        CUATRIMESTRES.map((cuatrimestre) =>
          obtenerCuadroHonor({ cuatrimestre, egresados: false })
            .then((response) => response.alumnos || [])
            .catch(() => []),
        ),
      );

      setAlumnos(alumnosResponse);
      setCarreras(carrerasResponse);
      setCalificaciones(calificacionesResponse);
      setCuadroHonor(cuadrosResponse.flat());
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
      setAlumnos([]);
      setCarreras([]);
      setCalificaciones([]);
      setCuadroHonor([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setError("");

      try {
        const [alumnosResponse, carrerasResponse, calificacionesResponse] =
          await Promise.all([
            obtenerAlumnosDetalle(),
            obtenerCarreras(),
            obtenerCalificacionesAlumno(),
          ]);

        const cuadrosResponse = await Promise.all(
          CUATRIMESTRES.map((cuatrimestre) =>
            obtenerCuadroHonor({ cuatrimestre, egresados: false })
              .then((response) => response.alumnos || [])
              .catch(() => []),
          ),
        );

        if (!activo) return;

        setAlumnos(alumnosResponse);
        setCarreras(carrerasResponse);
        setCalificaciones(calificacionesResponse);
        setCuadroHonor(cuadrosResponse.flat());
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError(obtenerMensajeError(requestError));
          setAlumnos([]);
          setCarreras([]);
          setCalificaciones([]);
          setCuadroHonor([]);
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const resumen = useMemo(() => {
    const alumnosActivos = alumnos.filter((alumno) => {
      const estatus = normalizarEstatus(alumno.estatus);

      return estatus !== "BAJA" && !ESTATUS_EGRESADO.has(estatus);
    });

    const alumnosEgresados = alumnos.filter((alumno) =>
      ESTATUS_EGRESADO.has(normalizarEstatus(alumno.estatus)),
    );

    const calificacionesNumericas = calificaciones
      .map((calificacion) => Number(calificacion.calificacion))
      .filter((calificacion) => !Number.isNaN(calificacion));

    const promedioGeneral =
      calificacionesNumericas.length > 0
        ? calificacionesNumericas.reduce((total, item) => total + item, 0) /
          calificacionesNumericas.length
        : null;

    const carrerasActivas = carreras.filter(
      (carrera) => carrera.estado !== false,
    );

    return {
      alumnosActivos: alumnosActivos.length,
      alumnosTotales: alumnos.length,
      egresados: alumnosEgresados.length,
      promedioGeneral,
      carrerasActivas: carrerasActivas.length,
      carrerasTotales: carreras.length,
    };
  }, [alumnos, calificaciones, carreras]);

  const alumnosPorCarrera = useMemo(() => {
    const conteos = new Map();

    alumnos.forEach((alumno) => {
      if (normalizarEstatus(alumno.estatus) === "BAJA") return;

      const idCarrera = alumno.carrera?.id_carrera || alumno.id_carrera;
      const nombreCarrera = alumno.carrera?.nombre || "Sin carrera";
      const actual = conteos.get(idCarrera) || {
        id: idCarrera || nombreCarrera,
        nombre: nombreCarrera,
        total: 0,
      };

      conteos.set(idCarrera || nombreCarrera, {
        ...actual,
        total: actual.total + 1,
      });
    });

    return Array.from(conteos.values()).sort((a, b) => b.total - a.total);
  }, [alumnos]);

  const topHonor = useMemo(() => {
    const mejoresPorAlumno = new Map();

    cuadroHonor.forEach((alumno) => {
      const actual = mejoresPorAlumno.get(alumno.id_alumno);

      if (!actual || Number(alumno.promedio) > Number(actual.promedio)) {
        mejoresPorAlumno.set(alumno.id_alumno, alumno);
      }
    });

    return Array.from(mejoresPorAlumno.values())
      .sort((a, b) => Number(b.promedio) - Number(a.promedio))
      .slice(0, 4);
  }, [cuadroHonor]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <main className="flex-1 p-8">
        <div className="mb-10 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-5xl font-display text-[var(--primary)]">
              Panel general
            </h1>

            <p className="mt-2 text-gray-500">
              Resumen institucional calculado con registros actuales
            </p>
          </div>

          <button
            type="button"
            onClick={cargarDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Alumnos activos"
            value={resumen.alumnosActivos}
            subtitle={`${resumen.alumnosTotales} totales`}
            icon={Users}
          />

          <StatsCard
            title="Egresados"
            value={resumen.egresados}
            subtitle="Estatus egresado o titulado"
            icon={GraduationCap}
          />

          <StatsCard
            title="Promedio general"
            value={formatearNumero(resumen.promedioGeneral)}
            subtitle="Escala 0-100"
            icon={ClipboardCheck}
          />

          <StatsCard
            title="Carreras"
            value={resumen.carrerasActivas}
            subtitle={`${resumen.carrerasTotales} registradas`}
            icon={BookOpen}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 xl:col-span-2">
            <h2 className="mb-8 font-display text-3xl">Alumnos por carrera</h2>

            {alumnosPorCarrera.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No hay alumnos activos para mostrar.
              </p>
            ) : (
              alumnosPorCarrera.map((career) => (
                <div key={career.id} className="mb-6 last:mb-0">
                  <div className="mb-2 flex justify-between gap-4">
                    <span className="font-medium text-slate-700">
                      {career.nombre}
                    </span>
                    <span className="shrink-0 text-slate-500">
                      {career.total} alumnos
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-[var(--primary)]"
                      style={{
                        width: porcentaje(career.total, alumnos.length),
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="mb-8 font-display text-3xl">Cuadro de honor</h2>

            {topHonor.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No hay alumnos con promedio de honor registrado.
              </p>
            ) : (
              <div className="space-y-6">
                {topHonor.map((alumno, index) => (
                  <div
                    key={alumno.id_alumno}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {nombreAlumnoApellidosPrimero(alumno)}
                        </p>
                        <p className="truncate text-sm text-gray-400">
                          {alumno.matricula || "Sin matrícula"} |{" "}
                          {alumno.carrera || "Sin carrera"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-lg bg-[var(--secondary)] px-3 py-1 font-semibold">
                      {formatearNumero(alumno.promedio)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
