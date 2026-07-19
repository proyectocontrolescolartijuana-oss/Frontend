import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FormAlert from "../components/usuarios/FormAlert";
import UsuarioForm from "../components/usuarios/UsuarioForm";
import {
  alumnoInicial,
  contactoEmergenciaInicial,
  DEFAULT_USER_PASSWORD,
  docenteInicial,
  procedenciaAcademicaInicial,
  seguroMedicoInicial,
  tutorInicial,
  usuarioInicial,
} from "../components/usuarios/usuarioFormConfig";
import { obtenerGrupos } from "../services/alumnosGruposService";
import { obtenerCarreras } from "../services/carrerasService";
import { obtenerPeriodos } from "../services/periodosService";
import { obtenerPlanesEstudio } from "../services/planesEstudioService";
import {
  crearUsuarioPorRol,
  obtenerSiguienteMatriculaAlumno,
} from "../services/usuariosService";

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

  return "No se pudo crear el usuario.";
};

const tieneValores = (payload) => {
  return Object.values(payload).some(
    (value) => value !== "" && value !== false && value !== null,
  );
};

const obtenerPeriodoActivoId = (periodos = []) => {
  return (
    periodos.find((periodo) => periodo.estado === "ACTIVO")?.id_periodo ||
    periodos[0]?.id_periodo ||
    ""
  );
};

export default function UsuariosAltaPage() {
  const navigate = useNavigate();
  const [rol, setRol] = useState("ALUMNO");
  const [usuarioForm, setUsuarioForm] = useState(usuarioInicial);
  const [alumnoForm, setAlumnoForm] = useState(alumnoInicial);
  const [docenteForm, setDocenteForm] = useState(docenteInicial);
  const [tutorForm, setTutorForm] = useState(tutorInicial);
  const [contactosEmergenciaForm, setContactosEmergenciaForm] = useState([
    { ...contactoEmergenciaInicial, id: crypto.randomUUID() },
  ]);
  const [seguroMedicoForm, setSeguroMedicoForm] = useState(seguroMedicoInicial);
  const [procedenciaAcademicaForm, setProcedenciaAcademicaForm] = useState(
    procedenciaAcademicaInicial,
  );
  const [carreras, setCarreras] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [matriculaSugerida, setMatriculaSugerida] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerCarreras(),
      obtenerPlanesEstudio(),
      obtenerGrupos(),
      obtenerPeriodos(),
      obtenerSiguienteMatriculaAlumno(),
    ]).then(
      ([
        carrerasResponse,
        planesResponse,
        gruposResponse,
        periodosResponse,
        matriculaResponse,
      ]) => {
        if (activo) {
          setCarreras(carrerasResponse);
          setPlanes(planesResponse);
          setGrupos(gruposResponse);
          setPeriodos(periodosResponse);
          setMatriculaSugerida(matriculaResponse);
          setAlumnoForm((prev) => ({
            ...prev,
            id_periodo:
              prev.id_periodo || obtenerPeriodoActivoId(periodosResponse),
          }));
        }
      },
    )
      .catch((requestError) => {
        console.error(requestError);

        if (activo) {
          setError("No se pudieron cargar los catalogos del formulario.");
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

  const planesDisponibles = useMemo(() => {
    if (!alumnoForm.id_carrera) {
      return planes;
    }

    return planes.filter(
      (plan) => plan.carrera?.id_carrera === Number(alumnoForm.id_carrera),
    );
  }, [planes, alumnoForm.id_carrera]);

  const gruposDisponibles = useMemo(() => {
    if (!alumnoForm.id_carrera) {
      return grupos;
    }

    return grupos.filter(
      (grupo) => grupo.id_carrera === Number(alumnoForm.id_carrera),
    );
  }, [grupos, alumnoForm.id_carrera]);

  const resetForm = () => {
    setUsuarioForm(usuarioInicial);
    setAlumnoForm({
      ...alumnoInicial,
      id_periodo: obtenerPeriodoActivoId(periodos),
    });
    setDocenteForm(docenteInicial);
    setTutorForm(tutorInicial);
    setContactosEmergenciaForm([
      { ...contactoEmergenciaInicial, id: crypto.randomUUID() },
    ]);
    setSeguroMedicoForm(seguroMedicoInicial);
    setProcedenciaAcademicaForm(procedenciaAcademicaInicial);
    setRol("ALUMNO");
  };

  const handleSimpleChange = (setter) => (event) => {
    const { name, value, type, checked } = event.target;

    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAlumnoChange = (event) => {
    const { name, value } = event.target;

    setAlumnoForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "id_carrera" ? { id_plan: "", id_grupo: "" } : {}),
    }));
  };

  const handleSeguroMedicoChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSeguroMedicoForm((prev) => {
      if (name === "tiene_seguro" && !checked) {
        return {
          ...prev,
          tiene_seguro: false,
          institucion: "",
          numero_poliza: "",
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleContactoEmergenciaChange = (id, event) => {
    const { name, value, type, checked } = event.target;

    setContactosEmergenciaForm((prev) =>
      prev.map((contacto) => {
        if (contacto.id !== id) {
          if (name === "contacto_principal" && checked) {
            return {
              ...contacto,
              contacto_principal: false,
            };
          }

          return contacto;
        }

        return {
          ...contacto,
          [name]: type === "checkbox" ? checked : value,
        };
      }),
    );
  };

  const handleAgregarContactoEmergencia = () => {
    setContactosEmergenciaForm((prev) => [
      ...prev,
      {
        ...contactoEmergenciaInicial,
        id: crypto.randomUUID(),
        contacto_principal: prev.length === 0,
      },
    ]);
  };

  const handleEliminarContactoEmergencia = (id) => {
    setContactosEmergenciaForm((prev) => {
      const contactos = prev.filter((contacto) => contacto.id !== id);

      if (
        contactos.length > 0 &&
        !contactos.some((c) => c.contacto_principal)
      ) {
        return contactos.map((contacto, index) => ({
          ...contacto,
          contacto_principal: index === 0,
        }));
      }

      return contactos;
    });
  };

  const prepararAlumno = () => {
    const data = limpiarPayload(alumnoForm);
    delete data.matricula;

    const alumno = {
      ...data,
      id_carrera: Number(data.id_carrera),
      id_plan: Number(data.id_plan),
    };

    if (data.id_grupo) {
      alumno.id_grupo = Number(data.id_grupo);
    }

    if (data.id_periodo) {
      alumno.id_periodo = Number(data.id_periodo);
    }

    return alumno;
  };

  const prepararTutor = () => {
    if (!tutorForm.nombre.trim()) {
      return undefined;
    }

    return limpiarPayload(tutorForm);
  };

  const prepararContactosEmergencia = () => {
    const contactos = contactosEmergenciaForm
      .filter((contacto) => contacto.nombre.trim())
      .map((contacto) => {
        const data = { ...contacto };
        delete data.id;

        return limpiarPayload(data);
      });

    if (contactos.length === 0) {
      return undefined;
    }

    if (!contactos.some((contacto) => contacto.contacto_principal)) {
      return contactos.map((contacto, index) => ({
        ...contacto,
        contacto_principal: index === 0,
      }));
    }

    return contactos;
  };

  const prepararSeguroMedico = () => {
    if (!seguroMedicoForm.tiene_seguro) {
      return undefined;
    }

    if (!tieneValores(seguroMedicoForm)) {
      return undefined;
    }

    return limpiarPayload(seguroMedicoForm);
  };

  const prepararProcedenciaAcademica = () => {
    if (!tieneValores(procedenciaAcademicaForm)) {
      return undefined;
    }

    const data = limpiarPayload(procedenciaAcademicaForm);

    if (data.promedio_general) {
      data.promedio_general = Number(data.promedio_general);
    }

    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      await crearUsuarioPorRol({
        rol,
        usuario: {
          ...limpiarPayload(usuarioForm),
          password: usuarioForm.password || DEFAULT_USER_PASSWORD,
        },
        alumno: rol === "ALUMNO" ? prepararAlumno() : undefined,
        docente: rol === "DOCENTE" ? limpiarPayload(docenteForm) : undefined,
        tutor: rol === "ALUMNO" ? prepararTutor() : undefined,
        contactosEmergencia:
          rol === "ALUMNO" ? prepararContactosEmergencia() : undefined,
        seguroMedico: rol === "ALUMNO" ? prepararSeguroMedico() : undefined,
        procedenciaAcademica:
          rol === "ALUMNO" ? prepararProcedenciaAcademica() : undefined,
      });

      setMensaje("Usuario creado correctamente.");
      resetForm();

      try {
        setMatriculaSugerida(await obtenerSiguienteMatriculaAlumno());
      } catch (matriculaError) {
        console.error(matriculaError);
        setMatriculaSugerida("");
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Alta de usuario</h1>

          <p className="mt-1 text-slate-500">
            Captura usuarios, alumnos, docentes o control escolar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/usuarios")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Volver al directorio
        </button>
      </div>

      <div className="h-px w-full bg-slate-200" />

      {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
      {error && <FormAlert type="error">{error}</FormAlert>}

      <div className="max">
        <UsuarioForm
          rol={rol}
          usuarioForm={usuarioForm}
          alumnoForm={alumnoForm}
          docenteForm={docenteForm}
          tutorForm={tutorForm}
          contactosEmergenciaForm={contactosEmergenciaForm}
          seguroMedicoForm={seguroMedicoForm}
          procedenciaAcademicaForm={procedenciaAcademicaForm}
          carreras={carreras}
          planesDisponibles={planesDisponibles}
          gruposDisponibles={gruposDisponibles}
          periodos={periodos}
          matriculaSugerida={matriculaSugerida}
          mensaje=""
          error=""
          guardando={guardando}
          onRolChange={setRol}
          onUsuarioChange={handleSimpleChange(setUsuarioForm)}
          onAlumnoChange={handleAlumnoChange}
          onDocenteChange={handleSimpleChange(setDocenteForm)}
          onTutorChange={handleSimpleChange(setTutorForm)}
          onContactoEmergenciaChange={handleContactoEmergenciaChange}
          onAgregarContactoEmergencia={handleAgregarContactoEmergencia}
          onEliminarContactoEmergencia={handleEliminarContactoEmergencia}
          onSeguroMedicoChange={handleSeguroMedicoChange}
          onProcedenciaAcademicaChange={handleSimpleChange(
            setProcedenciaAcademicaForm,
          )}
          onReset={resetForm}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
