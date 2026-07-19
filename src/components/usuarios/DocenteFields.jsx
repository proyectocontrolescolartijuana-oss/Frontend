import Field from "./Field";
import { inputClass } from "./usuarioFormConfig";

export default function DocenteFields({ form, onChange }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Datos de docente
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Número de empleado">
          <input
            className={inputClass}
            name="numero_empleado"
            value={form.numero_empleado}
            onChange={onChange}
          />
        </Field>

        <Field label="Grado académico">
          <input
            className={inputClass}
            name="grado_academico"
            value={form.grado_academico}
            onChange={onChange}
          />
        </Field>

        <Field label="Especialidad">
          <input
            className={inputClass}
            name="especialidad"
            value={form.especialidad}
            onChange={onChange}
          />
        </Field>

        <Field label="Fecha de ingreso">
          <input
            className={inputClass}
            type="date"
            name="fecha_ingreso"
            value={form.fecha_ingreso}
            onChange={onChange}
          />
        </Field>
      </div>
    </section>
  );
}
