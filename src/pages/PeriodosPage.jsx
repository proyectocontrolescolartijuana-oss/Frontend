import { useEffect, useMemo, useState } from "react";
import PeriodoHeader from "../components/periodos/PeriodoHeader";
import PeriodoForm from "../components/periodos/PeriodoForm";
import PeriodoListCard from "../components/periodos/PeriodoListCard";
import PeriodoModal from "../components/periodos/PeriodoModal";
import {
  actualizarPeriodo,
  cerrarPeriodo,
  crearPeriodo,
  eliminarPeriodo,
  obtenerPeriodos,
  previsualizarCierrePeriodo,
} from "../services/periodosService";
import { formatDateDDMMYYYY } from "../utils/fechas";

const normalizarTexto = (texto) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const getToday = () => {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const obtenerEtapaPeriodo = (periodo) => {
  if (periodo.estado === "PENDIENTE") {
    return { key: "PENDIENTES", label: "Pendiente" };
  }

  if (periodo.estado === "CERRADO") {
    return { key: "VENCIDOS", label: "Cerrado" };
  }

  const today = getToday();
  const fechaInicio = parseLocalDate(periodo.fecha_inicio);
  const fechaFin = parseLocalDate(periodo.fecha_fin);

  if (fechaInicio > today) {
    return { key: "FUTUROS", label: "Futuro" };
  }

  if (fechaFin < today) {
    return { key: "VENCIDOS", label: "Vencido" };
  }

  return { key: "ACTIVOS", label: "Activo" };
};

const formatDate = (dateString) => {
  return formatDateDDMMYYYY(dateString);
};

const getErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return fallback;
};

const resumenCierreTexto = (resumen) => {
  if (!resumen) {
    return "";
  }

  return [
    `Periodo a activar: ${resumen.periodo_activado?.nombre || "ninguno"}`,
    `Grupos que avanzan: ${resumen.grupos_avanzados || 0}`,
    `Materias-grupo nuevas: ${resumen.materias_grupo_creadas || 0}`,
    `Cargas nuevas: ${resumen.cargas_creadas || 0}`,
    `Alumnos omitidos: ${resumen.alumnos_omitidos?.length || 0}`,
    `Advertencias: ${resumen.advertencias?.length || 0}`,
  ].join("\n");
};

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("ACTIVOS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarPeriodos() {
    try {
      setError("");
      const response = await obtenerPeriodos();

      setPeriodos(response);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los periodos escolares.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    obtenerPeriodos()
      .then((response) => {
        if (activo) {
          setPeriodos(response);
        }
      })
      .catch((err) => {
        console.error(err);

        if (activo) {
          setError("No se pudieron cargar los periodos escolares.");
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

  const periodosConEtapa = useMemo(() => {
    return periodos
      .map((periodo) => ({
        ...periodo,
        etapa: obtenerEtapaPeriodo(periodo),
      }))
      .sort(
        (a, b) =>
          parseLocalDate(b.fecha_inicio).getTime() -
          parseLocalDate(a.fecha_inicio).getTime(),
      );
  }, [periodos]);

  const conteos = useMemo(() => {
    const base = {
      TODOS: periodosConEtapa.length,
      ACTIVOS: 0,
      PENDIENTES: 0,
      FUTUROS: 0,
      VENCIDOS: 0,
    };

    periodosConEtapa.forEach((periodo) => {
      base[periodo.etapa.key] += 1;
    });

    return base;
  }, [periodosConEtapa]);

  const periodosFiltrados = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busqueda.toLowerCase());

    return periodosConEtapa.filter((periodo) => {
      const coincideBusqueda = normalizarTexto(
        periodo.nombre.toLowerCase(),
      ).includes(busquedaNormalizada);

      const coincideFiltro = filtro === "TODOS" || periodo.etapa.key === filtro;

      return coincideBusqueda && coincideFiltro;
    });
  }, [periodosConEtapa, busqueda, filtro]);

  const handleCrear = async (formData) => {
    try {
      setError("");
      setMensaje("");

      const existeActivo = periodos.some(
        (periodo) => periodo.estado === "ACTIVO",
      );

      await crearPeriodo({
        ...formData,
        estado: existeActivo ? "PENDIENTE" : "ACTIVO",
      });
      await cargarPeriodos();

      return true;
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo crear el periodo."));

      return false;
    }
  };

  const handleEditar = (periodo) => {
    setPeriodoEditando(periodo);
    setModalAbierto(true);
  };

  const handleSubmitModal = async (formData) => {
    try {
      setError("");
      setMensaje("");
      const debeCerrarPeriodo =
        periodoEditando?.estado !== "CERRADO" && formData.estado === "CERRADO";

      let cierreResponse = null;

      if (debeCerrarPeriodo) {
        const resumen = await previsualizarCierrePeriodo(
          periodoEditando.id_periodo,
        );
        const confirmar = window.confirm(
          `Confirmar cierre de ${periodoEditando.nombre}?\n\n${resumenCierreTexto(
            resumen,
          )}`,
        );

        if (!confirmar) {
          return false;
        }

        cierreResponse = await cerrarPeriodo(periodoEditando.id_periodo);
      } else {
        await actualizarPeriodo(periodoEditando.id_periodo, formData);
      }

      setModalAbierto(false);
      setPeriodoEditando(null);

      await cargarPeriodos();

      if (debeCerrarPeriodo) {
        const resumen = cierreResponse?.resumen;

        setMensaje(
          [
            "Periodo cerrado correctamente.",
            resumen?.periodo_activado
              ? `${resumen.periodo_activado.nombre} quedo activo.`
              : "No habia periodo pendiente para activar.",
            `Se crearon ${resumen?.materias_grupo_creadas || 0} materias-grupo y ${resumen?.cargas_creadas || 0} cargas academicas.`,
          ].join(" "),
        );
      }

      return true;
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo actualizar el periodo."));

      return false;
    }
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setPeriodoEditando(null);
  };

  const handleEliminar = async (periodo) => {
    const confirmar = window.confirm(`Eliminar periodo ${periodo.nombre}?`);

    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");
      await eliminarPeriodo(periodo.id_periodo);
      await cargarPeriodos();

      if (periodoEditando?.id_periodo === periodo.id_periodo) {
        handleCerrarModal();
      }
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo eliminar el periodo."));
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
      <PeriodoHeader
        total={periodos.length}
        activos={conteos.ACTIVOS}
        pendientes={conteos.PENDIENTES}
        futuros={conteos.FUTUROS}
        vencidos={conteos.VENCIDOS}
      />

      <div className="h-px w-full bg-slate-200" />

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <PeriodoForm onSubmit={handleCrear} />
        </div>

        <div className="xl:col-span-2">
          <PeriodoListCard
            periodos={periodosFiltrados}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtro={filtro}
            setFiltro={setFiltro}
            conteos={conteos}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            formatDate={formatDate}
          />
        </div>
      </div>

      <PeriodoModal
        open={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitModal}
        periodo={periodoEditando}
      />
    </div>
  );
}
