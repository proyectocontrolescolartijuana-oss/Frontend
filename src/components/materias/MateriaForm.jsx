import { useState } from "react";
import { X } from "lucide-react";

const getInitialForm = (materia) => ({
  clave: materia?.clave || "",
  nombre: materia?.nombre || "",
  creditos: materia?.creditos || "",
  estado: materia?.estado ?? true,
});

export default function MateriaForm({
  materia,
  onSubmit,
  onCancel,
  showHeader = true,
}) {
  const [form, setForm] = useState(() => getInitialForm(materia));
  const isEditing = !!materia;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit({
      ...form,
      creditos: Number(form.creditos),
    });

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
            {isEditing ? "Editar materia" : "Nueva materia"}
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
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Clave
          </label>

          <input
            type="text"
            name="clave"
            value={form.clave}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder="Ej: INF101"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder="Nombre de la materia"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Créditos
          </label>

          <input
            type="number"
            step="0.01"
            name="creditos"
            value={form.creditos}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder="0"
            min={0.1}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="estado"
            checked={form.estado}
            onChange={handleChange}
          />

          <label className="text-sm text-slate-700">Materia activa</label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="rounded-xl px-6 py-3 font-medium text-white transition hover:bg-blue-700 bg-[#0B245B]"
          >
            {materia ? "Actualizar materia" : "Guardar materia"}
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
