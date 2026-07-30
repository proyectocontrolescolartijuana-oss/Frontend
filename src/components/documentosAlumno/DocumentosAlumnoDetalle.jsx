import {
  ArrowLeft,
  FileText,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
import FormAlert from "../usuarios/FormAlert";
import BadgeDocumento from "./BadgeDocumento";
import PreviewDocumento from "./PreviewDocumento";
import { obtenerDocumentoPorTipo } from "./documentosAlumnoUtils";

export default function DocumentosAlumnoDetalle({
  alumno,
  tiposDocumento,
  mensaje,
  error,
  procesandoDocumento,
  onBack,
  onRefresh,
  onArchivoSeleccionado,
  onEliminarDocumento,
}) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Volver a alumnos
          </button>

          <h1 className="text-4xl font-bold text-slate-900">
            Expediente escolar digital
          </h1>

          <p className="mt-2 text-slate-500">
            {alumno.entregados} de {alumno.totalDocumentos} documentos
            digitalizados
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
              {alumno.nombre}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              Matrícula: {alumno.matricula || "Sin dato"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              Control: {alumno.numero_control || "Sin dato"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              {alumno.carrera?.nombre || "Sin carrera"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
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
              alumno.documentos,
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
                  entregado ? "border-slate-200" : "border-dashed border-slate-300"
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
                      onArchivoSeleccionado(tipoDocumento, archivo);
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
                      onClick={() => onEliminarDocumento(tipoDocumento, documento)}
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
