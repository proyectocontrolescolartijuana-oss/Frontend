import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

const getErrorMessage = (error) => {
  return (
    error.response?.data?.detail ||
    error.message ||
    "No se pudo completar la accion"
  );
};

export default function MateriaPrerrequisitosModal({
  open,
  materia,
  materias,
  prerrequisitos,
  loading,
  guardando,
  error,
  onClose,
  onCrear,
  onActualizar,
  onEliminar,
}) {
  const [form, setForm] = useState({
    id_materia_requerida: "",
    tipo: "OBLIGATORIO",
  });
  const [submitError, setSubmitError] = useState("");

  const idsRegistrados = useMemo(() => {
    return new Set(
      prerrequisitos.map(
        (prerrequisito) => prerrequisito.id_materia_requerida,
      ),
    );
  }, [prerrequisitos]);

  const materiasDisponibles = useMemo(() => {
    return materias.filter((opcion) => {
      return (
        opcion.id_materia !== materia?.id_materia &&
        !idsRegistrados.has(opcion.id_materia)
      );
    });
  }, [idsRegistrados, materia?.id_materia, materias]);

  if (!open || !materia) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    try {
      await onCrear({
        id_materia_requerida: Number(form.id_materia_requerida),
        tipo: form.tipo,
      });

      setForm({
        id_materia_requerida: "",
        tipo: "OBLIGATORIO",
      });
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Prerrequisitos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {materia.clave ? `${materia.clave} - ` : ""}
              {materia.nombre}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 border-b border-slate-200 pb-6 md:grid-cols-[1fr_170px_auto]"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Materia requerida
            </label>
            <select
              name="id_materia_requerida"
              value={form.id_materia_requerida}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
              disabled={guardando || materiasDisponibles.length === 0}
            >
              <option value="">
                {materiasDisponibles.length === 0
                  ? "Sin materias disponibles"
                  : "Selecciona una materia"}
              </option>
              {materiasDisponibles.map((opcion) => (
                <option key={opcion.id_materia} value={opcion.id_materia}>
                  {opcion.clave ? `${opcion.clave} - ` : ""}
                  {opcion.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tipo
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              disabled={guardando}
            >
              <option value="OBLIGATORIO">Obligatorio</option>
              <option value="RECOMENDADO">Recomendado</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={guardando || materiasDisponibles.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B245B] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
            >
              <Plus size={18} />
              Agregar
            </button>
          </div>
        </form>

        {(error || submitError) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError || error}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
            </div>
          ) : prerrequisitos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
              Esta materia no tiene prerrequisitos registrados.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      Materia
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      Tipo
                    </th>
                    <th className="px-5 py-3 text-right text-sm font-semibold text-slate-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prerrequisitos.map((prerrequisito) => (
                    <tr
                      key={prerrequisito.id_prerrequisito}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {prerrequisito.materia_requerida?.nombre}
                        </div>
                        <div className="text-sm text-slate-500">
                          {prerrequisito.materia_requerida?.clave || "Sin clave"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={prerrequisito.tipo}
                          onChange={(event) =>
                            onActualizar(prerrequisito, {
                              tipo: event.target.value,
                            })
                          }
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={guardando}
                        >
                          <option value="OBLIGATORIO">Obligatorio</option>
                          <option value="RECOMENDADO">Recomendado</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onEliminar(prerrequisito)}
                            aria-label="Eliminar prerrequisito"
                            title="Eliminar prerrequisito"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={guardando}
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
      </div>
    </div>
  );
}
