import { useEffect, useState } from "react";
import CarreraHeader from "../components/carreras/CarreraHeader";
import CarreraForm from "../components/carreras/CarreraForm";
import CarreraListCard from "../components/carreras/CarreraListCard";
import CarreraModal from "../components/carreras/CarreraModal";

import {
  obtenerCarreras,
  crearCarrera,
  eliminarCarrera,
  actualizarCarrera,
} from "../services/carrerasService";

export default function CarrerasPage() {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [carreraEditando, setCarreraEditando] = useState(null);

  async function cargarCarreras() {
    try {
      const response = await obtenerCarreras();
      setCarreras(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    obtenerCarreras()
      .then((response) => {
        if (activo) {
          setCarreras(response);
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

  const handleCrear = async (formData) => {
    try {
      await crearCarrera(formData);
      await cargarCarreras();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditar = (carrera) => {
    setCarreraEditando(carrera);
    setModalAbierto(true);
  };

  const handleSubmitModal = async (formData) => {
    try {
      await actualizarCarrera(carreraEditando.id_carrera, formData);

      setModalAbierto(false);
      setCarreraEditando(null);

      await cargarCarreras();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setCarreraEditando(null);
  };

  const handleEliminar = async (carrera) => {
    const confirmar = window.confirm(`¿Eliminar carrera ${carrera.nombre}?`);

    if (!confirmar) return;

    try {
      await eliminarCarrera(carrera.id_carrera);
      await cargarCarreras();

      if (carreraEditando?.id_carrera === carrera.id_carrera) {
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
      <CarreraHeader total={carreras.length} />

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Formulario */}
        <div className="xl:col-span-1">
          <CarreraForm onSubmit={handleCrear} />
        </div>

        {/* Tabla */}
        <div className="xl:col-span-2">
          <CarreraListCard
            carreras={carreras}
            onEliminar={handleEliminar}
            onEditar={handleEditar}
          />
        </div>
      </div>

      <CarreraModal
        open={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitModal}
        carrera={carreraEditando}
      />
    </div>
  );
}
