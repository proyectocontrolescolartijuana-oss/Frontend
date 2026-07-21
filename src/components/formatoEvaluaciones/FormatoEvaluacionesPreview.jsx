import FormatoEvaluacionesDocument from "./FormatoEvaluacionesDocument";

export default function FormatoEvaluacionesPreview({
  cargando,
  data,
  error,
  logoUrl,
}) {
  return (
    <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      {cargando && !data ? (
        <div className="flex min-h-[6in] items-center justify-center text-sm text-slate-500">
          Cargando calificaciones...
        </div>
      ) : !data ? (
        <div className="flex min-h-[6in] items-center justify-center text-sm text-slate-500">
          {error || "Selecciona una carrera y un grupo para generar el formato."}
        </div>
      ) : (
        <FormatoEvaluacionesDocument data={data} logoUrl={logoUrl} />
      )}
    </section>
  );
}
