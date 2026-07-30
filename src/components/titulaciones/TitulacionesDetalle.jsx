import { ArrowLeft, RefreshCcw } from "lucide-react";
import FormAlert from "../usuarios/FormAlert";
import TitulacionDocumentoCard from "./TitulacionDocumentoCard";
import { DOCUMENTOS_TITULACION, documentoEntregado } from "./titulacionesUtils";

export default function TitulacionesDetalle({
  alumno,
  documentosPorRequisito,
  mensaje,
  error,
  procesandoCampo,
  onBack,
  onRefresh,
  onSubirDocumento,
  onLimpiarDocumento,
  onTextoChange,
}) {
  const entregados = DOCUMENTOS_TITULACION.filter((documento) =>
    documentoEntregado(alumno.titulacion, documento),
  ).length;

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
            Expediente de titulación
          </h1>

          <p className="mt-2 text-slate-500">
            {entregados} de {DOCUMENTOS_TITULACION.length} requisitos
            registrados en Semáforo egresados
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
              {alumno.carrera?.nombre || alumno.carrera || "Sin carrera"}
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {DOCUMENTOS_TITULACION.map((documento) => (
          <TitulacionDocumentoCard
            key={documento.key}
            documento={documento}
            documentoArchivo={documentosPorRequisito.get(documento.key)}
            titulacion={alumno.titulacion}
            procesando={procesandoCampo === documento.key}
            onSubir={onSubirDocumento}
            onLimpiar={onLimpiarDocumento}
            onTextoChange={onTextoChange}
          />
        ))}
      </div>
    </div>
  );
}
