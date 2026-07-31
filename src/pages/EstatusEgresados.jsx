import { useEffect, useMemo, useState } from "react";

import EstatusEgresadosFilters from "../components/estatusEgresados/EstatusEgresadosFilters";
import EstatusEgresadosHeader from "../components/estatusEgresados/EstatusEgresadosHeader";
import EstatusEgresadosPreview from "../components/estatusEgresados/EstatusEgresadosPreview";
import EstatusEgresadosStyles from "../components/estatusEgresados/EstatusEgresadosStyles";
import {
  combinarEstatusAlumnos,
  completarDatosKardex,
  filtrarEgresados,
  formatearFechaConsulta,
  getGrupoCarreraId,
} from "../components/estatusEgresados/estatusEgresadosUtils";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { obtenerAlumnosDetalle } from "../services/alumnosGruposService";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerGrupos } from "../services/gruposService";
import { obtenerKardexPorMatricula } from "../services/kardexService";
import { obtenerCuatrimestres } from "../services/planesEstudioService";
import { obtenerTitulaciones } from "../services/semaforoService";
import {
  obtenerPracticasProfesionales,
  obtenerServiciosSociales,
} from "../services/estatusEgresadosService";

export default function EstatusEgresados() {
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

    Promise.all([
      obtenerCarreras(),
      obtenerGrupos(),
      obtenerCuatrimestres(),
    ])
      .then(([carrerasResponse, gruposResponse, cuatrimestresResponse]) => {
        if (!activo) return;
        const cuatrimestresPorId = new Map(
          cuatrimestresResponse.map((cuatrimestre) => [
            String(cuatrimestre.id_cuatrimestre),
            cuatrimestre,
          ]),
        );
        setCarreras(
          carrerasResponse
            .filter((carrera) => carrera.estado !== false)
            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")),
        );
        setGrupos(
          gruposResponse
            .map((grupo) => ({
              ...grupo,
              cuatrimestre:
                cuatrimestresPorId.get(String(grupo.id_cuatrimestre)) || null,
            }))
            .sort((a, b) =>
              (a.nombre || "").localeCompare(b.nombre || ""),
            ),
        );
      })
      .catch((requestError) => {
        console.error(requestError);
        if (activo) setError("No se pudieron cargar carreras y grupos.");
      })
      .finally(() => {
        if (activo) setLoadingCatalogos(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const gruposFiltrados = useMemo(
    () =>
      carreraId
        ? grupos.filter(
            (grupo) =>
              String(getGrupoCarreraId(grupo)) === String(carreraId),
          )
        : [],
    [carreraId, grupos],
  );

  const carreraSeleccionada = carreras.find(
    (carrera) => String(carrera.id_carrera) === String(carreraId),
  );
  const grupoSeleccionado = grupos.find(
    (grupo) => String(grupo.id_grupo) === String(grupoId),
  );
  const alumnosFiltrados = useMemo(
    () => filtrarEgresados(alumnos, busqueda),
    [alumnos, busqueda],
  );

  const reiniciarReporte = () => {
    setAlumnos([]);
    setBusqueda("");
    setReporteGenerado(false);
    setError("");
  };

  const handleConsultar = async () => {
    if (!carreraId || !grupoId) {
      setError("Selecciona una carrera y un grupo.");
      return;
    }

    setLoadingReporte(true);
    setError("");

    try {
      const [
        titulaciones,
        alumnosDetalle,
        practicasProfesionales,
        serviciosSociales,
      ] = await Promise.all([
        obtenerTitulaciones(),
        obtenerAlumnosDetalle(),
        obtenerPracticasProfesionales(),
        obtenerServiciosSociales(),
      ]);
      const combinados = combinarEstatusAlumnos({
        alumnosDetalle,
        carreraId,
        grupoCatalogo: grupoSeleccionado,
        grupoId,
        practicasProfesionales,
        serviciosSociales,
        titulaciones,
      });
      const resultado = await Promise.all(
        combinados.map(async (alumno) => {
          if (!alumno.matricula) return alumno;
          try {
            const kardex = await obtenerKardexPorMatricula(alumno.matricula);
            return completarDatosKardex(alumno, kardex);
          } catch (kardexError) {
            console.error(kardexError);
            return alumno;
          }
        }),
      );

      setAlumnos(resultado);
      setFechaConsulta(formatearFechaConsulta());
      setReporteGenerado(true);
    } catch (requestError) {
      console.error(requestError);
      setAlumnos([]);
      setReporteGenerado(false);
      setError("No se pudo generar el reporte. Verifica el backend.");
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleDownload = () => {
    const previousTitle = document.title;
    document.title = "estatus_egresados";
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
      <EstatusEgresadosStyles />
      <EstatusEgresadosHeader
        disabled={loadingReporte || alumnosFiltrados.length === 0}
        onDownload={handleDownload}
      />
      <div className="h-px w-full bg-slate-200" />
      <EstatusEgresadosFilters
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
        onCarreraChange={(value) => {
          setCarreraId(value);
          setGrupoId("");
          reiniciarReporte();
        }}
        onGrupoChange={(value) => {
          setGrupoId(value);
          reiniciarReporte();
        }}
        onLimpiarBusqueda={() => setBusqueda("")}
      />
      <EstatusEgresadosPreview
        alumnos={alumnosFiltrados}
        busqueda={busqueda}
        carreraNombre={carreraSeleccionada?.nombre || ""}
        fechaConsulta={fechaConsulta}
        grupoNombre={grupoSeleccionado?.nombre || ""}
        loading={loadingReporte}
        logoUrl={logoUnifront}
        reporteGenerado={reporteGenerado}
      />
    </div>
  );
}
