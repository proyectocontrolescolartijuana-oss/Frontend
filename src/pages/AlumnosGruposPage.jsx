import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  UserPlus,
  Users,
} from "lucide-react";
import {
  crearGrupoMateria,
  crearCargaAcademica,
  eliminarCargaAcademica,
  obtenerAlumnosDetalle,
  obtenerCatalogosCargaAcademica,
  obtenerCargasAcademicas,
  obtenerGruposMaterias,
} from "../services/alumnosGruposService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

const obtenerFechaActual = () => new Date().toISOString().slice(0, 10);

const normalizarTexto = (texto = "") => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

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

const getGrupoTitulo = (grupoMateria) => {
  return [
    grupoMateria?.materia?.nombre || "Materia sin nombre",
    grupoMateria?.grupo?.nombre || "Grupo sin nombre",
  ]
    .filter(Boolean)
    .join(" - ");
};

const getGrupoMeta = (grupoMateria) => {
  return [
    grupoMateria?.periodo?.nombre,
    grupoMateria?.grupo?.turno,
    grupoMateria?.aula ? `Aula ${grupoMateria.aula}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
};

const getAlumnoTexto = (alumno) => {
  return [
    nombreAlumnoApellidosPrimero(alumno, ""),
    alumno.matricula,
    alumno.numero_control,
    alumno.carrera?.nombre,
  ]
    .filter(Boolean)
    .join(" ");
};

const getDocenteLabel = (docente) => {
  return docente.numero_empleado || `Docente ${docente.id_docente}`;
};

const getMateriaOptionLabel = (materia) => {
  return [materia.clave, materia.nombre, materia.cuatrimestre]
    .filter(Boolean)
    .join(" | ");
};

export default function AlumnosGruposPage() {
  const [alumnos, setAlumnos] = useState([]);
  const [gruposMaterias, setGruposMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState("");
  const [busquedaGrupo, setBusquedaGrupo] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [ofertaAbierta, setOfertaAbierta] = useState(false);
  const [ofertaForm, setOfertaForm] = useState({
    id_plan: "",
    id_grupo: "",
    id_materia: "",
    id_docente: "",
    id_periodo: "",
    aula: "",
    cupo_maximo: "40",
  });
  const [oportunidad, setOportunidad] = useState("ORDINARIO");
  const [intento, setIntento] = useState(1);
  const [fechaInscripcion, setFechaInscripcion] = useState(
    obtenerFechaActual(),
  );
  const [loading, setLoading] = useState(true);
  const [loadingCargas, setLoadingCargas] = useState(false);
  const [guardandoOferta, setGuardandoOferta] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const grupoSeleccionado = useMemo(() => {
    return gruposMaterias.find(
      (grupoMateria) =>
        String(grupoMateria.id_grupo_materia) ===
        String(grupoSeleccionadoId),
    );
  }, [gruposMaterias, grupoSeleccionadoId]);

  const getPlanParaGrupo = (grupoId) => {
    const grupo = grupos.find(
      (item) => String(item.id_grupo) === String(grupoId),
    );
    const plan = planes.find(
      (item) => item.carrera?.id_carrera === grupo?.id_carrera,
    );

    return plan?.id_plan || planes[0]?.id_plan || "";
  };

  const aplicarCatalogosOferta = (catalogos) => {
    const periodoActivo =
      catalogos.periodos.find((periodo) => periodo.estado === "ACTIVO") ||
      catalogos.periodos[0];
    const grupoInicial = catalogos.grupos[0];
    const planInicial =
      catalogos.planes.find(
        (plan) => plan.carrera?.id_carrera === grupoInicial?.id_carrera,
      ) || catalogos.planes[0];

    setGrupos(catalogos.grupos);
    setMaterias(catalogos.materias);
    setDocentes(catalogos.docentes);
    setPeriodos(catalogos.periodos);
    setPlanes(catalogos.planes);
    setOfertaForm((prev) => ({
      ...prev,
      id_grupo: prev.id_grupo || grupoInicial?.id_grupo || "",
      id_plan: prev.id_plan || planInicial?.id_plan || "",
      id_docente: prev.id_docente || catalogos.docentes[0]?.id_docente || "",
      id_periodo: prev.id_periodo || periodoActivo?.id_periodo || "",
    }));
  };

  const cargarCatalogos = async () => {
    setError("");
    setLoading(true);

    try {
      const [alumnosResponse, gruposResponse, catalogosResponse] =
        await Promise.all([
        obtenerAlumnosDetalle(),
        obtenerGruposMaterias(),
        obtenerCatalogosCargaAcademica(),
      ]);

      aplicarCatalogosOferta(catalogosResponse);
      setAlumnos(alumnosResponse);
      setGruposMaterias(gruposResponse);
      if (gruposResponse.length === 0) {
        setCargas([]);
      }
      const existeActual = gruposResponse.some(
        (grupoMateria) =>
          String(grupoMateria.id_grupo_materia) ===
          String(grupoSeleccionadoId),
      );
      const siguienteGrupoId = existeActual
        ? grupoSeleccionadoId
        : gruposResponse[0]?.id_grupo_materia || "";

      setGrupoSeleccionadoId(siguienteGrupoId);

      if (siguienteGrupoId && String(siguienteGrupoId) === String(grupoSeleccionadoId)) {
        await cargarCargas(siguienteGrupoId);
      }
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const cargarCargas = async (grupoMateriaId = grupoSeleccionadoId) => {
    if (!grupoMateriaId) {
      setCargas([]);
      return;
    }

    setError("");
    setLoadingCargas(true);

    try {
      const response = await obtenerCargasAcademicas({
        grupo_materia_id: grupoMateriaId,
      });

      setCargas(response);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoadingCargas(false);
    }
  };

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerAlumnosDetalle(),
      obtenerGruposMaterias(),
      obtenerCatalogosCargaAcademica(),
    ])
      .then(([alumnosResponse, gruposResponse, catalogosResponse]) => {
        if (!activo) return;

        aplicarCatalogosOferta(catalogosResponse);
        setAlumnos(alumnosResponse);
        setGruposMaterias(gruposResponse);
        setLoadingCargas(Boolean(gruposResponse[0]?.id_grupo_materia));
        setGrupoSeleccionadoId(gruposResponse[0]?.id_grupo_materia || "");
      })
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

  useEffect(() => {
    if (!grupoSeleccionadoId) {
      return;
    }

    let activo = true;

    obtenerCargasAcademicas({
      grupo_materia_id: grupoSeleccionadoId,
    })
      .then((response) => {
        if (activo) {
          setCargas(response);
        }
      })
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError(obtenerMensajeError(requestError));
        }
      })
      .finally(() => {
        if (activo) {
          setLoadingCargas(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [grupoSeleccionadoId]);

  const gruposFiltrados = useMemo(() => {
    const busqueda = normalizarTexto(busquedaGrupo.trim());

    return gruposMaterias.filter((grupoMateria) => {
      const texto = normalizarTexto(
        [
          grupoMateria.materia?.nombre,
          grupoMateria.materia?.clave,
          grupoMateria.grupo?.nombre,
          grupoMateria.periodo?.nombre,
          grupoMateria.docente?.nombre,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return busqueda === "" || texto.includes(busqueda);
    });
  }, [gruposMaterias, busquedaGrupo]);

  const materiasOferta = useMemo(() => {
    const plan = planes.find(
      (item) => String(item.id_plan) === String(ofertaForm.id_plan),
    );

    if (plan?.cuatrimestres?.length) {
      return plan.cuatrimestres.flatMap((cuatrimestre) =>
        cuatrimestre.materias.map((materiaPlan) => ({
          ...materiaPlan.materia,
          cuatrimestre: cuatrimestre.nombre,
        })),
      );
    }

    return materias;
  }, [planes, materias, ofertaForm.id_plan]);

  const materiasOfertadasIds = useMemo(() => {
    return new Set(
      gruposMaterias
        .filter(
          (grupoMateria) =>
            String(grupoMateria.grupo?.id_grupo) ===
              String(ofertaForm.id_grupo) &&
            String(grupoMateria.periodo?.id_periodo) ===
              String(ofertaForm.id_periodo),
        )
        .map((grupoMateria) => grupoMateria.materia?.id_materia)
        .filter((idMateria) => idMateria !== undefined && idMateria !== null),
    );
  }, [gruposMaterias, ofertaForm.id_grupo, ofertaForm.id_periodo]);

  const materiasDisponiblesOferta = useMemo(() => {
    return materiasOferta.filter(
      (materia) => !materiasOfertadasIds.has(materia.id_materia),
    );
  }, [materiasOferta, materiasOfertadasIds]);

  useEffect(() => {
    const materiaExiste = materiasDisponiblesOferta.some(
      (materia) => String(materia.id_materia) === String(ofertaForm.id_materia),
    );

    if (materiaExiste) {
      return;
    }

    setOfertaForm((prev) => ({
      ...prev,
      id_materia: materiasDisponiblesOferta[0]?.id_materia || "",
    }));
  }, [materiasDisponiblesOferta, ofertaForm.id_materia]);

  const alumnosInscritosIds = useMemo(() => {
    return new Set(
      cargas
        .map((carga) => carga.alumno?.id_alumno)
        .filter((idAlumno) => idAlumno !== undefined && idAlumno !== null),
    );
  }, [cargas]);

  const candidatos = useMemo(() => {
    const busqueda = normalizarTexto(busquedaAlumno.trim());

    return alumnos
      .filter((alumno) => alumno.estatus !== "BAJA")
      .filter((alumno) => !alumnosInscritosIds.has(alumno.id_alumno))
      .filter((alumno) => {
        const texto = normalizarTexto(getAlumnoTexto(alumno));

        return busqueda === "" || texto.includes(busqueda);
      })
      .sort((a, b) =>
        nombreAlumnoApellidosPrimero(a, "").localeCompare(
          nombreAlumnoApellidosPrimero(b, ""),
        ),
      );
  }, [alumnos, alumnosInscritosIds, busquedaAlumno]);

  const cargasOrdenadas = useMemo(() => {
    return [...cargas].sort((a, b) =>
      nombreAlumnoApellidosPrimero(a.alumno, "").localeCompare(
        nombreAlumnoApellidosPrimero(b.alumno, ""),
      ),
    );
  }, [cargas]);

  const resumen = useMemo(() => {
    const cupo = grupoSeleccionado?.cupo_maximo || null;
    const inscritos = cargas.length;
    const disponibles = cupo === null ? null : Math.max(cupo - inscritos, 0);

    return {
      cupo,
      inscritos,
      disponibles,
    };
  }, [cargas, grupoSeleccionado]);

  const handleSeleccionGrupo = (grupoMateriaId) => {
    setMensaje("");
    setError("");
    setGrupoSeleccionadoId(grupoMateriaId);
  };

  const handleAbrirOferta = () => {
    const grupoId = grupoSeleccionado?.grupo?.id_grupo || ofertaForm.id_grupo;
    const periodoId =
      grupoSeleccionado?.periodo?.id_periodo || ofertaForm.id_periodo;

    setOfertaForm((prev) => ({
      ...prev,
      id_grupo: grupoId || prev.id_grupo,
      id_periodo: periodoId || prev.id_periodo,
      id_plan: getPlanParaGrupo(grupoId) || prev.id_plan,
      id_materia: "",
    }));
    setOfertaAbierta(true);
  };

  const handleOfertaChange = (event) => {
    const { name, value } = event.target;

    setOfertaForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "id_grupo"
        ? {
            id_plan: getPlanParaGrupo(value),
            id_materia: "",
          }
        : {}),
      ...(name === "id_plan" || name === "id_periodo"
        ? { id_materia: "" }
        : {}),
    }));
  };

  const handleCrearGrupoMateria = async (event) => {
    event.preventDefault();

    if (
      !ofertaForm.id_grupo ||
      !ofertaForm.id_materia ||
      !ofertaForm.id_docente ||
      !ofertaForm.id_periodo
    ) {
      setError("Selecciona grupo, materia, docente y periodo.");
      return;
    }

    setMensaje("");
    setError("");
    setGuardandoOferta(true);

    try {
      const grupoMateria = await crearGrupoMateria({
        id_grupo: Number(ofertaForm.id_grupo),
        id_materia: Number(ofertaForm.id_materia),
        id_docente: Number(ofertaForm.id_docente),
        id_periodo: Number(ofertaForm.id_periodo),
        aula: ofertaForm.aula.trim() || null,
        cupo_maximo: ofertaForm.cupo_maximo
          ? Number(ofertaForm.cupo_maximo)
          : null,
      });
      const gruposResponse = await obtenerGruposMaterias();

      setGruposMaterias(gruposResponse);
      setGrupoSeleccionadoId(grupoMateria.id_grupo_materia);
      setOfertaAbierta(false);
      setMensaje("Materia-grupo creada correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setGuardandoOferta(false);
    }
  };

  const handleAgregarAlumno = async (alumno) => {
    if (!grupoSeleccionado || savingId) return;

    setMensaje("");
    setError("");
    setSavingId(alumno.id_alumno);

    try {
      await crearCargaAcademica({
        id_alumno: alumno.id_alumno,
        id_grupo_materia: grupoSeleccionado.id_grupo_materia,
        oportunidad,
        intento: Number(intento) || 1,
        estatus: "CURSANDO",
        fecha_inscripcion: fechaInscripcion || null,
      });

      setMensaje(
        `${nombreAlumnoApellidosPrimero(alumno, "Alumno")} agregado correctamente.`,
      );
      await cargarCargas(grupoSeleccionado.id_grupo_materia);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setSavingId(null);
    }
  };

  const handleQuitarAlumno = async (carga) => {
    const confirmar = window.confirm(
      `Quitar a ${nombreAlumnoApellidosPrimero(
        carga.alumno,
        "este alumno",
      )} de la materia?`,
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");
    setDeletingId(carga.id_carga);

    try {
      await eliminarCargaAcademica(carga.id_carga);
      setMensaje("Alumno removido correctamente.");
      await cargarCargas(grupoSeleccionadoId);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setDeletingId(null);
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
    <div className="min-h-screen space-y-6 bg-[var(--background)] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Cargas academicas
          </h1>
          <p className="mt-1 text-slate-500">
            Alumnos, materias y grupos activos.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleAbrirOferta}
            disabled={guardandoOferta}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Nueva materia-grupo
          </button>

          <button
            type="button"
            onClick={cargarCatalogos}
            disabled={
              loadingCargas ||
              guardandoOferta ||
              Boolean(savingId) ||
              Boolean(deletingId)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {ofertaAbierta && (
        <form
          onSubmit={handleCrearGrupoMateria}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Nueva materia-grupo
            </h2>
            <button
              type="button"
              onClick={() => setOfertaAbierta(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Plan</span>
              <select
                name="id_plan"
                value={ofertaForm.id_plan}
                onChange={handleOfertaChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {planes.map((plan) => (
                  <option key={plan.id_plan} value={plan.id_plan}>
                    {plan.nombre_plan}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Grupo</span>
              <select
                name="id_grupo"
                value={ofertaForm.id_grupo}
                onChange={handleOfertaChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {grupos.map((grupo) => (
                  <option key={grupo.id_grupo} value={grupo.id_grupo}>
                    {grupo.nombre || `Grupo ${grupo.id_grupo}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Materia</span>
              <select
                name="id_materia"
                value={ofertaForm.id_materia}
                onChange={handleOfertaChange}
                disabled={materiasDisponiblesOferta.length === 0}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                {materiasDisponiblesOferta.length === 0 ? (
                  <option value="">Sin materias pendientes</option>
                ) : (
                  materiasDisponiblesOferta.map((materia) => (
                    <option key={materia.id_materia} value={materia.id_materia}>
                      {getMateriaOptionLabel(materia)}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Docente</span>
              <select
                name="id_docente"
                value={ofertaForm.id_docente}
                onChange={handleOfertaChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {docentes.map((docente) => (
                  <option key={docente.id_docente} value={docente.id_docente}>
                    {getDocenteLabel(docente)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Periodo</span>
              <select
                name="id_periodo"
                value={ofertaForm.id_periodo}
                onChange={handleOfertaChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {periodos.map((periodo) => (
                  <option key={periodo.id_periodo} value={periodo.id_periodo}>
                    {periodo.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Aula</span>
                <input
                  type="text"
                  name="aula"
                  value={ofertaForm.aula}
                  onChange={handleOfertaChange}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Cupo</span>
                <input
                  type="number"
                  min="1"
                  name="cupo_maximo"
                  value={ofertaForm.cupo_maximo}
                  onChange={handleOfertaChange}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOfertaAbierta(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                guardandoOferta ||
                !ofertaForm.id_materia ||
                materiasDisponiblesOferta.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {guardandoOferta ? "Creando..." : "Crear materia-grupo"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Materias y grupos
              </h2>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                {gruposMaterias.length}
              </span>
            </div>

            <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              <Search size={17} />
              <input
                type="search"
                value={busquedaGrupo}
                onChange={(event) => setBusquedaGrupo(event.target.value)}
                placeholder="Buscar grupo o materia"
                className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          {gruposFiltrados.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-500">
              No hay grupos para mostrar.
            </div>
          ) : (
            <div className="max-h-[calc(100vh-270px)] divide-y divide-slate-100 overflow-y-auto">
              {gruposFiltrados.map((grupoMateria) => {
                const seleccionado =
                  String(grupoSeleccionadoId) ===
                  String(grupoMateria.id_grupo_materia);

                return (
                  <button
                    type="button"
                    key={grupoMateria.id_grupo_materia}
                    onClick={() =>
                      handleSeleccionGrupo(grupoMateria.id_grupo_materia)
                    }
                    className={`w-full px-5 py-4 text-left transition ${
                      seleccionado
                        ? "bg-blue-50 text-blue-900"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          seleccionado
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-snug">
                          {grupoMateria.materia?.nombre || "Materia sin nombre"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {grupoMateria.grupo?.nombre || "Grupo sin nombre"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {getGrupoMeta(grupoMateria)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="space-y-5">
          {!grupoSeleccionado ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
              Selecciona una materia.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold text-slate-900">
                      {getGrupoTitulo(grupoSeleccionado)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {getGrupoMeta(grupoSeleccionado)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${
                      grupoSeleccionado.periodo?.estado === "ACTIVO"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {grupoSeleccionado.periodo?.estado || "SIN ESTADO"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        Inscritos
                      </p>
                      <Users size={18} className="text-blue-600" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {resumen.inscritos}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">Cupo</p>
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {resumen.cupo ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        Disponibles
                      </p>
                      <CalendarDays size={18} className="text-blue-600" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {resumen.disponibles ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[1fr_420px]">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[1fr_150px_120px_160px]">
                    <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                      <Search size={17} />
                      <input
                        type="search"
                        value={busquedaAlumno}
                        onChange={(event) =>
                          setBusquedaAlumno(event.target.value)
                        }
                        placeholder="Buscar alumno"
                        className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </label>

                    <select
                      value={oportunidad}
                      onChange={(event) => setOportunidad(event.target.value)}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="ORDINARIO">Ordinario</option>
                      <option value="EXTRAORDINARIO">Extraordinario</option>
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={intento}
                      onChange={(event) => setIntento(event.target.value)}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      aria-label="Intento"
                    />

                    <input
                      type="date"
                      value={fechaInscripcion}
                      onChange={(event) =>
                        setFechaInscripcion(event.target.value)
                      }
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      aria-label="Fecha de inscripcion"
                    />
                  </div>

                  {loadingCargas ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
                    </div>
                  ) : candidatos.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-500">
                      No hay alumnos disponibles.
                    </div>
                  ) : (
                    <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
                      {candidatos.map((alumno) => (
                        <div
                          key={alumno.id_alumno}
                          className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {nombreAlumnoApellidosPrimero(alumno)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Matricula {alumno.matricula || "Sin dato"} |{" "}
                              Control {alumno.numero_control || "Sin dato"}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {alumno.carrera?.nombre || "Carrera sin dato"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAgregarAlumno(alumno)}
                            disabled={Boolean(savingId) || loadingCargas}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <UserPlus size={18} />
                            {savingId === alumno.id_alumno
                              ? "Agregando..."
                              : "Agregar"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Lista del grupo
                    </h3>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                      {cargas.length}
                    </span>
                  </div>

                  {loadingCargas ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
                    </div>
                  ) : cargasOrdenadas.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-500">
                      Sin alumnos inscritos.
                    </div>
                  ) : (
                    <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
                      {cargasOrdenadas.map((carga) => (
                        <div
                          key={carga.id_carga}
                          className="grid grid-cols-[1fr_auto] gap-3 px-5 py-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {nombreAlumnoApellidosPrimero(carga.alumno)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {carga.alumno?.matricula || "Sin matricula"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {carga.oportunidad || "SIN OPORTUNIDAD"}
                              </span>
                              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {carga.estatus || "SIN ESTATUS"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuitarAlumno(carga)}
                            disabled={deletingId === carga.id_carga}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Quitar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
