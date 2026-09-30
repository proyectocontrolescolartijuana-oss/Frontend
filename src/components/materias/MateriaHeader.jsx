export default function MateriaHeader({ total }) {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900">Materias</h1>

      <p className="mt-1 text-slate-500">{total} materias registradas</p>
    </div>
  );
}
