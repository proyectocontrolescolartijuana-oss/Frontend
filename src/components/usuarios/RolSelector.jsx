import { ROLES_USUARIO } from "../../services/usuariosService";
import { iconosRol } from "./usuarioFormConfig";

export default function RolSelector({ rol, onChange }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Rol
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Object.entries(ROLES_USUARIO).map(([value, role]) => {
          const Icon = iconosRol[value];
          const activo = rol === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                activo
                  ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold">{role.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
