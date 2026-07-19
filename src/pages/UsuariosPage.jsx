import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormAlert from "../components/usuarios/FormAlert";
import UsuarioDetalleModal from "../components/usuarios/UsuarioDetalleModal";
import UsuarioEditModal from "../components/usuarios/UsuarioEditModal";
import UsuariosDirectory from "../components/usuarios/UsuariosDirectory";
import UsuariosHeader from "../components/usuarios/UsuariosHeader";
import {
  actualizarContactoEmergencia,
  actualizarProcedenciaAcademica,
  actualizarSeguroMedico,
  actualizarTutor,
  actualizarUsuario,
  crearContactoEmergencia,
  crearProcedenciaAcademica,
  crearSeguroMedico,
  crearTutor,
  eliminarUsuario,
  obtenerDetalleUsuario,
  obtenerUsuarios,
  vincularAlumnoTutor,
} from "../services/usuariosService";
import { nombreApellidosPrimero } from "../utils/nombres";

const limpiarPayload = (payload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  );
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

const tieneValores = (payload) => {
  return Object.values(payload).some(
    (value) => value !== "" && value !== false && value !== null,
  );
};

const prepararPayload = (payload, camposIgnorados = []) => {
  const data = { ...payload };

  camposIgnorados.forEach((campo) => {
    delete data[campo];
  });

  return limpiarPayload(data);
};

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("TODOS");
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setUsuarios(await obtenerUsuarios());
    } catch (requestError) {
      console.error(requestError);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let activo = true;

    obtenerUsuarios()
      .then((response) => {
        if (activo) {
          setUsuarios(response);
        }
      })
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError("No se pudieron cargar los usuarios.");
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

  const usuariosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return usuarios
      .filter((usuario) => {
        const textoUsuario = [
          usuario.nombre,
          usuario.apellido_paterno,
          usuario.apellido_materno,
          usuario.correo,
          usuario.telefono,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const coincideBusqueda =
          busquedaNormalizada === "" ||
          textoUsuario.includes(busquedaNormalizada);

        const roles = usuario.roles?.map((role) => role.nombre) || [];
        const coincideRol =
          rolFiltro === "TODOS" ||
          (rolFiltro === "SIN_ROL" && roles.length === 0) ||
          roles.includes(rolFiltro);

        return coincideBusqueda && coincideRol;
      })
      .sort((a, b) => Number(b.id_usuario) - Number(a.id_usuario));
  }, [usuarios, busqueda, rolFiltro]);

  const handleVerDetalle = async (usuario) => {
    setMensaje("");
    setError("");
    setDetalleLoading(true);

    try {
      setUsuarioDetalle(await obtenerDetalleUsuario(usuario));
    } catch (requestError) {
      console.error(requestError);
      setError("No se pudo cargar el detalle del usuario.");
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleEditarUsuario = async (formData) => {
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      await actualizarUsuario(usuarioEditando.id_usuario, limpiarPayload(formData));
      setMensaje("Usuario actualizado correctamente.");
      setUsuarioEditando(null);
      await cargarUsuarios();
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarComplementarios = async ({
    tutores,
    contactosEmergencia,
    seguroMedico,
    procedenciaAcademica,
  }) => {
    const idAlumno = usuarioDetalle?.alumno?.id_alumno;

    if (!idAlumno) return;

    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const tutoresValidos = tutores
        .map((tutor) => prepararPayload(tutor, ["localId"]))
        .filter((tutor) => tutor.nombre?.trim());

      await Promise.all(
        tutoresValidos.map(async (tutor) => {
          if (tutor.id_tutor) {
            const idTutor = tutor.id_tutor;
            delete tutor.id_tutor;
            return actualizarTutor(idTutor, tutor);
          }

          const tutorCreado = await crearTutor(tutor);
          return vincularAlumnoTutor(idAlumno, tutorCreado.id_tutor);
        }),
      );

      const contactosValidos = contactosEmergencia
        .map((contacto) => prepararPayload(contacto, ["localId"]))
        .filter((contacto) => contacto.nombre?.trim());

      const contactosNormalizados = contactosValidos.some(
        (contacto) => contacto.contacto_principal,
      )
        ? contactosValidos
        : contactosValidos.map((contacto, index) => ({
            ...contacto,
            contacto_principal: index === 0,
          }));

      await Promise.all(
        contactosNormalizados.map((contacto) => {
          if (contacto.id_contacto) {
            const idContacto = contacto.id_contacto;
            delete contacto.id_contacto;
            return actualizarContactoEmergencia(idContacto, contacto);
          }

          return crearContactoEmergencia({
            ...contacto,
            id_alumno: idAlumno,
          });
        }),
      );

      const seguroPayload = prepararPayload(seguroMedico, ["id_seguro"]);

      if (seguroMedico.id_seguro) {
        await actualizarSeguroMedico(seguroMedico.id_seguro, seguroPayload);
      } else if (seguroPayload.tiene_seguro) {
        await crearSeguroMedico({
          ...seguroPayload,
          id_alumno: idAlumno,
        });
      }

      const procedenciaPayload = prepararPayload(procedenciaAcademica, [
        "id_procedencia",
      ]);

      if (procedenciaPayload.promedio_general) {
        procedenciaPayload.promedio_general = Number(
          procedenciaPayload.promedio_general,
        );
      }

      if (procedenciaAcademica.id_procedencia) {
        await actualizarProcedenciaAcademica(
          procedenciaAcademica.id_procedencia,
          procedenciaPayload,
        );
      } else if (tieneValores(procedenciaPayload)) {
        await crearProcedenciaAcademica({
          ...procedenciaPayload,
          id_alumno: idAlumno,
        });
      }

      const detalleActualizado = await obtenerDetalleUsuario(
        usuarioDetalle.usuario,
      );
      setUsuarioDetalle(detalleActualizado);
      setMensaje("Expediente actualizado correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
      throw requestError;
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarUsuario = async (usuario) => {
    const confirmar = window.confirm(
      `Deseas borrar a ${nombreApellidosPrimero(usuario, "este usuario")}?`,
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      await eliminarUsuario(usuario.id_usuario);
      setMensaje("Usuario eliminado correctamente.");
      await cargarUsuarios();
    } catch (requestError) {
      console.error(requestError);
      setError(obtenerMensajeError(requestError));
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
      <UsuariosHeader
        total={usuarios.length}
        onRefresh={cargarUsuarios}
        onCreate={() => navigate("/usuarios/nuevo")}
      />

      <div className="h-px w-full bg-slate-200" />

      {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
      {error && <FormAlert type="error">{error}</FormAlert>}
      {detalleLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          Cargando detalle del usuario...
        </div>
      )}

      <UsuariosDirectory
        usuarios={usuariosFiltrados}
        busqueda={busqueda}
        rolFiltro={rolFiltro}
        onBusquedaChange={setBusqueda}
        onRolFiltroChange={setRolFiltro}
        onVer={handleVerDetalle}
        onEditar={setUsuarioEditando}
        onEliminar={handleEliminarUsuario}
      />

      <UsuarioDetalleModal
        detalle={usuarioDetalle}
        guardando={guardando}
        onClose={() => setUsuarioDetalle(null)}
        onGuardarComplementarios={handleGuardarComplementarios}
      />

      <UsuarioEditModal
        key={usuarioEditando?.id_usuario || "sin-edicion"}
        usuario={usuarioEditando}
        guardando={guardando}
        onClose={() => setUsuarioEditando(null)}
        onSubmit={handleEditarUsuario}
      />
    </div>
  );
}
