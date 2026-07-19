import { useEffect, useMemo, useState } from "react";
import GrupoForm from "../components/grupos/GrupoForm";
import GrupoHeader from "../components/grupos/GrupoHeader";
import GrupoListCard from "../components/grupos/GrupoListCard";
import GrupoModal from "../components/grupos/GrupoModal";
import { obtenerCarreras } from "../services/carrerasService";
import {
  actualizarGrupo,
  crearGrupo,
  eliminarGrupo,
  obtenerGrupos,
} from "../services/gruposService";
import { obtenerCuatrimestres } from "../services/planesEstudioService";

const normalizarTexto = (texto = "") => {
  return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const ordenarCuatrimestres = (a, b) => {
  const numeroA = a.numero ?? a.id_cuatrimestre;
  const numeroB = b.numero ?? b.id_cuatrimestre;

  return numeroA - numeroB;
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

export default function GruposPage() {
  const [grupos, setGrupos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cuatrimestres, setCuatrimestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [carreraFiltro, setCarreraFiltro] = useState("TODAS");
  const [turnoFiltro, setTurnoFiltro] = useState("TODOS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  const aplicarDatos = (gruposResponse, carrerasResponse, cuatrimestresResponse) => {
    setGrupos(gruposResponse);
    setCarreras(carrerasResponse);
    setCuatrimestres([...cuatrimestresResponse].sort(ordenarCuatrimestres));
  };

  async function cargarDatos() {
    try {
      const [gruposResponse, carrerasResponse, cuatrimestresResponse] =
        await Promise.all([
          obtenerGrupos(),
          obtenerCarreras(),
          obtenerCuatrimestres(),
        ]);

      aplicarDatos(gruposResponse, carrerasResponse, cuatrimestresResponse);
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    Promise.all([obtenerGrupos(), obtenerCarreras(), obtenerCuatrimestres()])
      .then(([gruposResponse, carrerasResponse, cuatrimestresResponse]) => {
        if (activo) {
          aplicarDatos(gruposResponse, carrerasResponse, cuatrimestresResponse);
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
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const carrerasMap = useMemo(() => {
    return new Map(
      carreras.map((carrera) => [Number(carrera.id_carrera), carrera]),
    );
  }, [carreras]);

  const cuatrimestresMap = useMemo(() => {
    return new Map(
      cuatrimestres.map((cuatrimestre) => [
        Number(cuatrimestre.id_cuatrimestre),
        cuatrimestre,
      ]),
    );
  }, [cuatrimestres]);

  const gruposConDetalle = useMemo(() => {
    return grupos
      .map((grupo) => {
        const carrera = carrerasMap.get(Number(grupo.id_carrera));
        const cuatrimestre = cuatrimestresMap.get(
          Number(grupo.id_cuatrimestre),
        );

        return {
          ...grupo,
          carreraNombre: carrera?.nombre || "Carrera no encontrada",
          cuatrimestreNombre:
            cuatrimestre?.nombre || "Cuatrimestre no encontrado",
          cuatrimestreNumero:
            cuatrimestre?.numero ?? cuatrimestre?.id_cuatrimestre ?? 0,
        };
      })
      .sort((a, b) => {
        const carreraCompare = a.carreraNombre.localeCompare(b.carreraNombre);

        if (carreraCompare !== 0) return carreraCompare;

        if (a.cuatrimestreNumero !== b.cuatrimestreNumero) {
          return a.cuatrimestreNumero - b.cuatrimestreNumero;
        }

        return (a.nombre || "").localeCompare(b.nombre || "");
      });
  }, [grupos, carrerasMap, cuatrimestresMap]);

  const gruposBaseFiltrados = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busqueda.trim().toLowerCase());

    return gruposConDetalle.filter((grupo) => {
      const coincideBusqueda =
        !busquedaNormalizada ||
        [
          grupo.nombre,
          grupo.carreraNombre,
          grupo.cuatrimestreNombre,
          grupo.turno,
        ].some((valor) =>
          normalizarTexto(valor?.toLowerCase()).includes(busquedaNormalizada),
        );

      const coincideCarrera =
        carreraFiltro === "TODAS" ||
        Number(grupo.id_carrera) === Number(carreraFiltro);

      return coincideBusqueda && coincideCarrera;
    });
  }, [gruposConDetalle, busqueda, carreraFiltro]);

  const gruposFiltrados = useMemo(() => {
    if (turnoFiltro === "TODOS") {
      return gruposBaseFiltrados;
    }

    return gruposBaseFiltrados.filter((grupo) => grupo.turno === turnoFiltro);
  }, [gruposBaseFiltrados, turnoFiltro]);

  const conteosTurno = useMemo(() => {
    return gruposBaseFiltrados.reduce(
      (conteos, grupo) => ({
        ...conteos,
        [grupo.turno]: (conteos[grupo.turno] ?? 0) + 1,
      }),
      { TODOS: gruposBaseFiltrados.length, MATUTINO: 0, VESPERTINO: 0 },
    );
  }, [gruposBaseFiltrados]);

  const conteosHeader = useMemo(() => {
    return grupos.reduce(
      (conteos, grupo) => ({
        ...conteos,
        [grupo.turno]: (conteos[grupo.turno] ?? 0) + 1,
      }),
      { MATUTINO: 0, VESPERTINO: 0 },
    );
  }, [grupos]);

  const handleCrear = async (formData) => {
    setGuardando(true);
    setError("");

    try {
      await crearGrupo(formData);
      await cargarDatos();

      return true;
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));

      return false;
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (grupo) => {
    setGrupoEditando(grupo);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setGrupoEditando(null);
  };

  const handleSubmitModal = async (formData) => {
    if (!grupoEditando) return false;

    setGuardando(true);
    setError("");

    try {
      await actualizarGrupo(grupoEditando.id_grupo, formData);
      handleCerrarModal();
      await cargarDatos();

      return true;
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));

      return false;
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (grupo) => {
    const confirmar = window.confirm(
      `Eliminar grupo ${grupo.nombre || grupo.id_grupo}?`,
    );

    if (!confirmar) return;

    setGuardando(true);
    setError("");

    try {
      await eliminarGrupo(grupo.id_grupo);
      await cargarDatos();

      if (grupoEditando?.id_grupo === grupo.id_grupo) {
        handleCerrarModal();
      }
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
      <GrupoHeader
        total={grupos.length}
        matutinos={conteosHeader.MATUTINO}
        vespertinos={conteosHeader.VESPERTINO}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <GrupoForm
            carreras={carreras}
            cuatrimestres={cuatrimestres}
            onSubmit={handleCrear}
            guardando={guardando}
          />
        </div>

        <div className="xl:col-span-2">
          <GrupoListCard
            grupos={gruposFiltrados}
            carreras={carreras}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            carreraFiltro={carreraFiltro}
            setCarreraFiltro={setCarreraFiltro}
            turnoFiltro={turnoFiltro}
            setTurnoFiltro={setTurnoFiltro}
            conteosTurno={conteosTurno}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        </div>
      </div>

      <GrupoModal
        open={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitModal}
        grupo={grupoEditando}
        carreras={carreras}
        cuatrimestres={cuatrimestres}
        guardando={guardando}
      />
    </div>
  );
}
