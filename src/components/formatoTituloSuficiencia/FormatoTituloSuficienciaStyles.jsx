export default function FormatoTituloSuficienciaStyles() {
  return (
    <style>
      {`
        .suficiencia-documento {
          color: #111;
          font-family: arial;
          font-size: 8pt;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .suficiencia-documento, .suficiencia-documento * { box-sizing: border-box; }
        .suficiencia-hoja { width: 8.5in; min-height: 11in; padding: 0.4in 0.5in; background: #fff; }
        .suficiencia-header { display: flex; align-items: center; gap: 0.2in; margin-bottom: 0.1in; }
        .suficiencia-logo { width: 0.85in; height: 0.85in; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .suficiencia-logo img { width: 100%; height: 100%; object-fit: contain; }
        .suficiencia-title { flex: 1; text-align: center; }
        .suficiencia-title p { margin: 0; font-size: 7.5pt; }
        .suficiencia-title .nombre { font-weight: 700; font-size: 11pt; }
        .suficiencia-title .depto { font-weight: 700; font-size: 9pt; margin-top: 0.05in; }
        .suficiencia-title .formato { font-weight: 700; font-size: 8.5pt; }
        .suficiencia-badge { background: #bfe0d9; border: 1px solid #333; text-align: center; font-weight: 700; padding: 0.05in 0; width: 2.6in; margin: 0.08in auto 0.12in; }
        .suficiencia-meta-table { width: 100%; border-collapse: collapse; margin-bottom: 0.12in; font-size: 8pt; }
        .suficiencia-meta-table td { padding: 0.02in 0.04in; vertical-align: top; }
        .suficiencia-meta-table .label { font-weight: 700; width: 0.9in; }
        .suficiencia-meta-table .center { text-align: center; }
        .suficiencia-table { width: 100%; border-collapse: collapse; border: 1px solid #333; margin-bottom: 0.1in; }
        .suficiencia-table th, .suficiencia-table td { border: 1px solid #333; padding: 0.03in 0.05in; }
        .suficiencia-table th { background: #bfe0d9; font-size: 7pt; font-weight: 700; }
        .suficiencia-table td { font-size: 7.5pt; }
        .suficiencia-table .center { text-align: center; }
        .suficiencia-table .prom { font-weight: 700; }
        .suficiencia-table .nota { font-size: 6.5pt; text-align: left; }
        .suficiencia-escala { font-size: 7.5pt; margin: 0 0 0.04in; }
        .suficiencia-fecha { text-align: right; font-size: 7.5pt; font-weight: 700; margin: 0 0 0.16in; }
        .suficiencia-claves { width: 4.8in; border-collapse: collapse; border: 1px solid #333; margin-bottom: 0.4in; }
        .suficiencia-claves th, .suficiencia-claves td { border: 1px solid #333; padding: 0.03in 0.06in; font-size: 7.5pt; }
        .suficiencia-claves th { background: #bfe0d9; font-weight: 700; }
        .suficiencia-claves .clave { font-weight: 700; }
        .suficiencia-claves .center { text-align: center; }
        .suficiencia-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4in; margin-bottom: 0.4in; font-size: 7.5pt; text-align: center; }
        .suficiencia-signatures .titulo { font-weight: 700; margin: 0 0 0.4in; }
        .suficiencia-signatures .nombre-firma { margin: 0; border-top: 1px solid #333; padding-top: 0.04in; }
        .suficiencia-coordinadora { text-align: center; font-size: 7.5pt; }
        .suficiencia-coordinadora .titulo { font-weight: 700; margin: 0 0 0.4in; }
        .suficiencia-coordinadora .nombre-firma { font-weight: 700; margin: 0; }
        @media print {
          html, body, #root { width: 8.5in; height: 11in; margin: 0; overflow: hidden; }
          body * { visibility: hidden; }
          #suficiencia-preview, #suficiencia-preview * { visibility: visible; }
          #suficiencia-preview { position: absolute; top: 0; left: 0; width: 8.5in; min-height: 11in; margin: 0; box-shadow: none; }
          @page { size: letter portrait; margin: 0; }
        }
      `}
    </style>
  );
}
