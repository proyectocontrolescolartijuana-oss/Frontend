export default function PlanSelector({ planes, value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-[320px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    >
      {planes.map((plan) => (
        <option key={plan.id_plan} value={plan.id_plan}>
          {plan.nombre_plan} - {plan.carrera.nombre}
        </option>
      ))}
    </select>
  );
}
