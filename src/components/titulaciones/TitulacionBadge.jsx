import { CheckCircle2, X } from "lucide-react";

const badgeClasses = {
  entregado: "bg-emerald-50 text-emerald-700",
  pendiente: "bg-slate-100 text-slate-500",
};

export default function TitulacionBadge({ entregado, label }) {
  return (
    <span
      title={label}
      className={`inline-flex max-w-52 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        entregado ? badgeClasses.entregado : badgeClasses.pendiente
      }`}
    >
      {entregado ? <CheckCircle2 size={14} /> : <X size={14} />}
      <span className="truncate">
        {label ? `${label}: ` : ""}
        {entregado ? "Registrado" : "Pendiente"}
      </span>
    </span>
  );
}
