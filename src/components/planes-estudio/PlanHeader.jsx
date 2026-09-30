import { Plus } from "lucide-react";

export default function PlanHeader({ onCrearPlan, totalPlanes }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-2xl font-bold">Gestión de planes de estudio</h2>

        <p className="mt-1 text-sm text-slate-300">
          Administra carreras, cuatrimestres y materias.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
          {totalPlanes} planes registrados
        </div>

        <button
          onClick={onCrearPlan}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:scale-[1.02]"
        >
          <Plus size={18} />
          Nuevo plan
        </button>
      </div>
    </div>
  );
}
