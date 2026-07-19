import { Edit2, Eye, Search, Trash2, Users } from "lucide-react";
import { ROLES_USUARIO } from "../../services/usuariosService";
import { nombreApellidosPrimero } from "../../utils/nombres";

export default function UsuariosDirectory({
  usuarios,
  busqueda,
  rolFiltro,
  onBusquedaChange,
  onRolFiltroChange,
  onVer,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Users size={20} />
          </span>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Directorio</h2>

            <p className="text-sm text-slate-500">
              {usuarios.length} usuarios encontrados
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => onBusquedaChange(event.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 md:w-80"
            />
          </div>

          <select
            value={rolFiltro}
            onChange={(event) => onRolFiltroChange(event.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="TODOS">Todos los roles</option>
            {Object.entries(ROLES_USUARIO).map(([value, role]) => (
              <option key={value} value={value}>
                {role.label}
              </option>
            ))}
            <option value="ADMIN">Admin</option>
            <option value="SIN_ROL">Sin rol</option>
          </select>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          No hay usuarios que coincidan con los filtros.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Usuario
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Contacto
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Rol
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id_usuario}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5">
                    <div className="font-semibold text-slate-900">
                      {nombreApellidosPrimero(usuario, "Usuario sin nombre")}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      ID #{usuario.id_usuario}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-800">
                      {usuario.correo}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {usuario.telefono || "Sin telefono"}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {usuario.roles?.length > 0 ? (
                        usuario.roles.map((role) => (
                          <span
                            key={role.id_rol}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          >
                            {role.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Sin rol
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onVer(usuario)}
                        title="Ver datos"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditar(usuario)}
                        title="Editar"
                        className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEliminar(usuario)}
                        title="Borrar"
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
