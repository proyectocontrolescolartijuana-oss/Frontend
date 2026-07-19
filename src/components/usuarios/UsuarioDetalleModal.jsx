import { useEffect, useState } from "react";
import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import Field from "./Field";
import {
  contactoEmergenciaInicial,
  inputClass,
  procedenciaAcademicaInicial,
  seguroMedicoInicial,
  tutorInicial,
} from "./usuarioFormConfig";
import { formatDateDDMMYYYY } from "../../utils/fechas";

const checkboxClass =
  "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500";

const emptyValue = "Sin registrar";

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">
        {value ?? emptyValue}
      </dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-4 border-t border-slate-200 px-6 py-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function EmptyText({ children = "Sin registros." }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

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

const buildLocalId = (prefix, id) => `${prefix}-${id || crypto.randomUUID()}`;

const prepararTutores = (tutores = []) => {
  if (tutores.length === 0) {
    return [{ ...tutorInicial, localId: buildLocalId("tutor") }];
  }

  return tutores.map((tutor) => ({
    ...tutorInicial,
    ...tutor,
    localId: buildLocalId("tutor", tutor.id_tutor),
  }));
};

const prepararContactos = (contactos = []) => {
  if (contactos.length === 0) {
    return [
      {
        ...contactoEmergenciaInicial,
        localId: buildLocalId("contacto"),
      },
    ];
  }

  return contactos.map((contacto) => ({
    ...contactoEmergenciaInicial,
    ...contacto,
    localId: buildLocalId("contacto", contacto.id_contacto),
  }));
};

const prepararSeguro = (seguros = []) => ({
  ...seguroMedicoInicial,
  ...(seguros[0] || {}),
});

const prepararProcedencia = (procedencia) => ({
  ...procedenciaAcademicaInicial,
  ...(procedencia || {}),
  promedio_general: procedencia?.promedio_general ?? "",
  fecha_egreso: procedencia?.fecha_egreso ?? "",
});

const limpiarTexto = (value) => value ?? "";

export default function UsuarioDetalleModal({
  detalle,
  guardando = false,
  onClose,
  onGuardarComplementarios,
}) {
  const [editando, setEditando] = useState(false);
  const [tutoresForm, setTutoresForm] = useState([]);
  const [contactosForm, setContactosForm] = useState([]);
  const [seguroForm, setSeguroForm] = useState(seguroMedicoInicial);
  const [procedenciaForm, setProcedenciaForm] = useState(
    procedenciaAcademicaInicial,
  );

  const resetEdicion = (nextDetalle = detalle) => {
    const expediente = nextDetalle?.expediente_alumno;

    setEditando(false);
    setTutoresForm(prepararTutores(expediente?.tutores));
    setContactosForm(prepararContactos(expediente?.contactos_emergencia));
    setSeguroForm(prepararSeguro(expediente?.seguros_medicos));
    setProcedenciaForm(prepararProcedencia(expediente?.procedencia_academica));
  };

  useEffect(() => {
    let activo = true;

    queueMicrotask(() => {
      if (activo) {
        resetEdicion(detalle);
      }
    });

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalle]);

  if (!detalle) return null;

  const { usuario, alumno, docente, expediente_alumno: expediente } = detalle;

  const handleTutorChange = (localId, event) => {
    const { name, value } = event.target;

    setTutoresForm((prev) =>
      prev.map((tutor) =>
        tutor.localId === localId ? { ...tutor, [name]: value } : tutor,
      ),
    );
  };

  const handleContactoChange = (localId, event) => {
    const { name, value, type, checked } = event.target;

    setContactosForm((prev) =>
      prev.map((contacto) => {
        if (contacto.localId !== localId) {
          return name === "contacto_principal" && checked
            ? { ...contacto, contacto_principal: false }
            : contacto;
        }

        return {
          ...contacto,
          [name]: type === "checkbox" ? checked : value,
        };
      }),
    );
  };

  const handleSeguroChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSeguroForm((prev) => {
      if (name === "tiene_seguro" && !checked) {
        return {
          ...prev,
          tiene_seguro: false,
          institucion: "",
          numero_poliza: "",
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleProcedenciaChange = (event) => {
    const { name, value } = event.target;

    setProcedenciaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarTutor = () => {
    setTutoresForm((prev) => [
      ...prev,
      { ...tutorInicial, localId: buildLocalId("tutor") },
    ]);
  };

  const eliminarTutorNuevo = (localId) => {
    setTutoresForm((prev) => {
      const restantes = prev.filter((tutor) => tutor.localId !== localId);
      return restantes.length > 0
        ? restantes
        : [{ ...tutorInicial, localId: buildLocalId("tutor") }];
    });
  };

  const agregarContacto = () => {
    setContactosForm((prev) => [
      ...prev,
      {
        ...contactoEmergenciaInicial,
        contacto_principal: prev.length === 0,
        localId: buildLocalId("contacto"),
      },
    ]);
  };

  const eliminarContactoNuevo = (localId) => {
    setContactosForm((prev) => {
      const restantes = prev.filter((contacto) => contacto.localId !== localId);

      if (restantes.length === 0) {
        return [
          {
            ...contactoEmergenciaInicial,
            localId: buildLocalId("contacto"),
          },
        ];
      }

      if (!restantes.some((contacto) => contacto.contacto_principal)) {
        return restantes.map((contacto, index) => ({
          ...contacto,
          contacto_principal: index === 0,
        }));
      }

      return restantes;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onGuardarComplementarios({
      tutores: tutoresForm,
      contactosEmergencia: contactosForm,
      seguroMedico: seguroForm,
      procedenciaAcademica: procedenciaForm,
    });

    setEditando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Expediente del usuario
            </h2>
            <p className="text-sm text-slate-500">ID #{usuario.id_usuario}</p>
          </div>

          <div className="flex items-center gap-2">
            {alumno && onGuardarComplementarios && (
              <button
                type="button"
                onClick={() => {
                  if (editando) {
                    resetEdicion();
                    return;
                  }

                  setEditando(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 size={16} />
                {editando ? "Ver detalle" : "Editar expediente"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <Section title="Usuario">
          <dl className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <DetailItem label="Nombre" value={usuario.nombre} />
            <DetailItem
              label="Apellido paterno"
              value={usuario.apellido_paterno}
            />
            <DetailItem
              label="Apellido materno"
              value={usuario.apellido_materno}
            />
            <DetailItem label="Correo" value={usuario.correo} />
            <DetailItem label="Teléfono" value={usuario.telefono} />
            <DetailItem label="Estado" value={usuario.estado} />
          </dl>
        </Section>

        {alumno && (
          <Section title="Alumno">
            <dl className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <DetailItem label="Matrícula" value={alumno.matricula} />
              <DetailItem
                label="Número de control"
                value={alumno.numero_control}
              />
              <DetailItem label="Estatus" value={alumno.estatus} />
              <DetailItem label="Carrera" value={alumno.carrera?.nombre} />
              <DetailItem label="Plan" value={alumno.plan?.nombre_plan} />
              <DetailItem label="CURP" value={alumno.curp} />
              <DetailItem
                label="Fecha nacimiento"
                value={formatDateDDMMYYYY(alumno.fecha_nacimiento, emptyValue)}
              />
              <DetailItem
                label="Fecha ingreso"
                value={formatDateDDMMYYYY(alumno.fecha_ingreso, emptyValue)}
              />
              <DetailItem
                label="Correo contacto"
                value={alumno.correo_contacto}
              />
            </dl>
          </Section>
        )}

        {docente && (
          <Section title="Docente">
            <dl className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <DetailItem
                label="Número empleado"
                value={docente.numero_empleado}
              />
              <DetailItem label="Especialidad" value={docente.especialidad} />
              <DetailItem
                label="Grado académico"
                value={docente.grado_academico}
              />
              <DetailItem
                label="Fecha ingreso"
                value={formatDateDDMMYYYY(docente.fecha_ingreso, emptyValue)}
              />
              <DetailItem
                label="Estado"
                value={docente.estado ? "Activo" : "Inactivo"}
              />
            </dl>
          </Section>
        )}

        {expediente && !editando && (
          <>
            <Section title="Tutores">
              {expediente.tutores.length === 0 ? (
                <EmptyText />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {expediente.tutores.map((tutor) => (
                    <div
                      key={tutor.id_tutor}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <p className="font-semibold text-slate-900">
                        {tutor.nombre}
                      </p>
                      <p className="text-sm text-slate-500">
                        {tutor.parentesco || "Sin parentesco"} -{" "}
                        {tutor.telefono || "Sin teléfono"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {tutor.correo || "Sin correo"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Contactos de emergencia">
              {expediente.contactos_emergencia.length === 0 ? (
                <EmptyText />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {expediente.contactos_emergencia.map((contacto) => (
                    <div
                      key={contacto.id_contacto}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          {contacto.nombre}
                        </p>
                        {contacto.contacto_principal && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {contacto.parentesco || "Sin parentesco"} -{" "}
                        {contacto.telefono || "Sin teléfono"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {contacto.direccion || "Sin dirección"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Seguro y procedencia">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-900">
                    Seguro médico
                  </h4>
                  {expediente.seguros_medicos.length === 0 ? (
                    <EmptyText />
                  ) : (
                    expediente.seguros_medicos.map((seguro) => (
                      <dl key={seguro.id_seguro} className="mt-3 space-y-2">
                        <DetailItem
                          label="Tiene seguro"
                          value={seguro.tiene_seguro ? "Sí" : "No"}
                        />
                        <DetailItem
                          label="Institución"
                          value={seguro.institucion}
                        />
                        <DetailItem
                          label="Póliza"
                          value={seguro.numero_poliza}
                        />
                      </dl>
                    ))
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-900">
                    Procedencia académica
                  </h4>
                  {expediente.procedencia_academica ? (
                    <dl className="mt-3 space-y-2">
                      <DetailItem
                        label="Escuela"
                        value={
                          expediente.procedencia_academica.escuela_procedencia
                        }
                      />
                      <DetailItem
                        label="Nivel"
                        value={expediente.procedencia_academica.nivel_academico}
                      />
                      <DetailItem
                        label="Promedio"
                        value={
                          expediente.procedencia_academica.promedio_general
                        }
                      />
                    </dl>
                  ) : (
                    <EmptyText />
                  )}
                </div>
              </div>
            </Section>
          </>
        )}

        {expediente && editando && (
          <form onSubmit={handleSubmit}>
            <Section title="Tutores">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={agregarTutor}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Plus size={16} />
                    Agregar tutor
                  </button>
                </div>

                {tutoresForm.map((tutor, index) => (
                  <div
                    key={tutor.localId}
                    className="space-y-4 rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Tutor {index + 1}
                      </span>

                      {!tutor.id_tutor && tutoresForm.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarTutorNuevo(tutor.localId)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Quitar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field label="Nombre del tutor">
                        <input
                          className={inputClass}
                          name="nombre"
                          value={limpiarTexto(tutor.nombre)}
                          onChange={(event) =>
                            handleTutorChange(tutor.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Parentesco">
                        <input
                          className={inputClass}
                          name="parentesco"
                          value={limpiarTexto(tutor.parentesco)}
                          onChange={(event) =>
                            handleTutorChange(tutor.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Teléfono">
                        <input
                          className={inputClass}
                          name="telefono"
                          value={limpiarTexto(tutor.telefono)}
                          onChange={(event) =>
                            handleTutorChange(tutor.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Correo">
                        <input
                          className={inputClass}
                          type="email"
                          name="correo"
                          value={limpiarTexto(tutor.correo)}
                          onChange={(event) =>
                            handleTutorChange(tutor.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Ocupación">
                        <input
                          className={inputClass}
                          name="ocupacion"
                          value={limpiarTexto(tutor.ocupacion)}
                          onChange={(event) =>
                            handleTutorChange(tutor.localId, event)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Contactos de emergencia">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={agregarContacto}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Plus size={16} />
                    Agregar contacto
                  </button>
                </div>

                {contactosForm.map((contacto, index) => (
                  <div
                    key={contacto.localId}
                    className="space-y-4 rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Contacto {index + 1}
                      </span>

                      {!contacto.id_contacto && contactosForm.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            eliminarContactoNuevo(contacto.localId)
                          }
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Quitar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field label="Nombre del contacto">
                        <input
                          className={inputClass}
                          name="nombre"
                          value={limpiarTexto(contacto.nombre)}
                          onChange={(event) =>
                            handleContactoChange(contacto.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Parentesco">
                        <input
                          className={inputClass}
                          name="parentesco"
                          value={limpiarTexto(contacto.parentesco)}
                          onChange={(event) =>
                            handleContactoChange(contacto.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Teléfono">
                        <input
                          className={inputClass}
                          name="telefono"
                          value={limpiarTexto(contacto.telefono)}
                          onChange={(event) =>
                            handleContactoChange(contacto.localId, event)
                          }
                        />
                      </Field>
                      <Field label="Correo">
                        <input
                          className={inputClass}
                          type="email"
                          name="correo"
                          value={limpiarTexto(contacto.correo)}
                          onChange={(event) =>
                            handleContactoChange(contacto.localId, event)
                          }
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Dirección">
                          <textarea
                            className={inputClass}
                            name="direccion"
                            value={limpiarTexto(contacto.direccion)}
                            onChange={(event) =>
                              handleContactoChange(contacto.localId, event)
                            }
                            rows={3}
                          />
                        </Field>
                      </div>
                      <CheckboxField
                        label="Contacto principal"
                        name="contacto_principal"
                        checked={Boolean(contacto.contacto_principal)}
                        onChange={(event) =>
                          handleContactoChange(contacto.localId, event)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Seguro y procedencia">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-900">
                    Seguro médico
                  </h4>

                  <CheckboxField
                    label="Tiene seguro"
                    name="tiene_seguro"
                    checked={Boolean(seguroForm.tiene_seguro)}
                    onChange={handleSeguroChange}
                  />

                  {seguroForm.tiene_seguro && (
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Institución" required>
                        <input
                          className={inputClass}
                          name="institucion"
                          value={limpiarTexto(seguroForm.institucion)}
                          onChange={handleSeguroChange}
                          required
                        />
                      </Field>
                      <Field label="Número de póliza" required>
                        <input
                          className={inputClass}
                          name="numero_poliza"
                          value={limpiarTexto(seguroForm.numero_poliza)}
                          onChange={handleSeguroChange}
                          required
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-900">
                    Procedencia académica
                  </h4>

                  <Field label="Escuela de procedencia">
                    <input
                      className={inputClass}
                      name="escuela_procedencia"
                      value={limpiarTexto(procedenciaForm.escuela_procedencia)}
                      onChange={handleProcedenciaChange}
                    />
                  </Field>
                  <Field label="Nivel académico">
                    <select
                      className={inputClass}
                      name="nivel_academico"
                      value={limpiarTexto(procedenciaForm.nivel_academico)}
                      onChange={handleProcedenciaChange}
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
                      value={limpiarTexto(procedenciaForm.estado_procedencia)}
                      onChange={handleProcedenciaChange}
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
                      value={limpiarTexto(procedenciaForm.promedio_general)}
                      onChange={handleProcedenciaChange}
                    />
                  </Field>
                  <Field label="Fecha de egreso">
                    <input
                      className={inputClass}
                      type="date"
                      name="fecha_egreso"
                      value={limpiarTexto(procedenciaForm.fecha_egreso)}
                      onChange={handleProcedenciaChange}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => resetEdicion()}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Save size={16} />
                {guardando ? "Guardando..." : "Guardar expediente"}
              </button>
            </div>
          </form>
        )}

        {expediente && !editando && (
          <Section title="Documentos">
            {expediente.documentos_alumno.length === 0 ? (
              <EmptyText />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        Archivo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        Validado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expediente.documentos_alumno.map((documento) => (
                      <tr
                        key={documento.id_documento}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {documento.tipo_documento?.nombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {documento.nombre_archivo}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {documento.validado ? "Sí" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
