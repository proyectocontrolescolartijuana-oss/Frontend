import { useState } from "react";
import { Save, X } from "lucide-react";
import DocenteFields from "./DocenteFields";
import Field from "./Field";
import { docenteInicial, inputClass } from "./usuarioFormConfig";
import { nombreApellidosPrimero } from "../../utils/nombres";

const getInitialForm = (usuario) => ({
  nombre: usuario?.nombre || "",
  apellido_paterno: usuario?.apellido_paterno || "",
  apellido_materno: usuario?.apellido_materno || "",
  correo: usuario?.correo || "",
  telefono: usuario?.telefono || "",
  numero_control: usuario?.alumno?.numero_control || "",
  numero_empleado: usuario?.docente?.numero_empleado || "",
  especialidad: usuario?.docente?.especialidad || "",
  grado_academico: usuario?.docente?.grado_academico || "",
  fecha_ingreso: usuario?.docente?.fecha_ingreso || "",
  estado_docente: usuario?.docente?.estado ?? true,
  password: "",
});

const usuarioTieneRol = (usuario, rol) =>
  usuario?.roles?.some((role) => role.nombre === rol);

const usuarioEsAlumno = (usuario) =>
  Boolean(usuario?.alumno) || usuarioTieneRol(usuario, "ALUMNO");

const usuarioEsDocente = (usuario) =>
  Boolean(usuario?.docente) || usuarioTieneRol(usuario, "DOCENTE");

export default function UsuarioEditModal({
  usuario,
  guardando,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => getInitialForm(usuario));

  if (!usuario) return null;

  const esAlumno = usuarioEsAlumno(usuario);
  const esDocente = usuarioEsDocente(usuario);
  const docenteForm = {
    ...docenteInicial,
    numero_empleado: form.numero_empleado,
    especialidad: form.especialidad,
    grado_academico: form.grado_academico,
    fecha_ingreso: form.fecha_ingreso,
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "telefono"
            ? value.replace(/\D/g, "").slice(0, 10)
            : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/^\d{10}$/.test(form.telefono)) {
      alert("El telefono debe contener exactamente 10 digitos.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
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

        <div className="space-y-6 px-6 py-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <Field label="Telefono" required>
              <input
                className={inputClass}
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                title="El telefono debe contener exactamente 10 digitos."
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

            {esAlumno && (
              <Field label="Numero de control">
                <input
                  className={inputClass}
                  name="numero_control"
                  value={form.numero_control}
                  onChange={handleChange}
                  disabled={!usuario.alumno}
                  placeholder={
                    usuario.alumno ? "Ej. 260001" : "Sin expediente de alumno"
                  }
                />
              </Field>
            )}

            <Field label="Nueva contrasena">
              <input
                className={inputClass}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Dejar vacia para conservar la actual"
              />
            </Field>
          </section>

          {esDocente && (
            <section className="rounded-lg border border-slate-200 p-4">
              <DocenteFields form={docenteForm} onChange={handleChange} />
              <label className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="estado_docente"
                  checked={Boolean(form.estado_docente)}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Docente activo
              </label>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
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
