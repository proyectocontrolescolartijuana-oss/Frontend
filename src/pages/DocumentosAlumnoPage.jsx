import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileImage,
  FileText,
  FileUp,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import FormAlert from "../components/usuarios/FormAlert";
import { useAuth } from "../context/authStore";
import api from "../services/api";
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

const RECEPCION_CAMPOS = [
  "ficha_inscripcion",
  "acta_original",
  "acta_copias",
  "certificado_original",
  "constancia_terminacion",
  "fotografias",
  "curp_documento",
];

const RECEPCION_REGLAS = [
  { campo: "curp_documento", coincide: (texto) => texto.includes("curp") },
  {
    campo: "certificado_original",
    coincide: (texto) => texto.includes("certificado"),
  },
  {
    campo: "constancia_terminacion",
    coincide: (texto) => texto.includes("constancia"),
  },
  {
    campo: "fotografias",
    coincide: (texto) => texto.includes("fotografia") || texto.includes("foto"),
  },
  { campo: "ficha_inscripcion", coincide: (texto) => texto.includes("ficha") },
  {
    campo: "acta_copias",
    coincide: (texto) => texto.includes("acta") && texto.includes("copia"),
  },
  { campo: "acta_original", coincide: (texto) => texto.includes("acta") },
];

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const fechaLocal = () => {
  const fecha = new Date();
  const month = `${fecha.getMonth() + 1}`.padStart(2, "0");
  const day = `${fecha.getDate()}`.padStart(2, "0");

  return `${fecha.getFullYear()}-${month}-${day}`;
};

const getApiBase = () => (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const nombreCompleto = (usuario) =>
  [
    usuario?.nombre,
    usuario?.apellido_paterno,
    usuario?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.loc?.join("."))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo completar la operacion.";
};

const obtenerIdTipoDocumento = (documento) =>
  documento?.tipo_documento?.id_tipo_documento;

const obtenerDocumentoPorTipo = (documentos, idTipoDocumento) => {
  return documentos
    .filter(
      (documento) =>
        Number(obtenerIdTipoDocumento(documento)) === Number(idTipoDocumento),
    )
    .sort((a, b) => Number(b.id_documento) - Number(a.id_documento))[0];
};

const obtenerCampoRecepcion = (tipoDocumento) => {
  const texto = normalizar(tipoDocumento?.nombre);
  const regla = RECEPCION_REGLAS.find((item) => item.coincide(texto));

  return regla?.campo;
};

const resolverArchivoUrl = (rutaArchivo) => {
  if (!rutaArchivo) return "";

  if (
    rutaArchivo.startsWith("http://") ||
    rutaArchivo.startsWith("https://") ||
    rutaArchivo.startsWith("blob:") ||
    rutaArchivo.startsWith("data:")
  ) {
    return rutaArchivo;
  }

  if (rutaArchivo.startsWith("/")) {
    return `${getApiBase()}${rutaArchivo}`;
  }

  if (rutaArchivo.startsWith("static/")) {
    return `${getApiBase()}/${rutaArchivo}`;
  }

  return "";
};

const obtenerDocumentoProtegido = async (rutaArchivo) => {
  if (!rutaArchivo) {
    return "";
  }

  try {
    const response = await api.get(rutaArchivo, {
      responseType: "blob",
    });

    const blobUrl = URL.createObjectURL(response.data);
    return blobUrl;
  } catch (error) {
    console.error("Error al obtener documento protegido:", error);
    return "";
  }
};

const esImagen = (documento) => {
  const nombre = normalizar(documento?.nombre_archivo || documento?.ruta_archivo);

  return /\.(png|jpg|jpeg|webp)$/i.test(nombre);
};

const esPdf = (documento) => {
  const nombre = normalizar(documento?.nombre_archivo || documento?.ruta_archivo);

  return /\.pdf$/i.test(nombre);
};

function BadgeDocumento({ entregado }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold ${
        entregado ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {entregado ? <Check size={13} /> : <X size={13} />}
      {entregado ? "Entregado" : "Falta"}
    </span>
  );
}

function PreviewDocumento({ documento }) {
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    let activeUrl = "";

    const cargarDocumento = async () => {
      if (!documento?.ruta_archivo) {
        return;
      }

      if (
        documento.ruta_archivo.startsWith("http://") ||
        documento.ruta_archivo.startsWith("https://") ||
        documento.ruta_archivo.startsWith("blob:") ||
        documento.ruta_archivo.startsWith("data:")
      ) {
        if (isMounted) {
          setBlobUrl(documento.ruta_archivo);
        }
        return;
      }

      activeUrl = await obtenerDocumentoProtegido(documento.ruta_archivo);

      if (isMounted) {
        setBlobUrl(activeUrl);
      }
    };

    cargarDocumento();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [documento]);

  if (!documento) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        Pendiente de digitalizar
      </div>
    );
  }

  if (blobUrl && esImagen(documento)) {
    return (
      <img
        src={blobUrl}
        alt={documento.nombre_archivo || "Documento digitalizado"}
        className="h-full min-h-64 w-full rounded-lg border border-slate-200 bg-white object-contain"
      />
    );
  }

  if (blobUrl && esPdf(documento)) {
    return (
      <iframe
        src={blobUrl}
        title={documento.nombre_archivo || "Documento PDF"}
        className="h-full min-h-64 w-full rounded-lg border border-slate-200 bg-white"
      />
    );
  }

  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 text-center text-sm text-slate-500">
      <FileImage className="mb-3 text-slate-400" size={32} />
      <span className="font-semibold text-slate-700">
        {documento.nombre_archivo || "Documento previo"}
      </span>
      <span className="mt-1 max-w-full truncate text-xs text-slate-400">
        {blobUrl ? "Preview no disponible para este tipo de archivo" : "Cargando documento..."}
      </span>
    </div>
  );
}

function DocumentoChip({ tipoDocumento, entregado }) {
  return (
    <span
      title={tipoDocumento.nombre}
      className={`inline-flex max-w-52 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        entregado
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {entregado ? <CheckCircle2 size={14} /> : <X size={14} />}
      <span className="truncate">{tipoDocumento.nombre}</span>
    </span>
  );
}

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
      setError("No se pudo cargar la informacion de expedientes.");
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
          setError("No se pudo cargar la informacion de expedientes.");
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

      if (!actual || Number(recepcion.id_recepcion) > Number(actual.id_recepcion)) {
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
      return actualizarRecepcionDocumento(recepcionActual.id_recepcion, payload);
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

      await guardarRecepcion(alumnoSeleccionado.id_alumno, documentosActualizados);
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

      await guardarRecepcion(alumnoSeleccionado.id_alumno, documentosActualizados);
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (alumnoId && !alumnoSeleccionado) {
    return (
      <div className="space-y-6 p-6">
        <button
          type="button"
          onClick={() => navigate("/documentos-alumno")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <FormAlert type="error">No se encontro el alumno solicitado.</FormAlert>
      </div>
    );
  }

  if (alumnoSeleccionado) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/documentos-alumno")}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Volver a alumnos
            </button>

            <h1 className="text-4xl font-bold text-slate-900">
              Expediente escolar digital
            </h1>

            <p className="mt-2 text-slate-500">
              {alumnoSeleccionado.entregados} de{" "}
              {alumnoSeleccionado.totalDocumentos} documentos digitalizados
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                {alumnoSeleccionado.nombre}
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                Matricula: {alumnoSeleccionado.matricula || "Sin dato"}
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                Control: {alumnoSeleccionado.numero_control || "Sin dato"}
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                {alumnoSeleccionado.carrera?.nombre || "Sin carrera"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={cargarDatos}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>
        </div>

        <div className="h-px w-full bg-slate-200" />

        {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
        {error && <FormAlert type="error">{error}</FormAlert>}

        {tiposDocumento.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            No hay tipos de documento configurados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {tiposDocumento.map((tipoDocumento) => {
              const documento = obtenerDocumentoPorTipo(
                alumnoSeleccionado.documentos,
                tipoDocumento.id_tipo_documento,
              );
              const entregado = Boolean(documento);
              const inputId = `documento-${tipoDocumento.id_tipo_documento}`;
              const procesando =
                procesandoDocumento === tipoDocumento.id_tipo_documento;

              return (
                <article
                  key={tipoDocumento.id_tipo_documento}
                  className={`flex min-h-44 flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm ${
                    entregado
                      ? "border-slate-200"
                      : "border-dashed border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="shrink-0 text-[#0B245B]" size={20} />
                      <h2 className="truncate text-base font-bold text-slate-900">
                        {tipoDocumento.nombre}
                      </h2>
                    </div>

                    <BadgeDocumento entregado={entregado} />
                  </div>

                  {entregado && (
                    <div className="min-h-64 flex-1">
                      <PreviewDocumento documento={documento} />
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-2">
                    <input
                      id={inputId}
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      disabled={procesando}
                      onChange={(event) => {
                        const archivo = event.target.files?.[0];
                        event.target.value = "";
                        handleArchivoSeleccionado(tipoDocumento, archivo);
                      }}
                    />

                    <label
                      htmlFor={inputId}
                      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-white ${
                        procesando ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      {procesando ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0B245B]" />
                      ) : (
                        <Upload size={18} />
                      )}
                      {entregado ? "Subir archivo nuevo" : "Subir PDF o imagen"}
                    </label>

                    {entregado && (
                      <button
                        type="button"
                        onClick={() =>
                          handleEliminarDocumento(tipoDocumento, documento)
                        }
                        disabled={procesando}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={17} />
                        Eliminar documento
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Documentos de alumnos
          </h1>

          <p className="mt-1 text-slate-500">
            {alumnosFiltrados.length} alumnos encontrados
          </p>
        </div>

        <button
          type="button"
          onClick={cargarDatos}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCcw size={18} />
          Actualizar
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
      {error && <FormAlert type="error">{error}</FormAlert>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileUp size={20} />
            </span>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recepcion de documentos
              </h2>

              <p className="text-sm text-slate-500">
                Filtra por carrera, matricula, numero de control o nombre
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar alumno"
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 lg:w-80"
              />
            </div>

            <select
              value={carreraFiltro}
              onChange={(event) => setCarreraFiltro(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="TODAS">Todas las carreras</option>
              {carreras.map((carrera) => (
                <option key={carrera.id_carrera} value={carrera.id_carrera}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {alumnosFiltrados.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No hay alumnos que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Alumno
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Carrera
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Matricula / Control
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Avance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                    Documentos
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {alumnosFiltrados.map((alumno) => (
                  <tr key={alumno.id_alumno} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">
                        {alumno.nombre}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        ID alumno #{alumno.id_alumno}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-slate-800">
                        {alumno.carrera?.nombre || "Sin carrera"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {alumno.carrera?.clave || "Sin clave"}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-slate-800">
                        {alumno.matricula || "Sin matricula"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {alumno.numero_control || "Sin numero de control"}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-slate-900">
                        {alumno.entregados}/{alumno.totalDocumentos}
                      </div>
                      <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width:
                              alumno.totalDocumentos > 0
                                ? `${(alumno.entregados / alumno.totalDocumentos) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </td>

                    <td className="max-w-xl px-6 py-5">
                      {tiposDocumento.length === 0 ? (
                        <span className="text-sm text-slate-500">
                          Sin tipos configurados
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {tiposDocumento.map((tipoDocumento) => (
                            <DocumentoChip
                              key={tipoDocumento.id_tipo_documento}
                              tipoDocumento={tipoDocumento}
                              entregado={Boolean(
                                obtenerDocumentoPorTipo(
                                  alumno.documentos,
                                  tipoDocumento.id_tipo_documento,
                                ),
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/documentos-alumno/${alumno.id_alumno}`)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0B245B] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900"
                        >
                          <FileText size={17} />
                          Agregar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
