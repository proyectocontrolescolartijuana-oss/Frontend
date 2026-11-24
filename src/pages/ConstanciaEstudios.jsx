import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import logoUnifront from "../assets/UnifrontLogoColorSinFondo.png";
import { obtenerAlumnosDetalle } from "../services/usuariosService";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Footer,
  Header,
  TableLayoutType,
  VerticalAlign,
  LineRuleType,
  PageBorderDisplay,
  PageBorderOffsetFrom,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  TextWrappingType,
  Tab,
} from "docx";

const initialForm = {
  idAlumno: "",
  sexo: "hombre",
  nombreAlumno: "",
  matricula: "",
  carrera: "",
  cuatrimestre: "",
  cuatrimestreEstimado: false,
  grupo: "",
  planEstudios: "",
  departamento: "Control Escolar",
  asunto: "Constancia de Estudios",
  horario: "lunes a viernes",
  periodoVacacional: "acuerdo al calendario escolar vigente",
  fechaEmision: new Date().toISOString().slice(0, 10),
  ciudad: "Tijuana",
  estado: "B.C.",
  director: "MTRA. MARIA DEL CARMEN GONZALEZ",
  cargoDirector: "DIRECTORA GENERAL",
  campus: "Campus Tijuana",
  telefono: "Tel. 660-19-23 y 903-43-07",
  correo: "control.escolar@unifront.edu.mx",
  direccion: "Blvd. Bernardo O'Higgins No. 6050, Los Alamos",
  sitioWeb: "WWW.UNIFRONT.MX",
};

const normalizar = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();


const primerValor = (...valores) => {
  for (const v of valores) {
    if (v === null || v === undefined) continue;
    if (typeof v === "object") {
      const interno = v.nombre ?? v.clave ?? v.descripcion ?? v.numero ?? v.grado;
      if (interno !== undefined && interno !== null && String(interno).trim() !== "") {
        return String(interno).trim();
      }
      continue;
    }
    if (String(v).trim() !== "") return String(v).trim();
  }
  return "";
};

const ORDINALES = {
  primer: 1, primero: 1, segundo: 2, tercer: 3, tercero: 3, cuarto: 4, quinto: 5,
  sexto: 6, septimo: 7, octavo: 8, noveno: 9, decimo: 10, onceavo: 11, doceavo: 12,
};


const numeroDeCuatrimestre = (valor) => {
  if (valor === null || valor === undefined) return "";

  if (typeof valor === "number") return Number.isFinite(valor) && valor > 0 ? String(valor) : "";

  if (typeof valor === "object") {
    for (const clave of ["numero", "num", "numero_cuatrimestre", "num_cuatrimestre", "orden", "grado"]) {
      const n = numeroDeCuatrimestre(valor[clave]);
      if (n) return n;
    }
    
    return numeroDeCuatrimestre(valor.nombre ?? valor.descripcion ?? valor.clave);
  }

  const texto = normalizar(valor);
  const digitos = texto.match(/\d+/);
  if (digitos) return String(parseInt(digitos[0], 10));

  const palabra = texto.split(/[^a-z]+/).find((w) => ORDINALES[w]);
  return palabra ? String(ORDINALES[palabra]) : "";
};

const estimarCuatrimestre = (fechaIngreso, hoy = new Date()) => {
  if (!fechaIngreso) return "";
  const ingreso = new Date(`${String(fechaIngreso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(ingreso.getTime())) return "";

  const periodo = (fecha) => fecha.getFullYear() * 3 + Math.floor(fecha.getMonth() / 4);
  const numero = periodo(hoy) - periodo(ingreso) + 1;

  return numero >= 1 ? String(numero) : "";
};


const obtenerGrupoYCuatrimestre = (alumno) => {
  const grupo = primerValor(
    alumno?.grupo,
    alumno?.grupo_actual,
    alumno?.nombre_grupo,
    alumno?.clave_grupo,
    alumno?.grupo_nombre,
  );

  
  let cuatrimestre = "";
  for (const candidato of [
    alumno?.cuatrimestre,
    alumno?.cuatrimestre_actual,
    alumno?.num_cuatrimestre,
    alumno?.grupo?.cuatrimestre,
    alumno?.grupo?.cuatrimestre_actual,
    alumno?.grupo?.num_cuatrimestre,
    alumno?.grado,
    alumno?.grupo?.grado,
  ]) {
    cuatrimestre = numeroDeCuatrimestre(candidato);
    if (cuatrimestre) break;
  }

  
  if (!cuatrimestre) {
    const m = grupo.match(/-(\d{1,2})$/);
    if (m) cuatrimestre = m[1];
  }

  let estimado = false;
  if (!cuatrimestre) {
    cuatrimestre = estimarCuatrimestre(alumno?.fecha_ingreso);
    estimado = Boolean(cuatrimestre);
  }

  return { grupo, cuatrimestre, estimado };
};

const SUFIJO_ORDINAL = { 1: "ER", 2: "DO", 3: "ER", 4: "TO", 5: "TO", 6: "TO", 7: "MO", 8: "VO", 9: "NO", 10: "MO", 11: "VO", 12: "VO" };


const datosInscripcion = (form) => {
  const grupo = (form.grupo || "").trim();
  const raw = String(form.cuatrimestre ?? "").trim();
  const num = parseInt(raw, 10);
  const cuatri = raw
    ? Number.isNaN(num)
      ? { numero: raw.toUpperCase(), sufijo: "" }
      : { numero: String(num), sufijo: SUFIJO_ORDINAL[num] || "O" }
    : null;
  return { cuatri, grupo };
};

const textosPorSexo = {
  hombre: {
    alumno: "el alumno",
    alumnoCapitalizado: "El alumno",
    inscrito: "inscrito",
    peticion: "del interesado",
  },
  mujer: {
    alumno: "la alumna",
    alumnoCapitalizado: "La alumna",
    inscrito: "inscrita",
    peticion: "de la interesada",
  },
};

const formatDate = (value) => {
  if (!value) return "___ de __________ de ____";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};


const TNR = "Times New Roman";
const ARIAL = "Arial";
const PX_A_EMU = 9525; 
const pulg = (n) => Math.round(n * 1440);


const WORD = {
  cuerpoSize: 27, 
  interlineado: 252, 
  espacioParrafo: pulg(0.31),
  margenSuperior: pulg(0.87), 
  antesDelRecuadro: 660, 
  antesDeDestinatario: 880, 
};

const sinBorde = { style: BorderStyle.NONE, size: 0, color: "auto" };
const bordesCeldaNulos = {
  top: sinBorde,
  bottom: sinBorde,
  left: sinBorde,
  right: sinBorde,
};
const bordesTablaNulos = {
  ...bordesCeldaNulos,
  insideHorizontal: sinBorde,
  insideVertical: sinBorde,
};


const medirEnHoja = (selector) => {
  const hoja = document.getElementById("constancia-preview");
  const el = hoja?.querySelector(selector);
  if (!hoja || !el) return null;
  const h = hoja.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    left: r.left - h.left,
    top: r.top - h.top,
    width: r.width,
    height: r.height,
  };
};


const AMARILLO_TEXTO = "#F8D31E"; 
const AMARILLO_TRIANGULO = "#FDC603";
const ICONO_PX = 15; 


const ICONOS = {
  telefono: [
    {
      d: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
    },
  ],
  correo: [
    {
      d: "M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5z",
      trazo: true,
    },
    { d: "M3 7.2l9 6.3 9-6.3", trazo: true },
  ],
  ubicacion: [
    {
      d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z",
    },
  ],
};

const atributosTrazo = (trazo) =>
  trazo
    ? { fill: "none", stroke: AMARILLO_TEXTO, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
    : { fill: AMARILLO_TEXTO };


function IconoContacto({ nombre }) {
  return (
    <svg className="icono-contacto" viewBox="0 0 24 24" aria-hidden="true">
      {ICONOS[nombre].map((trazo, i) => (
        <path key={i} d={trazo.d} {...atributosTrazo(trazo.trazo)} />
      ))}
    </svg>
  );
}


const svgIcono = (nombre, px) => {
  const paths = ICONOS[nombre]
    .map((t) =>
      t.trazo
        ? `<path d="${t.d}" fill="none" stroke="${AMARILLO_TEXTO}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="${t.d}" fill="${AMARILLO_TEXTO}"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24">${paths}</svg>`;
};

const svgTriangulo = (px) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 100 100"><polygon points="0,0 0,100 100,100" fill="${AMARILLO_TRIANGULO}"/></svg>`;


const svgAPng = async (svg, widthPx, heightPx) => {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    canvas.getContext("2d").drawImage(img, 0, 0, widthPx, heightPx);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return blob ? await blob.arrayBuffer() : null;
  } finally {
    URL.revokeObjectURL(url);
  }
};


const DECO = {
  ancho: 1538,
  alto: 545,
  color: "#245d69",
  grosor: 2.2,
  lineas: [
    [863.9, 310.1, -40, 541.6],
    [863.9, 310.1, 1578, 24],
    [863.9, 310.1, 300.9, -40],
    [863.9, 310.1, 1241.3, -40],
    [863.9, 310.1, 886.7, -40],
    [863.9, 310.1, 822, -40],
    [1303.7, 247.1, 822.6, -40],
    [1303.7, 247.1, 1114.3, -40],
    [1303.7, 247.1, 1578, 155.3],
  ],
};

const svgDecoracion = ({ extra = 0, widthPx, heightPx }) => {
  const trazos = DECO.lineas
    .map(
      ([x1, y1, x2, y2]) =>
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DECO.color}" stroke-width="${DECO.grosor}"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="${-extra} ${-extra} ${DECO.ancho + 2 * extra} ${DECO.alto + extra}">${trazos}</svg>`;
};


const capturarDecoracion = async () => {
  const rect = medirEnHoja(".lineas-geometricas");
  if (!rect) return null;

  
  const extra = 11; 
  const pxPorUnidad = rect.width / DECO.ancho;
  const extraPx = extra * pxPorUnidad;
  const escala = 4; 

  const widthPx = Math.round((DECO.ancho + 2 * extra) * pxPorUnidad * escala);
  const heightPx = Math.round((DECO.alto + extra) * pxPorUnidad * escala);

  const svg = svgDecoracion({ extra, widthPx, heightPx });
  const data = await svgAPng(svg, widthPx, heightPx);
  if (!data) return null;

  return {
    data,
    rect: {
      left: rect.left - extraPx,
      top: rect.top - extraPx,
      width: rect.width + 2 * extraPx,
      height: rect.height + extraPx,
    },
  };
};


const capturarPie = async () => {
  const rect = medirEnHoja(".triangulo-esquina");
  const escala = 4;
  const px = ICONO_PX * escala;

  const [telefono, correo, ubicacion] = await Promise.all(
    ["telefono", "correo", "ubicacion"].map((n) => svgAPng(svgIcono(n, px), px, px)),
  );

  let triangulo = null;
  if (rect) {
    const t = Math.round(rect.width * escala);
    const data = await svgAPng(svgTriangulo(t), t, t);
    if (data) triangulo = { data, rect };
  }

  return { triangulo, iconos: { telefono, correo, ubicacion } };
};

const cargarLogo = async () => {
  const rect = medirEnHoja(".logo-unifront");
  if (!rect) return null;
  const response = await fetch(logoUnifront);
  return { data: await response.arrayBuffer(), rect };
};


const imagenFlotante = ({ data, rect, atras, z }) =>
  new ImageRun({
    type: "png",
    data,
    transformation: {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        offset: Math.round(rect.left * PX_A_EMU),
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PAGE,
        offset: Math.round(rect.top * PX_A_EMU),
      },
      behindDocument: atras,
      allowOverlap: true,
      lockAnchor: true,
      wrap: { type: TextWrappingType.NONE },
      zIndex: z,
    },
  });

const crearDocumentoConstancia = ({
  form,
  textos,
  fechaLegible,
  nombre,
  matricula,
  carrera,
  inscripcion,
  logo,
  deco,
  pie,
}) => {
  const cuerpo = (text, opts = {}) =>
    new TextRun({ text, font: TNR, size: WORD.cuerpoSize, ...opts });

  const parrafoCuerpo = (children, after = WORD.espacioParrafo) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      spacing: { before: 0, after, line: WORD.interlineado, lineRule: LineRuleType.AUTO },
      children,
    });

  
  const lineaTitulo = (text, size) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      indent: { left: pulg(1.64), right: pulg(0.52) },
      spacing: { before: 0, after: 0, line: 215, lineRule: LineRuleType.AUTO },
      children: [new TextRun({ text, bold: true, size, font: TNR })],
    });

  
  const bordeRecuadro = { style: BorderStyle.DASHED, size: 8, color: "222222" };
  const recuadro = new Paragraph({
    spacing: { before: WORD.antesDelRecuadro, after: 0, line: 240, lineRule: LineRuleType.AUTO },
    indent: { left: pulg(3.7) + 200, right: 230 },
    border: {
      top: { ...bordeRecuadro, space: 6 },
      bottom: { ...bordeRecuadro, space: 6 },
      left: { ...bordeRecuadro, space: 9 },
      right: { ...bordeRecuadro, space: 9 },
    },
    children: [
      new TextRun({ text: "Departamento: ", bold: true, size: 24, font: TNR }),
      new TextRun({ text: form.departamento || "", size: 24, font: TNR }),
      new TextRun({ text: "Asunto: ", bold: true, size: 24, font: TNR, break: 1 }),
      new TextRun({ text: form.asunto || "", size: 24, font: TNR }),
    ],
  });

  
  const imagenesHeader = [];
  if (deco) imagenesHeader.push(imagenFlotante({ ...deco, atras: true, z: 1 }));
  if (logo) imagenesHeader.push(imagenFlotante({ ...logo, atras: false, z: 2 }));
  if (pie?.triangulo) imagenesHeader.push(imagenFlotante({ ...pie.triangulo, atras: true, z: 1 }));

  const header = new Header({
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT },
        children: imagenesHeader,
      }),
    ],
  });

  
  const SANGRIA_ICONO = 374; 

  const lineaContacto = (text, color, icono) => {
    const datosIcono = icono ? pie?.iconos?.[icono] : null;
    const children = [];

    if (datosIcono) {
      children.push(
        new ImageRun({
          type: "png",
          data: datosIcono,
          transformation: { width: ICONO_PX, height: ICONO_PX },
        }),
        new TextRun({ children: [new Tab()] }),
      );
    }
    children.push(new TextRun({ text, bold: true, color, size: 18, font: ARIAL }));

    return new Paragraph({
      spacing: { before: 0, after: 0, line: 221, lineRule: LineRuleType.AUTO },
      indent: datosIcono
        ? { left: SANGRIA_ICONO, hanging: SANGRIA_ICONO }
        : { left: SANGRIA_ICONO },
      children,
    });
  };

  const copia = (text) =>
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 0, line: 230, lineRule: LineRuleType.AUTO },
      children: [new TextRun({ text, size: 14, font: TNR, color: "111111" })],
    });

  const celdaSinMargen = { top: 0, bottom: 0, left: 0, right: 0 };

  const footerTable = new Table({
    width: { size: 10340, type: WidthType.DXA },
    columnWidths: [3700, 3840, 2800],
    layout: TableLayoutType.FIXED,
    borders: bordesTablaNulos,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3700, type: WidthType.DXA },
            borders: bordesCeldaNulos,
            margins: celdaSinMargen,
            verticalAlign: VerticalAlign.BOTTOM,
            children: [
              lineaContacto(form.campus || "Campus Tijuana", AMARILLO_TEXTO.slice(1)),
              lineaContacto(form.telefono || "", "174E63", "telefono"),
              lineaContacto(form.correo || "", "174E63", "correo"),
              lineaContacto(form.direccion || "", "174E63", "ubicacion"),
              lineaContacto(`${form.ciudad || "Tijuana"} ${form.estado || "B.C."} México`, "174E63"),
              
              new Paragraph({
                spacing: { before: 0, after: 0, line: 432, lineRule: LineRuleType.EXACT },
                children: [],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3840, type: WidthType.DXA },
            borders: bordesCeldaNulos,
            margins: celdaSinMargen,
            children: [new Paragraph({})],
          }),
          new TableCell({
            width: { size: 2800, type: WidthType.DXA },
            borders: bordesCeldaNulos,
            margins: celdaSinMargen,
            verticalAlign: VerticalAlign.BOTTOM,
            children: [
              copia("C.c.p. Archivo alumno"),
              copia("C.c.p. Minutario."),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 520, after: 0, line: 230, lineRule: LineRuleType.AUTO },
                children: [
                  new TextRun({
                    text: form.sitioWeb || "www.unifront.mx",
                    bold: true,
                    color: "0B5A78",
                    size: 32,
                    font: ARIAL,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  
  const cierreFooter = new Paragraph({
    spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT },
    children: [new TextRun({ text: "", size: 2 })],
  });

  
  const runsInscripcion = (() => {
    const { cuatri, grupo } = inscripcion;
    if (!cuatri && !grupo) {
      return [cuerpo(`, se encuentra ${textos.inscrito} a esta Institución en la carrera de `)];
    }
    const runs = [cuerpo(`, se encuentra ${textos.inscrito} al `)];
    if (cuatri) {
      runs.push(cuerpo(cuatri.numero));
      if (cuatri.sufijo) runs.push(cuerpo(cuatri.sufijo, { superScript: true }));
      runs.push(cuerpo(" CUATRIMESTRE"));
    }
    if (grupo) {
      runs.push(cuerpo(`${cuatri ? " " : ""}grupo `));
      runs.push(cuerpo(grupo, { bold: true }));
    }
    runs.push(cuerpo(" de la carrera de "));
    return runs;
  })();

  const planTexto = form.planEstudios
    ? ` con el plan de estudios ${form.planEstudios}`
    : "";

  const bordePagina = {
    style: BorderStyle.THICK_THIN_SMALL_GAP,
    size: 18,
    color: "0F6375",
    space: 4,
  };

  return new Document({
    creator: "Control Escolar",
    title: `Constancia de estudios - ${nombre}`,
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // Letter
            margin: {
              top: WORD.margenSuperior,
              bottom: 1700,
              left: 950,
              right: 950,
              header: 300,
              footer: 500,
            },
            borders: {
              pageBorders: {
                display: PageBorderDisplay.ALL_PAGES,
                offsetFrom: PageBorderOffsetFrom.PAGE,
              },
              pageBorderTop: bordePagina,
              pageBorderBottom: bordePagina,
              pageBorderLeft: bordePagina,
              pageBorderRight: bordePagina,
            },
          },
        },
        headers: { default: header },
        footers: { default: new Footer({ children: [footerTable, cierreFooter] }) },
        children: [
          lineaTitulo("CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA", 25),
          lineaTitulo("Blvd. Bernardo O'Higgins No. 6050, Los Alamos", 20),
          lineaTitulo("TELS. 660-19-23 Y 903-43-07", 20),
          lineaTitulo("Clave Incorp. 02PSU0015M", 20),
          lineaTitulo("RVOE-BC-L009-M2/17", 20),

          recuadro,

          new Paragraph({
            spacing: { before: WORD.antesDeDestinatario, after: pulg(0.42), line: WORD.interlineado, lineRule: LineRuleType.AUTO },
            children: [
              new TextRun({ text: "A QUIEN CORRESPONDA", bold: true, italics: true, size: 24, font: TNR }),
            ],
          }),

          parrafoCuerpo(
            [
              cuerpo(
                `Por medio de la presente hago constar que según comprobantes que obran en el archivo general del plantel, ${textos.alumno}:`,
              ),
            ],
            331,
          ),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: pulg(0.25), line: WORD.interlineado, lineRule: LineRuleType.AUTO },
            children: [
              new TextRun({ text: nombre.toUpperCase(), bold: true, size: 38, font: ARIAL }),
            ],
          }),

          parrafoCuerpo([
            cuerpo("Es estudiante en esta Institución con la matrícula "),
            cuerpo(matricula, { bold: true }),
            ...runsInscripcion,
            cuerpo(carrera.toUpperCase(), { bold: true }),
            cuerpo(
              `${planTexto}. ${textos.alumnoCapitalizado} cursó el periodo escolar con horario de ${form.horario || "lunes a viernes"} y con un periodo vacacional del ${form.periodoVacacional || "acuerdo al calendario escolar vigente"}.`,
            ),
          ]),

          parrafoCuerpo([
            cuerpo(
              `Se extiende la presente constancia a petición ${textos.peticion} y para los usos legales a que haya lugar, en la Ciudad de ${form.ciudad || "Tijuana"} ${form.estado || "B.C."} al día ${fechaLegible}.`,
            ),
          ]),

          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 30, after: 800, line: WORD.interlineado, lineRule: LineRuleType.AUTO },
            children: [
              new TextRun({
                text: "A T E N T A M E N T E",
                size: 25,
                font: TNR,
                characterSpacing: 173, 
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0, line: WORD.interlineado, lineRule: LineRuleType.AUTO },
            children: [cuerpo((form.director || "MTRA. MARIA DEL CARMEN GONZALEZ").toUpperCase())],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0, line: WORD.interlineado, lineRule: LineRuleType.AUTO },
            children: [cuerpo((form.cargoDirector || "DIRECTORA GENERAL").toUpperCase())],
          }),
        ],
      },
    ],
  });
};

export default function ConstanciaEstudios() {
  const [form, setForm] = useState(initialForm);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [errorAlumnos, setErrorAlumnos] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarAlumnos = async () => {
      setLoadingAlumnos(true);
      setErrorAlumnos("");

      try {
        const alumnosResponse = await obtenerAlumnosDetalle();

        if (!activo) return;

        setAlumnos(alumnosResponse);
      } catch (requestError) {
        console.error(requestError);

        if (activo) {
          setErrorAlumnos("No se pudo cargar la lista de alumnos.");
        }
      } finally {
        if (activo) {
          setLoadingAlumnos(false);
        }
      }
    };

    cargarAlumnos();

    return () => {
      activo = false;
    };
  }, []);

  const fechaLegible = useMemo(
    () => formatDate(form.fechaEmision),
    [form.fechaEmision],
  );

  const textos = textosPorSexo[form.sexo];

  const alumnosDetalle = useMemo(() => {
    return [...alumnos].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "", "es"),
    );
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const texto = normalizar(busquedaAlumno);

    if (!texto) return alumnosDetalle;

    return alumnosDetalle.filter((alumno) => {
      const datos = normalizar(
        [
          alumno.nombre,
          alumno.matricula,
          alumno.numero_control,
          alumno.carrera?.nombre,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return datos.includes(texto);
    });
  }, [alumnosDetalle, busquedaAlumno]);

  const handleAlumnoChange = (idAlumno) => {
    const alumno = alumnosDetalle.find(
      (item) => Number(item.id_alumno) === Number(idAlumno),
    );

    
    console.debug("Alumno seleccionado:", alumno);

    const { grupo, cuatrimestre, estimado } = obtenerGrupoYCuatrimestre(alumno);
    const sexoAlumno = normalizar(alumno?.sexo);

    setForm((currentForm) => ({
      ...currentForm,
      idAlumno,
      sexo:
        sexoAlumno.startsWith("f") || sexoAlumno.startsWith("mujer")
          ? "mujer"
          : sexoAlumno.startsWith("m") || sexoAlumno.startsWith("h")
            ? "hombre"
            : currentForm.sexo,
      nombreAlumno: alumno?.nombre || "",
      matricula: alumno?.matricula || "",
      carrera: alumno?.carrera?.nombre || "",
      cuatrimestre,
      cuatrimestreEstimado: estimado,
      grupo,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "cuatrimestre" ? { cuatrimestreEstimado: false } : {}),
    }));
  };

  const handleDownload = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    try {
      const [logo, deco, pie] = await Promise.all([
        cargarLogo().catch((e) => {
          console.warn("No se pudo cargar el logo para el Word:", e);
          return null;
        }),
        capturarDecoracion().catch((e) => {
          console.warn("No se pudieron capturar las líneas decorativas:", e);
          return null;
        }),
        capturarPie().catch((e) => {
          console.warn("No se pudieron generar el triángulo y los iconos:", e);
          return null;
        }),
      ]);

      const doc = crearDocumentoConstancia({
        form,
        textos,
        fechaLegible,
        nombre: nombreAlumno,
        matricula,
        carrera,
        inscripcion,
        logo,
        deco,
        pie,
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Constancia_${nombreAlumno.replace(/\s+/g, "_")}.docx`);
    } catch (error) {
      console.error("Error al generar el documento Word:", error);
    }
  };


  const nombreAlumno = form.nombreAlumno || "NOMBRE COMPLETO DEL ALUMNO";
  const matricula = form.matricula || "MATRICULA";
  const carrera = form.carrera || "NOMBRE DE LA CARRERA";
  const inscripcion = datosInscripcion(form);

  return (
    <div className="space-y-6 p-6">
      <style>
        {`
          .constancia-documento {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #111;
            font-family: "Times New Roman", Times, serif;
            font-size: 13.8pt;
            line-height: 1.18;
          }

          .constancia-documento,
          .constancia-documento * {
            box-sizing: border-box;
          }

          .documento-hoja {
            position: relative;
            width: 8.5in;
            min-height: 11in;
            padding: 0.54in 0.66in 0.45in;
            background: #fff;
            overflow: hidden;
          }

          .documento-borde {
            position: absolute;
            inset: 0.06in;
            border: 3px solid #0f6375;
            box-shadow:
              inset 0 0 0 1px #043e4b,
              inset 0 0 0 5px #d6eef0,
              inset 0 0 0 7px #0f6375;
            pointer-events: none;
          }

          .constancia-encabezado {
            position: relative;
            min-height: 2.65in;
          }

          .lineas-geometricas {
            position: absolute;
            top: 0.165in;
            left: 0.165in;
            right: 0.165in;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }

          .lineas-geometricas svg {
            display: block;
            width: 100%;
            height: auto;
          }

          .marca-institucional {
            position: relative;
            z-index: 1;
            min-height: 1.62in;
          }

          .logo-unifront {
            position: absolute;
            left: 0.33in;
            top: 0.75in;
            width: 2.82in;
            height: auto;
          }

          .datos-institucion {
            position: absolute;
            top: 0.33in;
            left: 1.64in;
            right: 0.52in;
            text-align: center;
            font-size: 9.8pt;
            font-weight: 700;
            line-height: 1.03;
          }

          .datos-institucion h1,
          .datos-institucion p {
            margin: 0;
          }

          .datos-institucion h1 {
            font-size: 12.5pt;
            white-space: nowrap;
          }

          .documento-meta {
            position: absolute;
            top: 1.54in;
            right: 0.02in;
            z-index: 1;
            width: 3.46in;
            padding: 0.08in 0.13in;
            border: 1.6px dashed #222;
            font-size: 12pt;
            line-height: 1.14;
          }

          .documento-meta p {
            margin: 0;
          }

          .constancia-cuerpo {
            position: relative;
            z-index: 1;
            margin-top: 0.08in;
          }

          .constancia-cuerpo p {
            margin: 0 0 0.31in;
            text-align: justify;
          }

          .destinatario {
            margin-bottom: 0.42in !important;
            font-size: 12pt;
            font-style: italic;
            font-weight: 700;
          }

          .nombre-alumno {
            margin: -0.08in 0 0.25in;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 19pt;
            font-weight: 800;
            letter-spacing: 0;
            text-align: center;
          }

          .firma {
            margin-top: 0.02in;
            text-align: center;
          }

          .firma p {
            margin: 0;
            text-align: center;
          }

          .atentamente {
            margin-bottom: 0.36in !important;
            font-size: 12.5pt;
            letter-spacing: 0.12in;
          }

          .firma-linea {
            width: 2.35in;
            height: 0.22in;
            margin: 0 auto 0.02in;
          }

          .nombre-director {
            text-transform: uppercase;
          }

          .constancia-pie {
            position: absolute;
            left: 0.58in;
            right: 0.55in;
            bottom: 0.28in;
            z-index: 1;
            min-height: 0.95in;
            font-family: Arial, Helvetica, sans-serif;
          }

          .contacto-campus {
            position: absolute;
            left: 0;
            bottom: 0.33in;
            width: 2.41in;
            padding-left: 0.26in;
            color: #174e63;
            font-size: 9pt;
            font-weight: 700;
            line-height: 1.06;
          }

          .contacto-campus p {
            margin: 0;
          }

          .contacto-campus .campus {
            color: #f8d31e;
          }

          .contacto-campus .con-icono {
            position: relative;
          }

          .icono-contacto {
            position: absolute;
            left: -0.26in;
            top: -1px;
            width: 15px;
            height: 15px;
          }

          .triangulo-esquina {
            position: absolute;
            left: 0.36in;
            bottom: 0.3in;
            width: 0.5in;
            height: 0.5in;
            z-index: 0;
            pointer-events: none;
          }

          .copias {
            position: absolute;
            right: 0;
            bottom: 0.54in;
            font-family: "Times New Roman", Times, serif;
            font-size: 7.2pt;
            line-height: 1.06;
          }

          .copias p {
            margin: 0;
          }

          .sitio-web {
            position: absolute;
            right: 0;
            bottom: 0;
            margin: 0;
            color: #0b5a78;
            font-size: 16pt;
            font-weight: 800;
            line-height: 0.96;
            text-align: right;
          }

          @media print {
            html,
            body,
            #root {
              width: 8.5in;
              height: 11in;
              margin: 0;
              overflow: hidden;
            }

            body * {
              visibility: hidden;
            }

            #constancia-preview,
            #constancia-preview * {
              visibility: visible;
            }

            #constancia-preview {
              position: absolute;
              top: 0;
              left: 0;
              width: 8.5in;
              height: 11in;
              min-height: 11in;
              margin: 0;
              box-shadow: none;
            }

            @page {
              size: letter;
              margin: 0;
            }
          }
        `}
      </style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FileText size={22} />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Constancia de estudios
            </h1>

            <p className="mt-1 text-slate-500">
              Captura los datos y revisa el documento antes de descargarlo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Download size={18} />
              Descargar PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <FileText size={18} />
              Descargar Word
            </button>
          </div>
      </div>

      <div className="h-px w-full bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Datos de la constancia
          </h2>

          <div className="mt-5 space-y-4">
            {errorAlumnos && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorAlumnos}
              </div>
            )}

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">
                Sexo del alumno
              </legend>

              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {[
                  ["hombre", "Hombre"],
                  ["mujer", "Mujer"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                      form.sexo === value
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value={value}
                      checked={form.sexo === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="relative block">
              <span className="text-sm font-medium text-slate-700">
                Nombre completo
              </span>
              <input
                type="text"
                value={
                  mostrarOpciones
                    ? busquedaAlumno
                    : form.nombreAlumno || busquedaAlumno
                }
                onChange={(event) => {
                  setBusquedaAlumno(event.target.value);
                  setMostrarOpciones(true);
                  setForm((currentForm) => ({
                    ...currentForm,
                    idAlumno: "",
                    nombreAlumno: event.target.value,
                  }));
                }}
                onFocus={() => {
                  setBusquedaAlumno("");
                  setMostrarOpciones(true);
                }}
                onBlur={() => {
                  setTimeout(() => setMostrarOpciones(false), 150);
                }}
                disabled={loadingAlumnos}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                placeholder={
                  loadingAlumnos
                    ? "Cargando alumnos..."
                    : "Busca por nombre o matricula"
                }
              />

              {mostrarOpciones && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {alumnosFiltrados.length === 0 && (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      Sin resultados
                    </div>
                  )}

                  {alumnosFiltrados.map((alumno) => (
                    <button
                      key={alumno.id_alumno}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        handleAlumnoChange(alumno.id_alumno);
                        setBusquedaAlumno("");
                        setMostrarOpciones(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                    >
                      {alumno.nombre}
                      {alumno.matricula ? ` - ${alumno.matricula}` : ""}
                    </button>
                  ))}
                </div>
              )}
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Matricula
                </span>
                <input
                  name="matricula"
                  value={form.matricula}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. 20231001"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Departamento
                </span>
                <input
                  name="departamento"
                  value={form.departamento}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Asunto
              </span>
              <input
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Carrera
              </span>
              <input
                name="carrera"
                value={form.carrera}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ej. Lic. en Derecho"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Cuatrimestre
                </span>
                <input
                  name="cuatrimestre"
                  value={form.cuatrimestre}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. 4"
                />
                {form.cuatrimestreEstimado && (
                  <p className="mt-1 text-xs text-amber-600">
                    Calculado con la fecha de ingreso. Verifícalo.
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Grupo
                </span>
                <input
                  name="grupo"
                  value={form.grupo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. COS09-4"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Plan de estudios
              </span>
              <input
                name="planEstudios"
                value={form.planEstudios}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Opcional"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Horario
              </span>
              <input
                name="horario"
                value={form.horario}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Periodo vacacional
              </span>
              <input
                name="periodoVacacional"
                value={form.periodoVacacional}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Fecha de emision
              </span>
              <input
                type="date"
                name="fechaEmision"
                value={form.fechaEmision}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Ciudad
                </span>
                <input
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Estado
                </span>
                <input
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Director
              </span>
              <input
                name="director"
                value={form.director}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Cargo del director
              </span>
              <input
                name="cargoDirector"
                value={form.cargoDirector}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </section>

        <section className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <article
            id="constancia-preview"
            className="documento-hoja constancia-documento constancia mx-auto shadow-sm"
          >
            <div className="documento-borde" />

            <div className="lineas-geometricas" aria-hidden="true">
              <svg
                viewBox={`0 0 ${DECO.ancho} ${DECO.alto}`}
                preserveAspectRatio="xMinYMin meet"
              >
                {DECO.lineas.map(([x1, y1, x2, y2], i) => (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={DECO.color}
                    strokeWidth={DECO.grosor}
                  />
                ))}
              </svg>
            </div>

            <header className="constancia-encabezado">
              <section className="marca-institucional">
                <img
                  className="logo-unifront"
                  src={logoUnifront}
                  alt="UNIFRONT"
                />

                <div className="datos-institucion">
                  <h1>CENTRO DE ESTUDIOS SUPERIORES DE LA FRONTERA</h1>
                  <p>Blvd. Bernardo O'Higgins No. 6050, Los Alamos</p>
                  <p>TELS. 660-19-23 Y 903-43-07</p>
                  <p>Clave Incorp. 02PSU0015M</p>
                  <p>RVOE-BC-L009-M2/17</p>
                </div>
              </section>

              <section className="documento-meta">
                <p>
                  <strong>Departamento:</strong> {form.departamento}
                </p>
                <p>
                  <strong>Asunto:</strong> {form.asunto}
                </p>
              </section>
            </header>

            <main className="constancia-cuerpo">
              <p className="destinatario">A QUIEN CORRESPONDA</p>

              <p>
                Por medio de la presente hago constar que segun comprobantes
                que obran en el archivo general del plantel, {textos.alumno}:
              </p>

              <h2 className="nombre-alumno">{nombreAlumno.toUpperCase()}</h2>

              <p>
                Es estudiante en esta Institucion con la matricula{" "}
                <strong>{matricula}</strong>, se encuentra {textos.inscrito}{" "}
                {inscripcion.cuatri || inscripcion.grupo ? (
                  <>
                    al{" "}
                    {inscripcion.cuatri ? (
                      <>
                        {inscripcion.cuatri.numero}
                        {inscripcion.cuatri.sufijo ? (
                          <sup style={{ lineHeight: 0 }}>
                            {inscripcion.cuatri.sufijo}
                          </sup>
                        ) : null}{" "}
                        CUATRIMESTRE{" "}
                      </>
                    ) : null}
                    {inscripcion.grupo ? (
                      <>
                        grupo <strong>{inscripcion.grupo}</strong>{" "}
                      </>
                    ) : null}
                    de la carrera de
                  </>
                ) : (
                  "a esta Institucion en la carrera de"
                )}{" "}
                <strong>{carrera.toUpperCase()}</strong>
                {form.planEstudios
                  ? ` con el plan de estudios ${form.planEstudios}`
                  : ""}
                . {textos.alumnoCapitalizado} curso el periodo escolar con
                horario de {form.horario} y con un periodo vacacional del{" "}
                {form.periodoVacacional}.
              </p>

              <p>
                Se extiende la presente constancia a peticion{" "}
                {textos.peticion} y para los usos legales a que haya lugar, en
                la Ciudad de {form.ciudad} {form.estado} al dia {fechaLegible}.
              </p>

              <section className="firma">
                <p className="atentamente">ATENTAMENTE</p>
                <div className="firma-linea" />
                <p className="nombre-director">{form.director}</p>
                <p>{form.cargoDirector}</p>
              </section>
            </main>

            <svg
              className="triangulo-esquina"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <polygon points="0,0 0,100 100,100" fill={AMARILLO_TRIANGULO} />
            </svg>

            <footer className="constancia-pie">
              <section className="contacto-campus">
                <p className="campus">{form.campus}</p>
                <p className="con-icono">
                  <IconoContacto nombre="telefono" />
                  {form.telefono}
                </p>
                <p className="con-icono">
                  <IconoContacto nombre="correo" />
                  {form.correo}
                </p>
                <p className="con-icono">
                  <IconoContacto nombre="ubicacion" />
                  {form.direccion}
                </p>
                <p>Tijuana B.C. Mexico</p>
              </section>

              <section className="copias">
                <p>C.c.p. Archivo alumno</p>
                <p>C.c.p. Minutario.</p>
              </section>

              <p className="sitio-web">{form.sitioWeb}</p>
            </footer>
          </article>
        </section>
      </div>
    </div>
  );
}