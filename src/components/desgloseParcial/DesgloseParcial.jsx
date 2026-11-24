import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import {
  CLAVES_CRITERIOS,
  guardarDesgloseParcial,
  obtenerDesgloseParcial,
} from "../../services/desgloseService";
import { nombreAlumnoApellidosPrimero } from "../../utils/nombres";

const MINIMA_APROBATORIA = 70;
const MAX_ACTIVIDADES = 5;

const getCellKey = (idCarga, clave) => `${idCarga}-${clave}`;

const obtenerMensajeError = (error) => {
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

  return "No se pudo completar la operacion.";
};

const vacio = (valor) => valor === "" || valor === null || valor === undefined;

const puntajeInvalido = (valor, maximo) => {
  if (vacio(valor)) return false;

  const numero = Number(valor);

  return Number.isNaN(numero) || numero < 0 || numero > Number(maximo);
};

const inputBase =
  "h-10 rounded-lg border bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2";
const inputOk = "border-slate-300 focus:border-blue-500 focus:ring-blue-100";
const inputError =
  "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100";

/**
 * Captura del desglose de un parcial: criterios, puntajes por actividad y
 * concentrado. Se incrusta dentro de CapturaCalificacionesPage.
 *
 * Props:
 *  - grupoMateriaId: id del grupo-materia seleccionado
 *  - parcial: objeto del parcial ({ id_parcial, nombre, ... })
 *  - alumnos: captura.alumnos de la pantalla de captura
 *  - onGuardado(idParcial, cpfPorCarga): se llama despues de guardar
 */
function DesgloseParcial({ grupoMateriaId, parcial, alumnos, onGuardado }) {
  const parcialId = parcial.id_parcial;

  const [criterios, setCriterios] = useState([]);
  const [puntajes, setPuntajes] = useState({});
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const aplicarDesglose = useCallback((desglose) => {
    const valores = {};
    const resumenes = {};

    desglose.alumnos.forEach((alumno) => {
      Object.entries(alumno.puntajes ?? {}).forEach(([clave, valor]) => {
        valores[getCellKey(alumno.id_carga, clave)] = valor ?? "";
      });
      resumenes[alumno.id_carga] = alumno.resumen;
    });

    setCriterios(desglose.criterios);
    setPuntajes(valores);
    setResumen(resumenes);
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setError("");
      setMensaje("");

      try {
        const desglose = await obtenerDesgloseParcial(
          grupoMateriaId,
          parcialId,
        );

        if (!cancelado) aplicarDesglose(desglose);
      } catch (err) {
        if (!cancelado) setError(obtenerMensajeError(err));
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [grupoMateriaId, parcialId, aplicarDesglose]);

  const totalPorcentaje = useMemo(
    () =>
      criterios.reduce(
        (total, criterio) => total + (Number(criterio.porcentaje) || 0),
        0,
      ),
    [criterios],
  );
  const sumaCorrecta = Math.round(totalPorcentaje * 100) === 10000;

  const columnas = useMemo(
    () =>
      criterios.filter(
        (criterio) =>
          Number(criterio.porcentaje) > 0 && Number(criterio.puntos_max) > 0,
      ),
    [criterios],
  );

  const actividadesUsadas = columnas.filter(
    (criterio) => criterio.clave !== "EPA",
  ).length;

  const erroresConfiguracion = useMemo(() => {
    const errores = [];

    if (!sumaCorrecta) {
      errores.push(
        `Los criterios deben sumar 100% (hoy suman ${totalPorcentaje}%).`,
      );
    }

    criterios.forEach((criterio) => {
      if (!(Number(criterio.porcentaje) > 0)) return;

      if (criterio.clave !== "EPA" && !criterio.nombre.trim()) {
        errores.push(`${criterio.clave} necesita un nombre.`);
      }

      if (!(Number(criterio.puntos_max) > 0)) {
        errores.push(`${criterio.clave} necesita puntos maximos mayores a 0.`);
      }
    });

    return errores;
  }, [criterios, sumaCorrecta, totalPorcentaje]);

  const actualizarCriterio = (clave, campo, valor) => {
    setMensaje("");
    setCriterios((actuales) =>
      actuales.map((criterio) =>
        criterio.clave === clave ? { ...criterio, [campo]: valor } : criterio,
      ),
    );
  };

  const actualizarPuntaje = (idCarga, clave, valor) => {
    setMensaje("");
    setPuntajes((actuales) => ({
      ...actuales,
      [getCellKey(idCarga, clave)]: valor,
    }));
  };

  const handleGuardar = async () => {
    setMensaje("");
    setError("");

    if (erroresConfiguracion.length > 0) {
      setError(erroresConfiguracion.join(" "));
      return;
    }

    const hayPuntajeInvalido = alumnos.some((alumno) =>
      columnas.some((criterio) =>
        puntajeInvalido(
          puntajes[getCellKey(alumno.id_carga, criterio.clave)],
          criterio.puntos_max,
        ),
      ),
    );

    if (hayPuntajeInvalido) {
      setError("Hay puntajes fuera de rango. Revisa las celdas en rojo.");
      return;
    }

    setSaving(true);

    try {
      const puntajesPorCarga = {};

      alumnos.forEach((alumno) => {
        puntajesPorCarga[alumno.id_carga] = {};
        columnas.forEach((criterio) => {
          puntajesPorCarga[alumno.id_carga][criterio.clave] =
            puntajes[getCellKey(alumno.id_carga, criterio.clave)] ?? "";
        });
      });

      const desglose = await guardarDesgloseParcial(
        grupoMateriaId,
        parcialId,
        { criterios, puntajes: puntajesPorCarga },
      );

      aplicarDesglose(desglose);

      const cpfPorCarga = {};
      desglose.alumnos.forEach((alumno) => {
        cpfPorCarga[alumno.id_carga] = alumno.resumen?.cpf ?? null;
      });

      onGuardado?.(parcialId, cpfPorCarga);
      setMensaje("Desglose guardado.");
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          La calificacion del {parcial.nombre} se calcula con este desglose.
        </p>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar desglose"}
        </button>
      </div>

      {mensaje && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="rounded-lg border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              1. Criterios de evaluacion
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Cada criterio tiene una actividad (maximo {MAX_ACTIVIDADES}).
              Define su valor y sus puntos maximos. Todo debe sumar 100%.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              sumaCorrecta
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            Total {totalPorcentaje}%
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {criterios.map((criterio) => {
            const esExamen = criterio.clave === "EPA";

            return (
              <div
                key={criterio.clave}
                className={`rounded-lg border p-3 ${
                  esExamen
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="mb-2 text-sm font-bold text-blue-700">
                  {esExamen ? "Examen parcial (EPA)" : criterio.clave}
                </p>

                {!esExamen && (
                  <input
                    type="text"
                    value={criterio.nombre}
                    onChange={(event) =>
                      actualizarCriterio(
                        criterio.clave,
                        "nombre",
                        event.target.value,
                      )
                    }
                    placeholder="Sin usar"
                    aria-label={`Nombre de ${criterio.clave}`}
                    className={`${inputBase} ${inputOk} mb-2 w-full`}
                  />
                )}

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-sm text-slate-600">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={criterio.porcentaje}
                      onChange={(event) =>
                        actualizarCriterio(
                          criterio.clave,
                          "porcentaje",
                          event.target.value,
                        )
                      }
                      aria-label={`Porcentaje de ${criterio.clave}`}
                      className={`${inputBase} ${inputOk} w-16 text-center`}
                    />
                    %
                  </label>
                  <label className="flex items-center gap-1 text-sm text-slate-600">
                    max
                    <input
                      type="number"
                      min="0"
                      value={criterio.puntos_max}
                      onChange={(event) =>
                        actualizarCriterio(
                          criterio.clave,
                          "puntos_max",
                          event.target.value,
                        )
                      }
                      aria-label={`Puntos maximos de ${criterio.clave}`}
                      className={`${inputBase} ${inputOk} w-16 text-center`}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              2. Registro de actividades y concentrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Captura el puntaje de cada alumno en las columnas azules. Las
              grises las calcula el sistema al guardar.
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {actividadesUsadas} de {MAX_ACTIVIDADES} actividades
          </span>
        </div>

        {columnas.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Define al menos un criterio con porcentaje y puntos maximos para
            empezar a capturar puntajes.
          </div>
        ) : alumnos.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Este grupo aun no tiene alumnos en carga academica.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="w-64 border-b border-slate-200 bg-slate-50 px-5 py-3 text-left text-sm font-semibold text-slate-600"
                  >
                    Alumno
                  </th>
                  <th
                    colSpan={columnas.length}
                    className="border-b border-blue-100 bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-800"
                  >
                    Registro de Actividades de Aprendizajes, Criterios y Procedimientos de Evaluacion (Evaluacion Continua)
                  </th>
                  <th
                    colSpan={CLAVES_CRITERIOS.length + 2}
                    className="border-b border-l-2 border-slate-200 border-l-slate-300 bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                  >
                    Concentrado de Evaluacion
                  </th>
                </tr>
                <tr>
                  {columnas.map((criterio) => (
                    <th
                      key={criterio.clave}
                      className="border-b border-slate-200 bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                    >
                      {criterio.clave === "EPA" ? "Examen" : criterio.nombre}
                      <span className="block text-xs font-medium text-slate-500">
                        {criterio.clave} - max {criterio.puntos_max}
                      </span>
                    </th>
                  ))}
                  {[...CLAVES_CRITERIOS, "CPF", "CPFL"].map((clave, indice) => (
                    <th
                      key={clave}
                      className={`border-b border-slate-200 bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-700 ${
                        indice === 0 ? "border-l-2 border-l-slate-300" : ""
                      }`}
                    >
                      {clave}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {alumnos.map((alumno) => {
                  const calculo = resumen[alumno.id_carga];
                  const reprobado =
                    calculo?.cpf !== null &&
                    calculo?.cpf !== undefined &&
                    calculo.cpf < MINIMA_APROBATORIA;

                  return (
                    <tr key={alumno.id_carga}>
                      <td className="border-b border-slate-100 px-5 py-3">
                        <p className="font-semibold text-slate-900">
                          {nombreAlumnoApellidosPrimero(alumno)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Matricula: {alumno.alumno?.matricula ?? "-"}
                        </p>
                      </td>

                      {columnas.map((criterio) => {
                        const valor =
                          puntajes[getCellKey(alumno.id_carga, criterio.clave)] ??
                          "";
                        const invalido = puntajeInvalido(
                          valor,
                          criterio.puntos_max,
                        );

                        return (
                          <td
                            key={criterio.clave}
                            className="border-b border-slate-100 bg-blue-50/40 px-3 py-3 text-center"
                          >
                            <input
                              type="number"
                              min="0"
                              max={criterio.puntos_max}
                              value={valor}
                              onChange={(event) =>
                                actualizarPuntaje(
                                  alumno.id_carga,
                                  criterio.clave,
                                  event.target.value,
                                )
                              }
                              aria-label={`${criterio.clave} de ${nombreAlumnoApellidosPrimero(
                                alumno,
                                "alumno",
                              )}`}
                              className={`${inputBase} ${
                                invalido ? inputError : inputOk
                              } w-20 text-center`}
                            />
                          </td>
                        );
                      })}

                      {CLAVES_CRITERIOS.map((clave, indice) => (
                        <td
                          key={clave}
                          className={`border-b border-slate-100 bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-700 ${
                            indice === 0 ? "border-l-2 border-l-slate-300" : ""
                          }`}
                        >
                          {calculo?.[clave] ?? "-"}
                        </td>
                      ))}

                      <td
                        className={`border-b border-slate-100 bg-slate-50 px-3 py-3 text-center text-sm font-bold ${
                          reprobado ? "text-red-700" : "text-slate-900"
                        }`}
                      >
                        {calculo?.cpf ?? "-"}
                      </td>
                      <td
                        className={`border-b border-slate-100 bg-slate-50 px-3 py-3 text-center text-sm font-medium ${
                          reprobado ? "text-red-700" : "text-slate-700"
                        }`}
                      >
                        {calculo
                          ? (calculo.cpfl ?? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                Incompleto
                              </span>
                            ))
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          En rojo: calificacion menor a {MINIMA_APROBATORIA}. El concentrado se
          actualiza al guardar el desglose.
        </p>
      </section>
    </div>
  );
}

export default DesgloseParcial;