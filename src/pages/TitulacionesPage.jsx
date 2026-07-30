import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitulacionNoEncontrada from "../components/titulaciones/TitulacionNoEncontrada";
import TitulacionesDetalle from "../components/titulaciones/TitulacionesDetalle";
import TitulacionesLista from "../components/titulaciones/TitulacionesLista";
import TitulacionesLoading from "../components/titulaciones/TitulacionesLoading";
import {
  archivoAEstatus,
  nombreAlumno,
  normalizar,
  obtenerMensajeError,
  titulacionBase,
} from "../components/titulaciones/titulacionesUtils";
import { obtenerAlumnosDetalle } from "../services/alumnosGruposService";
import { obtenerCarreras } from "../services/carrerasService";
import {
  actualizarTitulacion,
  crearTitulacion,
  eliminarDocumentoTitulacion,
  obtenerDocumentosTitulacion,
  obtenerTitulaciones,
  subirDocumentoTitulacion,
} from "../services/titulacionesService";

export default function TitulacionesPage() {
  const navigate = useNavigate();
  const { alumnoId } = useParams();
  const [alumnos, setAlumnos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [titulaciones, setTitulaciones] = useState([]);
  const [documentosTitulacion, setDocumentosTitulacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoCampo, setProcesandoCampo] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [carreraFiltro, setCarreraFiltro] = useState("TODAS");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        alumnosResponse,
        carrerasResponse,
        titulacionesResponse,
        documentosResponse,
      ] = await Promise.all([
        obtenerAlumnosDetalle(),
        obtenerCarreras(),
        obtenerTitulaciones(),
        obtenerDocumentosTitulacion(),
      ]);

      setAlumnos(alumnosResponse);
      setCarreras(carrerasResponse);
      setTitulaciones(titulacionesResponse);
      setDocumentosTitulacion(documentosResponse);
    } catch (requestError) {
      console.error(requestError);
      setError("No se pudo cargar la información de titulaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const titulacionesPorAlumno = useMemo(() => {
    const mapa = new Map();

    titulaciones.forEach((titulacion) => {
      mapa.set(Number(titulacion.id_alumno), titulacion);
    });

    return mapa;
  }, [titulaciones]);

  const documentosPorTitulacionRequisito = useMemo(() => {
    const mapa = new Map();

    documentosTitulacion.forEach((documento) => {
      const key = `${documento.id_titulacion}:${documento.requisito}`;
      const actual = mapa.get(key);

      if (
        !actual ||
        Number(documento.id_documento_titulacion) >
          Number(actual.id_documento_titulacion)
      ) {
        mapa.set(key, documento);
      }
    });

    return mapa;
  }, [documentosTitulacion]);

  const alumnosDetalle = useMemo(() => {
    return alumnos
      .map((alumno) => {
        const nombre = nombreAlumno(alumno);
        const titulacion =
          titulacionesPorAlumno.get(Number(alumno.id_alumno)) ||
          titulacionBase(alumno.id_alumno);
        const idCarrera = alumno.id_carrera || alumno.carrera?.id_carrera;

        return {
          ...alumno,
          nombre,
          id_carrera: idCarrera,
          titulacion,
          textoBusqueda: normalizar(
            [
              nombre,
              alumno.matricula,
              alumno.numero_control,
              alumno.carrera?.nombre || alumno.carrera,
              alumno.grupo?.nombre || alumno.grupo,
            ]
              .filter(Boolean)
              .join(" "),
          ),
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [alumnos, titulacionesPorAlumno]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda);

    return alumnosDetalle.filter((alumno) => {
      const coincideBusqueda = !texto || alumno.textoBusqueda.includes(texto);
      const coincideCarrera =
        carreraFiltro === "TODAS" ||
        Number(alumno.id_carrera) === Number(carreraFiltro);

      return coincideBusqueda && coincideCarrera;
    });
  }, [alumnosDetalle, busqueda, carreraFiltro]);

  const alumnoSeleccionado = useMemo(() => {
    if (!alumnoId) return null;

    return alumnosDetalle.find(
      (alumno) => Number(alumno.id_alumno) === Number(alumnoId),
    );
  }, [alumnoId, alumnosDetalle]);

  const guardarTitulacion = async (alumno, cambios) => {
    const actual = alumno.titulacion;
    const esNuevo = !actual?.id_titulacion;
    const payload = esNuevo
      ? {
          ...titulacionBase(alumno.id_alumno),
          ...cambios,
        }
      : cambios;
    const guardada = esNuevo
      ? await crearTitulacion(payload)
      : await actualizarTitulacion(actual.id_titulacion, payload);

    setTitulaciones((current) => {
      const sinActual = current.filter(
        (item) => Number(item.id_alumno) !== Number(alumno.id_alumno),
      );

      return [...sinActual, guardada];
    });

    return guardada;
  };

  const obtenerDocumentosAlumnoSeleccionado = (titulacion) => {
    if (!titulacion?.id_titulacion) return new Map();

    const mapa = new Map();

    documentosPorTitulacionRequisito.forEach((documento, key) => {
      if (key.startsWith(`${titulacion.id_titulacion}:`)) {
        mapa.set(documento.requisito, documento);
      }
    });

    return mapa;
  };

  const handleSubirDocumento = async (documento, archivo) => {
    if (!archivo || !alumnoSeleccionado) return;

    setMensaje("");
    setError("");
    setProcesandoCampo(documento.key);

    try {
      const titulacionGuardada = await guardarTitulacion(
        alumnoSeleccionado,
        documento.tipo === "boolean"
          ? { [documento.key]: true }
          : { [documento.key]: archivoAEstatus(archivo) },
      );
      const evidencia = await subirDocumentoTitulacion({
        idTitulacion: titulacionGuardada.id_titulacion,
        requisito: documento.key,
        archivo,
      });

      setDocumentosTitulacion((current) => {
        const sinAnterior = current.filter(
          (item) =>
            !(
              Number(item.id_titulacion) ===
                Number(evidencia.id_titulacion) &&
              item.requisito === evidencia.requisito
            ),
        );

        return [...sinAnterior, evidencia];
      });
      setMensaje(
        `${documento.label} registrado. Ya puedes ver la vista previa y el Semáforo egresados reflejará el cambio.`,
      );
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setProcesandoCampo(null);
    }
  };

  const handleLimpiarDocumento = async (documento) => {
    if (!alumnoSeleccionado) return;

    const confirmar = window.confirm(
      `Marcar ${documento.label} como pendiente para ${alumnoSeleccionado.nombre}?`,
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");
    setProcesandoCampo(documento.key);

    try {
      const documentoArchivo = obtenerDocumentosAlumnoSeleccionado(
        alumnoSeleccionado.titulacion,
      ).get(documento.key);

      if (documentoArchivo) {
        await eliminarDocumentoTitulacion(
          documentoArchivo.id_documento_titulacion,
        );
        setDocumentosTitulacion((current) =>
          current.filter(
            (item) =>
              item.id_documento_titulacion !==
              documentoArchivo.id_documento_titulacion,
          ),
        );
        setTitulaciones((current) =>
          current.map((item) =>
            Number(item.id_titulacion) ===
            Number(documentoArchivo.id_titulacion)
              ? {
                  ...item,
                  [documento.key]: documento.tipo === "boolean" ? false : "",
                }
              : item,
          ),
        );
      } else {
        await guardarTitulacion(
          alumnoSeleccionado,
          documento.tipo === "boolean"
            ? { [documento.key]: false }
            : { [documento.key]: "" },
        );
      }
      setMensaje(`${documento.label} quedó pendiente en titulación.`);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setProcesandoCampo(null);
    }
  };

  const handleTextoChange = async (documento, value) => {
    if (!alumnoSeleccionado) return;

    setMensaje("");
    setError("");
    setProcesandoCampo(documento.key);

    try {
      await guardarTitulacion(alumnoSeleccionado, {
        [documento.key]: value,
      });
      setMensaje(`${documento.label} actualizado.`);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setProcesandoCampo(null);
    }
  };

  if (loading) {
    return <TitulacionesLoading />;
  }

  if (alumnoId && !alumnoSeleccionado) {
    return <TitulacionNoEncontrada onBack={() => navigate("/titulaciones")} />;
  }

  if (alumnoSeleccionado) {
    return (
      <TitulacionesDetalle
        alumno={alumnoSeleccionado}
        documentosPorRequisito={obtenerDocumentosAlumnoSeleccionado(
          alumnoSeleccionado.titulacion,
        )}
        mensaje={mensaje}
        error={error}
        procesandoCampo={procesandoCampo}
        onBack={() => navigate("/titulaciones")}
        onRefresh={cargarDatos}
        onSubirDocumento={handleSubirDocumento}
        onLimpiarDocumento={handleLimpiarDocumento}
        onTextoChange={handleTextoChange}
      />
    );
  }

  return (
    <TitulacionesLista
      alumnos={alumnosFiltrados}
      carreras={carreras}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      carreraFiltro={carreraFiltro}
      setCarreraFiltro={setCarreraFiltro}
      mensaje={mensaje}
      error={error}
      onRefresh={cargarDatos}
      onSelectAlumno={(idAlumno) => navigate(`/titulaciones/${idAlumno}`)}
    />
  );
}
