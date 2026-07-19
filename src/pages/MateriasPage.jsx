import { useEffect, useMemo, useState } from "react";
import MateriaHeader from "../components/materias/MateriaHeader";
import MateriaForm from "../components/materias/MateriaForm";
import MateriaListCard from "../components/materias/MateriaListCard";
import MateriaModal from "../components/materias/MateriaModal";

import {
  obtenerMaterias,
  crearMateria,
  eliminarMateria,
  actualizarMateria,
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
          />
        </div>
      </div>

      <MateriaModal
        open={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitModal}
        materia={materiaEditando}
      />
    </div>
  );
}
