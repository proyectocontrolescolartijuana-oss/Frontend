export default function TodasLasMateriasStyles() {
  return (
    <style>
      {`
        .certificado-documento {
          color: #111;
          font-family: Arial;
          font-size: 8pt;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .certificado-documento,
        .certificado-documento * {
          box-sizing: border-box;
        }

        .certificado-hoja {
          width: 8.5in;
          min-height: 11in;
          padding: 0.4in 0.5in;
          background: #fff;
        }

        .certificado-header {
          display: flex;
          justify-content: flex-end;
          border-bottom: 2px solid #1c3f6e;
          padding-bottom: 0.1in;
          margin-bottom: 0.16in;
        }

        .certificado-header-right {
          text-align: right;
        }

        .certificado-header-title {
          font-size: 9pt;
          font-weight: 700;
          color: #1c3f6e;
          letter-spacing: 0.3px;
        }

        .certificado-header-sub {
          font-size: 7.5pt;
          color: #555;
        }

        .certificado-info-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.3fr 1fr;
          column-gap: 0.22in;
          margin-bottom: 0.18in;
        }

        .certificado-info-col {
          font-size: 7.5pt;
        }

        .certificado-info-col-title {
          font-weight: 700;
          font-size: 8pt;
          color: #111;
          margin-bottom: 0.04in;
          letter-spacing: 0.2px;
          text-decoration: underline;
        }

        .certificado-info-col-title-hidden {
          font-size: 8pt;
          margin-bottom: 0.04in;
          visibility: hidden;
        }

        .certificado-info-line {
          padding: 0.01in 0;
          line-height: 1.5;
        }

        .certificado-info-label {
          color: #111;
          font-weight: 700;
        }

        .certificado-info-value {
          color: #111;
          font-weight: 400;
        }

        .certificado-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.5pt;
        }

        .certificado-table th {
          background: #1c3f6e;
          color: #fff;
          padding: 0.04in 0.04in;
          text-align: center;
          border: 1px solid #14304f;
          font-weight: 600;
        }

        .certificado-table td {
          padding: 0.03in 0.04in;
          border: 1px solid #d6d6d6;
        }

        .certificado-table .center {
          text-align: center;
        }

        .certificado-table .left {
          text-align: left;
        }

        .certificado-cuatrimestre-header td {
          font-weight: 700;
          text-transform: uppercase;
          border-color: #14304f;
        }

        .certificado-cuatrimestre-azul td,
        .certificado-cuatrimestre-azul.certificado-cuatrimestre-header td {
          background: #e8f0fb;
        }

        .certificado-cuatrimestre-blanco td,
        .certificado-cuatrimestre-blanco.certificado-cuatrimestre-header td {
          background: #fff;
        }

        .certificado-empty {
          padding: 0.3in 0;
          text-align: center;
          color: #64748b;
          font-size: 9pt;
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

          #certificado-preview,
          #certificado-preview * {
            visibility: visible;
          }

          #certificado-preview {
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
