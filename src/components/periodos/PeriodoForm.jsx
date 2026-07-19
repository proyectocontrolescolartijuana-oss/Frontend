import { useState } from "react";
import { X } from "lucide-react";

const getInitialForm = (periodo) => ({
  nombre: periodo?.nombre || "",
  fecha_inicio: periodo?.fecha_inicio || "",
  fecha_fin: periodo?.fecha_fin || "",
  estado: periodo?.estado || "ACTIVO",
});

export default function PeriodoForm({
  periodo,
  onSubmit,
  onCancel,
  showHeader = true,
}) {
  const [form, setForm] = useState(() => getInitialForm(periodo));
  const [error, setError] = useState("");
  const isEditing = !!periodo;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.fecha_fin < form.fecha_inicio) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
    };

    if (isEditing) {
      payload.estado = form.estado;
    }

    const saved = await onSubmit(payload);

    if (saved === false) {
      return;
    }

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
            {isEditing ? "Editar periodo" : "Nuevo periodo"}
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
            Nombre del periodo
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder="Ej: Enero-Abril 2026"
            maxLength={50}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de inicio
            </label>

            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de fin
            </label>

            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>
        </div>

        {isEditing && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Estado administrativo
            </label>

            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="CERRADO">CERRADO</option>
            </select>

            {periodo?.estado !== "CERRADO" && form.estado === "CERRADO" && (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Al cerrar este periodo, los grupos con materias asignadas en el
                periodo avanzaran al siguiente cuatrimestre.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="rounded-xl bg-[#0B245B] px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            {isEditing ? "Actualizar periodo" : "Guardar periodo"}
          </button>
        </div>
      </form>
    </div>
  );
}
