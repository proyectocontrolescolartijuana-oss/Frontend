import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  IdCard,
  Info,
  UserRound,
  X,
} from "lucide-react";

import { obtenerMiExpediente } from "../services/authService";
import { obtenerCalificacionesAlumno } from "../services/calificacionesService";
import { nombreApellidosPrimero } from "../utils/nombres";

const emptyValue = "Sin registrar";

function agruparCalificaciones(datos) {
  const periodos = {};

  datos.forEach((item) => {
    const periodoId = item.periodo.id_periodo;

    if (!periodos[periodoId]) {
      periodos[periodoId] = {
        id: periodoId,
        numero: Object.keys(periodos).length + 1,
        periodo: item.periodo.nombre,
        materias: [],
      };
    }

    let materia = periodos[periodoId].materias.find(
      (m) => m.id === item.materia.id_materia,
    );

      if (!materia) {
        materia = {
          id: item.materia.id_materia,
          materia: item.materia.nombre,
          docente: nombreApellidosPrimero(item.capturado_por, emptyValue),
          parciales: [null, null, null],
          calificacion: null,
        };

      periodos[periodoId].materias.push(materia);
    }

    switch (item.parcial.id_parcial) {
      case 1:
        materia.parciales[0] = item.calificacion;
        break;
      case 2:
        materia.parciales[1] = item.calificacion;
        break;
      case 3:
        materia.parciales[2] = item.calificacion;
        break;
      default:
        break;
    }

    const notas = materia.parciales.filter((x) => x !== null);

    if (notas.length > 0) {
      materia.calificacion = (
        notas.reduce((a, b) => a + b, 0) / notas.length
      ).toFixed(0);
    }
  });

  return Object.values(periodos);
}

function gradeBadgeClasses(value) {
  if (value === null || value === undefined) {
    return "bg-slate-100 text-slate-400";
  }

  const numeric = Number(value);

  if (numeric >= 70) return "bg-emerald-50 text-emerald-700";

  return "bg-rose-50 text-rose-700";
}

function InfoField({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value || emptyValue}
      </dd>
    </div>
  );
}

function ParcialPill({ value }) {
  return (
    <span
      className={`inline-flex h-8 w-12 items-center justify-center rounded-md text-sm font-semibold ${gradeBadgeClasses(
        value,
      )}`}
    >
      {value ?? "—"}
    </span>
  );
}

export default function CalificacionesAlumnos() {
  const [student, setStudent] = useState(null);
  const [cuatrimestres, setCuatrimestres] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabsRef = useRef(null);

  useEffect(() => {
    let activo = true;

    async function cargarInformacion() {
      try {
        const expediente = await obtenerMiExpediente();

        if (!activo) return;
        setStudent(expediente);

        const alumnoId = expediente.alumno.id_alumno;
        const calificaciones = await obtenerCalificacionesAlumno(alumnoId);

        if (!activo) return;
        const agrupadas = agruparCalificaciones(calificaciones);
        setCuatrimestres(agrupadas);

        if (agrupadas.length > 0) {
          setActiveIndex(agrupadas.length - 1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarInformacion();

    return () => {
      activo = false;
    };
  }, []);

  const nombreCompleto = useMemo(
    () => nombreApellidosPrimero(student?.usuario),
    [student],
  );

  function abrirMateria(materia) {
    setDetalle(materia);
  }

  function scrollTabs(dir) {
    tabsRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  const cuatri = cuatrimestres[activeIndex];

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B245B] text-white">
              <BookOpen size={24} />
            </div>
            <h1 className="text-4xl font-display text-[var(--primary)]">
              Calificaciones
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Consulta tu historial de calificaciones por cuatrimestre.
            </p>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B245B]">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {nombreCompleto || emptyValue}
              </h2>
              <p className="text-sm text-slate-500">Datos del alumno</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoField label="Matrícula" value={student?.alumno?.matricula} />
            <InfoField
              label="Número de control"
              value={student?.alumno?.numero_control}
            />
            <InfoField
              label="Carrera"
              value={student?.alumno?.carrera?.nombre}
            />
            <InfoField
              label="Plan"
              value={student?.alumno?.plan?.nombre_plan}
            />
            <InfoField label="Estatus" value={student?.alumno?.estatus} />
          </dl>
        </section>

        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
          <Info size={18} className="mt-0.5 shrink-0 text-[#0B245B]" />
          <p>
            Presiona una materia para ver el detalle de sus parciales. La
            calificación final se calcula con el promedio de los parciales
            capturados.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <button
              aria-label="Cuatrimestre anterior"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              onClick={() => scrollTabs(-1)}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              ref={tabsRef}
              className="flex flex-1 gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {cuatrimestres.map((c, index) => (
                <button
                  key={c.id}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    index === activeIndex
                      ? "bg-[#0B245B] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  {c.periodo}
                </button>
              ))}
            </div>

            <button
              aria-label="Siguiente cuatrimestre"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              onClick={() => scrollTabs(1)}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-[#0B245B]" />
              <h3 className="text-sm font-semibold text-slate-900">
                {cuatri?.periodo || emptyValue}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Materia</th>
                    <th className="py-2 pr-4">Docente</th>
                    <th className="py-2 pr-4 text-center">Parcial 1</th>
                    <th className="py-2 pr-4 text-center">Parcial 2</th>
                    <th className="py-2 pr-4 text-center">Parcial 3</th>
                    <th className="py-2 pl-4 text-right">Final</th>
                  </tr>
                </thead>

                <tbody>
                  {cuatri?.materias.map((materia) => (
                    <tr
                      key={materia.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-4">
                        <button
                          className="text-left font-semibold text-[#2f6fad] transition hover:underline"
                          onClick={() => abrirMateria(materia)}
                          type="button"
                        >
                          {materia.materia}
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {materia.docente}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <ParcialPill value={materia.parciales[0]} />
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <ParcialPill value={materia.parciales[1]} />
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <ParcialPill value={materia.parciales[2]} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-bold ${gradeBadgeClasses(
                            materia.calificacion,
                          )}`}
                        >
                          {materia.calificacion ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!cuatri?.materias?.length && (
                    <tr>
                      <td
                        className="py-8 text-center text-sm text-slate-400"
                        colSpan={6}
                      >
                        No hay calificaciones registradas para este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {detalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B245B]">
                  <IdCard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {detalle.materia}
                  </h2>
                  <p className="text-sm text-slate-500">{detalle.docente}</p>
                </div>
              </div>

              <button
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setDetalle(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="space-y-2">
              {["Primer parcial", "Segundo parcial", "Tercer parcial"].map(
                (label, index) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5"
                  >
                    <dt className="text-sm text-slate-600">{label}</dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {detalle.parciales[index] ?? "—"}
                    </dd>
                  </div>
                ),
              )}

              <div className="flex items-center justify-between rounded-lg bg-[#0B245B] px-4 py-3">
                <dt className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Award size={16} />
                  Calificación final
                </dt>
                <dd className="text-lg font-bold text-white">
                  {detalle.calificacion ?? "—"}
                </dd>
              </div>
            </dl>

            <button
              className="mt-6 w-full rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => setDetalle(null)}
              type="button"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
