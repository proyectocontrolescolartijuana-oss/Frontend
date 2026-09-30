import { RefreshCcw, UserPlus } from "lucide-react";

export default function UsuariosHeader({ total, onRefresh, onCreate }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Usuarios</h1>

        <p className="mt-1 text-slate-500">{total} usuarios registrados</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCcw size={18} />
          Actualizar
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B245B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
        >
          <UserPlus size={18} />
          Nuevo usuario
        </button>
      </div>
    </div>
  );
}
