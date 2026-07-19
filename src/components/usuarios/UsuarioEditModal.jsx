import { useState } from "react";
import { Save, X } from "lucide-react";
import Field from "./Field";
import { inputClass } from "./usuarioFormConfig";
import { nombreApellidosPrimero } from "../../utils/nombres";

const getInitialForm = (usuario) => ({
  nombre: usuario?.nombre || "",
  apellido_paterno: usuario?.apellido_paterno || "",
  apellido_materno: usuario?.apellido_materno || "",
  correo: usuario?.correo || "",
  telefono: usuario?.telefono || "",
  password: "",
});

export default function UsuarioEditModal({
  usuario,
  guardando,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => getInitialForm(usuario));

  if (!usuario) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "telefono" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/^\d{10}$/.test(form.telefono)) {
      alert("El teléfono debe contener exactamente 10 dígitos.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Editar usuario
            </h2>

            <p className="text-sm text-slate-500">
              {nombreApellidosPrimero(usuario, "Usuario sin nombre")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2">
          <Field label="Nombre" required>
            <input
              className={inputClass}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Apellido paterno" required>
            <input
              className={inputClass}
              name="apellido_paterno"
              value={form.apellido_paterno}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Apellido materno">
            <input
              className={inputClass}
              name="apellido_materno"
              value={form.apellido_materno}
              onChange={handleChange}
            />
          </Field>

          <Field label="Teléfono" required>
            <input
              className={inputClass}
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              title="El teléfono debe contener exactamente 10 dígitos."
              required
            />
          </Field>

          <Field label="Correo institucional" required>
            <input
              className={inputClass}
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Nueva contraseña">
            <input
              className={inputClass}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Dejar vacía para conservar la actual"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B245B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={18} />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
