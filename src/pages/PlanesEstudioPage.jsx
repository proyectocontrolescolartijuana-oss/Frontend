import { useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import PlanSelector from "../components/planes-estudio/PlanSelector";
import PlanCard from "../components/planes-estudio/PlanCard";
import PlanHeader from "../components/planes-estudio/PlanHeader";
import EmptyState from "../components/planes-estudio/EmptyState";
import PlanModal from "../components/planes-estudio/PlanModal";
import PlanMateriaModal from "../components/planes-estudio/PlanMateriaModal";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerMaterias } from "../services/materiasService";
import {
  actualizarMateriaDePlan,
  actualizarPlanEstudio,
  agregarMateriaAPlan,
  crearPlanEstudio,
  eliminarMateriaDePlan,
  eliminarPlanEstudio,
  obtenerCuatrimestres,
  obtenerPlanesEstudio,
} from "../services/planesEstudioService";
import { formatDateDDMMYYYY } from "../utils/fechas";

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

const ordenarCuatrimestres = (a, b) => {
  const numeroA = a.numero ?? a.id_cuatrimestre;
  const numeroB = b.numero ?? b.id_cuatrimestre;

  return numeroA - numeroB;
};

export default function PlanesEstudioPage() {
  const [planes, setPlanes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [cuatrimestres, setCuatrimestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [planModalAbierto, setPlanModalAbierto] = useState(false);
  const [planEditando, setPlanEditando] = useState(null);
  const [materiaModalAbierto, setMateriaModalAbierto] = useState(false);
  const [materiaPlanEditando, setMateriaPlanEditando] = useState(null);
  const [cuatrimestrePreseleccionado, setCuatrimestrePreseleccionado] =
    useState("");

  const aplicarDatos = (
    planesResponse,
    carrerasResponse,
    materiasResponse,
    cuatrimestresResponse,
    idPlanPreferido,
  ) => {
    setPlanes(planesResponse);
    setCarreras(carrerasResponse);
    setMaterias(materiasResponse);
    setCuatrimestres([...cuatrimestresResponse].sort(ordenarCuatrimestres));

    const idPreferido = idPlanPreferido ? Number(idPlanPreferido) : null;
    const planExiste = planesResponse.some(
      (plan) => plan.id_plan === idPreferido,
    );

    setPlanSeleccionado(
      planExiste ? idPreferido : planesResponse[0]?.id_plan || null,
    );
  };

  async function cargarDatos(idPlanPreferido = planSeleccionado) {
    try {
      const [
        planesResponse,
        carrerasResponse,
        materiasResponse,
        cuatrimestresResponse,
      ] = await Promise.all([
        obtenerPlanesEstudio(),
        obtenerCarreras(),
        obtenerMaterias(),
        obtenerCuatrimestres(),
      ]);

      aplicarDatos(
        planesResponse,
        carrerasResponse,
        materiasResponse,
        cuatrimestresResponse,
        idPlanPreferido,
      );
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerPlanesEstudio(),
      obtenerCarreras(),
      obtenerMaterias(),
      obtenerCuatrimestres(),
    ])
      .then(
        ([
          planesResponse,
          carrerasResponse,
          materiasResponse,
          cuatrimestresResponse,
        ]) => {
          if (activo) {
            aplicarDatos(
              planesResponse,
              carrerasResponse,
              materiasResponse,
              cuatrimestresResponse,
              null,
            );
          }
        },
      )
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError(obtenerMensajeError(requestError));
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

  const planActual = useMemo(() => {
    return planes.find((plan) => plan.id_plan === Number(planSeleccionado));
  }, [planes, planSeleccionado]);

  const cuatrimestresOrdenados = useMemo(() => {
    if (!planActual?.cuatrimestres) return [];

    return [...planActual.cuatrimestres].sort(ordenarCuatrimestres);
  }, [planActual]);

  const materiasAsignadasIds = useMemo(() => {
    if (!planActual?.cuatrimestres) return new Set();

    return new Set(
      planActual.cuatrimestres.flatMap((cuatrimestre) =>
        cuatrimestre.materias.map(
          (materiaPlan) => materiaPlan.materia.id_materia,
        ),
      ),
    );
  }, [planActual]);

  const materiasDisponibles = useMemo(() => {
    const idMateriaEditando = materiaPlanEditando?.materia?.id_materia;

    return materias.filter((materia) => {
      const activa = materia.estado !== false;
      const yaAsignada = materiasAsignadasIds.has(materia.id_materia);

      return (
        materia.id_materia === idMateriaEditando ||
        (activa && !yaAsignada)
      );
    });
  }, [materias, materiasAsignadasIds, materiaPlanEditando]);

  const abrirCrearPlan = () => {
    setPlanEditando(null);
    setPlanModalAbierto(true);
  };

  const abrirEditarPlan = (plan) => {
    setPlanEditando(plan);
    setPlanModalAbierto(true);
  };

  const cerrarPlanModal = () => {
    setPlanEditando(null);
    setPlanModalAbierto(false);
  };

  const handleSubmitPlan = async (formData) => {
    setGuardando(true);
    setError("");

    try {
      const response = planEditando
        ? await actualizarPlanEstudio(planEditando.id_plan, formData)
        : await crearPlanEstudio(formData);

      cerrarPlanModal();
      await cargarDatos(response.id_plan);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPlan = async (plan) => {
    const confirmar = window.confirm(
      `Deseas eliminar el plan ${plan.nombre_plan}?`,
    );

    if (!confirmar) return;

    setGuardando(true);
    setError("");

    try {
      await eliminarPlanEstudio(plan.id_plan);
      await cargarDatos(null);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setGuardando(false);
    }
  };

  const abrirAgregarMateria = (idCuatrimestre = "") => {
    setMateriaPlanEditando(null);
    setCuatrimestrePreseleccionado(idCuatrimestre);
    setMateriaModalAbierto(true);
  };

  const abrirEditarMateria = (materiaPlan, cuatrimestre) => {
    setMateriaPlanEditando({
      ...materiaPlan,
      id_cuatrimestre:
        materiaPlan.id_cuatrimestre || cuatrimestre.id_cuatrimestre,
    });
    setCuatrimestrePreseleccionado(cuatrimestre.id_cuatrimestre);
    setMateriaModalAbierto(true);
  };

  const cerrarMateriaModal = () => {
    setMateriaPlanEditando(null);
    setCuatrimestrePreseleccionado("");
    setMateriaModalAbierto(false);
  };

  const handleSubmitMateriaPlan = async (formData) => {
    if (!planActual) return;

    setGuardando(true);
    setError("");

    try {
      if (materiaPlanEditando) {
        await actualizarMateriaDePlan(
          planActual.id_plan,
          materiaPlanEditando.id_plan_materia,
          formData,
        );
      } else {
        await agregarMateriaAPlan(planActual.id_plan, formData);
      }

      cerrarMateriaModal();
      await cargarDatos(planActual.id_plan);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMateria = async (materiaPlan) => {
    if (!planActual) return;

    const confirmar = window.confirm(
      `Eliminar ${materiaPlan.materia.nombre} de este plan?`,
    );

    if (!confirmar) return;

    setGuardando(true);
    setError("");

    try {
      await eliminarMateriaDePlan(
        planActual.id_plan,
        materiaPlan.id_plan_materia,
      );
      await cargarDatos(planActual.id_plan);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
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
      <PlanHeader onCrearPlan={abrirCrearPlan} totalPlanes={planes.length} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Plan de estudios
          </h1>

          <p className="mt-1 text-slate-500">Mapa curricular por carrera</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {planActual && (
            <>
              <button
                type="button"
                onClick={() => abrirAgregarMateria()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              >
                <Plus size={18} />
                Agregar materia
              </button>

              <button
                type="button"
                onClick={() => abrirEditarPlan(planActual)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Edit2 size={18} />
                Editar
              </button>

              <button
                type="button"
                onClick={() => eliminarPlan(planActual)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </>
          )}

          {planes.length > 0 && (
            <PlanSelector
              planes={planes}
              value={planSeleccionado}
              onChange={setPlanSeleccionado}
            />
          )}
        </div>
      </div>

      <div className="h-px w-full bg-slate-200" />

      {!planActual ? (
        <EmptyState mensaje="Todavia no hay planes de estudio registrados." />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {planActual.nombre_plan}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {planActual.carrera.nombre}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    planActual.vigente
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {planActual.vigente ? "Vigente" : "No vigente"}
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Inicio: {formatDateDDMMYYYY(planActual.fecha_inicio, "Sin fecha")}
                </span>

                {planActual.fecha_fin && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Fin: {formatDateDDMMYYYY(planActual.fecha_fin)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {cuatrimestresOrdenados.length === 0 ? (
            <EmptyState mensaje="Este plan todavia no tiene materias asignadas." />
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              {cuatrimestresOrdenados.map((cuatrimestre) => (
                <PlanCard
                  key={cuatrimestre.id_cuatrimestre}
                  cuatrimestre={cuatrimestre}
                  onAgregarMateria={abrirAgregarMateria}
                  onEditarMateria={abrirEditarMateria}
                  onEliminarMateria={eliminarMateria}
                />
              ))}
            </div>
          )}
        </>
      )}

      {planModalAbierto && (
        <PlanModal
          key={planEditando?.id_plan || "nuevo-plan"}
          open={planModalAbierto}
          onClose={cerrarPlanModal}
          onSubmit={handleSubmitPlan}
          plan={planEditando}
          carreras={carreras}
          guardando={guardando}
        />
      )}

      {materiaModalAbierto && (
        <PlanMateriaModal
          key={
            materiaPlanEditando?.id_plan_materia ||
            `nueva-materia-${cuatrimestrePreseleccionado || "sin-cuatri"}`
          }
          open={materiaModalAbierto}
          onClose={cerrarMateriaModal}
          onSubmit={handleSubmitMateriaPlan}
          materiaPlan={materiaPlanEditando}
          cuatrimestreId={cuatrimestrePreseleccionado}
          materias={materiasDisponibles}
          cuatrimestres={cuatrimestres}
          guardando={guardando}
        />
      )}
    </div>
  );
}
