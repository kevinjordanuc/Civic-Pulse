export type CommentNode = {
  id: string;
  author: string;
  role?: string;
  body: string;
  timeAgo: string;
  children?: CommentNode[];
};

export type OfficialSource = {
  name: string;
  dataset: string;
  url: string;
  lastUpdated: string;
  coverage: string;
};

export type CommunityPost = {
  id: string;
  title: string;
  summary: string;
  body: string;
  community: string;
  commentsCount: number;
  shares: number;
  author: string;
  timeAgo: string;
  flair: string;
  tags?: string[];
  source: OfficialSource;
  commentTree: CommentNode[];
};

export const communityPosts: CommunityPost[] = [
  {
    id: 'post-usa-2025-calendar',
    title: 'USA.gov publica calendario cívico 2025',
    summary: 'El portal federal agregó plazos de registro, voto anticipado y asistencia lingüística en español.',
    body: 'USA.gov en Español liberó la versión 2025 de su "Election Calendar & Voting Assistance Directory" con plazos oficiales por estado, enlaces a vote.gov y rangos de atención para personas con discapacidad. El feed se integra tal cual para que comunidades migrantes compartan verificación rápida.',
    community: 'usa/nacional',
    commentsCount: 41,
    shares: 14,
    author: 'GovUSA',
    timeAgo: 'hace 1 h',
    flair: 'Participación',
    tags: ['usa.gov', 'elecciones', 'calendario'],
    source: {
      name: 'USA.gov en Español',
      dataset: 'Election Calendar & Voting Assistance Directory',
      url: 'https://www.usa.gov/election-calendar',
      lastUpdated: 'mayo 2024',
      coverage: '50 estados + DC, fechas de registro y voto anticipado',
    },
    commentTree: [
      {
        id: 'c-usa-01',
        author: 'AlianzaMigrante',
        role: 'ONG',
        body: 'Confirmamos que la API JSON también expone `stateDeadlines` con formato ISO8601. ¿Alguien ya automatizó alertas por SMS?',
        timeAgo: 'hace 45 min',
        children: [
          {
            id: 'c-usa-02',
            author: 'CivicTechTX',
            role: 'Voluntariado',
            body: 'Usamos el feed de USA.gov y vote.gov para disparar recordatorios en WhatsApp. Compartimos script en el repo de la convención.',
            timeAgo: 'hace 32 min',
          },
        ],
      },
      {
        id: 'c-usa-03',
        author: 'DefensoriaNY',
        role: 'Autoridad local',
        body: 'Recuerden que los datos provienen directamente de las oficinas electorales estatales. Si detectan rezago, levanten ticket a elections@usa.gov.',
        timeAgo: 'hace 20 min',
      },
    ],
  },
  {
    id: 'post-inegi-ensu',
    title: 'Ensambles ENSU abiertos para Iztapalapa',
    summary: 'INEGI habilitó la serie de percepción de seguridad y despliegue policial vía API para la alcaldía.',
    body: 'El endpoint `ind_v1` del API de INEGI ya expone la Encuesta Nacional de Seguridad Pública Urbana (ENSU) para la clave `09008`. Incluye variables trimestrales sobre percepción, contacto con autoridades y confianza institucional. Compartimos query base para conectarla al mapa de riesgos.',
    community: 'cdmx/iztapalapa',
    commentsCount: 63,
    shares: 18,
    author: 'INEGIDataLab',
    timeAgo: 'hace 2 h',
    flair: 'Datos abiertos',
    tags: ['inegi', 'seguridad', 'api'],
    source: {
      name: 'INEGI API',
      dataset: 'Encuesta Nacional de Seguridad Pública Urbana (ENSU)',
      url: 'https://www.inegi.org.mx/programas/ensu/2023/',
      lastUpdated: 'abril 2024',
      coverage: '75 ciudades; filtro cvegeo 09008 para Iztapalapa',
    },
    commentTree: [
      {
        id: 'c-inegi-01',
        author: 'VecinasIztapalapa',
        role: 'Colectiva',
        body: '¿Cuál es el identificador del indicador de iluminación pública?',
        timeAgo: 'hace 1 h',
        children: [
          {
            id: 'c-inegi-02',
            author: 'INEGIDataLab',
            role: 'Autoridad',
            body: 'Usen el indicador 6207065286 y la serie `BIE` para descargar JSON. Incluye desagregación trimestral.',
            timeAgo: 'hace 55 min',
          },
        ],
      },
      {
        id: 'c-inegi-03',
        author: 'LaboratorioMX',
        role: 'Academia',
        body: 'Integramos la ENSU con reportes de alumbrado del 311 local para alimentar el modelo de riesgo. Podemos compartir dashboard en Power BI.',
        timeAgo: 'hace 40 min',
      },
    ],
  },
  {
    id: 'post-shcp-ppef',
    title: 'PPEF 2025 disponible en CSV para Neza',
    summary: 'Transparencia Presupuestaria liberó anexos programáticos con claves por municipio.',
    body: 'La plataforma de la SHCP publicó los datos abiertos del Proyecto de Presupuesto de Egresos 2025 con columnas `ramo`, `programa`, `cve_ent`, `clasificacion_funcional` y montos en miles de pesos. Filtramos Nezahualcóyotl para revisar proyectos de movilidad y agua potable (ramo 23 y 33).',
    community: 'edomex/nezahualcoyotl',
    commentsCount: 27,
    shares: 11,
    author: 'PresupuestoAbierto',
    timeAgo: 'hace 3 h',
    flair: 'Presupuesto',
    tags: ['transparencia', 'ppef', 'agua'],
    source: {
      name: 'Transparencia Presupuestaria (SHCP)',
      dataset: 'Proyecto de Presupuesto de Egresos de la Federación 2025',
      url: 'https://www.transparenciapresupuestaria.gob.mx/es/PTP/Datos_Abiertos',
      lastUpdated: 'septiembre 2024',
      coverage: 'Ramos federales con desagregación estatal y municipal',
    },
    commentTree: [
      {
        id: 'c-shcp-01',
        author: 'ContraloriaNeza',
        role: 'Autoridad',
        body: 'Ya vinculamos los proyectos etiquetados como clave 33F020. Se publicará el tablero en el portal municipal.',
        timeAgo: 'hace 2 h',
      },
      {
        id: 'c-shcp-02',
        author: 'RedAguaJusta',
        role: 'ONG',
        body: '¿Pueden compartir el script para normalizar los montos? Queremos comparar contra los padrones de fugas.',
        timeAgo: 'hace 1 h',
      },
    ],
  },
  {
    id: 'post-cultura-agenda',
    title: 'Agenda Cultura Comunitaria para Valles Centrales',
    summary: 'La Secretaría de Cultura publicó actividades itinerantes con fichas técnicas y accesibilidad.',
    body: 'El Sistema de Información Cultural (SIC) liberó en datos.cultura.gob.mx las giras de Cultura Comunitaria 2024, incluyendo sedes en Etla, San Pablo y Telixtlahuaca. El dataset lista disciplina, público objetivo, intérprete y servicios de accesibilidad. Ya están listos para agregarse al mapa.',
    community: 'oaxaca/telixtlahuaca',
    commentsCount: 19,
    shares: 7,
    author: 'CulturaComunitaria',
    timeAgo: 'hace 5 h',
    flair: 'Cultura',
    tags: ['secretaría de cultura', 'agenda', 'accesibilidad'],
    source: {
      name: 'Secretaría de Cultura',
      dataset: 'Sistema de Información Cultural (SIC) - Agenda Cultura Comunitaria',
      url: 'https://datos.cultura.gob.mx/',
      lastUpdated: 'marzo 2024',
      coverage: '337 actividades itinerantes; incluye filtros por municipio',
    },
    commentTree: [
      {
        id: 'c-cultura-01',
        author: 'RedTeatralOax',
        role: 'Colectivo',
        body: 'Gracias por exponer la columna de accesibilidad. Pediremos intérpretes de lengua de señas para las fechas del 15 y 22 de junio.',
        timeAgo: 'hace 3 h',
      },
    ],
  },
  {
    id: 'post-conagua-presas',
    title: 'Monterrey usa reporte oficial de presas',
    summary: 'El SINA de CONAGUA actualizó los niveles de El Cuchillo II y La Boca para el plan hídrico.',
    body: 'CONAGUA publicó el concentrado semanal del Sistema Nacional de Información del Agua (SINA) con almacenamiento por presa y porcentaje sobre Nivel de Aguas Máximas Ordinarias. El municipio integra los CSV del 10 de mayo para simular escenarios de transferencia y evitar cortes.',
    community: 'nl/monterrey',
    commentsCount: 52,
    shares: 16,
    author: 'AguaNL',
    timeAgo: 'ayer',
    flair: 'Infraestructura',
    tags: ['conagua', 'agua', 'monitoreo'],
    source: {
      name: 'CONAGUA - SINA',
      dataset: 'Reporte de almacenamiento de presas',
      url: 'https://sigagis.conagua.gob.mx/ords/f?p=SIGAGIS',
      lastUpdated: 'mayo 2024',
      coverage: '210 presas monitoreadas; énfasis en Nuevo León',
    },
    commentTree: [
      {
        id: 'c-conagua-01',
        author: 'ObservatorioHidrico',
        role: 'Academia',
        body: 'Corroboramos los mismos porcentajes en la API JSON. Subiremos la serie histórica a GitHub para modelos predictivos.',
        timeAgo: 'hace 20 h',
      },
      {
        id: 'c-conagua-02',
        author: 'ResidentesApodaca',
        role: 'Vecindario',
        body: '¿Pueden publicar un tablero público? Queremos anticipar cortes en fraccionamientos.',
        timeAgo: 'hace 18 h',
      },
    ],
  },
];
