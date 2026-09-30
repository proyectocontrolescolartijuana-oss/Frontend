import { useState } from "react";
import { Save, X } from "lucide-react";

const getInitialForm = (materiaPlan, cuatrimestreId) => ({
  id_materia: materiaPlan?.materia?.id_materia || "",
  id_cuatrimestre:
    materiaPlan?.id_cuatrimestre || cuatrimestreId || "",
  obligatoria: materiaPlan?.obligatoria ?? true,
});

export default function PlanMateriaModal({
  open,
  onClose,
  onSubmit,
  materiaPlan,
  cuatrimestreId,
  materias,
  cuatrimestres,
  guardando,
}) {
  const [form, setForm] = useState(() =>
    getInitialForm(materiaPlan, cuatrimestreId),
  );

  if (!open) return null;

  const isEditing = !!materiaPlan;
  const sinMaterias = materias.length === 0;
  const sinCuatrimestres = cuatrimestres.length === 0;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      id_materia: Number(form.id_materia),
      id_cuatrimestre: Number(form.id_cuatrimestre),
      obligatoria: form.obligatoria,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Editar materia del plan" : "Agregar materia al plan"}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Materia
            </label>

            <select
              name="id_materia"
              value={form.id_materia}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
              disabled={sinMaterias}
            >
              <option value="">
                {sinMaterias ? "No hay materias disponibles" : "Selecciona una materia"}
              </option>
              {materias.map((materia) => (
                <option key={materia.id_materia} value={materia.id_materia}>
                  {materia.clave ? `${materia.clave} - ` : ""}
                  {materia.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Cuatrimestre
            </label>

            <select
              name="id_cuatrimestre"
              value={form.id_cuatrimestre}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
              disabled={sinCuatrimestres}
            >
              <option value="">
                {sinCuatrimestres
                  ? "No hay cuatrimestres disponibles"
                  : "Selecciona un cuatrimestre"}
              </option>
              {cuatrimestres.map((cuatrimestre) => (
                <option
                  key={cuatrimestre.id_cuatrimestre}
                  value={cuatrimestre.id_cuatrimestre}
                >
                  {cuatrimestre.nombre}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="obligatoria"
              checked={form.obligatoria}
              onChange={handleChange}
            />
            Materia obligatoria
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B245B] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={guardando || sinMaterias || sinCuatrimestres}
            >
              <Save size={18} />
              {guardando ? "Guardando..." : "Guardar materia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
