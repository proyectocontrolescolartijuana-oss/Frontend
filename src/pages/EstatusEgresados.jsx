import { useEffect, useMemo, useState } from "react";

import EstatusEgresadosFilters from "../components/estatusEgresados/EstatusEgresadosFilters";
import EstatusEgresadosHeader from "../components/estatusEgresados/EstatusEgresadosHeader";
import EstatusEgresadosManualForm from "../components/estatusEgresados/EstatusEgresadosManualForm";
import EstatusEgresadosPreview from "../components/estatusEgresados/EstatusEgresadosPreview";
import EstatusEgresadosStyles from "../components/estatusEgresados/EstatusEgresadosStyles";
import {
  aplicarDatosManuales,
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
  descargarDocumentoEgresado,
  eliminarDocumentoEgresado,
  guardarEstatusPractica,
  obtenerDocumentosEgresado,
  obtenerPracticasProfesionales,
  obtenerServiciosSociales,
  obtenerVistaPreviaDocumentoEgresado,
  subirDocumentoEgresado,
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
  const [valoresManuales, setValoresManuales] = useState({});
  const [documentos, setDocumentos] = useState([]);

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
  const alumnosConDatosManuales = useMemo(
    () => aplicarDatosManuales(alumnos, valoresManuales),
    [alumnos, valoresManuales],
  );
  const alumnosFiltrados = useMemo(
    () => filtrarEgresados(alumnosConDatosManuales, busqueda),
    [alumnosConDatosManuales, busqueda],
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
        documentosEgresado,
      ] = await Promise.all([
        obtenerTitulaciones(),
        obtenerAlumnosDetalle(),
        obtenerPracticasProfesionales(),
        obtenerServiciosSociales(),
        obtenerDocumentosEgresado(),
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
      setDocumentos(documentosEgresado);
      setValoresManuales({});
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

  const handleGuardarManual = async (alumnoId, valores) => {
    await guardarEstatusPractica(alumnoId, {
      oficio_campo: valores.oficio_servicio_campo,
      horas_campo: valores.servicio_campo_horas,
    });
    setValoresManuales((actual) => ({
      ...actual,
      [String(alumnoId)]: valores,
    }));
  };

  const handleSubirDocumento = async (alumnoId, tipo, archivo) => {
    const documento = await subirDocumentoEgresado({
      alumnoId,
      tipo,
      archivo,
    });
    setDocumentos((actual) => [
      ...actual.filter(
        (item) =>
          !(
            String(item.id_alumno) === String(alumnoId) &&
            item.tipo === tipo
          ),
      ),
      documento,
    ]);
    const campoPorTipo = {
      OFICIO_CAMPO: "oficio_servicio_campo",
      CARTA_UNIFRONT: "carta_liberacion_unifront",
      CARTA_PROCEDENCIA: "carta_liberacion_procedencia",
    };
    setValoresManuales((actual) => ({
      ...actual,
      [String(alumnoId)]: {
        ...(actual[String(alumnoId)] || {}),
        [campoPorTipo[tipo]]: true,
      },
    }));
  };

  const handleEliminarDocumento = async (documento) => {
    await eliminarDocumentoEgresado(documento.id_documento);
    setDocumentos((actual) =>
      actual.filter(
        (item) => item.id_documento !== documento.id_documento,
      ),
    );
    const campoPorTipo = {
      OFICIO_CAMPO: "oficio_servicio_campo",
      CARTA_UNIFRONT: "carta_liberacion_unifront",
      CARTA_PROCEDENCIA: "carta_liberacion_procedencia",
    };
    setValoresManuales((actual) => ({
      ...actual,
      [String(documento.id_alumno)]: {
        ...(actual[String(documento.id_alumno)] || {}),
        [campoPorTipo[documento.tipo]]: false,
      },
    }));
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
      {reporteGenerado && (
        <EstatusEgresadosManualForm
          alumnos={alumnos}
          documentos={documentos}
          onDescargar={descargarDocumentoEgresado}
          onEliminarDocumento={handleEliminarDocumento}
          onVistaPrevia={obtenerVistaPreviaDocumentoEgresado}
          valoresPorAlumno={valoresManuales}
          onGuardar={handleGuardarManual}
          onSubirDocumento={handleSubirDocumento}
        />
      )}
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
