import { Plus, Trash2 } from "lucide-react";
import Field from "./Field";
import { inputClass } from "./usuarioFormConfig";

const checkboxClass =
  "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500";

function CheckboxField({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={checkboxClass}
      />
      {label}
    </label>
  );
}

export default function AlumnoComplementariosFields({
  tutorForm,
  contactosEmergenciaForm = [],
  seguroMedicoForm,
  procedenciaAcademicaForm,
  onTutorChange,
  onContactoEmergenciaChange,
  onAgregarContactoEmergencia,
  onEliminarContactoEmergencia,
  onSeguroMedicoChange,
  onProcedenciaAcademicaChange,
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Tutor
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nombre del tutor">
            <input
              className={inputClass}
              name="nombre"
              value={tutorForm.nombre}
              onChange={onTutorChange}
            />
          </Field>

          <Field label="Parentesco">
            <input
              className={inputClass}
              name="parentesco"
              value={tutorForm.parentesco}
              onChange={onTutorChange}
            />
          </Field>

          <Field label="Teléfono">
            <input
              className={inputClass}
              name="telefono"
              value={tutorForm.telefono}
              onChange={onTutorChange}
            />
          </Field>

          <Field label="Correo">
            <input
              className={inputClass}
              type="email"
              name="correo"
              value={tutorForm.correo}
              onChange={onTutorChange}
            />
          </Field>

          <Field label="Ocupación">
            <input
              className={inputClass}
              name="ocupacion"
              value={tutorForm.ocupacion}
              onChange={onTutorChange}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Contactos de emergencia
          </h3>

          <button
            type="button"
            onClick={onAgregarContactoEmergencia}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {contactosEmergenciaForm.map((contacto, index) => (
          <div
            key={contacto.id}
            className="space-y-4 rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Contacto {index + 1}
              </span>

              {contactosEmergenciaForm.length > 1 && (
                <button
                  type="button"
                  onClick={() => onEliminarContactoEmergencia(contacto.id)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nombre del contacto">
                <input
                  className={inputClass}
                  name="nombre"
                  value={contacto.nombre}
                  onChange={(event) =>
                    onContactoEmergenciaChange(contacto.id, event)
                  }
                />
              </Field>

              <Field label="Parentesco">
                <input
                  className={inputClass}
                  name="parentesco"
                  value={contacto.parentesco}
                  onChange={(event) =>
                    onContactoEmergenciaChange(contacto.id, event)
                  }
                />
              </Field>

              <Field label="Teléfono">
                <input
                  className={inputClass}
                  name="telefono"
                  value={contacto.telefono}
                  onChange={(event) =>
                    onContactoEmergenciaChange(contacto.id, event)
                  }
                />
              </Field>

              <Field label="Correo">
                <input
                  className={inputClass}
                  type="email"
                  name="correo"
                  value={contacto.correo}
                  onChange={(event) =>
                    onContactoEmergenciaChange(contacto.id, event)
                  }
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Dirección">
                  <textarea
                    className={inputClass}
                    name="direccion"
                    value={contacto.direccion}
                    onChange={(event) =>
                      onContactoEmergenciaChange(contacto.id, event)
                    }
                    rows={3}
                  />
                </Field>
              </div>

              <CheckboxField
                label="Contacto principal"
                name="contacto_principal"
                checked={contacto.contacto_principal}
                onChange={(event) =>
                  onContactoEmergenciaChange(contacto.id, event)
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Seguro medico
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckboxField
            label="Tiene seguro"
            name="tiene_seguro"
            checked={seguroMedicoForm.tiene_seguro}
            onChange={onSeguroMedicoChange}
          />

          {seguroMedicoForm.tiene_seguro && (
            <>
              <Field label="Institución" required>
                <input
                  className={inputClass}
                  name="institucion"
                  value={seguroMedicoForm.institucion}
                  onChange={onSeguroMedicoChange}
                  required
                />
              </Field>

              <Field label="Número de póliza" required>
                <input
                  className={inputClass}
                  name="numero_poliza"
                  value={seguroMedicoForm.numero_poliza}
                  onChange={onSeguroMedicoChange}
                  required
                />
              </Field>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Procedencia académica
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Escuela de procedencia">
            <input
              className={inputClass}
              name="escuela_procedencia"
              value={procedenciaAcademicaForm.escuela_procedencia}
              onChange={onProcedenciaAcademicaChange}
            />
          </Field>

          <Field label="Nivel académico">
            <select
              className={inputClass}
              name="nivel_academico"
              value={procedenciaAcademicaForm.nivel_academico}
              onChange={onProcedenciaAcademicaChange}
            >
              <option value="">Selecciona nivel</option>
              <option value="BACHILLERATO">Bachillerato</option>
              <option value="UNIVERSIDAD">Universidad</option>
              <option value="OTRO">Otro</option>
            </select>
          </Field>

          <Field label="Estado de procedencia">
            <input
              className={inputClass}
              name="estado_procedencia"
              value={procedenciaAcademicaForm.estado_procedencia}
              onChange={onProcedenciaAcademicaChange}
            />
          </Field>

          <Field label="Promedio general">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min={0}
              max={100}
              name="promedio_general"
              value={procedenciaAcademicaForm.promedio_general}
              onChange={onProcedenciaAcademicaChange}
            />
          </Field>

          <Field label="Fecha de egreso">
            <input
              className={inputClass}
              type="date"
              name="fecha_egreso"
              value={procedenciaAcademicaForm.fecha_egreso}
              onChange={onProcedenciaAcademicaChange}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
