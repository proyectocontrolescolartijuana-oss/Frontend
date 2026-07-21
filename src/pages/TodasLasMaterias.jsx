import { useEffect, useMemo, useState } from "react";

import TodasLasMateriasFilters from "../components/todasLasMaterias/TodasLasMateriasFilters";
import TodasLasMateriasHeader from "../components/todasLasMaterias/TodasLasMateriasHeader";
import TodasLasMateriasPreview from "../components/todasLasMaterias/TodasLasMateriasPreview";
import TodasLasMateriasStyles from "../components/todasLasMaterias/TodasLasMateriasStyles";
import {
  getAlumno,
  getCertificado,
  getGruposCuatrimestre,
  getHistorial,
} from "../components/todasLasMaterias/todasLasMateriasUtils";
import {
  buscarAlumnosKardex,
  obtenerKardexPorBusqueda,
  obtenerKardexPorMatricula,
} from "../services/kardexService";

export default function TodasLasMaterias() {
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [datos, setDatos] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    const termino = String(busqueda || "").trim();

    if (termino.length < 2) {
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoadingSugerencias(true);
        const data = await buscarAlumnosKardex(termino);
        setSugerencias(Array.isArray(data) ? data : []);
        setMostrarSugerencias(true);
      } catch {
        setSugerencias([]);
        setMostrarSugerencias(false);
      } finally {
        setLoadingSugerencias(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [busqueda]);

  const handleBuscar = async (terminoForzado) => {
    const termino = String(terminoForzado || busqueda || "").trim();

    setError("");
    setMostrarSugerencias(false);

    if (!termino) {
      setError("Ingresa una matricula, no. de control o nombre valido.");
      return;
    }

    setLoading(true);

    try {
      const data = terminoForzado
        ? await obtenerKardexPorMatricula(termino)
        : await obtenerKardexPorBusqueda(termino);

      setDatos(data);
      setBusqueda(data.matricula || data.numero_control || termino);
    } catch (err) {
      const status = err?.response?.status;

      setDatos(null);
      if (status === 404) {
        setError(
          "No se encontro el alumno con esa matricula, no. de control o nombre.",
        );
      } else {
        setError(
          "No se pudo obtener el kardex. Verifica tu conexion o intenta de nuevo.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleBuscar();
  };

  const handleSeleccionarSugerencia = (alumnoSug) => {
    const termino = alumnoSug.matricula || alumnoSug.numero_control || "";

    setBusqueda(termino);
    setSugerencias([]);
    setMostrarSugerencias(false);
    handleBuscar(termino);
  };

  const handleLimpiar = () => {
    setBusqueda("");
    setDatos(null);
    setError("");
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  const handleBusquedaChange = (value) => {
    setBusqueda(value);

    if (String(value || "").trim().length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const handleDownload = () => {
    const previousTitle = document.title;

    document.title = "certificado_alumno";
    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true },
    );
    window.setTimeout(() => window.print(), 0);
  };

  const alumno = useMemo(() => getAlumno(datos), [datos]);
  const historial = useMemo(() => getHistorial(datos), [datos]);
  const certificado = useMemo(
    () => getCertificado(datos, historial),
    [datos, historial],
  );
  const gruposCuatrimestre = useMemo(
    () => getGruposCuatrimestre(historial),
    [historial],
  );

  return (
    <div className="space-y-6 p-6">
      <TodasLasMateriasStyles />

      <TodasLasMateriasHeader disabled={!datos} onDownload={handleDownload} />

      <div className="h-px w-full bg-slate-200" />

      <TodasLasMateriasFilters
        busqueda={busqueda}
        error={error}
        loading={loading}
        loadingSugerencias={loadingSugerencias}
        mostrarSugerencias={mostrarSugerencias}
        sugerencias={sugerencias}
        onBuscar={() => handleBuscar()}
        onBusquedaChange={handleBusquedaChange}
        onFocusBusqueda={() => {
          if (sugerencias.length > 0 || loadingSugerencias) {
            setMostrarSugerencias(true);
          }
        }}
        onKeyDown={handleKeyDown}
        onLimpiar={handleLimpiar}
        onSeleccionarSugerencia={handleSeleccionarSugerencia}
      />

      <TodasLasMateriasPreview
        alumno={alumno}
        certificado={certificado}
        datos={datos}
        gruposCuatrimestre={gruposCuatrimestre}
        loading={loading}
      />
    </div>
  );
}
