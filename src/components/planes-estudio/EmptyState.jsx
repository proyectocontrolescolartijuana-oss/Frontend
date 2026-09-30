export default function EmptyState({
  mensaje = "No hay información disponible.",
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <div className="rounded-full bg-slate-100 p-5 text-4xl">📚</div>

      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        Sin contenido
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">{mensaje}</p>
    </div>
  );
}
