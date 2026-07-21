import FormatoExtraordinarioDocument from "./FormatoExtraordinarioDocument";

export default function FormatoExtraordinarioPreview({ data, logoUrl }) {
  return (
    <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <FormatoExtraordinarioDocument data={data} logoUrl={logoUrl} />
    </section>
  );
}
