import { X } from "lucide-react";
import PeriodoForm from "./PeriodoForm";

export default function PeriodoModal({ open, onClose, onSubmit, periodo }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {periodo ? "Editar periodo" : "Nuevo periodo"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <PeriodoForm
          key={periodo?.id_periodo ?? "nuevo"}
          periodo={periodo}
          onSubmit={onSubmit}
          onCancel={onClose}
          showHeader={false}
        />
      </div>
    </div>
  );
}
