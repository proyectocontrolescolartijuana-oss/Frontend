export default function CarreraHeader({ total }) {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900">Carreras</h1>

      <p className="mt-1 text-slate-500">{total} programas registrados</p>
    </div>
  );
}
