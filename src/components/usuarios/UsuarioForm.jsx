import { Save, UserPlus } from "lucide-react";
import AlumnoComplementariosFields from "./AlumnoComplementariosFields";
import AlumnoFields from "./AlumnoFields";
import ControlEscolarNotice from "./ControlEscolarNotice";
import DatosGeneralesFields from "./DatosGeneralesFields";
import DocenteFields from "./DocenteFields";
import FormAlert from "./FormAlert";
import RolSelector from "./RolSelector";

export default function UsuarioForm({
  rol,
  usuarioForm,
  alumnoForm,
  docenteForm,
  tutorForm,
  contactosEmergenciaForm,
  seguroMedicoForm,
  procedenciaAcademicaForm,
  carreras,
  planesDisponibles,
  gruposDisponibles,
  periodos,
  matriculaSugerida,
  mensaje,
  error,
  guardando,
  onRolChange,
  onUsuarioChange,
  onAlumnoChange,
  onDocenteChange,
  onTutorChange,
  onContactoEmergenciaChange,
  onAgregarContactoEmergencia,
  onEliminarContactoEmergencia,
  onSeguroMedicoChange,
  onProcedenciaAcademicaChange,
  onReset,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <UserPlus size={22} />
        </span>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Alta de usuario
          </h2>

          <p className="text-sm text-slate-500">
            Alumno, docente o control escolar
          </p>
        </div>
      </div>

      {mensaje && <FormAlert type="success">{mensaje}</FormAlert>}
      {error && <FormAlert type="error">{error}</FormAlert>}

      <RolSelector rol={rol} onChange={onRolChange} />

      <DatosGeneralesFields form={usuarioForm} onChange={onUsuarioChange} />

      {rol === "ALUMNO" && (
        <AlumnoFields
          form={alumnoForm}
          carreras={carreras}
          planesDisponibles={planesDisponibles}
          gruposDisponibles={gruposDisponibles}
          periodos={periodos}
          matriculaSugerida={matriculaSugerida}
          onChange={onAlumnoChange}
        />
      )}

      {rol === "ALUMNO" && (
        <AlumnoComplementariosFields
          tutorForm={tutorForm}
          contactosEmergenciaForm={contactosEmergenciaForm}
          seguroMedicoForm={seguroMedicoForm}
          procedenciaAcademicaForm={procedenciaAcademicaForm}
          onTutorChange={onTutorChange}
          onContactoEmergenciaChange={onContactoEmergenciaChange}
          onAgregarContactoEmergencia={onAgregarContactoEmergencia}
          onEliminarContactoEmergencia={onEliminarContactoEmergencia}
          onSeguroMedicoChange={onSeguroMedicoChange}
          onProcedenciaAcademicaChange={onProcedenciaAcademicaChange}
        />
      )}

      {rol === "DOCENTE" && (
        <DocenteFields form={docenteForm} onChange={onDocenteChange} />
      )}

      {rol === "CONTROL_ESCOLAR" && <ControlEscolarNotice />}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Limpiar
        </button>

        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B245B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Save size={18} />
          {guardando ? "Guardando..." : "Guardar usuario"}
        </button>
      </div>
    </form>
  );
}
