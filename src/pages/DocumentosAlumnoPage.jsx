import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlumnoNoEncontrado from "../components/documentosAlumno/AlumnoNoEncontrado";
import DocumentosAlumnoDetalle from "../components/documentosAlumno/DocumentosAlumnoDetalle";
import DocumentosAlumnoLista from "../components/documentosAlumno/DocumentosAlumnoLista";
import DocumentosAlumnoLoading from "../components/documentosAlumno/DocumentosAlumnoLoading";
import {
  RECEPCION_CAMPOS,
  fechaLocal,
  nombreCompleto,
  normalizar,
  obtenerCampoRecepcion,
  obtenerDocumentoPorTipo,
  obtenerIdTipoDocumento,
  obtenerMensajeError,
} from "../components/documentosAlumno/documentosAlumnoUtils";
import { useAuth } from "../context/authStore";
import { obtenerCarreras } from "../services/carrerasService";
import {
  actualizarRecepcionDocumento,
  crearRecepcionDocumento,
  eliminarDocumentoAlumno,
  obtenerAlumnos,
  obtenerDocumentosAlumno,
  obtenerRecepcionesDocumento,
  obtenerTiposDocumento,
  subirDocumentoAlumno,
} from "../services/documentosAlumnoService";
import { obtenerUsuarios } from "../services/usuariosService";

export default function DocumentosAlumnoPage() {
  const navigate = useNavigate();
  const { alumnoId } = useParams();
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoDocumento, setProcesandoDocumento] = useState(null);
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
        usuariosResponse,
        carrerasResponse,
        tiposResponse,
        documentosResponse,
        recepcionesResponse,
      ] = await Promise.all([
        obtenerAlumnos(),
        obtenerUsuarios(),
        obtenerCarreras(),
        obtenerTiposDocumento(),
        obtenerDocumentosAlumno(),
        obtenerRecepcionesDocumento(),
      ]);

      setAlumnos(alumnosResponse);
      setUsuarios(usuariosResponse);
      setCarreras(carrerasResponse);
      setTiposDocumento(tiposResponse);
      setDocumentos(documentosResponse);
      setRecepciones(recepcionesResponse);
    } catch (requestError) {
      console.error(requestError);
      setError("No se pudo cargar la información de expedientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          alumnosResponse,
          usuariosResponse,
          carrerasResponse,
          tiposResponse,
          documentosResponse,
          recepcionesResponse,
        ] = await Promise.all([
          obtenerAlumnos(),
          obtenerUsuarios(),
          obtenerCarreras(),
          obtenerTiposDocumento(),
          obtenerDocumentosAlumno(),
          obtenerRecepcionesDocumento(),
        ]);

        if (!activo) return;

        setAlumnos(alumnosResponse);
        setUsuarios(usuariosResponse);
        setCarreras(carrerasResponse);
        setTiposDocumento(tiposResponse);
        setDocumentos(documentosResponse);
        setRecepciones(recepcionesResponse);
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setError("No se pudo cargar la información de expedientes.");
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

  const usuariosPorId = useMemo(
    () => new Map(usuarios.map((usuario) => [usuario.id_usuario, usuario])),
    [usuarios],
  );

  const carrerasPorId = useMemo(
    () => new Map(carreras.map((carrera) => [carrera.id_carrera, carrera])),
    [carreras],
  );

  const recepcionesPorAlumno = useMemo(() => {
    const mapa = new Map();

    recepciones.forEach((recepcion) => {
      const id = recepcion.alumno?.id_alumno;
      const actual = mapa.get(id);

      if (
        !actual ||
        Number(recepcion.id_recepcion) > Number(actual.id_recepcion)
      ) {
        mapa.set(id, recepcion);
      }
    });

    return mapa;
  }, [recepciones]);

  const alumnosDetalle = useMemo(() => {
    return alumnos
      .map((alumno) => {
        const usuario = usuariosPorId.get(alumno.id_usuario);
        const carrera = carrerasPorId.get(alumno.id_carrera);
        const documentosAlumno = documentos.filter(
          (documento) =>
            Number(documento.alumno?.id_alumno) === Number(alumno.id_alumno),
        );
        const entregados = tiposDocumento.filter((tipoDocumento) =>
          obtenerDocumentoPorTipo(
            documentosAlumno,
            tipoDocumento.id_tipo_documento,
          ),
        ).length;
        const nombre = nombreCompleto(usuario) || `Alumno #${alumno.id_alumno}`;

        return {
          ...alumno,
          nombre,
          carrera,
          documentos: documentosAlumno,
          recepcion: recepcionesPorAlumno.get(alumno.id_alumno),
          entregados,
          totalDocumentos: tiposDocumento.length,
          textoBusqueda: normalizar(
            [
              nombre,
              alumno.matricula,
              alumno.numero_control,
              carrera?.nombre,
              carrera?.clave,
            ]
              .filter(Boolean)
              .join(" "),
          ),
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [
    alumnos,
    carrerasPorId,
    documentos,
    recepcionesPorAlumno,
    tiposDocumento,
    usuariosPorId,
  ]);

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

  const guardarRecepcion = async (idAlumno, documentosActualizados) => {
    const recepcionActual = recepcionesPorAlumno.get(Number(idAlumno));
    const documentosAlumno = documentosActualizados.filter(
      (documento) => Number(documento.alumno?.id_alumno) === Number(idAlumno),
    );

    const payload = RECEPCION_CAMPOS.reduce(
      (acc, campo) => ({
        ...acc,
        [campo]: false,
      }),
      {
        id_alumno: Number(idAlumno),
        fecha_recepcion: recepcionActual?.fecha_recepcion || fechaLocal(),
        observaciones: recepcionActual?.observaciones || "",
      },
    );

    const recibidoPor =
      user?.id_usuario || recepcionActual?.recibido_por?.id_usuario;

    if (recibidoPor) {
      payload.recibido_por = recibidoPor;
    }

    documentosAlumno.forEach((documento) => {
      const tipoDocumento = tiposDocumento.find(
        (tipo) =>
          Number(tipo.id_tipo_documento) ===
          Number(obtenerIdTipoDocumento(documento)),
      );
      const campo = obtenerCampoRecepcion(tipoDocumento);

      if (campo) {
        payload[campo] = true;
      }
    });

    if (recepcionActual) {
      return actualizarRecepcionDocumento(
        recepcionActual.id_recepcion,
        payload,
      );
    }

    return crearRecepcionDocumento(payload);
  };

  const handleArchivoSeleccionado = async (tipoDocumento, archivo) => {
    if (!archivo || !alumnoSeleccionado) return;

    const documentoActual = obtenerDocumentoPorTipo(
      alumnoSeleccionado.documentos,
      tipoDocumento.id_tipo_documento,
    );

    setMensaje("");
    setError("");
    setProcesandoDocumento(tipoDocumento.id_tipo_documento);

    try {
      const nuevoDocumento = await subirDocumentoAlumno({
        idAlumno: alumnoSeleccionado.id_alumno,
        idTipoDocumento: tipoDocumento.id_tipo_documento,
        archivo,
      });

      const documentosSinAnterior = documentos.filter(
        (documento) => documento.id_documento !== documentoActual?.id_documento,
      );
      const documentosActualizados = [...documentosSinAnterior, nuevoDocumento];

      if (documentoActual) {
        await eliminarDocumentoAlumno(documentoActual.id_documento);
      }

      await guardarRecepcion(
        alumnoSeleccionado.id_alumno,
        documentosActualizados,
      );
      setDocumentos(documentosActualizados);
      setMensaje("Documento registrado correctamente.");
      await cargarDatos();
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setProcesandoDocumento(null);
    }
  };

  const handleEliminarDocumento = async (tipoDocumento, documento) => {
    if (!documento || !alumnoSeleccionado) return;

    const confirmar = window.confirm(
      `Eliminar ${tipoDocumento.nombre} de ${alumnoSeleccionado.nombre}?`,
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");
    setProcesandoDocumento(tipoDocumento.id_tipo_documento);

    try {
      await eliminarDocumentoAlumno(documento.id_documento);

      const documentosActualizados = documentos.filter(
        (item) => item.id_documento !== documento.id_documento,
      );

      await guardarRecepcion(
        alumnoSeleccionado.id_alumno,
        documentosActualizados,
      );
      setDocumentos(documentosActualizados);
      setMensaje("Documento eliminado. Ya puedes subir el archivo correcto.");
      await cargarDatos();
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setProcesandoDocumento(null);
    }
  };

  if (loading) {
    return <DocumentosAlumnoLoading />;
  }

  if (alumnoId && !alumnoSeleccionado) {
    return (
      <AlumnoNoEncontrado onBack={() => navigate("/documentos-alumno")} />
    );
  }

  if (alumnoSeleccionado) {
    return (
      <DocumentosAlumnoDetalle
        alumno={alumnoSeleccionado}
        tiposDocumento={tiposDocumento}
        mensaje={mensaje}
        error={error}
        procesandoDocumento={procesandoDocumento}
        onBack={() => navigate("/documentos-alumno")}
        onRefresh={cargarDatos}
        onArchivoSeleccionado={handleArchivoSeleccionado}
        onEliminarDocumento={handleEliminarDocumento}
      />
    );
  }

  return (
    <DocumentosAlumnoLista
      alumnos={alumnosFiltrados}
      carreras={carreras}
      tiposDocumento={tiposDocumento}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      carreraFiltro={carreraFiltro}
      setCarreraFiltro={setCarreraFiltro}
      mensaje={mensaje}
      error={error}
      onRefresh={cargarDatos}
      onSelectAlumno={(idAlumno) => navigate(`/documentos-alumno/${idAlumno}`)}
    />
  );
}
