export type CivicEvent = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  municipality?: string;
  address?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  tags?: string[];
};

export const civicEvents: CivicEvent[] = [
  {
    id: 'ev-001',
    name: 'Cabildo abierto sobre movilidad',
    category: 'movilidad',
    latitude: 19.432608,
    longitude: -99.133209,
    municipality: 'CDMX',
    address: 'Av. Plaza de la Constitución s/n, Centro Histórico',
    description: 'Sesión para revisar el plan integral de movilidad sostenible del gobierno capitalino.',
    starts_at: '2025-11-22T10:00:00-06:00',
    ends_at: '2025-11-22T12:30:00-06:00',
    tags: ['cabildo-abierto', 'movilidad'],
  },
  {
    id: 'ev-002',
    name: 'Feria de servicios de salud comunitarios',
    category: 'salud',
    latitude: 20.659699,
    longitude: -103.349609,
    municipality: 'Guadalajara',
    address: 'Parque Revolución, Col. Americana',
    description: 'Jornada gratuita de vacunación, chequeo general y orientación nutricional.',
    starts_at: '2025-11-25T09:00:00-06:00',
    ends_at: '2025-11-25T16:00:00-06:00',
    tags: ['servicios', 'salud'],
  },
  {
    id: 'ev-003',
    name: 'Taller educativo sobre presupuesto participativo',
    category: 'educacion',
    latitude: 25.686614,
    longitude: -100.316113,
    municipality: 'Monterrey',
    address: 'Centro Cultural Barrio Antiguo',
    description: 'Sesión práctica para votar proyectos con acompañamiento técnico.',
    starts_at: '2025-11-28T17:00:00-06:00',
    ends_at: '2025-11-28T19:00:00-06:00',
    tags: ['presupuesto', 'participacion'],
  },
  {
    id: 'ev-004',
    name: 'Jornada de seguridad vial para peatones',
    category: 'seguridad',
    latitude: 19.041297,
    longitude: -98.2062,
    municipality: 'Puebla',
    address: 'Zócalo de Puebla',
    description: 'Materiales lúdicos y demostraciones prácticas para familias.',
    starts_at: '2025-11-24T11:00:00-06:00',
    ends_at: '2025-11-24T14:00:00-06:00',
    tags: ['seguridad-vial'],
  },
  {
    id: 'ev-hcd-6511',
    name: 'Dirección de Evento HCD · expediente 6511',
    category: 'legislativo',
    latitude: 19.430398,
    longitude: -99.127602,
    municipality: 'CDMX',
    address: 'Av. Congreso de la Unión 66, Palacio Legislativo de San Lázaro',
    description:
      'Convocatoria oficial publicada en https://portalhcd.diputados.gob.mx/PortalWeb/DireccionEvento/2025/e1e37e06-88a1-42fb-aac5-f0ffc6fc6511.pdf. Confirma el horario directo en el PDF antes de difundir.',
    starts_at: '2025-11-27T18:11:00-06:00',
    ends_at: '2025-11-27T20:11:00-06:00',
    tags: ['portal-hcd', 'demo-calendario'],
  },
  {
    id: 'ev-hcd-6035',
    name: 'Dirección de Evento HCD · expediente 6035',
    category: 'legislativo',
    latitude: 19.430398,
    longitude: -99.127602,
    municipality: 'CDMX',
    address: 'Av. Congreso de la Unión 66, Palacio Legislativo de San Lázaro',
    description:
      'Referencia del portal HCD disponible en https://portalhcd.diputados.gob.mx/PortalWeb/DireccionEvento/2025/ddbc81e6-44ff-4b35-b41e-14bf276be035.pdf para poblar la agenda sin backend.',
    starts_at: '2025-11-26T18:55:00-06:00',
    ends_at: '2025-11-26T20:25:00-06:00',
    tags: ['portal-hcd', 'legislativo'],
  },
  {
    id: 'ev-hcd-1484',
    name: 'Dirección de Evento HCD · expediente 1484',
    category: 'legislativo',
    latitude: 19.430398,
    longitude: -99.127602,
    municipality: 'CDMX',
    address: 'Av. Congreso de la Unión 66, Palacio Legislativo de San Lázaro',
    description:
      'Datos recuperados de https://portalhcd.diputados.gob.mx/PortalWeb/DireccionEvento/2025/c4e67289-1679-44c2-b2bb-b47b49721484.pdf para asegurarnos de que el calendario muestre resultados reales.',
    starts_at: '2025-11-25T18:55:00-06:00',
    ends_at: '2025-11-25T20:25:00-06:00',
    tags: ['portal-hcd', 'legislativo'],
  },
];

export const getOfflineEvents = (municipality?: string) => {
  if (!municipality) {
    return civicEvents;
  }
  const normalized = municipality.trim().toLowerCase();
  const filtered = civicEvents.filter(event => event.municipality?.toLowerCase().includes(normalized));
  return filtered.length ? filtered : civicEvents;
};

export const getEventsForDate = (isoDate: string) => {
  const safeDate = isoDate.trim();
  return civicEvents.filter(event => {
    if (!event.starts_at) return false;
    const eventDate = new Date(event.starts_at);
    if (Number.isNaN(eventDate.getTime())) return false;
    return eventDate.toISOString().split('T')[0] === safeDate;
  });
};
