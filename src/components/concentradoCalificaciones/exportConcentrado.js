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
  // Formato de una sola evaluacion (sabatina)
  "sab-slate": "#d5dce4",
  "sab-verde": "#b7e1cd",
  "sab-amarillo": "#ffff66",
  "sab-cyan": "#33ccff",
  "sab-lavanda": "#ccccff",
  "sab-rojo": "#ff9999",
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
  const { className = "", colspan = 1, style = "" } = options;

  return `<td colspan="${colspan}" style="${baseCellStyle}${colorStyle(className)}${style}">${escapeHtml(content)}</td>`;
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

// Formato de una sola evaluacion (sabatina), igual al formato impreso:
// calificaciones y asistencias lado a lado; la calificacion final se repite
// como "Promedio".
const formatCalificacionUnica = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);

  if (Number.isNaN(numero)) return String(valor);

  return Number.isInteger(numero) ? numero.toFixed(1) : String(numero);
};

const formatPorcentajeUnico = (valor) =>
  valor === null || valor === undefined || valor === ""
    ? ""
    : `${Math.round(Number(valor))}%`;

const buildSabatinoSheet = (materiaReporte, concentrado) => {
  const cuatrimestre = concentrado?.grupo?.cuatrimestre;
  const centro = "text-align:center;";
  const sinBorde = "border:none;background:none;";
  const gap = `<td style="${baseCellStyle}${sinBorde}"></td>`;
  const blank = `<tr><td colspan="9" style="border:none;height:10px;"></td></tr>`;
  const clases = materiaReporte.total_clases;

  const filas = materiaReporte.alumnos
    .map((alumno) => {
      const { asistencias, porcentaje } = alumno.asistencia_final;
      const final = formatCalificacionUnica(alumno.promedio_final);

      return `<tr>
        ${td(alumno.no, { style: centro })}
        ${td(formatStudentNameLastNamesFirst(alumno), {
          style: "text-transform:uppercase;",
        })}
        ${td(final, { className: "sab-lavanda", style: centro })}
        ${td(final, { className: "sab-rojo", style: `${centro}font-size:10pt;` })}
        ${gap}
        ${td(asistencias, { className: "sab-amarillo", style: centro })}
        ${td(formatPorcentajeUnico(porcentaje), {
          className: "sab-amarillo",
          style: centro,
        })}
        ${td(asistencias, { className: "sab-cyan", style: centro })}
        ${td(formatPorcentajeUnico(porcentaje), {
          className: "sab-cyan",
          style: centro,
        })}
      </tr>`;
    })
    .join("");

  return `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;width:100%;">
    <colgroup>
      <col style="width:4%" /><col style="width:29%" /><col style="width:10%" />
      <col style="width:10%" /><col style="width:12%" /><col style="width:8%" />
      <col style="width:8%" /><col style="width:10%" /><col style="width:9%" />
    </colgroup>
    ${titleRow("Centro de Estudios Superiores de la Frontera, UNIFRONT", 9)}
    ${titleRow("Concentrado de calificaciones", 9)}
    ${titleRow("Departamento de control escolar", 9)}
    ${blank}
    <tr>
      ${td(`NOMBRE DEL DOCENTE: ${(materiaReporte.docente || "").toUpperCase()}`, {
        className: "sab-slate",
        colspan: 5,
      })}
      ${td((cuatrimestre?.nombre || "").toUpperCase(), {
        colspan: 4,
        style: `${centro}${sinBorde}`,
      })}
    </tr>
    ${blank}
    <tr>
      ${td(
        `ASIGNATURA: ${(materiaReporte.materia?.nombre || "").toUpperCase()}`,
        { className: "sab-verde", colspan: 4 },
      )}
      ${th("Clases dadas")}
      ${td(clases, { className: "sab-amarillo", colspan: 2, style: centro })}
      ${td(clases, { className: "sab-cyan", colspan: 2, style: centro })}
    </tr>
    ${blank}
    <tr>
      ${th("No.")}
      ${th("Nombre del alumno", { style: "width:240px;" })}
      ${th("Calificación final", { className: "sab-lavanda" })}
      ${th("Promedio", { className: "sab-rojo" })}
      <th style="${sinBorde}"></th>
      ${th("Asistencias", { className: "sab-amarillo" })}
      ${th("%", { className: "sab-amarillo" })}
      ${th("Total de asistencias", { className: "sab-cyan" })}
      ${th("%", { className: "sab-cyan" })}
    </tr>
    ${filas}
    ${blank}
    ${blank}
    <tr>
      ${td("DIRECTOR (A) DE LA LICENCIATURA", { colspan: 4, style: centro })}
      <td style="${sinBorde}"></td>
      ${td("CONTROL ESCOLAR", { colspan: 4, style: centro })}
    </tr>
  </table>
  <br />
  <br />`;
};

const buildMateriaSheet = (materiaReporte, concentrado) => {
  if (concentrado?.evaluacion_unica) {
    return buildSabatinoSheet(materiaReporte, concentrado);
  }

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