import { ArrowLeft } from "lucide-react";
import FormAlert from "../usuarios/FormAlert";

export default function TitulacionNoEncontrada({ onBack }) {
  return (
    <div className="space-y-6 p-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Volver
      </button>
      <FormAlert type="error">No se encontró el alumno solicitado.</FormAlert>
    </div>
  );
}
