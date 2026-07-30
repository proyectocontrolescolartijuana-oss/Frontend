import { useState } from "react";
import { Image, Plus, Pencil, Upload, X } from "lucide-react";

const getInitialForm = (carrera) => ({
  clave: carrera?.clave || "",
  rvoe: carrera?.rvoe || "",
  nombre: carrera?.nombre || "",
  nivel: carrera?.nivel || "LICENCIATURA",
  duracion_cuatrimestres: carrera?.duracion_cuatrimestres || 9,
  fecha_autorizacion: carrera?.fecha_autorizacion || "",
  estado: carrera?.estado ?? true,
  logoFile: null,
  logoPreview: carrera?.logo || "",
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

  const handleLogoChange = (e) => {
    const archivo = e.target.files?.[0] || null;

    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        logoFile: archivo,
        logoPreview: reader.result || "",
      }));
    };

    reader.readAsDataURL(archivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      clave: form.clave,
      rvoe: form.rvoe,
      nombre: form.nombre,
      nivel: form.nivel,
      duracion_cuatrimestres: form.duracion_cuatrimestres,
      fecha_autorizacion: form.fecha_autorizacion,
      estado: form.estado,
      logoFile: form.logoFile,
    };

    await onSubmit(payload);

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
            placeholder="Ej. BC-053-M2/14"
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
            placeholder="Ej. Licenciatura en Nutrición"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Logo de la carrera
          </label>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {form.logoPreview ? (
                  <img
                    src={form.logoPreview}
                    alt="Logo de la carrera"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Image size={28} className="text-slate-400" />
                )}
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100">
                <Upload size={18} />
                Subir logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>

            {form.logoFile && (
              <p className="text-sm text-slate-500">{form.logoFile.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Fecha de autorización
          </label>

          <input
            type="date"
            name="fecha_autorizacion"
            value={form.fecha_autorizacion}
            onChange={handleChange}
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
