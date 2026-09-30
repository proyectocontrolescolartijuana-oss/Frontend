export default function FormatoEvaluacionesStyles() {
  return (
    <style>
      {`
        .evaluaciones-documento {
          color: #111;
          font-family: arial;
          font-size: 8pt;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .evaluaciones-documento,
        .evaluaciones-documento * {
          box-sizing: border-box;
        }

        .evaluaciones-hoja {
          width: 8.5in;
          min-height: 11in;
          padding: 0.4in 0.5in;
          background: #fff;
        }

        .evaluaciones-header {
          display: flex;
          align-items: center;
          gap: 0.2in;
          margin-bottom: 0.1in;
        }

        .evaluaciones-logo {
          width: 0.85in;
          height: 0.85in;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .evaluaciones-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .evaluaciones-title {
          flex: 1;
          text-align: center;
        }

        .evaluaciones-title p {
          margin: 0;
          font-size: 7.5pt;
        }

        .evaluaciones-title .nombre {
          font-weight: 700;
          font-size: 11pt;
        }

        .evaluaciones-title .depto {
          font-weight: 700;
          font-size: 9pt;
          margin-top: 0.05in;
        }

        .evaluaciones-title .formato {
          font-weight: 700;
          font-size: 8.5pt;
        }

        .evaluaciones-badge {
          background: #bfe0d9;
          border: 1px solid #333;
          text-align: center;
          font-weight: 700;
          padding: 0.05in 0;
          width: 2.6in;
          margin: 0.08in auto 0.12in;
        }

        .evaluaciones-meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.12in;
          font-size: 8pt;
        }

        .evaluaciones-meta-table td {
          padding: 0.02in 0.04in;
          vertical-align: top;
        }

        .evaluaciones-meta-table .label {
          font-weight: 700;
          width: 0.9in;
        }

        .evaluaciones-meta-table .center {
          text-align: center;
        }

        .evaluaciones-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #333;
          margin-bottom: 0.1in;
        }

        .evaluaciones-table th,
        .evaluaciones-table td {
          border: 1px solid #333;
          padding: 0.03in 0.05in;
        }

        .evaluaciones-table th {
          background: #bfe0d9;
          font-size: 7pt;
          font-weight: 700;
        }

        .evaluaciones-table td {
          font-size: 7.5pt;
        }

        .evaluaciones-table .center {
          text-align: center;
        }

        .evaluaciones-table .prom {
          font-weight: 700;
        }

        .evaluaciones-table .nota {
          font-size: 6.5pt;
          text-align: left;
        }

        .evaluaciones-escala {
          font-size: 7.5pt;
          margin: 0 0 0.04in;
        }

        .evaluaciones-fecha {
          text-align: right;
          font-size: 7.5pt;
          font-weight: 700;
          margin: 0 0 0.16in;
        }

        .evaluaciones-claves {
          width: 4.8in;
          border-collapse: collapse;
          border: 1px solid #333;
          margin-bottom: 0.4in;
        }

        .evaluaciones-claves th,
        .evaluaciones-claves td {
          border: 1px solid #333;
          padding: 0.03in 0.06in;
          font-size: 7.5pt;
        }

        .evaluaciones-claves th {
          background: #bfe0d9;
          font-weight: 700;
        }

        .evaluaciones-claves .clave {
          font-weight: 700;
        }

        .evaluaciones-claves .center {
          text-align: center;
        }

        .evaluaciones-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4in;
          margin-bottom: 0.4in;
          font-size: 7.5pt;
          text-align: center;
        }

        .evaluaciones-signatures .titulo {
          font-weight: 700;
          margin: 0 0 0.4in;
        }

        .evaluaciones-signatures .nombre-firma {
          margin: 0;
          border-top: 1px solid #333;
          padding-top: 0.04in;
        }

        .evaluaciones-coordinadora {
          text-align: center;
          font-size: 7.5pt;
        }

        .evaluaciones-coordinadora .titulo {
          font-weight: 700;
          margin: 0 0 0.4in;
        }

        .evaluaciones-coordinadora .nombre-firma {
          font-weight: 700;
          margin: 0;
        }

        @media print {
          html,
          body,
          #root {
            width: 8.5in;
            min-height: 11in;
            margin: 0;
          }

          body * {
            visibility: hidden;
          }

          #evaluaciones-preview,
          #evaluaciones-preview * {
            visibility: visible;
          }

          #evaluaciones-preview {
            position: absolute;
            top: 0;
            left: 0;
            width: 8.5in;
            min-height: 11in;
            margin: 0;
            box-shadow: none;
          }

          @page {
            size: letter portrait;
            margin: 0;
          }
        }
      `}
    </style>
  );
}
