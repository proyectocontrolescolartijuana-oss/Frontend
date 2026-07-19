import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";

const getInitialForm = (carrera) => ({
  clave: carrera?.clave || "",
  rvoe: carrera?.rvoe || "",
  nombre: carrera?.nombre || "",
  nivel: carrera?.nivel || "LICENCIATURA",
  duracion_cuatrimestres: carrera?.duracion_cuatrimestres || 9,
  estado: carrera?.estado ?? true,
});

export default function CarreraForm({
  onSubmit,
  carrera,
  onCancel,
  showHeader = true,
}) {
  const [form, setForm] = useState(() => getInitialForm(carrera));

  const isEditing = !!carrera;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "duracion_cuatrimestres" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit(form);

    if (!isEditing) {
      setForm(getInitialForm());
    }
  };

  return (
    <div
      className={
        showHeader
          ? "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          : ""
      }
    >
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? "Editar carrera" : "Nueva carrera"}
          </h2>

          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancelar edicion"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={showHeader ? "mt-6 space-y-5" : "space-y-5"}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Clave
          </label>

          <input
            type="text"
            name="clave"
            value={form.clave}
            onChange={handleChange}
            placeholder="Ej. 260125"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            RVOE
          </label>

          <input
            type="text"
            name="rvoe"
            value={form.rvoe}
            onChange={handleChange}
            placeholder="Ej. RVOE-BC-053-M2/14"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nombre completo
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Ingeniería en Sistemas"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nivel
          </label>

          <select
            name="nivel"
            value={form.nivel}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          >
            <option value="TSU">TSU</option>
            <option value="LICENCIATURA">Licenciatura</option>
            <option value="INGENIERIA">Ingeniería</option>
            <option value="MAESTRIA">Maestría</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Duración en Cuatrimestres
          </label>

          <input
            type="number"
            name="duracion_cuatrimestres"
            value={form.duracion_cuatrimestres}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
            min={1}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition hover:opacity-90 ${
              isEditing ? "bg-amber-500" : "bg-[#0B245B]"
            }`}
          >
            {isEditing ? <Pencil size={18} /> : <Plus size={18} />}

            {isEditing ? "Actualizar carrera" : "Agregar carrera"}
          </button>

          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
