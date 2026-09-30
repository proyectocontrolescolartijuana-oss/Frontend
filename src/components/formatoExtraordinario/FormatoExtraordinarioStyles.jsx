export default function FormatoExtraordinarioStyles() {
  return (
    <style>
      {`
        .extraord-documento {
          color: #111;
          font-family: arial;
          font-size: 8pt;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .extraord-documento, .extraord-documento * { box-sizing: border-box; }
        .extraord-hoja { width: 8.5in; min-height: 11in; padding: 0.4in 0.5in; background: #fff; }
        .extraord-header { display: flex; align-items: center; gap: 0.2in; margin-bottom: 0.1in; }
        .extraord-logo { width: 0.85in; height: 0.85in; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .extraord-logo img { width: 100%; height: 100%; object-fit: contain; }
        .extraord-title { flex: 1; text-align: center; }
        .extraord-title p { margin: 0; font-size: 7.5pt; }
        .extraord-title .nombre { font-weight: 700; font-size: 11pt; }
        .extraord-title .depto { font-weight: 700; font-size: 9pt; margin-top: 0.05in; }
        .extraord-title .formato { font-weight: 700; font-size: 8.5pt; }
        .extraord-badge { background: #bfe0d9; border: 1px solid #333; text-align: center; font-weight: 700; padding: 0.05in 0; width: 2.6in; margin: 0.08in auto 0.12in; }
        .extraord-meta-table { width: 100%; border-collapse: collapse; margin-bottom: 0.12in; font-size: 8pt; }
        .extraord-meta-table td { padding: 0.02in 0.04in; vertical-align: top; }
        .extraord-meta-table .label { font-weight: 700; width: 0.9in; }
        .extraord-meta-table .center { text-align: center; }
        .extraord-table { width: 100%; border-collapse: collapse; border: 1px solid #333; margin-bottom: 0.1in; }
        .extraord-table th, .extraord-table td { border: 1px solid #333; padding: 0.03in 0.05in; }
        .extraord-table th { background: #bfe0d9; font-size: 7pt; font-weight: 700; }
        .extraord-table td { font-size: 7.5pt; }
        .extraord-table .center { text-align: center; }
        .extraord-table .nota { font-size: 6.5pt; text-align: left; }
        .extraord-escala { font-size: 7.5pt; margin: 0 0 0.16in; }
        .extraord-fecha { text-align: right; font-size: 7.5pt; font-weight: 700; margin: 0 0 0.4in; }
        .extraord-claves { width: 4.8in; border-collapse: collapse; border: 1px solid #333; margin-bottom: 0.3in; }
        .extraord-claves th, .extraord-claves td { border: 1px solid #333; padding: 0.03in 0.06in; font-size: 7.5pt; }
        .extraord-claves th { background: #bfe0d9; font-weight: 700; }
        .extraord-claves .clave { font-weight: 700; }
        .extraord-claves .center { text-align: center; }
        .extraord-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4in; margin-bottom: 0.4in; font-size: 7.5pt; text-align: center; }
        .extraord-signatures .titulo { font-weight: 700; margin: 0 0 0.4in; }
        .extraord-signatures .nombre-firma { margin: 0; border-top: 1px solid #333; padding-top: 0.04in; }
        .extraord-coordinadora { text-align: center; font-size: 7.5pt; }
        .extraord-coordinadora .titulo { font-weight: 700; margin: 0 0 0.4in; }
        .extraord-coordinadora .nombre-firma { font-weight: 700; margin: 0; }
        @media print {
          html, body, #root { width: 8.5in; height: 11in; margin: 0; overflow: hidden; }
          body * { visibility: hidden; }
          #extraord-preview, #extraord-preview * { visibility: visible; }
          #extraord-preview { position: absolute; top: 0; left: 0; width: 8.5in; min-height: 11in; margin: 0; box-shadow: none; }
          @page { size: letter portrait; margin: 0; }
        }
      `}
    </style>
  );
}
