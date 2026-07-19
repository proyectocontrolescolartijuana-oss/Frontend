import {
  formatStudentNameLastNamesFirst,
  formatPercent,
  formatValue,
  parcialColorClass,
  parcialLabel,
} from "./concentradoCalificacionesUtils";

const colorsByClass = {
  "concentrado-blue": "#9dc3e6",
  "concentrado-gray": "#d9e2f3",
  "concentrado-orange": "#f8cbad",
  "concentrado-pink": "#f4a6b8",
  "concentrado-yellow": "#fff2a8",
};

const baseCellStyle =
  "border:1px solid #222;padding:4px;font-family:Arial;font-size:8pt;font-weight:700;mso-number-format:'\\@';";
const headerCellStyle = `${baseCellStyle}text-align:center;font-weight:900;text-transform:uppercase;`;

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const colorStyle = (className) => {
  const color = colorsByClass[className];

  return color ? `background:${color};background-color:${color};` : "";
};

const th = (content, options = {}) => {
  const { className = "", colspan = 1, style = "" } = options;

  return `<th colspan="${colspan}" style="${headerCellStyle}${colorStyle(className)}${style}">${escapeHtml(content)}</th>`;
};

const td = (content, options = {}) => {
  const { className = "", style = "" } = options;

  return `<td style="${baseCellStyle}${colorStyle(className)}${style}">${escapeHtml(content)}</td>`;
};

const titleRow = (content, colspan) =>
  `<tr>${th(content, {
    colspan,
    style: "font-size:10pt;text-align:center;",
  })}</tr>`;

const buildGradesTable = (materiaReporte, parciales) => {
  const columnCount = 4 + parciales.length;
  const headers = [
    th("No."),
    th("Nombre del alumno", { style: "width:240px;" }),
    ...parciales.map((parcial, index) =>
      th(parcialLabel(parcial, index), {
        className: parcialColorClass(index),
        style: "width:70px;",
      }),
    ),
    th("Promedio de 1er y 2do parcial", {
      className: "concentrado-gray",
      style: "width:95px;",
    }),
    th("Promedio", {
      className: "concentrado-yellow",
      style: "width:75px;",
    }),
  ].join("");

  const rows = materiaReporte.alumnos
    .map((alumno) => {
      const calificaciones = alumno.calificaciones
        .map((calificacion, index) =>
          td(formatValue(calificacion), {
            className: parcialColorClass(index),
            style: "text-align:center;",
          }),
        )
        .join("");

      return `<tr>
        ${td(alumno.no, { style: "text-align:center;" })}
        ${td(formatStudentNameLastNamesFirst(alumno), {
          style: "text-transform:uppercase;",
        })}
        ${calificaciones}
        ${td(formatValue(alumno.promedio_primeros_parciales), {
          className: "concentrado-gray",
          style: "text-align:center;",
        })}
        ${td(formatValue(alumno.promedio_final), {
          className: "concentrado-yellow",
          style: "text-align:center;",
        })}
      </tr>`;
    })
    .join("");

  return `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;width:100%;">
    ${titleRow("Calificaciones", columnCount)}
    <tr>${headers}</tr>
    ${rows}
  </table>`;
};

const buildAttendanceTable = (materiaReporte, parciales) => {
  const columnCount = parciales.length * 2 + 2;
  const classCells = materiaReporte.clases_dadas
    .map((clases, index) =>
      td(clases, {
        className: parcialColorClass(index),
        style: "text-align:center;",
      }),
    )
    .join("");
  const parcialHeaders = parciales
    .map((parcial, index) =>
      th(parcialLabel(parcial, index), {
        className: parcialColorClass(index),
        colspan: 2,
      }),
    )
    .join("");
  const subHeaders = parciales
    .map((_, index) => {
      const className = parcialColorClass(index);

      return `${th("No.", { className })}${th("%", { className })}`;
    })
    .join("");
  const rows = materiaReporte.alumnos
    .map((alumno) => {
      const asistencias = alumno.asistencias
        .map((asistencia, index) => {
          const className = parcialColorClass(index);

          return `${td(asistencia.asistencias, {
            className,
            style: "text-align:center;",
          })}${td(formatPercent(asistencia.porcentaje), {
            className,
            style: "text-align:center;",
          })}`;
        })
        .join("");

      return `<tr>
        ${asistencias}
        ${td(alumno.asistencia_final.asistencias, {
          className: "concentrado-yellow",
          style: "text-align:center;",
        })}
        ${td(formatPercent(alumno.asistencia_final.porcentaje), {
          className: "concentrado-yellow",
          style: "text-align:center;",
        })}
      </tr>`;
    })
    .join("");

  return `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;width:100%;">
    ${titleRow("Asistencias", columnCount)}
    <tr>
      ${th("Clases dadas")}
      ${classCells}
      ${td(materiaReporte.total_clases, {
        className: "concentrado-yellow",
        style: "text-align:center;",
      })}
    </tr>
    <tr>
      ${parcialHeaders}
      ${th("Final", { className: "concentrado-yellow", colspan: 2 })}
    </tr>
    <tr>
      ${subHeaders}
      ${th("No.", { className: "concentrado-yellow" })}
      ${th("%", { className: "concentrado-yellow" })}
    </tr>
    ${rows}
  </table>`;
};

const buildMateriaSheet = (materiaReporte, concentrado) => {
  const parciales = concentrado?.parciales || [];
  const carrera = concentrado?.grupo?.carrera;
  const cuatrimestre = concentrado?.grupo?.cuatrimestre;
  const gradeColumns = 4 + parciales.length;
  const attendanceColumns = parciales.length * 2 + 2;
  const headerColumns = Math.max(gradeColumns, attendanceColumns);

  return `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">
    ${titleRow("Concentrado de calificaciones", headerColumns)}
    ${titleRow("Departamento de control escolar", headerColumns)}
    <tr>
      ${th("Carrera")}
      ${td(carrera?.nombre || "", { style: "text-transform:uppercase;" })}
      ${th("Grado")}
      ${td(cuatrimestre?.nombre || "", { style: "text-transform:uppercase;" })}
    </tr>
    <tr>
      ${th("Nombre del docente")}
      ${td(materiaReporte.docente || "", { style: "text-transform:uppercase;" })}
      ${th("Asignatura")}
      ${td(materiaReporte.materia?.nombre || "", {
        style: "text-transform:uppercase;",
      })}
    </tr>
  </table>
  <br />
  ${buildGradesTable(materiaReporte, parciales)}
  <br />
  ${buildAttendanceTable(materiaReporte, parciales)}
  <br />
  <br />`;
};

export const descargarConcentradoPreviewExcel = async (concentrado) => {
  if (!concentrado?.materias?.length) {
    throw new Error("No hay una vista previa disponible para descargar.");
  }

  const sheets = concentrado.materias
    .map((materiaReporte) => buildMateriaSheet(materiaReporte, concentrado))
    .join('<br style="mso-data-placement:same-cell;" /><br />');
  const html = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head>
    <meta charset="utf-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Concentrado</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
  </head>
  <body>
    ${sheets}
  </body>
</html>`;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  downloadBlob(blob, "concentrado_calificaciones.xls");
};
