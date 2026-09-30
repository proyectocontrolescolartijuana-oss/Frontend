import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { obtenerAlumnosDetalle } from "../services/usuariosService";
import { obtenerPlanesEstudio } from "../services/planesEstudioService";
import { obtenerPeriodos } from "../services/periodosService";
import {
  obtenerHistorialesAcademicos,
  registrarEquivalenciasAlumno,
} from "../services/equivalenciasService";

const hoy = () => new Date().toISOString().slice(0, 10);

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getErrorMessage = (error) => {
  return (
    error.response?.data?.detail ||
    error.message ||
    "No se pudo completar la accion"
  );
};

const materiasPlan = (plan) => {
  return (plan?.cuatrimestres || []).flatMap((cuatrimestre) =>
    (cuatrimestre.materias || []).map((materiaPlan) => ({
      id_cuatrimestre: cuatrimestre.id_cuatrimestre,
      cuatrimestre: cuatrimestre.numero,
      cuatrimestre_nombre: cuatrimestre.nombre,
      ...materiaPlan.materia,
    })),
  );
};

export default function EquivalenciasPage() {
  const [alumnos, setAlumnos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [alumnoId, setAlumnoId] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [fechaCierre, setFechaCierre] = useState(hoy());
  const [equivalencias, setEquivalencias] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerAlumnosDetalle(),
      obtenerPlanesEstudio(),
      obtenerPeriodos(),
    ])
      .then(([alumnosResponse, planesResponse, periodosResponse]) => {
        if (!activo) return;

        setAlumnos(alumnosResponse);
        setPlanes(planesResponse);
        setPeriodos(periodosResponse);

        const periodoActivo = periodosResponse.find(
          (periodo) => periodo.estado === "ACTIVO",
        );

        setPeriodoId(periodoActivo?.id_periodo || periodosResponse[0]?.id_periodo || "");
      })
      .catch((requestError) => {
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

  const alumnoSeleccionado = useMemo(() => {
    return alumnos.find((alumno) => alumno.id_alumno === Number(alumnoId));
  }, [alumnoId, alumnos]);

  const alumnosOrdenados = useMemo(() => {
    return [...alumnos].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || ""),
    );
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busquedaAlumno);

    if (!texto) return alumnosOrdenados;

    return alumnosOrdenados.filter((alumno) => {
      const datos = normalizar(
        [
          alumno.nombre,
          alumno.matricula,
          alumno.numero_control,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return datos.includes(texto);
    });
  }, [alumnosOrdenados, busquedaAlumno]);

  const planSeleccionado = useMemo(() => {
    return planes.find((plan) => plan.id_plan === alumnoSeleccionado?.id_plan);
  }, [alumnoSeleccionado?.id_plan, planes]);

  const materias = useMemo(
    () => materiasPlan(planSeleccionado),
    [planSeleccionado],
  );

  const materiasPorCuatrimestre = useMemo(() => {
    return materias.reduce((acc, materia) => {
      const key = materia.cuatrimestre;

      if (!acc[key]) {
        acc[key] = {
          numero: materia.cuatrimestre,
          nombre: materia.cuatrimestre_nombre,
          materias: [],
        };
      }

      acc[key].materias.push(materia);

      return acc;
    }, {});
  }, [materias]);

  const handleAlumnoChange = async (id) => {
    setAlumnoId(id);
    setEquivalencias({});
    setMensaje("");
    setError("");

    if (!id) return;

    try {
      const historiales = await obtenerHistorialesAcademicos({
        alumno_id: id,
        tipo_evaluacion: "EQUIVALENCIA",
      });

      const equivalenciasExistentes = {};

      historiales.forEach((historial) => {
        if (!historial.materia?.id_materia) return;

        equivalenciasExistentes[historial.materia.id_materia] = {
          checked: true,
          calificacion_final: historial.calificacion_final || "",
        };
      });

      setEquivalencias(equivalenciasExistentes);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const handleMateriaChange = (idMateria, field, value) => {
    setEquivalencias((prev) => ({
      ...prev,
      [idMateria]: {
        checked: false,
        calificacion_final: "",
        ...prev[idMateria],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMensaje("");

    if (!alumnoSeleccionado) {
      setError("Selecciona un alumno");
      return;
    }

    const materiasSeleccionadas = Object.entries(equivalencias)
      .filter(([, data]) => data.checked)
      .map(([idMateria, data]) => ({
        id_materia: Number(idMateria),
        calificacion_final: Number(data.calificacion_final),
      }));

    if (materiasSeleccionadas.length === 0) {
      setError("Marca al menos una materia por equivalencia");
      return;
    }

    setGuardando(true);

    try {
      await registrarEquivalenciasAlumno(alumnoSeleccionado.id_alumno, {
        id_periodo: Number(periodoId),
        fecha_cierre: fechaCierre,
        materias: materiasSeleccionadas,
      });

      setMensaje("Equivalencias registradas correctamente.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Equivalencias</h1>
        <p className="mt-1 text-slate-500">
          Registra materias acreditadas por equivalencia con calificacion final.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Alumno
            </label>
            <input
              type="text"
              value={
                mostrarOpciones
                  ? busquedaAlumno
                  : alumnoSeleccionado?.nombre || busquedaAlumno
              }
              onChange={(event) => {
                setBusquedaAlumno(event.target.value);
                setMostrarOpciones(true);
              }}
              onFocus={() => {
                setBusquedaAlumno("");
                setMostrarOpciones(true);
              }}
              onBlur={() => {
                setTimeout(() => setMostrarOpciones(false), 150);
              }}
              placeholder={
                loading
                  ? "Cargando alumnos..."
                  : "Busca por nombre, matricula o numero de control"
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />

            {mostrarOpciones && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {alumnosFiltrados.length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    Sin resultados
                  </div>
                )}

                {alumnosFiltrados.map((alumno) => (
                  <button
                    key={alumno.id_alumno}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      handleAlumnoChange(alumno.id_alumno);
                      setBusquedaAlumno("");
                      setMostrarOpciones(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm transition hover:bg-blue-50"
                  >
                    <span className="block font-medium text-slate-900">
                      {alumno.nombre}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {[alumno.matricula, alumno.numero_control]
                        .filter(Boolean)
                        .join(" | ") || "Sin matricula"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Periodo
            </label>
            <select
              value={periodoId}
              onChange={(event) => setPeriodoId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            >
              <option value="">Selecciona periodo</option>
              {periodos.map((periodo) => (
                <option key={periodo.id_periodo} value={periodo.id_periodo}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fecha
            </label>
            <input
              type="date"
              value={fechaCierre}
              onChange={(event) => setFechaCierre(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>
        </div>

        {alumnoSeleccionado && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {alumnoSeleccionado.nombre}
                </h2>
                <p className="text-sm text-slate-500">
                  {alumnoSeleccionado.carrera?.nombre || "Sin carrera"} ·{" "}
                  {alumnoSeleccionado.plan?.nombre_plan || "Sin plan"}
                </p>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B245B] px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={18} />
                {guardando ? "Guardando..." : "Guardar equivalencias"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {mensaje}
          </div>
        )}

        {alumnoSeleccionado && !materias.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            El plan del alumno no tiene materias registradas.
          </div>
        )}

        {Object.values(materiasPorCuatrimestre).map((cuatrimestre) => (
          <div
            key={cuatrimestre.numero}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold text-slate-900">
                {cuatrimestre.numero}. {cuatrimestre.nombre}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      EQ
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      Clave
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      Materia
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      Calificacion final
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cuatrimestre.materias.map((materia) => {
                    const row = equivalencias[materia.id_materia] || {};
                    const checked = Boolean(row.checked);

                    return (
                      <tr
                        key={materia.id_materia}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              handleMateriaChange(
                                materia.id_materia,
                                "checked",
                                event.target.checked,
                              )
                            }
                          />
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          {materia.clave}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {materia.nombre}
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={row.calificacion_final || ""}
                            onChange={(event) =>
                              handleMateriaChange(
                                materia.id_materia,
                                "calificacion_final",
                                event.target.value,
                              )
                            }
                            disabled={!checked}
                            required={checked}
                            className="w-36 rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                            placeholder="0-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}
