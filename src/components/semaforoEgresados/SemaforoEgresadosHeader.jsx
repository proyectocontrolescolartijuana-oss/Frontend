import { Download, FileText } from "lucide-react";

export default function SemaforoEgresadosHeader({ disabled, onDownload }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <FileText size={22} />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Semaforo de Calificaciones
          </h1>

          <p className="mt-1 text-slate-500">
            Selecciona carrera y grupo para consultar el avance de egresados.
          </p>
        </div>
      </div>

      <button
        onClick={onDownload}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={18} />
        Descargar PDF
      </button>
    </div>
  );
}
