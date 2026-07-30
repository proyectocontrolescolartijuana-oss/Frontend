import { CheckCircle2, X } from "lucide-react";

export default function UsuarioAltaSuccessModal({ open, data, onClose }) {
  if (!open || !data) return null;

  const esAlumno = Boolean(data.matricula || data.correoInstitucional);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={24} />
            </span>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Usuario creado
              </h2>
              <p className="text-sm text-slate-500">
                El registro se guardo correctamente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {esAlumno ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Matricula asignada
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {data.matricula || "Sin dato"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Correo institucional
                </p>
                <p className="mt-1 break-all text-lg font-semibold text-slate-900">
                  {data.correoInstitucional || "Sin dato"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              El usuario ya esta disponible en el directorio.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#0B245B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
