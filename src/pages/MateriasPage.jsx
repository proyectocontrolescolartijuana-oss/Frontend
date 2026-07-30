import { useEffect, useMemo, useState } from "react";
import MateriaHeader from "../components/materias/MateriaHeader";
import MateriaForm from "../components/materias/MateriaForm";
import MateriaListCard from "../components/materias/MateriaListCard";
import MateriaModal from "../components/materias/MateriaModal";
import MateriaPrerrequisitosModal from "../components/materias/MateriaPrerrequisitosModal";

import {
  obtenerMaterias,
  crearMateria,
  eliminarMateria,
  actualizarMateria,
  crearPrerrequisitoMateria,
  actualizarPrerrequisitoMateria,
  eliminarPrerrequisitoMateria,
  obtenerPrerrequisitosMateria,
} from "../services/materiasService";

import { obtenerCarreras } from "../services/carrerasService";

const normalizarTexto = (texto) => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function MateriasPage() {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [carreraFiltro, setCarreraFiltro] = useState("TODAS");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState(null);
  const [modalPrerrequisitosAbierto, setModalPrerrequisitosAbierto] =
    useState(false);
  const [materiaPrerrequisitos, setMateriaPrerrequisitos] = useState(null);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  const [loadingPrerrequisitos, setLoadingPrerrequisitos] = useState(false);
  const [guardandoPrerrequisito, setGuardandoPrerrequisito] = useState(false);
  const [errorPrerrequisitos, setErrorPrerrequisitos] = useState("");

  async function cargarDatos() {
    try {
      const [materiasResponse, carrerasResponse] = await Promise.all([
        obtenerMaterias(),
        obtenerCarreras(),
      ]);

      setMaterias(materiasResponse);

      setCarreras(carrerasResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    Promise.all([obtenerMaterias(), obtenerCarreras()])
      .then(([materiasResponse, carrerasResponse]) => {
        if (activo) {
          setMaterias(materiasResponse);
          setCarreras(carrerasResponse);
        }
      })
      .catch((error) => {
        console.error(error);
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

  const materiasFiltradas = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busqueda.toLowerCase());

    return materias.filter((materia) => {
      const coincideBusqueda =
        normalizarTexto(materia.nombre.toLowerCase()).includes(
          busquedaNormalizada,
        ) ||
        normalizarTexto(materia.clave.toLowerCase()).includes(
          busquedaNormalizada,
        );

      const coincideCarrera =
        carreraFiltro === "TODAS" ||
        materia.carrera?.id_carrera === Number(carreraFiltro);

      return coincideBusqueda && coincideCarrera;
    });
  }, [materias, busqueda, carreraFiltro]);

  const handleCrear = async (formData) => {
    try {
      await crearMateria(formData);

      await cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditar = (materia) => {
    setMateriaEditando(materia);
    setModalAbierto(true);
  };

  const handleSubmitModal = async (formData) => {
    try {
      await actualizarMateria(materiaEditando.id_materia, formData);

      setModalAbierto(false);
      setMateriaEditando(null);

      await cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setMateriaEditando(null);
  };

  const handleEliminar = async (materia) => {
    const confirmar = window.confirm(`¿Eliminar materia ${materia.nombre}?`);

    if (!confirmar) return;

    try {
      await eliminarMateria(materia.id_materia);

      await cargarDatos();

      if (materiaEditando?.id_materia === materia.id_materia) {
        handleCerrarModal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cargarPrerrequisitos = async (materiaId) => {
    setLoadingPrerrequisitos(true);
    setErrorPrerrequisitos("");

    try {
      const response = await obtenerPrerrequisitosMateria(materiaId);
      setPrerrequisitos(response);
    } catch (error) {
      console.error(error);
      setErrorPrerrequisitos(
        error.response?.data?.detail ||
          "No se pudieron cargar los prerrequisitos",
      );
    } finally {
      setLoadingPrerrequisitos(false);
    }
  };

  const handleAbrirPrerrequisitos = async (materia) => {
    setMateriaPrerrequisitos(materia);
    setModalPrerrequisitosAbierto(true);
    setPrerrequisitos([]);

    await cargarPrerrequisitos(materia.id_materia);
  };

  const handleCerrarPrerrequisitos = () => {
    setModalPrerrequisitosAbierto(false);
    setMateriaPrerrequisitos(null);
    setPrerrequisitos([]);
    setErrorPrerrequisitos("");
  };

  const handleCrearPrerrequisito = async (formData) => {
    if (!materiaPrerrequisitos) return;

    setGuardandoPrerrequisito(true);
    setErrorPrerrequisitos("");

    try {
      await crearPrerrequisitoMateria(
        materiaPrerrequisitos.id_materia,
        formData,
      );

      await cargarPrerrequisitos(materiaPrerrequisitos.id_materia);
    } catch (error) {
      console.error(error);
      setErrorPrerrequisitos(
        error.response?.data?.detail ||
          "No se pudo registrar el prerrequisito",
      );
      throw error;
    } finally {
      setGuardandoPrerrequisito(false);
    }
  };

  const handleEliminarPrerrequisito = async (prerrequisito) => {
    if (!materiaPrerrequisitos) return;

    const confirmar = window.confirm("Eliminar este prerrequisito?");

    if (!confirmar) return;

    setGuardandoPrerrequisito(true);
    setErrorPrerrequisitos("");

    try {
      await eliminarPrerrequisitoMateria(
        materiaPrerrequisitos.id_materia,
        prerrequisito.id_prerrequisito,
      );

      await cargarPrerrequisitos(materiaPrerrequisitos.id_materia);
    } catch (error) {
      console.error(error);
      setErrorPrerrequisitos(
        error.response?.data?.detail ||
          "No se pudo eliminar el prerrequisito",
      );
    } finally {
      setGuardandoPrerrequisito(false);
    }
  };

  const handleActualizarPrerrequisito = async (prerrequisito, formData) => {
    if (!materiaPrerrequisitos) return;

    setGuardandoPrerrequisito(true);
    setErrorPrerrequisitos("");

    try {
      await actualizarPrerrequisitoMateria(
        materiaPrerrequisitos.id_materia,
        prerrequisito.id_prerrequisito,
        formData,
      );

      await cargarPrerrequisitos(materiaPrerrequisitos.id_materia);
    } catch (error) {
      console.error(error);
      setErrorPrerrequisitos(
        error.response?.data?.detail ||
          "No se pudo actualizar el prerrequisito",
      );
    } finally {
      setGuardandoPrerrequisito(false);
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
      <MateriaHeader total={materias.length} />

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Formulario */}
        <div className="xl:col-span-1">
          <MateriaForm carreras={carreras} onSubmit={handleCrear} />
        </div>

        {/* Tabla */}
        <div className="xl:col-span-2">
          <MateriaListCard
            materias={materiasFiltradas}
            carreras={carreras}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            carreraFiltro={carreraFiltro}
            setCarreraFiltro={setCarreraFiltro}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onPrerrequisitos={handleAbrirPrerrequisitos}
          />
        </div>
      </div>

      <MateriaModal
        open={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitModal}
        materia={materiaEditando}
      />

      {modalPrerrequisitosAbierto && (
        <MateriaPrerrequisitosModal
          key={materiaPrerrequisitos?.id_materia ?? "prerrequisitos"}
          open={modalPrerrequisitosAbierto}
          materia={materiaPrerrequisitos}
          materias={materias}
          prerrequisitos={prerrequisitos}
          loading={loadingPrerrequisitos}
          guardando={guardandoPrerrequisito}
          error={errorPrerrequisitos}
          onClose={handleCerrarPrerrequisitos}
          onCrear={handleCrearPrerrequisito}
          onActualizar={handleActualizarPrerrequisito}
          onEliminar={handleEliminarPrerrequisito}
        />
      )}
    </div>
  );
}
