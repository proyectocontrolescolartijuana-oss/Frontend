import { X } from "lucide-react";
import MateriaForm from "./MateriaForm";

export default function MateriaModal({ open, onClose, onSubmit, materia }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {materia ? "Editar materia" : "Nueva materia"}
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

        <MateriaForm
          key={materia?.id_materia ?? "nueva"}
          materia={materia}
          onSubmit={onSubmit}
          onCancel={onClose}
          showHeader={false}
        />
      </div>
    </div>
  );
}
