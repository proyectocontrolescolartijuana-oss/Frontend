import TodasLasMateriasDocument from "./TodasLasMateriasDocument";

export default function TodasLasMateriasPreview(props) {
  return (
    <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <TodasLasMateriasDocument {...props} />
    </section>
  );
}
