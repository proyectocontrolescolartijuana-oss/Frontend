import { useEffect, useMemo, useState } from "react";
import FormatoEvaluacionesFilters from "../components/formatoEvaluaciones/FormatoEvaluacionesFilters";
import FormatoEvaluacionesHeader from "../components/formatoEvaluaciones/FormatoEvaluacionesHeader";
import FormatoEvaluacionesPreview from "../components/formatoEvaluaciones/FormatoEvaluacionesPreview";
import FormatoEvaluacionesStyles from "../components/formatoEvaluaciones/FormatoEvaluacionesStyles";
import {
  grupoPerteneceACarrera,
  mapearCalificaciones,
} from "../components/formatoEvaluaciones/formatoEvaluacionesUtils";
import logoUnifrontSello from "../assets/Unifront1954Sello.png";
import { obtenerCalificacionesGrupo } from "../services/calificacionesService";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerGrupos } from "../services/gruposService";

export default function FormatoEvaluaciones({ data: dataProp }) {
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [carreraId, setCarreraId] = useState("");
  const [busquedaGrupo, setBusquedaGrupo] = useState("");
  const [data, setData] = useState(dataProp || null);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(!dataProp);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (dataProp) return;
    let activo = true;

    const cargarCatalogos = async () => {
      setCargandoCatalogos(true);
      setError("");

      try {
        const [carrerasResponse, gruposResponse] = await Promise.all([
          obtenerCarreras(),
          obtenerGrupos(),
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
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError("No se pudieron cargar carreras y grupos.");
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    };

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, [dataProp]);

  const gruposFiltrados = useMemo(
    () => grupos.filter((grupo) => grupoPerteneceACarrera(grupo, carreraId)),
    [grupos, carreraId],
  );

  const cargarGrupo = async (id) => {
    if (!id || Number(id) <= 0) {
      setError("Selecciona un grupo válido.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const calificaciones = await obtenerCalificacionesGrupo(Number(id));

      if (!calificaciones.length) {
        setData(null);
        setError("El grupo no tiene calificaciones registradas.");
        return;
      }

      setData(mapearCalificaciones(calificaciones));
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;

      console.error(requestError);
      setData(null);
      setError(
        typeof detail === "string"
          ? detail
          : "No se pudieron cargar las calificaciones del grupo.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleDownload = () => {
    const previousTitle = document.title;

    document.title = "formato_evaluaciones";
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    window.setTimeout(() => window.print(), 0);
  };

  const handleCarreraChange = (event) => {
    setCarreraId(event.target.value);
    setBusquedaGrupo("");
    setData(null);
    setError("");
  };

  const handleBuscar = () => {
    if (!carreraId) {
      setError("Selecciona una carrera antes de elegir el grupo.");
      return;
    }

    const termino = busquedaGrupo.trim().toLowerCase();

    if (!termino) {
      setError("Escribe o selecciona el nombre de un grupo (ej. CRIM26).");
      return;
    }

    const grupo = gruposFiltrados.find(
      (item) => item.nombre.toLowerCase() === termino,
    );

    if (!grupo) {
      setError(
        "No se encontró un grupo con ese nombre en la carrera seleccionada.",
      );
      return;
    }

    cargarGrupo(grupo.id_grupo);
  };

  const handleBuscarKeyDown = (event) => {
    if (event.key === "Enter") handleBuscar();
  };

  const handleLimpiar = () => {
    setBusquedaGrupo("");
    setData(null);
    setError("");
  };

  return (
    <div className="space-y-6 p-6">
      <FormatoEvaluacionesStyles />

      <FormatoEvaluacionesHeader disabled={!data} onDownload={handleDownload} />

      <div className="h-px w-full bg-slate-200" />

      <FormatoEvaluacionesFilters
        busquedaGrupo={busquedaGrupo}
        carreras={carreras}
        carreraId={carreraId}
        cargando={cargando}
        cargandoCatalogos={cargandoCatalogos}
        error={error}
        gruposFiltrados={gruposFiltrados}
        onBuscar={handleBuscar}
        onBuscarKeyDown={handleBuscarKeyDown}
        onCarreraChange={handleCarreraChange}
        onGrupoChange={(event) => setBusquedaGrupo(event.target.value)}
        onLimpiar={handleLimpiar}
      />

      <FormatoEvaluacionesPreview
        cargando={cargando}
        data={data}
        error={error}
        logoUrl={logoUnifrontSello}
      />
    </div>
  );
}
