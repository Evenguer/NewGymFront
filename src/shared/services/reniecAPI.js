import axios from 'axios';

const API_BASE = import.meta.env.VITE_RENIEC_API_BASE || '/api-inti/api/v1';
const API_KEY = import.meta.env.VITE_RENIEC_API_KEY || 'inti_live_4981bed6d497d88141a2566f7a41c96c';

const pickFirst = (...values) => values.find((value) => typeof value === 'string' && value.trim()) || '';

const toTitleCase = (value) =>
  pickFirst(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const nestedCandidate = payload.data || payload.result || payload.response || payload.persona || payload.person;
  const source = nestedCandidate && typeof nestedCandidate === 'object' ? nestedCandidate : payload;

  const nombres = pickFirst(
    source.nombres,
    source.nombre,
    source.nombresCompletos,
    source.nombreCompleto,
    source.fullName,
    source.full_name,
    source.nombres_completos
  );

  const apellidoPaterno = pickFirst(
    source.apellidoPaterno,
    source.apellido_paterno,
    source.paterno,
    source.apellido1,
    source.apellido_uno
  );

  const apellidoMaterno = pickFirst(
    source.apellidoMaterno,
    source.apellido_materno,
    source.materno,
    source.apellido2,
    source.apellido_dos
  );

  const apellidos = pickFirst(
    source.apellidos,
    [apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ').trim()
  );

  const nombreCompleto = pickFirst(
    source.nombreCompleto,
    source.nombresCompletos,
    source.fullName,
    source.full_name,
    [nombres, apellidos].filter(Boolean).join(' ').trim()
  );

  return {
    dni: pickFirst(source.dni, source.numeroDocumento, source.documento),
    nombres: toTitleCase(nombres),
    apellidoPaterno: toTitleCase(apellidoPaterno),
    apellidoMaterno: toTitleCase(apellidoMaterno),
    apellidos: toTitleCase(apellidos),
    nombreCompleto: toTitleCase(nombreCompleto),
    success: payload.success ?? source.success ?? true
  };
};

export async function consultarDNI(dni) {
  const response = await axios.get(`${API_BASE}/dni/${dni}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const data = response?.data?.data ?? response?.data;

  if (!data) {
    throw new Error('La consulta no devolvió datos');
  }

  const normalized = normalizePayload(data);

  if (!normalized.nombres && !normalized.apellidos && !normalized.nombreCompleto) {
    throw new Error('La respuesta del DNI no contiene nombres ni apellidos');
  }

  return normalized;
}