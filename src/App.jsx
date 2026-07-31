import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PlanesEstudioPage from "./pages/PlanesEstudioPage";
import CarrerasPage from "./pages/CarrerasPage";
import GruposPage from "./pages/GruposPage";
import MateriasPage from "./pages/MateriasPage";
import PeriodosPage from "./pages/PeriodosPage";
import ConstanciaEstudios from "./pages/ConstanciaEstudios";
import DocumentosAlumnoPage from "./pages/DocumentosAlumnoPage";
import AlumnosGruposPage from "./pages/AlumnosGruposPage";
import AsistenciaPage from "./pages/AsistenciaPage";
import CapturaCalificacionesPage from "./pages/CapturaCalificacionesPage";
import UsuariosAltaPage from "./pages/UsuariosAltaPage";
import UsuariosPage from "./pages/UsuariosPage";
import CuadroHonorPage from "./pages/CuadroHonorPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ConstanciaTerminacion from "./pages/ConstanciaTerminacion";
import ActaExamenExtraordinario from "./pages/ActaExamenExtraordinario";
import ActaExamenTituloSuficiencia from "./pages/ActaExamenTituloSuficiencia";
import ActaTitulacionLicenciatura from "./pages/ActaTitulacionLicenciatura";
import BoletaFinal from "./pages/BoletaFinal";
import ReciboDocumentosOriginales from "./pages/ReciboDocumentosOriginales";
import RegistroReinscripcionAlumnos from "./pages/RegistroReinscripcionAlumnos";
import FichaInscripcion from "./pages/FichaInscripcion";
import PromediosGrupo from "./pages/PromediosGrupos";
import RezagoCarreras from "./pages/RezagoCarreras";
import Kardex from "./pages/Kardex";
import AlumnoPerfilPage from "./pages/AlumnoPerfilPage";
import DocentePerfilPage from "./pages/DocentePerfilPage";
import CalificacionesAlumnos from "./pages/CalificacionesAlumnos";
import FormatoEvaluaciones from "./pages/FormatoEvaluaciones";
import FormatoEvaluacionesExtraordinarias from "./pages/FormatoExtraordinario";
import FormatoTituloSuficiencia from "./pages/FormatoTituloSuficiencia";
import CertificadoCalificaciones from "./pages/TodasLasMaterias";
import SemaforoEgresados from "./pages/SemaforoEgresados";
import ConcentradoCalificaciones from "./pages/ConcentradoCalificaciones";
import TitulacionesPage from "./pages/TitulacionesPage";
import EquivalenciasPage from "./pages/EquivalenciasPage";
import MiSemaforoEgresados from "./pages/MiSemaforoEgresados";
import EstatusEgresados from "./pages/EstatusEgresados";
import ServicioSocial from "./pages/ServicioSocial";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/carreras"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CarrerasPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/materias"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MateriasPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/grupos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <GruposPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/periodos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PeriodosPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/planes-estudio"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PlanesEstudioPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumnos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AlumnosGruposPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/captura"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CapturaCalificacionesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/asistencia"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AsistenciaPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cuadro-honor"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CuadroHonorPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UsuariosPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios/nuevo"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UsuariosAltaPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/constancia-estudios"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ConstanciaEstudios />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/constancia-terminacion"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ConstanciaTerminacion />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documentos-alumno"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DocumentosAlumnoPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/acta-examen-extraordinario"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ActaExamenExtraordinario />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/acta-examen-titulo-suficiencia"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ActaExamenTituloSuficiencia />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/acta-titulacion-licenciatura"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ActaTitulacionLicenciatura />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recibo-documentos-originales"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReciboDocumentosOriginales />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ficha-inscripcion"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FichaInscripcion />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/ficha-inscripcion"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FichaInscripcion modoAlumno />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/registro-reinscripcion-alumnos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <RegistroReinscripcionAlumnos />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/boleta-final"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BoletaFinal />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/concentrado-calificaciones"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ConcentradoCalificaciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/docente/perfil"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DocentePerfilPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/perfil"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AlumnoPerfilPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/boleta-final"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BoletaFinal modoAlumno />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documentos-alumno/:alumnoId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DocumentosAlumnoPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/titulaciones"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TitulacionesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/titulaciones/:alumnoId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TitulacionesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Promedios  */}
        <Route
          path="/promedios"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PromediosGrupo />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Rezago de alumnos por carrera */}
        <Route
          path="/rezago"
          element={
            <ProtectedRoute>
              <MainLayout>
                <RezagoCarreras />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Kardex*/}
        <Route
          path="/kardex"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Kardex />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/equivalencias"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EquivalenciasPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/kardex"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Kardex modoAlumno />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/semaforo-egresado"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MiSemaforoEgresados />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/mis-calificaciones"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CalificacionesAlumnos />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/formato-evaluacion"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FormatoEvaluaciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/formato-extraordinario"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FormatoEvaluacionesExtraordinarias />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/formato-titulo-sufi"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FormatoTituloSuficiencia />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/listado-materias"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CertificadoCalificaciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/semaforo-egresados"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SemaforoEgresados />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicio-social"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ServicioSocial />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/*Estatus egresados*/}
        <Route
          path="/estatus-egresados"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EstatusEgresados />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
