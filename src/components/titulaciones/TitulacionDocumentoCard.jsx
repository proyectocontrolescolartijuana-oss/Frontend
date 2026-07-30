import { FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import PreviewDocumento from "../documentosAlumno/PreviewDocumento";
import TitulacionBadge from "./TitulacionBadge";
import { documentoEntregado } from "./titulacionesUtils";

export default function TitulacionDocumentoCard({
  documento,
  documentoArchivo,
  titulacion,
  procesando,
  onSubir,
  onLimpiar,
  onTextoChange,
}) {
  const entregado = documentoEntregado(titulacion, documento);
  const inputId = `titulacion-doc-${documento.key}`;
  const valorTexto = String(titulacion?.[documento.key] || "");
  const [draft, setDraft] = useState(valorTexto);

  useEffect(() => {
    setDraft(valorTexto);
  }, [valorTexto]);

  const guardarTexto = () => {
    if (documento.tipo !== "text" || draft === valorTexto) return;

    onTextoChange(documento, draft);
  };

  return (
    <article
      className={`flex min-h-44 flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm ${
        entregado ? "border-slate-200" : "border-dashed border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <FileText className="mt-0.5 shrink-0 text-[#0B245B]" size={20} />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">
              {documento.label}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {documento.descripcion}
            </p>
          </div>
        </div>

        <TitulacionBadge entregado={entregado} />
      </div>

      {documentoArchivo && (
        <div className="min-h-64 flex-1">
          <PreviewDocumento documento={documentoArchivo} />
        </div>
      )}

      {documento.tipo === "text" && !documentoArchivo && (
        <input
          type="text"
          value={draft}
          disabled={procesando}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={guardarTexto}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          placeholder="Captura folio, estatus o nombre del archivo"
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
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
            onSubir(documento, archivo);
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
          {entregado ? "Actualizar evidencia" : "Subir evidencia"}
        </label>

        {entregado && (
          <button
            type="button"
            onClick={() => onLimpiar(documento)}
            disabled={procesando}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={17} />
            {documentoArchivo ? "Eliminar evidencia" : "Marcar pendiente"}
          </button>
        )}
      </div>
    </article>
  );
}
