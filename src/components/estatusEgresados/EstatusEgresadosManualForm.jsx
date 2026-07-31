import { Download, Eye, FileUp, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const TIPOS = [
  { key: "OFICIO_CAMPO", label: "Oficio de servicio de campo" },
  { key: "CARTA_UNIFRONT", label: "Carta de liberacion UNIFRONT" },
  {
    key: "CARTA_PROCEDENCIA",
    label: "Carta del instituto de procedencia",
  },
];

const campoInicial = (valor) => (valor == null ? "" : valor);

export default function EstatusEgresadosManualForm({
  alumnos,
  documentos,
  onDescargar,
  onEliminarDocumento,
  onGuardar,
  onSubirDocumento,
  onVistaPrevia,
  valoresPorAlumno,
}) {
  const [alumnoId, setAlumnoId] = useState("");
  const [formulario, setFormulario] = useState({
    servicioLugar: "",
    servicioHoras: "",
    practicaLugar: "",
    practicaHoras: "",
  });
  const [procesando, setProcesando] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [vistaPrevia, setVistaPrevia] = useState(null);

  useEffect(
    () => () => {
      if (vistaPrevia?.url) URL.revokeObjectURL(vistaPrevia.url);
    },
    [vistaPrevia],
  );

  const alumnoSeleccionado = useMemo(
    () =>
      alumnos.find((item) => String(item.id_alumno) === String(alumnoId)) ||
      null,
    [alumnoId, alumnos],
  );

  const documentosAlumno = useMemo(
    () =>
      documentos.filter(
        (documento) => String(documento.id_alumno) === String(alumnoId),
      ),
    [alumnoId, documentos],
  );

  if (!alumnos.length) return null;

  const actualizarCampo = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const seleccionarAlumno = (value) => {
    const alumno = alumnos.find(
      (item) => String(item.id_alumno) === String(value),
    );
    const valores = valoresPorAlumno[value] || {};
    setAlumnoId(value);
    setFormulario({
      servicioLugar: campoInicial(
        valores.liberacion_lugar ?? alumno?.liberacion_lugar,
      ),
      servicioHoras: campoInicial(
        valores.liberacion_horas ?? alumno?.liberacion_horas,
      ),
      practicaLugar: campoInicial(
        valores.servicio_campo_lugar ?? alumno?.servicio_campo_lugar,
      ),
      practicaHoras: campoInicial(
        valores.servicio_campo_horas ?? alumno?.servicio_campo_horas,
      ),
    });
    setMensaje("");
  };

  const documentoPorTipo = (tipo) =>
    documentosAlumno.find((documento) => documento.tipo === tipo);

  const subir = async (tipo, archivo) => {
    if (!archivo || !alumnoId) return;
    setProcesando(tipo);
    setMensaje("");
    try {
      await onSubirDocumento(alumnoId, tipo, archivo);
      setMensaje("Documento guardado correctamente.");
    } catch {
      setMensaje("No se pudo subir el documento.");
    } finally {
      setProcesando("");
    }
  };

  const eliminar = async (documento) => {
    setProcesando(documento.tipo);
    setMensaje("");
    try {
      await onEliminarDocumento(documento);
      setMensaje("Documento eliminado correctamente.");
    } catch {
      setMensaje("No se pudo eliminar el documento.");
    } finally {
      setProcesando("");
    }
  };

  const previsualizar = async (documento) => {
    setProcesando(documento.tipo);
    setMensaje("");
    try {
      const vista = await onVistaPrevia(documento);
      setVistaPrevia(vista);
    } catch {
      setMensaje("No se pudo abrir la vista previa.");
    } finally {
      setProcesando("");
    }
  };

  const cerrarVistaPrevia = () => {
    setVistaPrevia(null);
  };

  const guardarDatos = async () => {
    const tiposPresentes = new Set(
      documentosAlumno.map((documento) => documento.tipo),
    );
    setProcesando("DATOS");
    setMensaje("");
    try {
      await onGuardar(alumnoId, {
        oficio_servicio_campo: tiposPresentes.has("OFICIO_CAMPO"),
        servicio_campo_horas:
          formulario.practicaHoras === "" ? null : Number(formulario.practicaHoras),
        servicio_campo_lugar: formulario.practicaLugar.trim(),
        carta_liberacion_unifront: tiposPresentes.has("CARTA_UNIFRONT"),
        carta_liberacion_procedencia: tiposPresentes.has("CARTA_PROCEDENCIA"),
        liberacion_horas:
          formulario.servicioHoras === "" ? null : Number(formulario.servicioHoras),
        liberacion_lugar: formulario.servicioLugar.trim(),
      });
      setMensaje("Datos guardados correctamente.");
    } catch {
      setMensaje("No se pudieron guardar los datos.");
    } finally {
      setProcesando("");
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Servicio social y practicas profesionales
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Captura documentos, lugar de la empresa y horas para cada proceso.
          </p>
        </div>
        {alumnoSeleccionado && (
          <button
            type="button"
            onClick={guardarDatos}
            disabled={Boolean(procesando)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save size={16} />
            {procesando === "DATOS" ? "Guardando..." : "Guardar datos"}
          </button>
        )}
      </div>

      <label className="mt-4 block max-w-2xl">
        <span className="text-sm font-medium text-slate-700">Alumno</span>
        <select
          value={alumnoId}
          onChange={(event) => seleccionarAlumno(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Selecciona alumno</option>
          {alumnos.map((alumno) => (
            <option key={alumno.id_alumno} value={alumno.id_alumno}>
              {alumno.numero_control} - {alumno.nombre}
            </option>
          ))}
        </select>
      </label>

      {alumnoId && (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">
                Servicio social
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
                <label>
                  <span className="text-sm font-medium text-slate-700">
                    Lugar de la empresa
                  </span>
                  <input
                    type="text"
                    value={formulario.servicioLugar}
                    onChange={(event) =>
                      actualizarCampo("servicioLugar", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700">
                    Horas
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formulario.servicioHoras}
                    onChange={(event) =>
                      actualizarCampo("servicioHoras", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">
                Practicas profesionales
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
                <label>
                  <span className="text-sm font-medium text-slate-700">
                    Lugar de la empresa
                  </span>
                  <input
                    type="text"
                    value={formulario.practicaLugar}
                    onChange={(event) =>
                      actualizarCampo("practicaLugar", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700">
                    Horas
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formulario.practicaHoras}
                    onChange={(event) =>
                      actualizarCampo("practicaHoras", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {TIPOS.map((tipo) => {
              const documento = documentoPorTipo(tipo.key);
              return (
                <div
                  key={tipo.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-800">
                    {tipo.label}
                  </h3>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {documento?.nombre_archivo || "Sin documento"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                      <FileUp size={15} />
                      {procesando === tipo.key
                        ? "Procesando..."
                        : documento
                          ? "Reemplazar"
                          : "Subir"}
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        disabled={Boolean(procesando)}
                        onChange={(event) => {
                          subir(tipo.key, event.target.files?.[0]);
                          event.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                    {documento && (
                      <>
                        <button
                          type="button"
                          onClick={() => previsualizar(documento)}
                          disabled={Boolean(procesando)}
                          className="rounded-lg border border-blue-200 bg-white p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          title="Vista previa"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDescargar(documento)}
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
                          title="Descargar"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar(documento)}
                          disabled={Boolean(procesando)}
                          className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {mensaje && (
        <p className="mt-3 text-sm font-medium text-slate-700">{mensaje}</p>
      )}

      {vistaPrevia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Vista previa de ${vistaPrevia.nombre}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarVistaPrevia();
          }}
        >
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">
                  {vistaPrevia.nombre}
                </h3>
                <p className="text-xs text-slate-500">Vista previa</p>
              </div>
              <button
                type="button"
                onClick={cerrarVistaPrevia}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar vista previa"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100 p-3">
              {vistaPrevia.tipo?.startsWith("image/") ? (
                <img
                  src={vistaPrevia.url}
                  alt={vistaPrevia.nombre}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <iframe
                  src={vistaPrevia.url}
                  title={vistaPrevia.nombre}
                  className="h-full w-full rounded-lg bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
