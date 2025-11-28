export type LearningResource = {
  id: string;
  title: string;
  provider: string;
  topic: string;
  description: string;
  duration: string;
  format: string;
  cta: string;
  href: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  dopamineHook: string;
};

export const learningResources: LearningResource[] = [
  {
    id: 'lffmaa-fundamentos',
    title: 'Fundamentos de la Ley Federal para el Fomento de la Microindustria',
    provider: 'Cámara de Diputados / DOF',
    topic: 'LFFMAA',
    description:
      'Resumen del Capítulo I: la ley es de orden público y busca impulsar el desarrollo de la microindustria y la actividad artesanal en todo el país.',
    duration: 'Lectura · 10 min',
    format: 'Compendio oficial',
    cta: 'Revisar PDF',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFFMAA.pdf',
    difficulty: 'Básico',
    dopamineHook: 'Incluye referencia a la reforma publicada en el DOF el 27-03-2023.',
  },
  {
    id: 'lffmaa-programas',
    title: 'Programas de apoyo a la microindustria',
    provider: 'Secretaría de Economía',
    topic: 'LFFMAA',
    description:
      'Guía práctica para vincularse con los apoyos previstos en los capítulos II y III de la LFFMAA, desde el registro ante autoridades estatales hasta la obtención de incentivos.',
    duration: 'Ficha · 12 min',
    format: 'Guía descargable',
    cta: 'Consultar guía',
    href: 'https://www.gob.mx/se/acciones-y-programas/microindustria',
    difficulty: 'Intermedio',
    dopamineHook: 'Incluye lista de verificación para acreditar requisitos ante la secretaría estatal correspondiente.',
  },
  {
    id: 'lfprh-marco',
    title: 'Objeto y definiciones de la LFPRH',
    provider: 'Cámara de Diputados / DOF',
    topic: 'LFPRH',
    description:
      'Lectura guiada del Título Primero, que define la programación, presupuestación y control del gasto federal con criterios de responsabilidad hacendaria.',
    duration: 'Lectura · 15 min',
    format: 'Texto legal acompañado',
    cta: 'Abrir documento',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPRH.pdf',
    difficulty: 'Intermedio',
    dopamineHook: 'Anota las reformas vigentes al 16-07-2025 para tus reportes de cumplimiento.',
  },
  {
    id: 'lfprh-calendario',
    title: 'Calendario de presupuesto y seguimiento',
    provider: 'SHCP',
    topic: 'LFPRH',
    description:
      'Plantilla editable que aterriza los plazos de programación, aprobación, ejercicio y rendición de cuentas previstos en la LFPRH.',
    duration: 'Plantilla · 20 min',
    format: 'Hoja de cálculo',
    cta: 'Descargar plantilla',
    href: 'https://www.gob.mx/shcp/documentos/calendario-presupuestario',
    difficulty: 'Intermedio',
    dopamineHook: 'incluye alertas para enviar informes trimestrales a los ejecutores del gasto.',
  },
  {
    id: 'liispcen-productividad',
    title: 'Productividad y competitividad (LIISPCEN)',
    provider: 'Cámara de Diputados / DOF',
    topic: 'LIISPCEN',
    description:
      'Resumen del decreto publicado el 06-05-2015 y reformado el 17-04-2024 que articula políticas para elevar la productividad y se vincula con la Ley de Planeación.',
    duration: 'Lectura · 12 min',
    format: 'Compendio oficial',
    cta: 'Revisar PDF',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LIISPCEN.pdf',
    difficulty: 'Básico',
    dopamineHook: 'Incluye cuadro sobre la adición del artículo 21 Bis a la Ley de Planeación.',
  },
  {
    id: 'liispcen-casos',
    title: 'Aplicaciones territoriales de la LIISPCEN',
    provider: 'CONCAMIN',
    topic: 'Competitividad',
    description:
      'Colección de estudios de caso sobre cómo los comités estatales alinean proyectos productivos con la LIISPCEN para detonar empleo local.',
    duration: 'Dossier · 30 min',
    format: 'Repositorio PDF',
    cta: 'Explorar casos',
    href: 'https://www.concamin.org.mx/productividad',
    difficulty: 'Avanzado',
    dopamineHook: 'Destaca indicadores recomendados por el Sistema Nacional de Productividad.',
  },
];
