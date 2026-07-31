import { BriefcaseBusiness } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import EstatusEgresadosFilters from "../components/estatusEgresados/EstatusEgresadosFilters";
import EstatusEgresadosManualForm from "../components/estatusEgresados/EstatusEgresadosManualForm";
import {
  aplicarDatosManuales,
  combinarEstatusAlumnos,
  filtrarEgresados,
  getGrupoCarreraId,
} from "../components/estatusEgresados/estatusEgresadosUtils";
import { obtenerAlumnosDetalle } from "../services/alumnosGruposService";
import { obtenerCarreras } from "../services/carrerasService";
import {
  descargarDocumentoEgresado,
  eliminarDocumentoEgresado,
  guardarEstatusPractica,
  guardarEstatusServicioSocial,
  obtenerDocumentosEgresado,
  obtenerPracticasProfesionales,
  obtenerServiciosSociales,
  obtenerVistaPreviaDocumentoEgresado,
  subirDocumentoEgresado,
} from "../services/estatusEgresadosService";
import { obtenerGrupos } from "../services/gruposService";
import { obtenerCuatrimestres } from "../services/planesEstudioService";

const campoPorTipo = {
  OFICIO_CAMPO: "oficio_servicio_campo",
  CARTA_UNIFRONT: "carta_liberacion_unifront",
  CARTA_PROCEDENCIA: "carta_liberacion_procedencia",
};

export default function ServicioSocial() {
  const [busqueda, setBusqueda] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [carreraId, setCarreraId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [consultaGenerada, setConsultaGenerada] = useState(false);
  const [error, setError] = useState("");
  const [valoresManuales, setValoresManuales] = useState({});

  useEffect(() => {
    document.title = "servicio_social";
  }, []);

  useEffect(() => {
    let activo = true;

    Promise.all([obtenerCarreras(), obtenerGrupos(), obtenerCuatrimestres()])
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
            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")),
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
            (grupo) => String(getGrupoCarreraId(grupo)) === String(carreraId),
          )
        : [],
    [carreraId, grupos],
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

  const reiniciarConsulta = () => {
    setAlumnos([]);
    setDocumentos([]);
    setValoresManuales({});
    setBusqueda("");
    setConsultaGenerada(false);
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
        alumnosDetalle,
        practicasProfesionales,
        serviciosSociales,
        documentosEgresado,
      ] = await Promise.all([
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
        titulaciones: [],
      });

      setAlumnos(combinados);
      setDocumentos(documentosEgresado);
      setValoresManuales({});
      setConsultaGenerada(true);
    } catch (requestError) {
      console.error(requestError);
      setAlumnos([]);
      setDocumentos([]);
      setConsultaGenerada(false);
      setError("No se pudieron cargar los alumnos. Verifica el backend.");
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleGuardarManual = async (alumnoId, valores) => {
    await Promise.all([
      guardarEstatusPractica(alumnoId, {
        oficio_campo: valores.oficio_servicio_campo,
        horas_campo: valores.servicio_campo_horas,
        empresa_nombre: valores.servicio_campo_lugar,
      }),
      guardarEstatusServicioSocial(alumnoId, {
        carta_unifront: valores.carta_liberacion_unifront,
        carta_procedencia: valores.carta_liberacion_procedencia,
        horas_completadas: valores.liberacion_horas,
        empresa_nombre: valores.liberacion_lugar,
      }),
    ]);
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
          !(String(item.id_alumno) === String(alumnoId) && item.tipo === tipo),
      ),
      documento,
    ]);
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
      actual.filter((item) => item.id_documento !== documento.id_documento),
    );
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
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <BriefcaseBusiness size={23} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Servicio Social</h1>
          <p className="mt-1 text-slate-500">
            Captura el avance de servicio social, practicas profesionales y sus
            documentos.
          </p>
        </div>
      </div>

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
          reiniciarConsulta();
        }}
        onGrupoChange={(value) => {
          setGrupoId(value);
          reiniciarConsulta();
        }}
        onLimpiarBusqueda={() => setBusqueda("")}
      />

      {consultaGenerada && (
        <EstatusEgresadosManualForm
          alumnos={alumnosFiltrados}
          documentos={documentos}
          onDescargar={descargarDocumentoEgresado}
          onEliminarDocumento={handleEliminarDocumento}
          onGuardar={handleGuardarManual}
          onSubirDocumento={handleSubirDocumento}
          onVistaPrevia={obtenerVistaPreviaDocumentoEgresado}
          valoresPorAlumno={valoresManuales}
        />
      )}

      {consultaGenerada && !alumnosFiltrados.length && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No hay alumnos para la carrera, grupo o busqueda seleccionada.
        </div>
      )}
    </div>
  );
}
