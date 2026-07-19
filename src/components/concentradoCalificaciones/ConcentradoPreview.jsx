import { FileSpreadsheet } from "lucide-react";

import ConcentradoSubjectPage from "./ConcentradoSubjectPage";

export default function ConcentradoPreview({ concentrado, logoUnifront }) {
  const parciales = concentrado?.parciales || [];
  const materias = concentrado?.materias || [];
  const carrera = concentrado?.grupo?.carrera;
  const cuatrimestre = concentrado?.grupo?.cuatrimestre;

  return (
    <section className="overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-4 shadow-sm">
      {!concentrado ? (
        <EmptyPreview message="Genera el reporte para ver la vista previa." />
      ) : materias.length === 0 ? (
        <EmptyPreview message="El grupo no tiene materias asignadas en este periodo." />
      ) : (
        <div id="concentrado-preview" className="mx-auto space-y-4">
          {materias.map((materiaReporte) => (
            <ConcentradoSubjectPage
              key={materiaReporte.id_grupo_materia}
              carrera={carrera}
              cuatrimestre={cuatrimestre}
              logoUnifront={logoUnifront}
              materiaReporte={materiaReporte}
              parciales={parciales}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyPreview({ message }) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-slate-400">
      <FileSpreadsheet size={44} strokeWidth={1.5} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
