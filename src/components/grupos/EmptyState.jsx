export default function EmptyState({ mensaje = "No hay grupos registrados." }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <p className="text-slate-500">{mensaje}</p>
    </div>
  );
}
