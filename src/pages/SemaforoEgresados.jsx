import { useEffect, useMemo, useState } from "react";

import SemaforoEgresadosFilters from "../components/semaforoEgresados/SemaforoEgresadosFilters";
import SemaforoEgresadosHeader from "../components/semaforoEgresados/SemaforoEgresadosHeader";
import SemaforoEgresadosPreview from "../components/semaforoEgresados/SemaforoEgresadosPreview";
import SemaforoEgresadosStyles from "../components/semaforoEgresados/SemaforoEgresadosStyles";
import {
  calcularPromedioKardex,
  combinarTitulacionesAlumnos,
  filtrarPorBusqueda,
  formatearFechaConsulta,
  getCarreraNombre,
  getGrupoCarreraId,
  getGrupoNombre,
} from "../components/semaforoEgresados/semaforoEgresadosUtils";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { obtenerAlumnosDetalle } from "../services/alumnosGruposService";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerGrupos } from "../services/gruposService";
import { obtenerKardexPorMatricula } from "../services/kardexService";
import { obtenerTitulaciones } from "../services/semaforoService";

export default function SemaforoEgresados() {
  const [busqueda, setBusqueda] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [carreraId, setCarreraId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [reporteGenerado, setReporteGenerado] = useState(false);
  const [fechaConsulta, setFechaConsulta] = useState(formatearFechaConsulta());
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      setLoadingCatalogos(true);
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
          setLoadingCatalogos(false);
        }
      }
    };

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  const gruposFiltrados = useMemo(() => {
    if (!carreraId) return [];

    return grupos.filter(
      (grupo) => String(getGrupoCarreraId(grupo)) === String(carreraId),
    );
  }, [carreraId, grupos]);

  const carreraSeleccionada = useMemo(
    () =>
      carreras.find(
        (carrera) => String(carrera.id_carrera) === String(carreraId),
      ),
    [carreraId, carreras],
  );

  const grupoSeleccionado = useMemo(
    () => grupos.find((grupo) => String(grupo.id_grupo) === String(grupoId)),
    [grupoId, grupos],
  );

  const alumnosFiltrados = useMemo(
    () => filtrarPorBusqueda(alumnos, busqueda),
    [alumnos, busqueda],
  );

  const handleCarreraChange = (value) => {
    setCarreraId(value);
    setGrupoId("");
    setAlumnos([]);
    setBusqueda("");
    setReporteGenerado(false);
    setError("");
  };

  const handleGrupoChange = (value) => {
    setGrupoId(value);
    setAlumnos([]);
    setBusqueda("");
    setReporteGenerado(false);
    setError("");
  };

  const handleConsultar = async () => {
    if (!carreraId) {
      setError("Selecciona una carrera.");
      return;
    }

    if (!grupoId) {
      setError("Selecciona un grupo.");
      return;
    }

    setLoadingReporte(true);
    setError("");

    try {
      const [titulaciones, alumnosDetalle] = await Promise.all([
        obtenerTitulaciones(),
        obtenerAlumnosDetalle(),
      ]);

      const combinados = combinarTitulacionesAlumnos({
        alumnosDetalle,
        carreraId,
        grupoId,
        titulaciones,
      });
      const alumnosConPromedio = await Promise.all(
        combinados.map(async (alumno) => {
          if (!alumno.matricula) return alumno;

          try {
            const kardex = await obtenerKardexPorMatricula(alumno.matricula);

            return {
              ...alumno,
              promedio_general: calcularPromedioKardex(kardex),
            };
          } catch (promedioError) {
            console.error(promedioError);

            return {
              ...alumno,
              promedio_general: null,
            };
          }
        }),
      );

      setAlumnos(alumnosConPromedio);
      setFechaConsulta(formatearFechaConsulta());
      setReporteGenerado(true);
    } catch (requestError) {
      console.error(requestError);
      setAlumnos([]);
      setReporteGenerado(false);
      setError(
        "No se pudieron cargar los datos de titulacion. Verifica que el backend este disponible.",
      );
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleDownload = () => {
    const previousTitle = document.title;

    document.title = "semaforo_egresados";
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
        disabled={loadingReporte || alumnosFiltrados.length === 0}
        onDownload={handleDownload}
      />

      <div className="h-px w-full bg-slate-200" />

      <SemaforoEgresadosFilters
        busqueda={busqueda}
        carreras={carreras}
        carreraId={carreraId}
        error={error}
        grupoId={grupoId}
        gruposFiltrados={gruposFiltrados}
        loadingCatalogos={loadingCatalogos}
        loadingReporte={loadingReporte}
        onBuscar={handleConsultar}
        onBusquedaChange={setBusqueda}
        onCarreraChange={handleCarreraChange}
        onGrupoChange={handleGrupoChange}
        onLimpiarBusqueda={() => setBusqueda("")}
      />

      <SemaforoEgresadosPreview
        alumnos={alumnosFiltrados}
        busqueda={busqueda}
        carreraNombre={getCarreraNombre(carreraSeleccionada)}
        fechaConsulta={fechaConsulta}
        grupoNombre={getGrupoNombre(grupoSeleccionado)}
        loading={loadingReporte}
        logoUrl={logoUnifront}
        reporteGenerado={reporteGenerado}
      />
    </div>
  );
}
