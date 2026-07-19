import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  GraduationCap,
  IdCard,
  KeyRound,
  LockKeyhole,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import FormAlert from "../components/usuarios/FormAlert";
import {
  actualizarMiPassword,
  obtenerMiExpediente,
} from "../services/authService";
import { formatDateDDMMYYYY } from "../utils/fechas";

const emptyValue = "Sin registrar";

const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.loc?.join("."))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo completar la operación.";
};

const joinName = (usuario) =>
  [usuario?.nombre, usuario?.apellido_paterno, usuario?.apellido_materno]
    .filter(Boolean)
    .join(" ");

const getInitials = (usuario) => {
  const first = usuario?.nombre?.[0] ?? "";
  const second = usuario?.apellido_paterno?.[0] ?? "";

  return (first + second).toUpperCase() || "?";
};

const formatDate = (value) => {
  return formatDateDDMMYYYY(value, emptyValue);
};

const formatSex = (value) => {
  const normalizedValue = value?.toUpperCase();

  if (normalizedValue === "M") return "Masculino";
  if (normalizedValue === "F") return "Femenino";

  return value;
};

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-100/60">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value || emptyValue}
      </dd>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0B245B]">
            <Icon size={18} />
          </div>
        )}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  autoComplete,
  minLength,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0B245B] focus:ring-2 focus:ring-blue-100"
        minLength={minLength}
        name={name}
        onChange={onChange}
        required
        type="password"
        value={value}
      />
    </label>
  );
}

export default function AlumnoPerfilPage() {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    password_actual: "",
    nueva_password: "",
    confirmar_password: "",
  });

  useEffect(() => {
    let activo = true;

    obtenerMiExpediente()
      .then((response) => {
        if (activo) {
          setDetalle(response);
        }
      })
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (activo) {
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const usuario = detalle?.usuario;
  const alumno = detalle?.alumno;
  const expediente = detalle?.expediente_alumno;

  const nombreCompleto = useMemo(
    () => joinName(usuario) || usuario?.nombre || emptyValue,
    [usuario],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");
    setError("");

    if (form.nueva_password !== form.confirmar_password) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    try {
      setSaving(true);
      await actualizarMiPassword({
        password_actual: form.password_actual,
        nueva_password: form.nueva_password,
      });
      setMensaje("Contraseña actualizada correctamente.");
      setForm({
        password_actual: "",
        nueva_password: "",
        confirmar_password: "",
      });
    } catch (requestError) {
      console.error(requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0B245B] text-lg font-bold text-white">
              {getInitials(usuario)}
            </div>
            <div>
              <h1 className="text-4xl font-display text-[var(--primary)]">
                Mi perfil
              </h1>
              {/* <p className="mt-1 text-sm text-slate-500">{nombreCompleto}</p> */}
            </div>
          </div>

          {alumno?.estatus && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <BadgeCheck size={14} />
              {alumno.estatus}
            </span>
          )}
        </header>

        {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
        {error && <FormAlert type="error">{error}</FormAlert>}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Section icon={UserRound} title="Datos del usuario">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ReadOnlyField label="Nombre completo" value={nombreCompleto} />
                <ReadOnlyField label="Correo" value={usuario?.correo} />
                <ReadOnlyField label="Teléfono" value={usuario?.telefono} />
                <ReadOnlyField label="Estado" value={usuario?.estado} />
              </dl>
            </Section>

            <Section icon={GraduationCap} title="Datos académicos">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ReadOnlyField label="Matricula" value={alumno?.matricula} />
                <ReadOnlyField
                  label="Número de control"
                  value={alumno?.numero_control}
                />
                <ReadOnlyField label="Estatus" value={alumno?.estatus} />
                <ReadOnlyField
                  label="Carrera"
                  value={alumno?.carrera?.nombre}
                />
                <ReadOnlyField label="Plan" value={alumno?.plan?.nombre_plan} />
                <ReadOnlyField
                  label="Fecha de ingreso"
                  value={formatDate(alumno?.fecha_ingreso)}
                />
              </dl>
            </Section>

            <Section icon={IdCard} title="Datos personales">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ReadOnlyField label="CURP" value={alumno?.curp} />
                <ReadOnlyField
                  label="Fecha de nacimiento"
                  value={formatDate(alumno?.fecha_nacimiento)}
                />
                <ReadOnlyField label="Sexo" value={formatSex(alumno?.sexo)} />
                <ReadOnlyField
                  label="Nacionalidad"
                  value={alumno?.nacionalidad}
                />
                <ReadOnlyField
                  label="Ciudad de nacimiento"
                  value={alumno?.ciudad_nacimiento}
                />
                <ReadOnlyField
                  label="Municipio de nacimiento"
                  value={alumno?.municipio_nacimiento}
                />
                <ReadOnlyField label="Dirección" value={alumno?.direccion} />
                <ReadOnlyField label="Ciudad" value={alumno?.ciudad} />
                <ReadOnlyField label="Estado" value={alumno?.estado} />
                <ReadOnlyField
                  label="Correo de contacto"
                  value={alumno?.correo_contacto}
                />
              </dl>
            </Section>

            <Section icon={Users} title="Contacto y procedencia">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Users size={16} className="text-[#0B245B]" />
                    Tutores
                  </h3>
                  <div className="mt-3 space-y-3">
                    {expediente?.tutores?.length ? (
                      expediente.tutores.map((tutor) => (
                        <div
                          className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
                          key={tutor.id_tutor}
                        >
                          <p className="font-semibold text-slate-900">
                            {tutor.nombre || emptyValue}
                          </p>
                          <p className="text-sm text-slate-500">
                            {[tutor.parentesco, tutor.telefono]
                              .filter(Boolean)
                              .join(" - ") || emptyValue}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">{emptyValue}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <MapPin size={16} className="text-[#0B245B]" />
                    Procedencia académica
                  </h3>
                  <dl className="mt-3 space-y-3">
                    <ReadOnlyField
                      label="Escuela"
                      value={
                        expediente?.procedencia_academica?.escuela_procedencia
                      }
                    />
                    <ReadOnlyField
                      label="Nivel"
                      value={expediente?.procedencia_academica?.nivel_academico}
                    />
                    <ReadOnlyField
                      label="Promedio"
                      value={
                        expediente?.procedencia_academica?.promedio_general
                      }
                    />
                  </dl>
                </div>
              </div>
            </Section>
          </div>

          <form
            className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B245B]">
                <LockKeyhole size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Contraseña
                </h2>
                <p className="text-sm text-slate-500">Actualizar acceso</p>
              </div>
            </div>

            <div className="space-y-4">
              <PasswordInput
                autoComplete="current-password"
                label="Contraseña actual"
                name="password_actual"
                onChange={handleChange}
                value={form.password_actual}
              />
              <PasswordInput
                autoComplete="new-password"
                label="Nueva contraseña"
                minLength={8}
                name="nueva_password"
                onChange={handleChange}
                value={form.nueva_password}
              />
              <PasswordInput
                autoComplete="new-password"
                label="Confirmar contraseña"
                minLength={8}
                name="confirmar_password"
                onChange={handleChange}
                value={form.confirmar_password}
              />
            </div>

            <button
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B245B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={saving}
              type="submit"
            >
              <KeyRound size={18} />
              {saving ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// import { useEffect, useMemo, useState } from "react";
// import { KeyRound, LockKeyhole, UserRound } from "lucide-react";
// import FormAlert from "../components/usuarios/FormAlert";
// import {
//   actualizarMiPassword,
//   obtenerMiExpediente,
// } from "../services/authService";

// const emptyValue = "Sin registrar";

// const getErrorMessage = (error) => {
//   const detail = error.response?.data?.detail;

//   if (Array.isArray(detail)) {
//     return detail
//       .map((item) => item.msg || item.loc?.join("."))
//       .filter(Boolean)
//       .join(" | ");
//   }

//   if (typeof detail === "string") {
//     return detail;
//   }

//   return "No se pudo completar la operación.";
// };

// const joinName = (usuario) =>
//   [usuario?.nombre, usuario?.apellido_paterno, usuario?.apellido_materno]
//     .filter(Boolean)
//     .join(" ");

// const formatDate = (value) => {
//   if (!value) return emptyValue;

//   return new Intl.DateTimeFormat("es-MX", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(new Date(`${value}T00:00:00`));
// };

// const formatSex = (value) => {
//   const normalizedValue = value?.toUpperCase();

//   if (normalizedValue === "M") return "Masculino";
//   if (normalizedValue === "F") return "Femenino";

//   return value;
// };

// function ReadOnlyField({ label, value }) {
//   return (
//     <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
//       <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//         {label}
//       </dt>
//       <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
//         {value || emptyValue}
//       </dd>
//     </div>
//   );
// }

// function Section({ title, children }) {
//   return (
//     <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
//       {children}
//     </section>
//   );
// }

// function PasswordInput({
//   label,
//   name,
//   value,
//   onChange,
//   autoComplete,
//   minLength,
// }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </span>
//       <input
//         autoComplete={autoComplete}
//         className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0B245B] focus:ring-2 focus:ring-blue-100"
//         minLength={minLength}
//         name={name}
//         onChange={onChange}
//         required
//         type="password"
//         value={value}
//       />
//     </label>
//   );
// }

// export default function AlumnoPerfilPage() {
//   const [detalle, setDetalle] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [mensaje, setMensaje] = useState("");
//   const [error, setError] = useState("");
//   const [form, setForm] = useState({
//     password_actual: "",
//     nueva_password: "",
//     confirmar_password: "",
//   });

//   useEffect(() => {
//     let activo = true;

//     obtenerMiExpediente()
//       .then((response) => {
//         if (activo) {
//           setDetalle(response);
//         }
//       })
//       .catch((requestError) => {
//         console.error(requestError);

//         if (activo) {
//           setError(getErrorMessage(requestError));
//         }
//       })
//       .finally(() => {
//         if (activo) {
//           setLoading(false);
//         }
//       });

//     return () => {
//       activo = false;
//     };
//   }, []);

//   const usuario = detalle?.usuario;
//   const alumno = detalle?.alumno;
//   const expediente = detalle?.expediente_alumno;

//   const nombreCompleto = useMemo(
//     () => joinName(usuario) || usuario?.nombre || emptyValue,
//     [usuario],
//   );

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setMensaje("");
//     setError("");

//     if (form.nueva_password !== form.confirmar_password) {
//       setError("La nueva contraseña y la confirmación no coinciden.");
//       return;
//     }

//     try {
//       setSaving(true);
//       await actualizarMiPassword({
//         password_actual: form.password_actual,
//         nueva_password: form.nueva_password,
//       });
//       setMensaje("Contraseña actualizada correctamente.");
//       setForm({
//         password_actual: "",
//         nueva_password: "",
//         confirmar_password: "",
//       });
//     } catch (requestError) {
//       console.error(requestError);
//       setError(getErrorMessage(requestError));
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
//         <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[var(--background)] p-6">
//       <div className="mx-auto max-w-6xl space-y-6">
//         <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
//           <div>
//             <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B245B] text-white">
//               <UserRound size={24} />
//             </div>
//             <h1 className="text-4xl font-display text-[var(--primary)]">
//               Mi perfil
//             </h1>
//             <p className="mt-2 text-sm text-slate-500">{nombreCompleto}</p>
//           </div>
//         </header>

//         {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
//         {error && <FormAlert type="error">{error}</FormAlert>}

//         <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
//           <div className="space-y-6">
//             <Section title="Datos del usuario">
//               <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 <ReadOnlyField label="Nombre completo" value={nombreCompleto} />
//                 <ReadOnlyField label="Correo" value={usuario?.correo} />
//                 <ReadOnlyField label="Teléfono" value={usuario?.telefono} />
//                 <ReadOnlyField label="Estado" value={usuario?.estado} />
//               </dl>
//             </Section>

//             <Section title="Datos académicos">
//               <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 <ReadOnlyField label="Matricula" value={alumno?.matricula} />
//                 <ReadOnlyField
//                   label="Número de control"
//                   value={alumno?.numero_control}
//                 />
//                 <ReadOnlyField label="Estatus" value={alumno?.estatus} />
//                 <ReadOnlyField
//                   label="Carrera"
//                   value={alumno?.carrera?.nombre}
//                 />
//                 <ReadOnlyField label="Plan" value={alumno?.plan?.nombre_plan} />
//                 <ReadOnlyField
//                   label="Fecha de ingreso"
//                   value={formatDate(alumno?.fecha_ingreso)}
//                 />
//               </dl>
//             </Section>

//             <Section title="Datos personales">
//               <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 <ReadOnlyField label="CURP" value={alumno?.curp} />
//                 <ReadOnlyField
//                   label="Fecha de nacimiento"
//                   value={formatDate(alumno?.fecha_nacimiento)}
//                 />
//                 <ReadOnlyField label="Sexo" value={formatSex(alumno?.sexo)} />
//                 <ReadOnlyField
//                   label="Nacionalidad"
//                   value={alumno?.nacionalidad}
//                 />
//                 <ReadOnlyField
//                   label="Ciudad de nacimiento"
//                   value={alumno?.ciudad_nacimiento}
//                 />
//                 <ReadOnlyField
//                   label="Municipio de nacimiento"
//                   value={alumno?.municipio_nacimiento}
//                 />
//                 <ReadOnlyField label="Dirección" value={alumno?.direccion} />
//                 <ReadOnlyField label="Ciudad" value={alumno?.ciudad} />
//                 <ReadOnlyField label="Estado" value={alumno?.estado} />
//                 <ReadOnlyField
//                   label="Correo de contacto"
//                   value={alumno?.correo_contacto}
//                 />
//               </dl>
//             </Section>

//             <Section title="Contacto y procedencia">
//               <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//                 <div className="rounded-lg border border-slate-200 p-4">
//                   <h3 className="text-sm font-semibold text-slate-900">
//                     Tutores
//                   </h3>
//                   <div className="mt-3 space-y-3">
//                     {expediente?.tutores?.length ? (
//                       expediente.tutores.map((tutor) => (
//                         <div
//                           className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
//                           key={tutor.id_tutor}
//                         >
//                           <p className="font-semibold text-slate-900">
//                             {tutor.nombre || emptyValue}
//                           </p>
//                           <p className="text-sm text-slate-500">
//                             {[tutor.parentesco, tutor.telefono]
//                               .filter(Boolean)
//                               .join(" - ") || emptyValue}
//                           </p>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-sm text-slate-500">{emptyValue}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="rounded-lg border border-slate-200 p-4">
//                   <h3 className="text-sm font-semibold text-slate-900">
//                     Procedencia académica
//                   </h3>
//                   <dl className="mt-3 space-y-3">
//                     <ReadOnlyField
//                       label="Escuela"
//                       value={
//                         expediente?.procedencia_academica?.escuela_procedencia
//                       }
//                     />
//                     <ReadOnlyField
//                       label="Nivel"
//                       value={expediente?.procedencia_academica?.nivel_academico}
//                     />
//                     <ReadOnlyField
//                       label="Promedio"
//                       value={
//                         expediente?.procedencia_academica?.promedio_general
//                       }
//                     />
//                   </dl>
//                 </div>
//               </div>
//             </Section>
//           </div>

//           <form
//             className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
//             onSubmit={handleSubmit}
//           >
//             <div className="mb-5 flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B245B]">
//                 <LockKeyhole size={20} />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-slate-900">
//                   Contraseña
//                 </h2>
//                 <p className="text-sm text-slate-500">Actualizar acceso</p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <PasswordInput
//                 autoComplete="current-password"
//                 label="Contraseña actual"
//                 name="password_actual"
//                 onChange={handleChange}
//                 value={form.password_actual}
//               />
//               <PasswordInput
//                 autoComplete="new-password"
//                 label="Nueva contraseña"
//                 minLength={8}
//                 name="nueva_password"
//                 onChange={handleChange}
//                 value={form.nueva_password}
//               />
//               <PasswordInput
//                 autoComplete="new-password"
//                 label="Confirmar contraseña"
//                 minLength={8}
//                 name="confirmar_password"
//                 onChange={handleChange}
//                 value={form.confirmar_password}
//               />
//             </div>

//             <button
//               className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B245B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
//               disabled={saving}
//               type="submit"
//             >
//               <KeyRound size={18} />
//               {saving ? "Actualizando..." : "Actualizar contraseña"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
