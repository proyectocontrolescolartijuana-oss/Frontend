import api from "./api";

export const ROLES_USUARIO = {
  ALUMNO: {
    id: 4,
    label: "Alumno",
  },
  DOCENTE: {
    id: 3,
    label: "Docente",
  },
  CONTROL_ESCOLAR: {
    id: 2,
    label: "Control escolar",
  },
};

export const obtenerUsuarios = async () => {
  const response = await api.get("/usuarios");

  return response.data;
};

export const crearUsuario = async (data) => {
  const response = await api.post("/usuarios", data);

  return response.data;
};

export const actualizarUsuario = async (idUsuario, data) => {
  const response = await api.patch(`/usuarios/${idUsuario}`, data);

  return response.data;
};

export const eliminarUsuario = async (idUsuario) => {
  const response = await api.delete(`/usuarios/${idUsuario}`);

  return response.data;
};

export const asignarRolUsuario = async (idUsuario, idRol) => {
  const response = await api.post("/usuarios-roles", {
    id_usuario: idUsuario,
    id_rol: idRol,
  });

  return response.data;
};

export const quitarRolUsuario = async (idUsuario, idRol) => {
  const response = await api.delete(`/usuarios-roles/${idUsuario}/${idRol}`);

  return response.data;
};

export const crearAlumno = async (data) => {
  const response = await api.post("/alumnos", data);

  return response.data;
};

export const obtenerSiguienteMatriculaAlumno = async () => {
  const response = await api.get("/alumnos/siguiente-matricula");

  return response.data?.matricula || "";
};

export const obtenerAlumnoDetalle = async (idAlumno) => {
  const response = await api.get(`/alumnos/${idAlumno}/detalle`);

  return response.data;
};

export const obtenerAlumnosDetalle = async () => {
  const response = await api.get("/alumnos/detalle");

  return response.data;
};

export const crearDocente = async (data) => {
  const response = await api.post("/docentes", data);

  return response.data;
};

export const crearTutor = async (data) => {
  const response = await api.post("/tutores", data);

  return response.data;
};

export const actualizarTutor = async (idTutor, data) => {
  const response = await api.patch(`/tutores/${idTutor}`, data);

  return response.data;
};

export const vincularAlumnoTutor = async (idAlumno, idTutor) => {
  const response = await api.post("/alumnos-tutores", {
    id_alumno: idAlumno,
    id_tutor: idTutor,
  });

  return response.data;
};

export const crearContactoEmergencia = async (data) => {
  const response = await api.post("/contactos-emergencia", data);

  return response.data;
};

export const actualizarContactoEmergencia = async (idContacto, data) => {
  const response = await api.patch(`/contactos-emergencia/${idContacto}`, data);

  return response.data;
};

export const crearSeguroMedico = async (data) => {
  const response = await api.post("/seguros-medicos", data);

  return response.data;
};

export const actualizarSeguroMedico = async (idSeguro, data) => {
  const response = await api.patch(`/seguros-medicos/${idSeguro}`, data);

  return response.data;
};

export const crearProcedenciaAcademica = async (data) => {
  const response = await api.post("/procedencias-academicas", data);

  return response.data;
};

export const actualizarProcedenciaAcademica = async (idProcedencia, data) => {
  const response = await api.patch(
    `/procedencias-academicas/${idProcedencia}`,
    data,
  );

  return response.data;
};

export const obtenerDetalleUsuario = async (usuario) => {
  const response = await api.get(`/usuarios/${usuario.id_usuario}/expediente`);

  return response.data;
};

export const crearUsuarioPorRol = async ({
  usuario,
  rol,
  alumno,
  docente,
  tutor,
  contactosEmergencia,
  seguroMedico,
  procedenciaAcademica,
}) => {
  const usuarioCreado = await crearUsuario({
    ...usuario,
    roles: [],
  });

  const idRol = ROLES_USUARIO[rol].id;

  try {
    await asignarRolUsuario(usuarioCreado.id_usuario, idRol);

    if (rol === "ALUMNO") {
      const alumnoCreado = await crearAlumno({
        ...alumno,
        id_usuario: usuarioCreado.id_usuario,
      });

      if (tutor) {
        const tutorCreado = await crearTutor(tutor);
        await vincularAlumnoTutor(alumnoCreado.id_alumno, tutorCreado.id_tutor);
      }

      if (contactosEmergencia?.length > 0) {
        await Promise.all(
          contactosEmergencia.map((contactoEmergencia) =>
            crearContactoEmergencia({
              ...contactoEmergencia,
              id_alumno: alumnoCreado.id_alumno,
            }),
          ),
        );
      }

      if (seguroMedico) {
        await crearSeguroMedico({
          ...seguroMedico,
          id_alumno: alumnoCreado.id_alumno,
        });
      }

      if (procedenciaAcademica) {
        await crearProcedenciaAcademica({
          ...procedenciaAcademica,
          id_alumno: alumnoCreado.id_alumno,
        });
      }
    }

    if (rol === "DOCENTE") {
      await crearDocente({
        ...docente,
        id_usuario: usuarioCreado.id_usuario,
      });
    }

    return usuarioCreado;
  } catch (error) {
    try {
      await quitarRolUsuario(usuarioCreado.id_usuario, idRol);
      await eliminarUsuario(usuarioCreado.id_usuario);
    } catch (cleanupError) {
      console.error("No se pudo revertir el usuario creado:", cleanupError);
    }

    throw error;
  }
};
