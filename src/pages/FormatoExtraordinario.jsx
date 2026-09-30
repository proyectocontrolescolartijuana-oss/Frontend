import { useCallback, useEffect, useMemo, useState } from "react";

import FormatoExtraordinarioFilters from "../components/formatoExtraordinario/FormatoExtraordinarioFilters";
import FormatoExtraordinarioHeader from "../components/formatoExtraordinario/FormatoExtraordinarioHeader";
import FormatoExtraordinarioPreview from "../components/formatoExtraordinario/FormatoExtraordinarioPreview";
import FormatoExtraordinarioStyles from "../components/formatoExtraordinario/FormatoExtraordinarioStyles";
import {
  CAMPOS_VACIOS,
  datosEstaticos,
  extraerNombre,
  formatearFechaConsulta,
  obtenerCarreraAlumno,
  obtenerCuatrimestres,
  obtenerDatosCarga,
  obtenerDescripciones,
  obtenerMaterias,
  textoAlumno,
} from "../components/formatoExtraordinario/formatoExtraordinarioUtils";
import logoUnifrontSello from "../assets/Unifront1954Sello.png";
import {
  obtenerAlumnosDetalle,
  obtenerCargasAcademicas,
} from "../services/alumnosGruposService.js";

export default function FormatoEvaluacionesExtraordinarias() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [cargas, setCargas] = useState([]);
  const [cargandoCargas, setCargandoCargas] = useState(false);
  const [errorCargas, setErrorCargas] = useState(null);
  const [cuatrimestreFiltro, setCuatrimestreFiltro] = useState("");
  const [campos, setCampos] = useState({
    ...CAMPOS_VACIOS,
    fecha: formatearFechaConsulta(),
  });

  useEffect(() => {
    let cancelado = false;

    const cargarAlumnos = async () => {
      setCargandoAlumnos(true);
      setErrorAlumnos(null);

      try {
        const data = await obtenerAlumnosDetalle();

        if (!cancelado) {
          setAlumnos(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        console.error(requestError);

        if (!cancelado) {
          setErrorAlumnos(
            requestError.message || "No se pudo cargar el listado de alumnos",
          );
        }
      } finally {
        if (!cancelado) {
          setCargandoAlumnos(false);
        }
      }
    };

    cargarAlumnos();

    return () => {
      cancelado = true;
    };
  }, []);

  const alumnosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return [];

    return alumnos
      .filter((alumno) => textoAlumno(alumno).includes(termino))
      .slice(0, 8);
  }, [alumnos, busqueda]);

  const cargarCargasAlumno = async (alumno) => {
    setCargandoCargas(true);
    setErrorCargas(null);

    try {
      const lista = await obtenerCargasAcademicas({
        alumno_id: alumno.id_alumno,
      });
      const cargasAlumno = Array.isArray(lista) ? lista : [];
      const primeraCarga = cargasAlumno[0];
      const datosCarga = obtenerDatosCarga(primeraCarga);
      const carrera = obtenerCarreraAlumno(alumno, primeraCarga);
      const cuatrimestres = obtenerCuatrimestres(cargasAlumno);

      setCargas(cargasAlumno);
      setCampos((prev) => ({
        ...prev,
        grupo: datosCarga.grupo,
        turno: datosCarga.turno,
        periodo: datosCarga.periodo,
        ciclo: datosCarga.ciclo || prev.ciclo,
        carrera: carrera || datosCarga.carrera || prev.carrera,
      }));

      if (cuatrimestres.length) {
        setCuatrimestreFiltro(
          String(cuatrimestres[cuatrimestres.length - 1].id_cuatrimestre),
        );
      }
    } catch (requestError) {
      console.error(requestError);
      setErrorCargas(
        requestError.message || "No se pudieron cargar las materias del alumno",
      );
    } finally {
      setCargandoCargas(false);
    }
  };

  const seleccionarAlumno = useCallback(async (alumno) => {
    setAlumnoSeleccionado(alumno);
    setBusqueda("");
    setCargas([]);
    setCuatrimestreFiltro("");
    setErrorCargas(null);
    setCampos((prev) => ({
      ...prev,
      control: alumno.numero_control || alumno.matricula || "",
      carrera: obtenerCarreraAlumno(alumno) || prev.carrera,
      fecha: formatearFechaConsulta(),
      ...extraerNombre(alumno),
    }));

    await cargarCargasAlumno(alumno);
  }, []);

  const limpiarFicha = () => {
    setAlumnoSeleccionado(null);
    setCargas([]);
    setCuatrimestreFiltro("");
    setBusqueda("");
    setErrorCargas(null);
    setCampos({
      ...CAMPOS_VACIOS,
      fecha: formatearFechaConsulta(),
    });
  };

  const cuatrimestresDisponibles = useMemo(
    () => obtenerCuatrimestres(cargas),
    [cargas],
  );

  const cargasFiltradas = useMemo(() => {
    if (!cuatrimestreFiltro) return cargas;

    return cargas.filter(
      (carga) =>
        String(carga.grupo_materia?.grupo?.cuatrimestre?.id_cuatrimestre) ===
        cuatrimestreFiltro,
    );
  }, [cargas, cuatrimestreFiltro]);

  const materias = useMemo(
    () => obtenerMaterias(cargasFiltradas),
    [cargasFiltradas],
  );

  const descripciones = useMemo(
    () => obtenerDescripciones(cargasFiltradas),
    [cargasFiltradas],
  );

  const cuatrimestreNombre = useMemo(() => {
    const activo = cuatrimestresDisponibles.find(
      (cuatrimestre) =>
        String(cuatrimestre.id_cuatrimestre) === cuatrimestreFiltro,
    );

    return activo?.nombre || cuatrimestresDisponibles[0]?.nombre || "";
  }, [cuatrimestresDisponibles, cuatrimestreFiltro]);

  const handleCampoChange = (campo, value) => {
    setCampos((prev) => ({ ...prev, [campo]: value }));
  };

  const handleDownload = () => {
    const previousTitle = document.title;

    document.title = "formato_extraordinario";
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    window.setTimeout(() => window.print(), 0);
  };

  const data = useMemo(
    () => ({
      escuela: datosEstaticos.escuela,
      periodo: {
        cuatrimestre: cuatrimestreNombre,
        grupo: campos.grupo,
        ciclo: campos.ciclo,
        periodo: campos.periodo,
        turno: campos.turno,
        carrera: campos.carrera,
      },
      materias,
      descripciones,
      alumno: {
        no: campos.no,
        control: campos.control,
        apP: campos.apP,
        apM: campos.apM,
        nombre: campos.nombre,
        calif: materias.map(() => null),
      },
      firmas: datosEstaticos.firmas,
      fecha: campos.fecha,
    }),
    [campos, cuatrimestreNombre, descripciones, materias],
  );

  return (
    <div className="space-y-6 p-6">
      <FormatoExtraordinarioStyles />

      <FormatoExtraordinarioHeader onDownload={handleDownload} />

      <div className="h-px w-full bg-slate-200" />

      <FormatoExtraordinarioFilters
        alumnoSeleccionado={alumnoSeleccionado}
        alumnosFiltrados={alumnosFiltrados}
        busqueda={busqueda}
        campos={campos}
        cargandoAlumnos={cargandoAlumnos}
        cargandoCargas={cargandoCargas}
        cargas={cargas}
        cuatrimestreFiltro={cuatrimestreFiltro}
        cuatrimestresDisponibles={cuatrimestresDisponibles}
        errorAlumnos={errorAlumnos}
        errorCargas={errorCargas}
        materias={materias}
        onBusquedaChange={setBusqueda}
        onCampoChange={handleCampoChange}
        onCuatrimestreChange={setCuatrimestreFiltro}
        onLimpiar={limpiarFicha}
        onSeleccionarAlumno={seleccionarAlumno}
      />

      <FormatoExtraordinarioPreview data={data} logoUrl={logoUnifrontSello} />
    </div>
  );
}
