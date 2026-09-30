import { CheckCircle2, X } from "lucide-react";

export default function DocumentoChip({ tipoDocumento, entregado }) {
  return (
    <span
      title={tipoDocumento.nombre}
      className={`inline-flex max-w-52 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        entregado
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {entregado ? <CheckCircle2 size={14} /> : <X size={14} />}
      <span className="truncate">{tipoDocumento.nombre}</span>
    </span>
  );
}
