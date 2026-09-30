import { useState } from "react";
import { Save, X } from "lucide-react";

const getInitialForm = (plan) => ({
  id_carrera: plan?.id_carrera || plan?.carrera?.id_carrera || "",
  nombre_plan: plan?.nombre_plan || "",
  fecha_inicio: plan?.fecha_inicio || "",
  fecha_fin: plan?.fecha_fin || "",
  vigente: plan?.vigente ?? true,
});

export default function PlanModal({
  open,
  onClose,
  onSubmit,
  plan,
  carreras,
  guardando,
}) {
  const [form, setForm] = useState(() => getInitialForm(plan));

  if (!open) return null;

  const isEditing = !!plan;

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
      ...form,
      id_carrera: Number(form.id_carrera),
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Editar plan" : "Nuevo plan"}
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
              Carrera
            </label>

            <select
              name="id_carrera"
              value={form.id_carrera}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            >
              <option value="">Selecciona una carrera</option>
              {carreras.map((carrera) => (
                <option key={carrera.id_carrera} value={carrera.id_carrera}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nombre del plan
            </label>

            <input
              type="text"
              name="nombre_plan"
              value={form.nombre_plan}
              onChange={handleChange}
              placeholder="Ej. Plan 2026"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fecha de inicio
              </label>

              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fecha de fin
              </label>

              <input
                type="date"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="vigente"
              checked={form.vigente}
              onChange={handleChange}
            />
            Plan vigente
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
              disabled={guardando || carreras.length === 0}
            >
              <Save size={18} />
              {guardando ? "Guardando..." : "Guardar plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
