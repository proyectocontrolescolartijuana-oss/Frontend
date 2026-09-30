import CuatrimestreCard from "./CuatrimestreCard";
import { Plus } from "lucide-react";

export default function PlanCard({
  cuatrimestre,
  onAgregarMateria,
  onEditarMateria,
  onEliminarMateria,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {cuatrimestre.nombre}
          </h3>

          <div className="mt-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {cuatrimestre.materias.length} materias
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAgregarMateria(cuatrimestre.id_cuatrimestre)}
          aria-label="Agregar materia"
          title="Agregar materia"
          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {cuatrimestre.materias.map((materiaPlan) => (
          <CuatrimestreCard
            key={materiaPlan.id_plan_materia}
            materiaPlan={materiaPlan}
            onEditar={() => onEditarMateria(materiaPlan, cuatrimestre)}
            onEliminar={() => onEliminarMateria(materiaPlan)}
          />
        ))}
      </div>
    </div>
  );
}
