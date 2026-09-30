import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";

const getInitialForm = (grupo = {}) => ({
  nombre: grupo.nombre || "",
  id_carrera: grupo.id_carrera || "",
  id_cuatrimestre: grupo.id_cuatrimestre || "",
  turno: grupo.turno || "MATUTINO",
});

export default function GrupoForm({
  grupo,
  carreras,
  cuatrimestres,
  onSubmit,
  onCancel,
  showHeader = true,
  guardando = false,
}) {
  const [form, setForm] = useState(() => getInitialForm(grupo));
  const [error, setError] = useState("");
  const isEditing = !!grupo;
  const sinCatalogos = carreras.length === 0 || cuatrimestres.length === 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setError("Escribe el nombre del grupo.");
      return;
    }

    if (!form.id_carrera || !form.id_cuatrimestre || !form.turno) {
      setError("Selecciona carrera, cuatrimestre y turno.");
      return;
    }

    const saved = await onSubmit({
      nombre: form.nombre.trim(),
      id_carrera: Number(form.id_carrera),
      id_cuatrimestre: Number(form.id_cuatrimestre),
      turno: form.turno,
    });

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
            {isEditing ? "Editar grupo" : "Nuevo grupo"}
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
            Nombre del grupo
          </label>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. 1A"
            maxLength={50}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </div>

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
            Cuatrimestre
          </label>

          <select
            name="id_cuatrimestre"
            value={form.id_cuatrimestre}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          >
            <option value="">Selecciona un cuatrimestre</option>

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

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Turno
          </label>

          <select
            name="turno"
            value={form.turno}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          >
            <option value="MATUTINO">Matutino</option>
            <option value="VESPERTINO">Vespertino</option>
          </select>
        </div>

        {sinCatalogos && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Registra carreras y cuatrimestres antes de crear grupos.
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
            disabled={guardando || sinCatalogos}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition ${
              isEditing ? "bg-amber-500" : "bg-[#0B245B]"
            } ${
              guardando || sinCatalogos
                ? "cursor-not-allowed opacity-60"
                : "hover:opacity-90"
            }`}
          >
            {isEditing ? <Pencil size={18} /> : <Plus size={18} />}

            {guardando
              ? "Guardando..."
              : isEditing
                ? "Actualizar grupo"
                : "Agregar grupo"}
          </button>
        </div>
      </form>
    </div>
  );
}
