import FormatoTituloSuficienciaDocument from "./FormatoTituloSuficienciaDocument";

export default function FormatoTituloSuficienciaPreview({ data, logoUrl }) {
  return (
    <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <FormatoTituloSuficienciaDocument data={data} logoUrl={logoUrl} />
    </section>
  );
}
