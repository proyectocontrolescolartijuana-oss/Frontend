import EstatusEgresadosDocument from "./EstatusEgresadosDocument";

export default function EstatusEgresadosPreview(props) {
  return (
    <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <EstatusEgresadosDocument {...props} />
    </section>
  );
}
