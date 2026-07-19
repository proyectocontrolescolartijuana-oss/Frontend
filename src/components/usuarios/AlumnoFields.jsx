import Field from "./Field";
import { inputClass } from "./usuarioFormConfig";

const lockedInputClass =
  "w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none ring-1 ring-slate-200";

export default function AlumnoFields({
  form,
  carreras,
  planesDisponibles,
  gruposDisponibles,
  periodos,
  matriculaSugerida,
  onChange,
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Datos de alumno
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Matricula" required>
          <input
            className={lockedInputClass}
            name="matricula"
            value={matriculaSugerida}
            readOnly
            aria-readonly="true"
            tabIndex={-1}
          />
        </Field>

        <Field label="Número de control">
          <input
            className={inputClass}
            name="numero_control"
            value={form.numero_control}
            onChange={onChange}
          />
        </Field>

        <Field label="Carrera" required>
          <select
            className={inputClass}
            name="id_carrera"
            value={form.id_carrera}
            onChange={onChange}
            required
          >
            <option value="">Selecciona carrera</option>
            {carreras.map((carrera) => (
              <option key={carrera.id_carrera} value={carrera.id_carrera}>
                {carrera.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Plan de estudio" required>
          <select
            className={inputClass}
            name="id_plan"
            value={form.id_plan}
            onChange={onChange}
            required
            disabled={!form.id_carrera}
          >
            <option value="">Selecciona plan</option>
            {planesDisponibles.map((plan) => (
              <option key={plan.id_plan} value={plan.id_plan}>
                {plan.nombre_plan}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Grupo" required>
          <select
            className={inputClass}
            name="id_grupo"
            value={form.id_grupo}
            onChange={onChange}
            required
            disabled={!form.id_carrera}
          >
            <option value="">Selecciona grupo</option>
            {gruposDisponibles.map((grupo) => (
              <option key={grupo.id_grupo} value={grupo.id_grupo}>
                {[
                  grupo.nombre || `Grupo ${grupo.id_grupo}`,
                  grupo.turno,
                  grupo.id_cuatrimestre
                    ? `Cuatrimestre ${grupo.id_cuatrimestre}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" - ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Periodo" required>
          <select
            className={inputClass}
            name="id_periodo"
            value={form.id_periodo}
            onChange={onChange}
            required
          >
            <option value="">Selecciona periodo</option>
            {periodos.map((periodo) => (
              <option key={periodo.id_periodo} value={periodo.id_periodo}>
                {[
                  periodo.nombre || `Periodo ${periodo.id_periodo}`,
                  periodo.estado === "ACTIVO" ? "ACTIVO" : null,
                ]
                  .filter(Boolean)
                  .join(" - ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha de nacimiento" required>
          <input
            className={inputClass}
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Fecha de ingreso" required>
          <input
            className={inputClass}
            type="date"
            name="fecha_ingreso"
            value={form.fecha_ingreso}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Sexo" required>
          <select
            className={inputClass}
            name="sexo"
            value={form.sexo}
            onChange={onChange}
            required
          >
            <option value="" disabled>
              Sin especificar
            </option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </Field>

        <Field label="CURP" required>
          <input
            className={inputClass}
            name="curp"
            value={form.curp}
            onChange={onChange}
            maxLength={18}
            required
          />
        </Field>

        <Field label="Nacionalidad" required>
          <input
            className={inputClass}
            name="nacionalidad"
            value={form.nacionalidad}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Correo de contacto" required>
          <input
            className={inputClass}
            type="email"
            name="correo_contacto"
            value={form.correo_contacto}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Ciudad de nacimiento" required>
          <input
            className={inputClass}
            name="ciudad_nacimiento"
            value={form.ciudad_nacimiento}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Municipio de nacimiento" required>
          <input
            className={inputClass}
            name="municipio_nacimiento"
            value={form.municipio_nacimiento}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Ciudad" required>
          <input
            className={inputClass}
            name="ciudad"
            value={form.ciudad}
            onChange={onChange}
            required
          />
        </Field>

        <Field label="Estado" required>
          <input
            className={inputClass}
            name="estado"
            value={form.estado}
            onChange={onChange}
            required
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Dirección" required>
            <textarea
              className={inputClass}
              name="direccion"
              value={form.direccion}
              onChange={onChange}
              rows={3}
              required
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
