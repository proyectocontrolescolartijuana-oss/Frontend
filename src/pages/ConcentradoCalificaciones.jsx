import { useEffect, useMemo, useState } from "react";

import { ConcentradoCalificacionesStyles } from "../components/concentradoCalificaciones/ConcentradoCalificacionesStyles";
import ConcentradoFilters from "../components/concentradoCalificaciones/ConcentradoFilters";
import ConcentradoHeader from "../components/concentradoCalificaciones/ConcentradoHeader";
import ConcentradoPreview from "../components/concentradoCalificaciones/ConcentradoPreview";
import {
  descargarConcentradoPreviewExcel,
} from "../components/concentradoCalificaciones/exportConcentrado";
import {
  getDefaultPeriodoId,
  initialConcentradoForm,
  obtenerMensajeErrorConcentrado,
} from "../components/concentradoCalificaciones/concentradoCalificacionesUtils";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerGrupos } from "../services/gruposService";
import { obtenerPeriodos } from "../services/periodosService";
import { obtenerConcentradoCalificaciones } from "../services/reportesService";

export default function ConcentradoCalificaciones() {
  const [form, setForm] = useState(initialConcentradoForm);
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [concentrado, setConcentrado] = useState(null);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
      setError("");

      try {
        const [carrerasResponse, gruposResponse, periodosResponse] = await Promise.all([
          obtenerCarreras(),
          obtenerGrupos(),
          obtenerPeriodos(),
        ]);

        if (!activo) return;

        setCarreras(
          carrerasResponse
            .filter((carrera) => carrera.estado !== false)
            .slice()
            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")),
        );
        setGrupos(
          gruposResponse
            .slice()
            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")),
        );
        setPeriodos(periodosResponse);
        setForm((currentForm) => ({
          ...currentForm,
          periodoId: getDefaultPeriodoId(periodosResponse),
        }));
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError("No se pudieron cargar grupos y periodos.");
        }
      } finally {
        if (activo) {
          setLoadingCatalogos(false);
        }
      }
    };

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  const grupoSeleccionado = useMemo(
    () => grupos.find((grupo) => String(grupo.id_grupo) === String(form.grupoId)),
    [grupos, form.grupoId],
  );

  const gruposFiltrados = useMemo(() => {
    if (!form.carreraId) return grupos;

    return grupos.filter(
      (grupo) => String(grupo.id_carrera) === String(form.carreraId),
    );
  }, [grupos, form.carreraId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "carreraId" ? { grupoId: "" } : {}),
    }));
    setConcentrado(null);
  };

  const handleGenerar = async () => {
    if (!form.carreraId) {
      setError("Selecciona una carrera.");
      return;
    }

    if (!form.grupoId) {
      setError("Selecciona un grupo.");
      return;
    }

    setLoadingReporte(true);
    setError("");

    try {
      const response = await obtenerConcentradoCalificaciones({
        grupoId: form.grupoId,
        periodoId: form.periodoId,
        carreraId: form.carreraId,
      });

      setConcentrado(response);
    } catch (requestError) {
      console.error(requestError);
      setConcentrado(null);
      setError(obtenerMensajeErrorConcentrado(requestError));
    } finally {
      setLoadingReporte(false);
    }
  };

  const handlePdf = () => {
    const previousTitle = document.title;

    document.title = "concentrado_calificaciones";
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    window.setTimeout(() => window.print(), 0);
  };

  const handleExcel = async () => {
    if (!concentrado) {
      setError("Genera el concentrado antes de descargarlo.");
      return;
    }

    setDownloadingExcel(true);
    setError("");

    try {
      await descargarConcentradoPreviewExcel(concentrado);
    } catch (downloadError) {
      console.error(downloadError);
      setError(downloadError.message || "No se pudo descargar el Excel.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <ConcentradoCalificacionesStyles />

      <ConcentradoHeader
        concentrado={concentrado}
        downloadingExcel={downloadingExcel}
        onDownloadExcel={handleExcel}
        onDownloadPdf={handlePdf}
      />

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        <ConcentradoFilters
          carreras={carreras}
          concentrado={concentrado}
          error={error}
          form={form}
          grupoSeleccionado={grupoSeleccionado}
          gruposFiltrados={gruposFiltrados}
          loadingCatalogos={loadingCatalogos}
          loadingReporte={loadingReporte}
          periodos={periodos}
          onChange={handleChange}
          onGenerate={handleGenerar}
        />

        <ConcentradoPreview
          concentrado={concentrado}
          logoUnifront={logoUnifront}
        />
      </div>
    </div>
  );
}
