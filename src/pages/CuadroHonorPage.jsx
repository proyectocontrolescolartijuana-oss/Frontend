import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  Download,
  Filter,
  GraduationCap,
  Medal,
  Search,
} from "lucide-react";
import { obtenerCuadroHonor } from "../services/calificacionesService";
import { nombreAlumnoApellidosPrimero } from "../utils/nombres";

const filtrosCuatrimestre = [
  { id: "1", label: "1ro" },
  { id: "2", label: "2do" },
  { id: "3", label: "3ro" },
  { id: "4", label: "4to" },
  { id: "5", label: "5to" },
  { id: "6", label: "6to" },
  { id: "7", label: "7mo" },
  { id: "8", label: "8vo" },
  { id: "9", label: "9no" },
  { id: "egresados", label: "Egresados" },
];

const getLugarStyles = (index) => {
  if (index === 0) return "bg-amber-100 text-amber-800 ring-amber-200";
  if (index === 1) return "bg-slate-100 text-slate-700 ring-slate-200";
  if (index === 2) return "bg-orange-100 text-orange-800 ring-orange-200";

  return "bg-blue-50 text-blue-700 ring-blue-100";
};

const normalizarTexto = (value = "") => value.toLowerCase().trim();

const obtenerMensajeError = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return "No se pudo cargar el cuadro de honor.";
};

const formatearPromedio = (promedio) => {
  if (promedio === null || promedio === undefined) return "-";

  return Number(promedio).toFixed(2);
};

export default function CuadroHonorPage() {
  const [filtroActivo, setFiltroActivo] = useState("1");
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const esEgresados = filtroActivo === "egresados";

  useEffect(() => {
    let activo = true;

    const cargarCuadroHonor = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await obtenerCuadroHonor({
          cuatrimestre: Number(filtroActivo),
          egresados: esEgresados,
        });

        if (activo) {
          setAlumnos(response.alumnos || []);
        }
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setAlumnos([]);
          setError(obtenerMensajeError(requestError));
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarCuadroHonor();

    return () => {
      activo = false;
    };
  }, [esEgresados, filtroActivo]);

  const alumnosVista = useMemo(() => {
    const termino = normalizarTexto(busqueda);

    return alumnos.filter((alumno) => {
      if (!termino) return true;

      return normalizarTexto(
        `${nombreAlumnoApellidosPrimero(alumno, "")} ${alumno.matricula || ""} ${
          alumno.carrera || ""
        }`,
      ).includes(termino);
    });
  }, [alumnos, busqueda]);

  const filtroActual = filtrosCuatrimestre.find(
    (filtro) => filtro.id === filtroActivo,
  );
  const topTres = alumnosVista.slice(0, 3);
  const carrerasIncluidas = new Set(alumnosVista.map((alumno) => alumno.carrera))
    .size;
  const promedioMasAlto = alumnosVista[0]?.promedio;

  const resumen = [
    {
      label: esEgresados ? "Egresados reconocidos" : "Alumnos reconocidos",
      value: alumnosVista.length,
      detail: esEgresados ? "Promedio de 1ro a 9no" : "Promedio minimo 90",
      icon: esEgresados ? GraduationCap : Award,
    },
    {
      label: "Promedio mas alto",
      value: formatearPromedio(promedioMasAlto),
      detail: esEgresados ? "Acumulado de carrera" : filtroActual.label,
      icon: Medal,
    },
    {
      label: "Carreras incluidas",
      value: carrerasIncluidas,
      detail: "Programas con resultados",
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-[var(--background)] p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Cuadro de honor
          </h1>
          <p className="mt-2 max-w-3xl text-slate-500">
            Reconocimientos por cuatrimestre y por carrera completa para
            egresados.
          </p>
        </div>

        <button
          type="button"
          disabled={alumnosVista.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B245B] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download size={18} />
          Exportar lista (aun no funciona)
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 xl:grid-cols-10">
          {filtrosCuatrimestre.map((filtro) => {
            const activo = filtroActivo === filtro.id;

            return (
              <button
                key={filtro.id}
                type="button"
                onClick={() => {
                  setFiltroActivo(filtro.id);
                  setBusqueda("");
                }}
                className={`h-11 rounded-md px-3 text-sm font-bold transition ${
                  activo
                    ? "bg-[#0B245B] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filtro.label}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {resumen.map((item) => {
          const Icon = item.icon;

          return (
            <section
              key={item.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0B245B]">
                  <Icon size={22} />
                </span>
              </div>
            </section>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Primeros lugares - {filtroActual.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {esEgresados
                  ? "Promedio acumulado considerando calificaciones de 1ro a 9no."
                  : "Alumnos destacados del cuatrimestre seleccionado."}
              </p>
            </div>

            {topTres.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No hay alumnos para mostrar en esta vista.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
                {topTres.map((alumno, index) => (
                  <article
                    key={alumno.id_alumno}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold ring-1 ${getLugarStyles(
                          index,
                        )}`}
                      >
                        {index + 1}
                      </span>
                      <span className="rounded-md bg-white px-3 py-1 text-sm font-bold text-[#0B245B] shadow-sm">
                        {formatearPromedio(alumno.promedio)}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold leading-snug text-slate-900">
                      {nombreAlumnoApellidosPrimero(alumno)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {alumno.matricula || "Sin matricula"} |{" "}
                      {esEgresados
                        ? alumno.generacion || "Sin generacion"
                        : alumno.grupo || "Sin grupo"}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {alumno.carrera || "Carrera sin nombre"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {esEgresados
                    ? "Listado de egresados"
                    : `Listado de ${filtroActual.label} cuatrimestre`}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Datos calculados desde las calificaciones capturadas.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar alumno"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                  />
                </label>

                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Filter size={18} />
                  Filtros
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Lugar
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Alumno
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Carrera
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      {esEgresados ? "Generacion" : "Grupo"}
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                      {esEgresados ? "Cuatrimestres" : "Materias"}
                    </th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-slate-600">
                      {esEgresados ? "Prom. carrera" : "Promedio"}
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Estatus
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {alumnosVista.map((alumno, index) => (
                    <tr
                      key={alumno.id_alumno}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ring-1 ${getLugarStyles(
                            index,
                          )}`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {nombreAlumnoApellidosPrimero(alumno)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Matricula {alumno.matricula || "Sin dato"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {alumno.carrera || "Carrera sin nombre"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {esEgresados
                            ? alumno.generacion || "Sin generacion"
                            : alumno.grupo || "Sin grupo"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {esEgresados
                            ? `${alumno.materias} materias cursadas`
                            : `${filtroActual.label} cuatrimestre`}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-slate-600">
                        {esEgresados
                          ? alumno.cuatrimestres_evaluados || 0
                          : alumno.materias}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-[#0B245B]">
                          {formatearPromedio(alumno.promedio)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {alumno.estatus || "SIN ESTATUS"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {alumnosVista.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No hay coincidencias para mostrar.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
