import { useEffect, useState } from "react";
import { FileImage } from "lucide-react";
import {
  esImagen,
  esPdf,
  obtenerDocumentoProtegido,
} from "./documentosAlumnoUtils";

const esUrlLista = (rutaArchivo) =>
  rutaArchivo.startsWith("http://") ||
  rutaArchivo.startsWith("https://") ||
  rutaArchivo.startsWith("blob:") ||
  rutaArchivo.startsWith("data:");

export default function PreviewDocumento({ documento }) {
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    let activeUrl = "";

    const cargarDocumento = async () => {
      if (!documento?.ruta_archivo) {
        return;
      }

      if (esUrlLista(documento.ruta_archivo)) {
        if (isMounted) {
          setBlobUrl(documento.ruta_archivo);
        }
        return;
      }

      activeUrl = await obtenerDocumentoProtegido(documento.ruta_archivo);

      if (isMounted) {
        setBlobUrl(activeUrl);
      }
    };

    cargarDocumento();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [documento]);

  if (!documento) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        Pendiente de digitalizar
      </div>
    );
  }

  if (blobUrl && esImagen(documento)) {
    return (
      <img
        src={blobUrl}
        alt={documento.nombre_archivo || "Documento digitalizado"}
        className="h-full min-h-64 w-full rounded-lg border border-slate-200 bg-white object-contain"
      />
    );
  }

  if (blobUrl && esPdf(documento)) {
    return (
      <iframe
        src={blobUrl}
        title={documento.nombre_archivo || "Documento PDF"}
        className="h-full min-h-64 w-full rounded-lg border border-slate-200 bg-white"
      />
    );
  }

  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 text-center text-sm text-slate-500">
      <FileImage className="mb-3 text-slate-400" size={32} />
      <span className="font-semibold text-slate-700">
        {documento.nombre_archivo || "Documento previo"}
      </span>
      <span className="mt-1 max-w-full truncate text-xs text-slate-400">
        {blobUrl
          ? "Preview no disponible para este tipo de archivo"
          : "Cargando documento..."}
      </span>
    </div>
  );
}
