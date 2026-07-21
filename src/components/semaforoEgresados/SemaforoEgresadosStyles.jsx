export default function SemaforoEgresadosStyles() {
  return (
    <style>{`
      .semaforo-documento {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #111;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .semaforo-hoja {
        width: 11in;
        min-height: 8.5in;
        padding: 0.35in 0.45in;
        background: #fff;
        box-sizing: border-box;
      }

      .semaforo-logo {
        width: 1.65in;
        height: auto;
        object-fit: contain;
      }

      .semaforo-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        table-layout: fixed;
      }

      .semaforo-table th {
        background: #1c3f6e;
        color: white;
        padding: 8px 6px;
        border: 1px solid #14304f;
        font-weight: 600;
      }

      .semaforo-table td {
        border: 1px solid #d6d6d6;
        padding: 6px;
        word-break: break-word;
      }

      .fila-par {
        background: #f7f9fc;
      }

      .fila-impar {
        background: white;
      }

      .semaforo-empty {
        padding: 0.3in 0;
        text-align: center;
        color: #64748b;
        font-size: 12px;
      }

      @page {
        size: letter landscape;
        margin: 0;
      }

      @media print {
        html, body, #root {
          width: 11in;
          height: 8.5in;
          margin: 0;
          overflow: hidden;
        }

        body * {
          visibility: hidden;
        }

        #semaforo-preview,
        #semaforo-preview * {
          visibility: visible;
        }

        #semaforo-preview {
          position: absolute;
          left: 0;
          top: 0;
          width: 11in;
          min-height: 8.5in;
          margin: 0;
          box-shadow: none;
        }
      }
    `}</style>
  );
}
