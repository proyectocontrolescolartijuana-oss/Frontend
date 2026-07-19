import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import selloUnifront from "../assets/Unifront1954Sello.png";
import {
  obtenerAlumnoDetalle,
  obtenerAlumnosDetalle,
  obtenerDetalleUsuario,
} from "../services/usuariosService";
import { obtenerMiExpediente } from "../services/authService";
import { useAuth } from "../context/authStore";
import { formatDateDDMMYYYY } from "../utils/fechas";

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const initialForm = {
  idAlumno: "",
  matricula: "",
  fecha: "",
  nombreAlumno: "",
  carrera: "Licenciatura en Nutrición",
  lugarNacimiento: "",
  fechaNacimiento: "",
  edad: "",
  estadoCivil: "",
  curp: "",
  nacionalidad: "",
  estatus: "",
  grupo: "",
  planEstudios: "",
  correoElectronico: "",
  telHogar: "",
  celular: "",
  radio: "",
  domicilio: "",
  lugarTrabajo: "",
  puestoDesempenado: "",
  escuelaProcedencia: "",
  promedioFinal: "",
  tieneSeguro: "",
  institucionSeguro: "",
  padreTutorNombre: "",
  padreTutorOcupacion: "",
  padreTutorTelTrabajo: "",
  padreTutorExt: "",
  madreNombre: "",
  madreOcupacion: "",
  madreTelTrabajo: "",
  madreExt: "",
  contactoEmergencia: "",
  contactoTelefono: "",
};

const value = (text) => text || "";

const calcularEdad = (fecha) => {
  if (!fecha) return "";

  const nacimiento = new Date(`${String(fecha).split("T")[0]}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad >= 0 ? String(edad) : "";
};

const getGrupoActual = (expediente) => {
  const cargas = expediente?.cargas_academicas || [];
  const cargaActiva =
    cargas.find((carga) => carga.estatus === "CURSANDO") || cargas[0];

  return cargaActiva?.grupo_materia?.grupo?.nombre || "";
};

const getTutorPadre = (expediente) =>
  expediente?.tutores?.find((tutor) =>
    normalizar(tutor.parentesco).includes("padre"),
  ) ||
  expediente?.tutores?.[0] ||
  {};

const getTutorMadre = (expediente) =>
  expediente?.tutores?.find((tutor) =>
    normalizar(tutor.parentesco).includes("madre"),
  ) ||
  expediente?.tutores?.[1] ||
  {};

const getContactoPrincipal = (expediente) =>
  expediente?.contactos_emergencia?.find(
    (contacto) => contacto.contacto_principal,
  ) ||
  expediente?.contactos_emergencia?.[0] ||
  {};

const getSeguro = (expediente) => expediente?.seguros_medicos?.[0] || {};

const buildFichaData = ({ alumnoLista, alumnoDetalle, expedienteDetalle }) => {
  const alumno = expedienteDetalle?.alumno || alumnoDetalle || alumnoLista || {};
  const usuario = expedienteDetalle?.usuario || {};
  const expediente = expedienteDetalle?.expediente_alumno || {};
  const procedencia = expediente.procedencia_academica || {};
  const padreTutor = getTutorPadre(expediente);
  const madre = getTutorMadre(expediente);
  const contacto = getContactoPrincipal(expediente);
  const seguro = getSeguro(expediente);
  const telefono = usuario.telefono || alumno.telefono || "";
  const correo = alumno.correo_contacto || usuario.correo || "";
  const nombreUsuario = [
    usuario.nombre,
    usuario.apellido_paterno,
    usuario.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
  const domicilio = [alumno.direccion, alumno.ciudad, alumno.estado]
    .filter(Boolean)
    .join(", ");
  const lugarNacimiento = [
    alumno.ciudad_nacimiento,
    alumno.municipio_nacimiento,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    idAlumno: alumno.id_alumno || alumnoLista?.id_alumno || "",
    matricula: alumno.matricula || alumnoLista?.matricula || "",
    nombreAlumno: alumno.nombre || nombreUsuario || alumnoLista?.nombre || "",
    carrera: alumno.carrera?.nombre || alumnoLista?.carrera?.nombre || "",
    lugarNacimiento,
    fechaNacimiento: formatDateDDMMYYYY(alumno.fecha_nacimiento),
    edad: calcularEdad(alumno.fecha_nacimiento),
    curp: alumno.curp || "",
    nacionalidad: alumno.nacionalidad || "",
    estatus: alumno.estatus || alumnoLista?.estatus || "",
    grupo: getGrupoActual(expediente),
    planEstudios:
      alumno.plan?.nombre_plan || alumnoLista?.plan?.nombre_plan || "",
    correoElectronico: correo,
    telHogar: telefono,
    celular: telefono,
    domicilio,
    escuelaProcedencia: procedencia.escuela_procedencia || "",
    promedioFinal:
      procedencia.promedio_general !== undefined &&
      procedencia.promedio_general !== null
        ? String(procedencia.promedio_general)
        : "",
    tieneSeguro:
      seguro.tiene_seguro === true ? "SI" : seguro.tiene_seguro === false ? "NO" : "",
    institucionSeguro: seguro.institucion || "",
    padreTutorNombre: padreTutor.nombre || "",
    padreTutorOcupacion: padreTutor.ocupacion || "",
    padreTutorTelTrabajo: padreTutor.telefono || "",
    madreNombre: madre.nombre || "",
    madreOcupacion: madre.ocupacion || "",
    madreTelTrabajo: madre.telefono || "",
    contactoEmergencia: contacto.nombre || "",
    contactoTelefono: contacto.telefono || "",
  };
};

function Line({ children, className = "" }) {
  return <span className={`ficha-line ${className}`}>{value(children)}</span>;
}

export default function FichaInscripcion({ modoAlumno = false }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const userRoles = user?.roles?.map((role) => role.nombre) || [];
  const esSoloAlumno =
    userRoles.includes("ALUMNO") &&
    userRoles.every((role) => role === "ALUMNO");
  const esModoAlumno = modoAlumno || esSoloAlumno;

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError("");

      try {
        if (esModoAlumno) {
          const expedienteDetalle = await obtenerMiExpediente();

          if (activo) {
            setForm((currentForm) => ({
              ...currentForm,
              ...buildFichaData({ expedienteDetalle }),
            }));
          }

          return;
        }

        const alumnosResponse = await obtenerAlumnosDetalle();
        if (activo) setAlumnos(alumnosResponse);
      } catch (requestError) {
        console.error(requestError);
        if (activo) {
          setError(
            esModoAlumno
              ? "No se pudo cargar tu expediente."
              : "No se pudo cargar la lista de alumnos.",
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [esModoAlumno]);

  const alumnosDetalle = useMemo(() => {
    return [...alumnos].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || ""),
    );
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busquedaAlumno);
    if (!texto) return alumnosDetalle;

    return alumnosDetalle.filter((alumno) => {
      const datos = normalizar(
        [alumno.nombre, alumno.matricula, alumno.numero_control]
          .filter(Boolean)
          .join(" "),
      );

      return datos.includes(texto);
    });
  }, [alumnosDetalle, busquedaAlumno]);

  const handleAlumnoChange = async (idAlumno) => {
    const alumnoLista = alumnosDetalle.find(
      (item) => Number(item.id_alumno) === Number(idAlumno),
    );

    setLoadingDetalle(true);
    setError("");
    setForm((currentForm) => ({
      ...currentForm,
      ...buildFichaData({ alumnoLista }),
    }));

    try {
      const alumnoDetalle = await obtenerAlumnoDetalle(idAlumno);
      let expedienteDetalle = null;

      if (alumnoDetalle?.id_usuario) {
        expedienteDetalle = await obtenerDetalleUsuario({
          id_usuario: alumnoDetalle.id_usuario,
        });
      }

      setForm((currentForm) => ({
        ...currentForm,
        ...buildFichaData({ alumnoLista, alumnoDetalle, expedienteDetalle }),
      }));
    } catch (requestError) {
      console.error(requestError);
      setError("Se cargo el alumno, pero no se pudo completar su expediente.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === "telHogar") {
      if (!/^\d*$/.test(value) || value.length > 10) return;

      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        telHogar:
          value.length === 0 || value.length === 10
            ? ""
            : "El Tel. hogar debe tener 10 dígitos o dejarse vacío.",
      }));
    }

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <style>{`
        .ficha-documento {
          color: #1d1d1d;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 8.7pt;
          line-height: 1.15;
        }

        .ficha-hoja {
          position: relative;
          width: 8.5in;
          height: 11in;
          padding: 0.42in 0.42in 0.32in;
          background: #ffffff;
          border: 1px solid #111827;
          box-shadow: 0 0 0.5rem rgba(15, 23, 42, 0.06);
          overflow: hidden;
          box-sizing: border-box;
        }

        .ficha-top-row {
          display: grid;
          grid-template-columns: 1.1in 1fr 1.65in;
          align-items: flex-start;
          gap: 0.12in;
          margin-bottom: 0.12in;
        }

        .ficha-sello {
          width: 1.0in;
          height: auto;
          margin-top: 0.12in;
        }

        .ficha-header {
          text-align: center;
          margin: 0;
        }

        .ficha-brand {
          display: grid;
          grid-template-columns: 0.58in 1fr;
          align-items: end;
          width: 3.75in;
          margin: 0 auto 0.055in;
          color: #1d1d1d;
          font-family: Georgia, "Times New Roman", serif;
          text-align: left;
        }

        .ficha-brand-u {
          font-size: 58pt;
          line-height: 0.72;
          font-weight: 800;
          letter-spacing: 0;
          transform: scaleX(0.92);
          transform-origin: left bottom;
        }

        .ficha-brand-text {
          display: block;
          padding-bottom: 0.015in;
        }

        .ficha-brand-name {
          display: block;
          border-bottom: 3px solid #1d1d1d;
          font-size: 25pt;
          font-weight: 800;
          line-height: 0.92;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .ficha-brand-school {
          display: block;
          margin-top: 0.025in;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14.5pt;
          font-weight: 700;
          line-height: 0.95;
          text-transform: none;
        }

        .ficha-subtitle {
          margin: 0;
          font-size: 7.6pt;
          font-weight: 700;
          line-height: 1.15;
          text-transform: uppercase;
        }

        .ficha-title {
          margin: 0.05in 0 0;
          font-size: 11.2pt;
          font-weight: 800;
          text-transform: uppercase;
        }

        .ficha-programa {
          margin: 0.06in 0 0;
          border-top: 1.2px solid #111827;
          border-bottom: 1.2px solid #111827;
          padding: 0.025in 0;
          font-size: 9pt;
          font-weight: 800;
          text-align: center;
          text-transform: uppercase;
        }

        .ficha-meta {
          padding-top: 0.15in;
          font-size: 8pt;
          font-weight: 700;
        }

        .ficha-meta-row {
          display: flex;
          align-items: flex-end;
          gap: 0.06in;
          margin-bottom: 0.05in;
          white-space: nowrap;
        }

        .ficha-meta-line {
          flex: 1;
          min-height: 0.12in;
          border-bottom: 1px solid #111827;
          font-weight: 700;
        }

        .ficha-box {
          border: 1px solid #111827;
          border-radius: 0.04in;
          padding: 0.12in 0.12in 0.08in;
          margin-top: 0.04in;
        }

        .ficha-section {
          margin-bottom: 0.055in;
        }

        .ficha-grid {
          display: grid;
          column-gap: 0.1in;
        }

        .ficha-grid-2 {
          grid-template-columns: 1fr 1fr;
        }

        .ficha-grid-3 {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .ficha-grid-4 {
          grid-template-columns: 1fr 1fr 0.45fr;
        }

        .ficha-birth-grid {
          grid-template-columns: 1.55fr 0.85fr 0.55fr;
        }

        .ficha-row {
          display: flex;
          align-items: flex-end;
          gap: 0.045in;
          min-height: 0.205in;
          margin-bottom: 0.035in;
        }

        .ficha-label {
          font-size: 6.7pt;
          font-weight: 700;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .ficha-line {
          flex: 1;
          min-width: 0.35in;
          min-height: 0.13in;
          border-bottom: 1px solid #111827;
          padding: 0 0 0.02in;
          font-size: 8pt;
          font-weight: 700;
        }

        .ficha-mini-note {
          display: block;
          margin-top: 0.01in;
          font-size: 5.7pt;
          font-weight: 700;
          line-height: 1;
          text-align: center;
          text-transform: uppercase;
        }

        .ficha-label-block {
          display: block;
          margin-bottom: 0.035in;
        }

        .ficha-docs {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          column-gap: 0.12in;
          row-gap: 0.04in;
        }

        .ficha-doc-row {
          display: flex;
          align-items: flex-end;
          gap: 0.04in;
          min-height: 0.18in;
          font-weight: 700;
        }

        .ficha-doc-row span {
          flex: 1;
          min-height: 0.12in;
          border-bottom: 1px solid #111827;
        }

        .ficha-textarea {
          min-height: 0.48in;
          border-bottom: 1px solid #111827;
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent 0.18in,
              #111827 0.185in,
              #111827 0.195in
            );
          padding: 0 0 0.02in;
          font-weight: 700;
        }

        .ficha-commitment {
          margin-top: 0.06in;
          font-size: 6.8pt;
          line-height: 1.18;
        }

        .ficha-commitment-title {
          margin: 0 0 0.035in;
          font-size: 7.3pt;
          font-weight: 800;
          text-transform: uppercase;
        }

        .ficha-commitment ol {
          margin: 0;
          padding-left: 0.16in;
          list-style: decimal;
          list-style-position: outside;
        }

        .ficha-commitment li {
          padding-left: 0.02in;
        }

        .ficha-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 0.8in;
          align-items: end;
          margin-top: 0.72in;
          text-align: center;
        }

        .ficha-signature {
          border-top: 1px solid #111827;
          padding-top: 0.035in;
          font-size: 7.1pt;
          font-weight: 700;
          text-transform: uppercase;
        }

        .ficha-note {
          margin: 0.08in 0 0;
          font-size: 6.4pt;
          font-weight: 600;
          text-align: center;
        }

        @media print {
          html,
          body,
          #root {
            width: 8.5in;
            height: 11in;
            margin: 0;
            overflow: hidden;
          }

          body * {
            visibility: hidden;
          }

          #ficha-inscripcion-preview,
          #ficha-inscripcion-preview * {
            visibility: visible;
          }

          #ficha-inscripcion-preview {
            position: absolute;
            top: 0;
            left: 0;
            width: 8.5in;
            height: 11in;
            padding: 0;
            margin: 0;
            border-radius: 0;
            background: #ffffff;
            box-shadow: none;
          }

          .ficha-hoja {
            border: 0;
            box-shadow: none;
          }

          @page {
            size: letter;
            margin: 0;
          }
        }
      `}</style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FileText size={22} />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Ficha de inscripción
            </h1>
            <p className="mt-1 text-slate-500">
              {esModoAlumno
                ? "Tus datos registrados se cargan automáticamente."
                : "Selecciona un alumno para rellenar los campos disponibles."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      {!esModoAlumno && (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <h2 className="text-xl font-semibold text-slate-900">
          Datos para autollenado
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="relative block">
            <span className="text-sm font-medium text-slate-700">Alumno</span>
            <input
              type="text"
              value={
                mostrarOpciones
                  ? busquedaAlumno
                  : form.nombreAlumno || busquedaAlumno
              }
              onChange={(event) => {
                setBusquedaAlumno(event.target.value);
                setMostrarOpciones(true);
              }}
              onFocus={() => {
                setBusquedaAlumno("");
                setMostrarOpciones(true);
              }}
              onBlur={() => {
                setTimeout(() => setMostrarOpciones(false), 150);
              }}
              disabled={loading}
              placeholder={
                loading ? "Cargando alumnos..." : "Busca por nombre o matrícula"
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            {mostrarOpciones && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {alumnosFiltrados.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Sin resultados
                  </div>
                )}

                {alumnosFiltrados.map((alumno) => (
                  <button
                    key={alumno.id_alumno}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      handleAlumnoChange(alumno.id_alumno);
                      setBusquedaAlumno("");
                      setMostrarOpciones(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                  >
                    {alumno.nombre}
                    {alumno.matricula ? ` - ${alumno.matricula}` : ""}
                    {alumno.numero_control
                      ? ` - Control ${alumno.numero_control}`
                      : ""}
                  </button>
                ))}
              </div>
            )}
          </label>

          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setBusquedaAlumno("");
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar ficha
          </button>
        </div>

        {loadingDetalle && (
          <p className="mt-3 text-sm text-slate-500">
            Completando datos del expediente...
          </p>
        )}

        {/* {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )} */}
      </section>
      )}

      {esModoAlumno && loading && (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm print:hidden">
            Cargando tus datos registrados...
          </p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 print:hidden">
          {error}
        </p>
      )}

      <div className="h-px w-full bg-slate-200" />

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Editar formato
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ajusta textos que aparecen en la ficha.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Fecha</span>
            <input
              name="fecha"
              value={form.fecha}
              onChange={handleFieldChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Estado civil
            </span>
            <input
              name="estadoCivil"
              value={form.estadoCivil}
              onChange={handleFieldChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Tel. hogar
            </span>
            <input
              name="telHogar"
              value={form.telHogar}
              onChange={handleFieldChange}
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.telHogar && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.telHogar}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Radio</span>
            <input
              name="radio"
              value={form.radio}
              onChange={handleFieldChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Lugar de trabajo
              </span>
              <input
                name="lugarTrabajo"
                value={form.lugarTrabajo}
                onChange={handleFieldChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Puesto desempeñado
              </span>
              <input
                name="puestoDesempenado"
                value={form.puestoDesempenado}
                onChange={handleFieldChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Ext. padre/tutor
              </span>
              <input
                name="padreTutorExt"
                value={form.padreTutorExt}
                onChange={handleFieldChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Ext. madre
              </span>
              <input
                name="madreExt"
                value={form.madreExt}
                onChange={handleFieldChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>

        <div
          id="ficha-inscripcion-preview"
          className="mx-auto rounded-3xl bg-white p-4 shadow-sm"
        >
        <div className="ficha-hoja ficha-documento">
          <div className="ficha-top-row">
            <img src={selloUnifront} alt="Sello Unifront 1954" className="ficha-sello" />

            <div className="ficha-header">
              <div className="ficha-brand" aria-label="UNIFRONT Colegio Ensenada">
                <span className="ficha-brand-u">U</span>
                <span className="ficha-brand-text">
                  <span className="ficha-brand-name">UNIFRONT</span>
                  <span className="ficha-brand-school">Colegio Ensenada</span>
                </span>
              </div>
              <p className="ficha-subtitle">Departamento de Control Escolar</p>
              <p className="ficha-subtitle">Inscripción de nuevo ingreso</p>
              <h2 className="ficha-title">Ficha de Inscripción</h2>
              <p className="ficha-programa">
                {form.carrera || "Licenciatura en Nutrición"}
              </p>
            </div>

            <div className="ficha-meta">
              <div className="ficha-meta-row">
                <span>FECHA:</span>
                <span className="ficha-meta-line">{value(form.fecha)}</span>
              </div>
            </div>
          </div>

          <div className="ficha-box">
            <div className="ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Nombre completo del alumno:</span>
                <Line>{form.nombreAlumno}</Line>
              </div>
            </div>

            <div className="ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Matrícula:</span>
                <Line>{form.matricula}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-birth-grid ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Lugar y fecha de nacimiento:</span>
                <Line>{form.lugarNacimiento}</Line>
                <span className="ficha-mini-note">Ciudad, municipio</span>
              </div>
              <div className="ficha-row">
                <Line>{form.fechaNacimiento}</Line>
                <span className="ficha-mini-note">Día, mes, año</span>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Edad:</span>
                <Line>{form.edad}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-3 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Estado civil:</span>
                <Line>{form.estadoCivil}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Clave CURP:</span>
                <Line>{form.curp}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Nacionalidad:</span>
                <Line>{form.nacionalidad}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-3 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Estatus:</span>
                <Line>{form.estatus}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Grupo:</span>
                <Line>{form.grupo}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Plan de estudios:</span>
                <Line>{form.planEstudios}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-3 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Tel. hogar:</span>
                <Line>{form.telHogar}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Celular:</span>
                <Line>{form.celular}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Radio:</span>
                <Line>{form.radio}</Line>
              </div>
            </div>

            <div className="ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Correo electrónico:</span>
                <Line>{form.correoElectronico}</Line>
              </div>
            </div>

            <div className="ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Domicilio actual:</span>
                <Line>{form.domicilio}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-2 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Lugar de trabajo:</span>
                <Line>{form.lugarTrabajo}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Puesto desempeñado:</span>
                <Line>{form.puestoDesempenado}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-2 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Escuela de procedencia:</span>
                <Line>{form.escuelaProcedencia}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Promedio final:</span>
                <Line>{form.promedioFinal}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-2 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">
                  ¿Está asegurado actualmente?
                </span>
                <Line>{form.tieneSeguro}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">
                  Institución a la que está asegurado(a):
                </span>
                <Line>{form.institucionSeguro}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-2 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">
                  Nombre completo del padre o tutor:
                </span>
                <Line>{form.padreTutorNombre}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">(Patria potestad)</span>
                <Line />
              </div>
            </div>

            <div className="ficha-grid ficha-grid-4 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Ocupación:</span>
                <Line>{form.padreTutorOcupacion}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Tel. del trabajo:</span>
                <Line>{form.padreTutorTelTrabajo}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Ext.:</span>
                <Line>{form.padreTutorExt}</Line>
              </div>
            </div>

            <div className="ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Nombre completo de la madre:</span>
                <Line>{form.madreNombre}</Line>
              </div>
            </div>

            <div className="ficha-grid ficha-grid-4 ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">Ocupación:</span>
                <Line>{form.madreOcupacion}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Tel. del trabajo:</span>
                <Line>{form.madreTelTrabajo}</Line>
              </div>
              <div className="ficha-row">
                <span className="ficha-label">Ext.:</span>
                <Line>{form.madreExt}</Line>
              </div>
            </div>

            <div className="ficha-section">
              <div className="ficha-row">
                <span className="ficha-label">En caso de emergencia avisar a:</span>
                <Line>{form.contactoEmergencia}</Line>
                <span className="ficha-label">Tel.:</span>
                <Line>{form.contactoTelefono}</Line>
              </div>
            </div>

            <div className="ficha-commitment">
              <p className="ficha-commitment-title">
                Al firmar la solicitud me comprometo a:
              </p>
              <ol>
                <li>
                  Cumplir fielmente con el Reglamento Escolar que rige la
                  disciplina de este plantel.
                </li>
                <li>
                  Asistir a clases con puntualidad de acuerdo al horario y turno
                  que se me asigne.
                </li>
                <li>
                  Trabajar permanentemente por el buen prestigio académico y
                  social de la institución.
                </li>
                <li>
                  Conservar el mobiliario e instalaciones y pagar los daños que
                  en forma accidental o intencional cause.
                </li>
                <li>
                  Cubrir puntualmente el pago de inscripción y colegiaturas.
                </li>
                <li>
                  Informar a Control Escolar cuando desee darme de baja temporal
                  o definitiva.
                </li>
              </ol>
            </div>
          </div>

          <div className="ficha-footer">
            <div className="ficha-signature">Firma del alumno (a)</div>
            <div className="ficha-signature">
              Firma de conformidad del padre o tutor
            </div>
          </div>

          <p className="ficha-note">
            Nota: Esta ficha es una plantilla para Control Escolar. Imprima y
            utilice en el proceso de inscripción.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
