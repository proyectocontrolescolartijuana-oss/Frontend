import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  IdCard,
  KeyRound,
  LockKeyhole,
  UserRound,
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

const formatDate = (value) => formatDateDDMMYYYY(value, emptyValue);

const formatEstadoDocente = (value) => {
  if (value === true) return "ACTIVO";
  if (value === false) return "INACTIVO";

  return emptyValue;
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

export default function DocentePerfilPage() {
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
  const docente = detalle?.docente;

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
    setMensaje("");
    setError("");
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
              <p className="mt-1 text-sm text-slate-500">{nombreCompleto}</p>
            </div>
          </div>

          {docente && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <BadgeCheck size={14} />
              {formatEstadoDocente(docente.estado)}
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

            <Section icon={BriefcaseBusiness} title="Datos docentes">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ReadOnlyField
                  label="Número de empleado"
                  value={docente?.numero_empleado}
                />
                <ReadOnlyField
                  label="Especialidad"
                  value={docente?.especialidad}
                />
                <ReadOnlyField
                  label="Grado académico"
                  value={docente?.grado_academico}
                />
                <ReadOnlyField
                  label="Fecha de ingreso"
                  value={formatDate(docente?.fecha_ingreso)}
                />
              </dl>
            </Section>

            <Section icon={IdCard} title="Acceso">
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadOnlyField label="Usuario" value={usuario?.correo} />
                <ReadOnlyField
                  label="Roles"
                  value={usuario?.roles
                    ?.map((role) => role.nombre)
                    .filter(Boolean)
                    .join(", ")}
                />
              </dl>
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
