import { Download, FileText } from "lucide-react";

export default function FormatoExtraordinarioHeader({ onDownload }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Formato de evaluaciones extraordinarias
          </h1>
          <p className="mt-1 text-slate-500">
            Busca por matricula, no. de control o nombre para rellenar los
            campos disponibles.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <Download size={18} />
        Descargar PDF
      </button>
    </div>
  );
}
