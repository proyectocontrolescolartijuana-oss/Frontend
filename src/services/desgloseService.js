import api from "./api";

export const CLAVES_CRITERIOS = ["C1", "C2", "C3", "C4", "C5", "EPA"];

const urlDesglose = (grupoMateriaId, parcialId) =>
  `/calificaciones/desglose/grupos/${grupoMateriaId}/parciales/${parcialId}`;

const aTexto = (valor) =>
  valor === null || valor === undefined ? "" : String(valor);


const normalizarDesglose = (data) => ({
  criterios: CLAVES_CRITERIOS.map((clave) => {
    const criterio = data.criterios.find((item) => item.clave === clave) ?? {};

    return {
      clave,
      nombre: criterio.nombre ?? "",
      porcentaje: aTexto(criterio.porcentaje),
      puntos_max: aTexto(criterio.puntos_max),
    };
  }),
  alumnos: data.alumnos ?? [],
});

export const obtenerDesgloseParcial = async (grupoMateriaId, parcialId) => {
  const response = await api.get(urlDesglose(grupoMateriaId, parcialId));

  return normalizarDesglose(response.data);
};

export const guardarDesgloseParcial = async (
  grupoMateriaId,
  parcialId,
  { criterios, puntajes },
) => {
  const response = await api.put(urlDesglose(grupoMateriaId, parcialId), {
    criterios,
    puntajes,
  });

  return normalizarDesglose(response.data);
};