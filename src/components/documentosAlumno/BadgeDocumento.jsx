import { Check, X } from "lucide-react";

export default function BadgeDocumento({ entregado }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold ${
        entregado ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {entregado ? <Check size={13} /> : <X size={13} />}
      {entregado ? "Entregado" : "Falta"}
    </span>
  );
}
