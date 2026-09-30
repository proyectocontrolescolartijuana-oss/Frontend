import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  RefreshCcw,
  Table2,
} from "lucide-react";
import FormAlert from "../components/usuarios/FormAlert";
import { useAuth } from "../context/authStore";
import {
  descargarReporteFundamental,
  descargarReportesFundamentales,
  obtenerReportesFundamentales,
} from "../services/reportesService";

const ROLES_PERMITIDOS = ["ADMIN", "CONTROL_ESCOLAR"];

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo completar la descarga del reporte.";
};

export default function ReportesFundamentalesPage() {
  const { user } = useAuth();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState("");
  const [error, setError] = useState("");

  const autorizado = useMemo(
    () =>
      user?.roles?.some((rol) => ROLES_PERMITIDOS.includes(rol.nombre)) ||
      false,
    [user],
  );

  const cargarReportes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await obtenerReportesFundamentales();
      setReportes(response);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
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
        const response = await obtenerReportesFundamentales();

        if (activo) {
          setReportes(response);
        }
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError(obtenerMensajeError(requestError));
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    if (autorizado) {
      cargar();
    } else {
      setLoading(false);
    }

    return () => {
      activo = false;
    };
  }, [autorizado]);

  const handleDescargarTodo = async () => {
    setDescargando("todos");
    setError("");

    try {
      await descargarReportesFundamentales();
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setDescargando("");
    }
  };

  const handleDescargarReporte = async (reporteId) => {
    setDescargando(reporteId);
    setError("");

    try {
      await descargarReporteFundamental(reporteId);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setDescargando("");
    }
  };

  if (!autorizado) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Reportes fundamentales
          </h1>
          <p className="mt-2 text-slate-500">
            Acceso restringido para administracion y control escolar.
          </p>
        </div>

        <FormAlert type="error">
          No tienes permisos para consultar esta seccion.
        </FormAlert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Reportes fundamentales
          </h1>

          <p className="mt-2 text-slate-500">
            Informacion base de alumnos, docentes, usuarios y catalogos
            academicos.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={cargarReportes}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>

          <button
            type="button"
            onClick={handleDescargarTodo}
            disabled={descargando === "todos" || reportes.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B245B] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {descargando === "todos" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Download size={18} />
            )}
            Descargar todo
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-slate-200" />

      {error && <FormAlert type="error">{error}</FormAlert>}

      {reportes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          No hay reportes disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {reportes.map((reporte) => {
            const estaDescargando = descargando === reporte.id;

            return (
              <article
                key={reporte.id}
                className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0B245B]">
                    <FileSpreadsheet size={22} />
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    <Table2 size={14} />
                    {reporte.total} registros
                  </span>
                </div>

                <div className="mt-5 flex-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {reporte.nombre}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {reporte.descripcion}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDescargarReporte(reporte.id)}
                  disabled={estaDescargando}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {estaDescargando ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0B245B]" />
                  ) : (
                    <Download size={17} />
                  )}
                  Excel
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
