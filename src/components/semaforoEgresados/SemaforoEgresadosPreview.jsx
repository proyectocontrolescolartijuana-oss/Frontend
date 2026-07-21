import SemaforoEgresadosDocument from "./SemaforoEgresadosDocument";

export default function SemaforoEgresadosPreview(props) {
  return (
    <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <SemaforoEgresadosDocument {...props} />
    </section>
  );
}
