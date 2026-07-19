import Field from "./Field";
import { DEFAULT_USER_PASSWORD, inputClass } from "./usuarioFormConfig";

const lockedInputClass =
  "w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none ring-1 ring-slate-200";

export default function DatosGeneralesFields({ form, onChange }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Datos generales
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre" required>
          <input
            className={inputClass}
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Apellido paterno" required>
          <input
            className={inputClass}
            name="apellido_paterno"
            value={form.apellido_paterno}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Apellido materno">
          <input
            className={inputClass}
            name="apellido_materno"
            value={form.apellido_materno}
            onChange={onChange}
          />
        </Field>

        <Field label="Teléfono" required>
          <input
            className={inputClass}
            type="tel"
            name="telefono"
            value={form.telefono}
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            required
            onChange={(e) => {
              const soloNumeros = e.target.value.replace(/\D/g, "");
              onChange({
                target: {
                  name: "telefono",
                  value: soloNumeros,
                },
              });
            }}
          />
        </Field>

        <Field label="Correo Institucional" required>
          <input
            className={inputClass}
            type="email"
            name="correo"
            value={form.correo}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Contraseña default" required>
          <input
            className={lockedInputClass}
            type="text"
            name="password"
            value={form.password || DEFAULT_USER_PASSWORD}
            readOnly
            aria-readonly="true"
            required
            minLength={6}
          />
        </Field>
      </div>
    </section>
  );
}
