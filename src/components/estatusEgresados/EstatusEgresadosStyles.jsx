export default function EstatusEgresadosStyles() {
  return (
    <style>{`
      .estatus-documento {
        font-family: Arial, sans-serif;
        color: #111;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .estatus-hoja {
        width: 16.5in;
        min-height: 8.5in;
        padding: .3in;
        background: white;
        box-sizing: border-box;
      }
      .estatus-encabezado {
        display: grid;
        grid-template-columns: 2.2in 1fr 2.2in;
        align-items: center;
        min-height: .85in;
        margin-bottom: .16in;
      }
      .estatus-logo { width: 1.85in; height: auto; }
      .estatus-titulo { text-align: center; }
      .estatus-titulo h2 { margin: 0; font-size: 15px; font-weight: 800; }
      .estatus-titulo p { margin: 7px 0 0; font-size: 12px; font-weight: 700; }
      .estatus-meta {
        display: flex;
        flex-direction: column;
        gap: 5px;
        text-align: right;
        font-size: 9px;
      }
      .estatus-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 7px;
        text-transform: uppercase;
      }
      .estatus-table th {
        height: 34px;
        border: 1px solid #263b26;
        background: #4f984c;
        padding: 3px 2px;
        font-size: 6.5px;
        font-weight: 700;
        line-height: 1.05;
        vertical-align: middle;
      }
      .estatus-table td {
        height: 25px;
        border: 1px solid #555;
        padding: 2px;
        text-align: center;
        line-height: 1.05;
        overflow-wrap: anywhere;
      }
      .estatus-table th:nth-child(1) { width: 2.5%; }
      .estatus-table th:nth-child(2) { width: 6%; }
      .estatus-table th:nth-child(3) { width: 13%; }
      .estatus-table th:nth-child(4) { width: 4.5%; }
      .estatus-table th:nth-child(5) { width: 5%; }
      .estatus-table th:nth-child(6) { width: 4%; }
      .estatus-table th:nth-child(7) { width: 8%; }
      .estatus-table th:nth-child(8) { width: 3.5%; }
      .estatus-table th:nth-child(9) { width: 7%; }
      .estatus-table th:nth-child(10) { width: 5%; }
      .estatus-table th:nth-child(11) { width: 5.5%; }
      .estatus-table th:nth-child(12) { width: 7%; }
      .estatus-table th:nth-child(13) { width: 3.5%; }
      .estatus-table th:nth-child(14) { width: 7%; }
      .estatus-table th:nth-child(15) { width: 5%; }
      .estatus-table th:nth-child(16) { width: 4%; }
      .estatus-table th:nth-child(17) { width: 5%; }
      .estatus-table th:nth-child(18) { width: 6%; }
      .estatus-table th:nth-child(19) { width: 5%; }
      .estatus-table th:nth-child(20) { width: 5%; }
      .estatus-table .estatus-nombre {
        text-align: left;
        font-weight: 600;
      }
      .estatus-empty {
        padding: .7in 0;
        color: #64748b;
        text-align: center;
        font-size: 12px;
      }
      @page { size: legal landscape; margin: 0; }
      @media print {
        html, body, #root { margin: 0; overflow: visible; }
        body * { visibility: hidden; }
        #estatus-egresados-preview,
        #estatus-egresados-preview * { visibility: visible; }
        #estatus-egresados-preview {
          position: absolute;
          inset: 0;
          margin: 0;
          box-shadow: none;
        }
      }
    `}</style>
  );
}
