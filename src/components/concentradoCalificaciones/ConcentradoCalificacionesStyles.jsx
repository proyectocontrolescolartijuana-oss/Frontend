export const concentradoCalificacionesStyles = `
  .concentrado-documento {
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 6.7pt;
    line-height: 1.12;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .concentrado-documento,
  .concentrado-documento * {
    box-sizing: border-box;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .concentrado-hoja {
    width: 11in;
    min-height: 8.5in;
    padding: 0.42in 0.55in 0.28in;
    background: #fff;
  }

  .concentrado-page {
    break-after: page;
    page-break-after: always;
  }

  .concentrado-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  .concentrado-header {
    display: grid;
    grid-template-columns: 2.1in 1fr 1.7in;
    align-items: start;
    column-gap: 0.2in;
    min-height: 0.52in;
  }

  .concentrado-logo-left {
    width: 1.45in;
    height: auto;
  }

  .concentrado-logo-right {
    justify-self: end;
    max-width: 0.92in;
    max-height: 0.52in;
    object-fit: contain;
  }

  .concentrado-title {
    margin: 0;
    text-align: center;
    font-size: 7.2pt;
    font-weight: 900;
    text-transform: uppercase;
  }

  .concentrado-subtitle {
    margin-top: 0.04in;
    text-align: center;
    font-size: 6.5pt;
    font-weight: 900;
    text-transform: uppercase;
  }

  .concentrado-meta {
    display: grid;
    grid-template-columns: 5.2in 1fr;
    align-items: end;
    gap: 0.4in;
    margin-top: 0.06in;
    font-size: 6.3pt;
    font-weight: 900;
    text-transform: uppercase;
  }

  .concentrado-meta-row {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    min-height: 0.17in;
  }

  .concentrado-meta-label {
    padding: 0.03in 0.08in;
    background: #d9eaf7;
  }

  .concentrado-meta-value {
    padding: 0.03in 0.08in;
    background: #eaf3f8;
  }

  .concentrado-grade {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.08in;
    justify-self: end;
  }

  .concentrado-body {
    display: grid;
    grid-template-columns: 5.05in 3.8in;
    gap: 0.26in;
    margin-top: 0.08in;
  }

  .concentrado-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .concentrado-table th,
  .concentrado-table td {
    border: 1.2px solid #222;
    padding: 0.035in 0.04in;
    height: 0.18in;
    overflow-wrap: anywhere;
  }

  .concentrado-table th {
    text-align: center;
    font-size: 5.7pt;
    font-weight: 900;
    text-transform: uppercase;
  }

  .concentrado-table td {
    font-size: 6.6pt;
    font-weight: 700;
  }

  .concentrado-center {
    text-align: center;
  }

  .concentrado-name {
    text-transform: uppercase;
  }

  .concentrado-blue {
    background: #9dc3e6;
    background-color: #9dc3e6;
  }

  .concentrado-gray {
    background: #d9e2f3;
    background-color: #d9e2f3;
  }

  .concentrado-pink {
    background: #f4a6b8;
    background-color: #f4a6b8;
  }

  .concentrado-yellow {
    background: #fff2a8;
    background-color: #fff2a8;
  }

  .concentrado-orange {
    background: #f8cbad;
    background-color: #f8cbad;
  }

  .concentrado-classes th,
  .concentrado-classes td {
    height: 0.15in;
    font-size: 5.9pt;
  }

  .concentrado-signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.28in;
    margin: 0.36in 1.8in 0;
    text-align: center;
    font-size: 5.7pt;
    font-weight: 900;
    text-transform: uppercase;
  }

  .concentrado-line {
    border-top: 1.4px solid #222;
    padding-top: 0.04in;
  }

  @media print {
    html,
    body,
    #root {
      width: 11in;
      min-height: 8.5in;
      margin: 0;
      overflow: visible;
    }

    body * {
      visibility: hidden;
    }

    #concentrado-preview,
    #concentrado-preview * {
      visibility: visible;
    }

    #concentrado-preview {
      position: absolute;
      top: 0;
      left: 0;
      width: 11in;
      margin: 0;
      box-shadow: none;
    }

    .concentrado-blue {
      background: #9dc3e6 !important;
      background-color: #9dc3e6 !important;
    }

    .concentrado-gray {
      background: #d9e2f3 !important;
      background-color: #d9e2f3 !important;
    }

    .concentrado-pink {
      background: #f4a6b8 !important;
      background-color: #f4a6b8 !important;
    }

    .concentrado-yellow {
      background: #fff2a8 !important;
      background-color: #fff2a8 !important;
    }

    .concentrado-orange {
      background: #f8cbad !important;
      background-color: #f8cbad !important;
    }

    @page {
      size: letter landscape;
      margin: 0;
    }
  }
`;

export function ConcentradoCalificacionesStyles() {
  return <style>{concentradoCalificacionesStyles}</style>;
}
