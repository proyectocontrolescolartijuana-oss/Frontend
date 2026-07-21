export default function InfoLine({ label, value }) {
  return (
    <div className="certificado-info-line">
      <span className="certificado-info-label">{label}: </span>
      <span className="certificado-info-value">{value}</span>
    </div>
  );
}
