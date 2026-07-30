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
  subirLogoCarrera,
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

  const prepararCarreraPayload = async (formData) => {
    const { logoFile, ...payload } = formData;

    if (logoFile) {
      const logoSubido = await subirLogoCarrera(logoFile);
      payload.logo = logoSubido.logo;
    }

    return payload;
  };

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
      const payload = await prepararCarreraPayload(formData);
      await crearCarrera(payload);
      await cargarCarreras();
    } catch (error) {
      console.error(error);
      window.alert(
        error.response?.data?.detail ||
          "No se pudo eliminar la carrera. Revisa si tiene informacion relacionada.",
      );
    }
  };

  const handleEditar = (carrera) => {
    setCarreraEditando(carrera);
    setModalAbierto(true);
  };

  const handleSubmitModal = async (formData) => {
    try {
      const payload = await prepararCarreraPayload(formData);
      await actualizarCarrera(carreraEditando.id_carrera, payload);

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
