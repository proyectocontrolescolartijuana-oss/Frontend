import { Edit2, Trash2 } from "lucide-react";

export default function MateriaItem({ materiaPlan, onEditar, onEliminar }) {
  const { materia, obligatoria } = materiaPlan;

  return (
    <div className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900">{materia.nombre}</h4>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{materia.clave}</span>

            <span>•</span>

            <span>{obligatoria ? "Obligatoria" : "Optativa"}</span>
          </div>
        </div>

        <div className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
          {materia.creditos} cr.
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onEditar}
          aria-label="Editar materia del plan"
          title="Editar materia"
          className="text-blue-500 transition hover:text-blue-700"
        >
          <Edit2 size={18} />
        </button>

        <button
          type="button"
          onClick={onEliminar}
          aria-label="Eliminar materia del plan"
          title="Eliminar materia"
          className="text-red-500 transition hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
