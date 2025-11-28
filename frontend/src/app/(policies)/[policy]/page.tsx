import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const CIVIC_CONTEXT =
  'Civic Pulse integra servicios de Azure AI para acercar información sobre políticas locales, eventos y servicios públicos. La plataforma combina datos de portales gubernamentales, foros moderados y flujos conversacionales para que cualquier persona pueda participar de forma informada y respetuosa.';

type PolicySection = {
  title: string;
  body: string;
  bullets?: string[];
};

type PolicyConfig = {
  title: string;
  summary: string;
  intro: string;
  highlights: { label: string; value: string }[];
  sections: PolicySection[];
  lastUpdated: string;
};

const policies: Record<string, PolicyConfig> = {
  'reglas-de-uso': {
    title: 'Reglas de uso',
    summary: 'Lineamientos para interactuar con Civic Pulse y sus asistentes de IA de manera segura, respetuosa y basada en datos públicos verificables.',
    intro:
      'Estas reglas se aplican al chat cívico, foros comunitarios, paneles informativos y notificaciones personalizadas. Su objetivo es fomentar un diálogo constructivo centrado en hechos, sin propaganda ni recomendaciones electorales específicas.',
    highlights: [
      { label: 'Enfoque', value: 'Participación cívica guiada por IA' },
      { label: 'Cobertura', value: 'Municipios y servicios locales' },
      { label: 'Moderación', value: 'Automática y humana combinada' },
      { label: 'Última revisión', value: 'Noviembre 2025' },
    ],
    sections: [
      {
        title: 'Interacciones impulsadas por IA responsables',
        body:
          'El asistente conversa en lenguaje natural para aclarar trámites, eventos o políticas. Siempre cita fuentes municipales cuando están disponibles y evita emitir juicios de valor.',
        bullets: [
          'Contrasta las respuestas con los enlaces oficiales mostrados en pantalla antes de compartirlas.',
          'No solicites ni difundas propaganda partidista o desinformación; los mensajes serán moderados.',
          'Si detectas contenido sensible, usa el botón de reporte para alertar al equipo de confianza y seguridad.',
        ],
      },
      {
        title: 'Uso de datos públicos y gubernamentales',
        body:
          'La plataforma agrega boletines oficiales, ordenanzas municipales, calendarios de eventos y bases públicas para responder preguntas en contexto.',
        bullets: [
          'Cada respuesta indica si proviene de un portal municipal, un dataset abierto o del historial de foros verificado.',
          'Cuando falten datos actualizados, el sistema lo señalará y sugerirá canales oficiales alternos.',
          'Los aportes ciudadanos pasan por un proceso de validación antes de mostrarse como referencia.',
        ],
      },
      {
        title: 'Participación respetuosa en foros y chat',
        body:
          'Los espacios comunitarios buscan elevar la conversación cívica. Se eliminan ataques personales, lenguaje discriminatorio o spam organizado.',
        bullets: [
          'Enfócate en hechos y experiencias locales; evita compartir datos personales de terceros.',
          'Identifica claramente tus fuentes o vivencias cuando aportes información nueva.',
          'Los moderadores pueden limitar temporalmente el acceso ante infracciones reiteradas.',
        ],
      },
      {
        title: 'Alertas y recomendaciones personalizadas',
        body:
          'Las notificaciones consideran intereses declarados y ubicación aproximada para mejorar la relevancia.',
        bullets: [
          'Puedes ajustar temas y radios desde Preferencias > Notificaciones en cualquier momento.',
          'Ninguna alerta sugiere por quién votar; solo aclara procesos, plazos y recursos disponibles.',
          'Cuando una fuente cambie o sea retirada, la alerta se marca como “en revisión” hasta validar la nueva información.',
        ],
      },
    ],
    lastUpdated: 'Entró en vigor el 15 de noviembre de 2025.',
  },
  'politica-de-privacidad': {
    title: 'Política de privacidad',
    summary:
      'Explica qué datos recopila Civic Pulse, cómo se usan los servicios de Azure AI para procesarlos y qué controles tienen las personas usuarias para gestionar su información.',
    intro:
      'Respetamos la normativa mexicana y los compromisos globales de protección de datos. Solo almacenamos lo necesario para ofrecer experiencias personalizadas y seguras.',
    highlights: [
      { label: 'Control de datos', value: 'Panel de preferencias' },
      { label: 'Cifrado', value: 'En tránsito y reposo (TLS/Azure SSE)' },
      { label: 'Retención', value: '12 meses para actividad cívica' },
      { label: 'Contacto', value: 'privacidad@civicpulse.mx' },
    ],
    sections: [
      {
        title: 'Datos que recopilamos',
        body:
          'Recopilamos información de cuenta, preferencias declaradas, actividad en el chat y foros, así como metadatos técnicos mínimos.',
        bullets: [
          'Perfil: nombre para mostrar, municipio, intereses cívicos seleccionados.',
          'Actividad: consultas al asistente, aportes en foros y confirmaciones de eventos para mejorar la precisión.',
          'Datos de uso: idioma, tipo de dispositivo y ajustes de accesibilidad para adaptar la experiencia.',
        ],
      },
      {
        title: 'Cómo usamos la información',
        body:
          'Azure AI ayuda a resumir boletines, priorizar respuestas y generar alertas personalizadas sin crear perfiles comerciales.',
        bullets: [
          'Responder preguntas sobre servicios locales con contexto adecuado.',
          'Detectar temas emergentes en la comunidad y proponer contenidos educativos.',
          'Medir el rendimiento del sistema para cumplir con métricas de equidad y calidad.',
        ],
      },
      {
        title: 'Intercambio y seguridad',
        body:
          'No vendemos datos personales. Compartimos información agregada con socios municipales cuando resulte imprescindible para operar el servicio.',
        bullets: [
          'Cifrado TLS 1.2+ para el tránsito y cifrado administrado por Azure en reposo.',
          'Controles de acceso basados en roles y registros de auditoría para cada consulta sensible.',
          'Acuerdos de procesamiento de datos con proveedores que cumplen estándares internacionales.',
        ],
      },
      {
        title: 'Tus decisiones y derechos',
        body:
          'Ofrecemos herramientas para consultar, rectificar o eliminar la información personal almacenada.',
        bullets: [
          'Desde Preferencias > Privacidad puedes descargar tu historial o solicitar su eliminación.',
          'Puedes desactivar la personalización de notificaciones y chat contextualizado.',
          'Si eres menor de edad o representas a un menor, solicita soporte para procesos adicionales de verificación.',
        ],
      },
    ],
    lastUpdated: 'Última revisión: 12 de noviembre de 2025.',
  },
  'acuerdo-de-usuario': {
    title: 'Acuerdo de usuario',
    summary:
      'Contrato que describe el servicio ofrecido por Civic Pulse, las responsabilidades de las personas usuarias y los límites de la plataforma.',
    intro:
      'Al crear una cuenta o usar el chat, aceptas estas condiciones diseñadas para garantizar transparencia y colaboración con gobiernos locales.',
    highlights: [
      { label: 'Jurisdicción', value: 'Ciudad de México' },
      { label: 'Soporte', value: 'soporte@civicpulse.mx' },
      { label: 'Cobertura', value: 'Foros, chat, mapas y alertas' },
      { label: 'Versión', value: '1.3 (2025)' },
    ],
    sections: [
      {
        title: 'Alcance del servicio',
        body:
          'Civic Pulse es un asistente informativo. No sustituye asesoría legal ni garantiza resultados de trámites o procesos electorales.',
        bullets: [
          'Puedes usarlo para conocer plazos, requisitos y eventos oficiales.',
          'No emitimos recomendaciones de voto ni avalamos candidatos o partidos.',
          'Al acceder desde integraciones de terceros, aplican también los términos de esas plataformas.',
        ],
      },
      {
        title: 'Responsabilidades de las personas usuarias',
        body:
          'Debes proporcionar información veraz y respetar la propiedad intelectual de los materiales que compartas.',
        bullets: [
          'No intentes vulnerar la seguridad de los sistemas, automatizar cuentas o recolectar datos de otros usuarios.',
          'Reporta vulnerabilidades a través del canal responsable en lugar de explotarlas.',
          'Aceptas que tus aportes puedan moderarse, resumirse o traducirse para servir mejor a la comunidad.',
        ],
      },
      {
        title: 'Limitaciones y exenciones',
        body:
          'Aun cuando usamos datos oficiales, pueden existir retrasos o discrepancias con la fuente primaria.',
        bullets: [
          'Verifica siempre la información crítica antes de realizar trámites o compromisos legales.',
          'No somos responsables de interrupciones ocasionadas por cortes de energía, fallas de internet o mantenimiento planificado.',
          'El servicio puede suspenderse en caso de incumplimiento grave de estas condiciones.',
        ],
      },
      {
        title: 'Cambios al acuerdo',
        body:
          'Notificaremos las actualizaciones relevantes mediante correo registrado y un aviso destacado en la aplicación.',
        bullets: [
          'La continuidad en el uso del servicio implica la aceptación de los cambios.',
          'Si no estás de acuerdo, puedes cancelar tu cuenta y solicitar la eliminación de tus datos.',
        ],
      },
    ],
    lastUpdated: 'Vigente desde el 20 de noviembre de 2025.',
  },
  accesibilidad: {
    title: 'Compromiso de accesibilidad',
    summary:
      'Hoja de ruta para ofrecer experiencias inclusivas sin importar el dispositivo, idioma o nivel de alfabetización digital.',
    intro:
      'Buscamos cumplir con WCAG 2.1 AA y reflejar las necesidades reales de comunidades diversas. Este documento describe las funciones disponibles y el proceso de mejora continua.',
    highlights: [
      { label: 'Idiomas', value: 'ES y EN (expandiendo)' },
      { label: 'Funciones clave', value: 'Lectura fácil, TTS, contraste alto' },
      { label: 'Canales', value: 'Web, SMS piloto, kioscos' },
      { label: 'Contacto accesibilidad', value: 'inclusion@civicpulse.mx' },
    ],
    sections: [
      {
        title: 'Diseño inclusivo por defecto',
        body:
          'Interfaces responsivas con tipografías escalables, controles grandes y navegación compatible con teclado y lectores de pantalla.',
        bullets: [
          'El panel de preferencias permite ajustar contraste, tamaño de fuente y modo simplificado.',
          'Los componentes críticos incluyen etiquetas ARIA y atajos accesibles.',
        ],
      },
      {
        title: 'Soporte multicanal y multiformato',
        body:
          'Además de la experiencia web, estamos desplegando recordatorios por SMS y materiales descargables en PDF accesibles.',
        bullets: [
          'Las notificaciones describen acciones concretas y enlaces directos a la fuente oficial.',
          'El chat puede resumir la información en lenguaje claro o leerla en voz alta cuando activas TTS.',
        ],
      },
      {
        title: 'Contenido comprensible y contextualizado',
        body:
          'Cada respuesta destaca los conceptos clave sobre políticas locales y explica por qué la información es relevante.',
        bullets: [
          'Se evita la jerga técnica; cuando es necesaria, se agregan definiciones rápidas.',
          'Las preguntas frecuentes incluyen ejemplos prácticos y pasos numerados para trámites.',
        ],
      },
      {
        title: 'Mejora continua y participación',
        body:
          'Evaluamos la accesibilidad con pruebas automatizadas y sesiones con personas de perfiles diversos.',
        bullets: [
          'Publicamos encuestas trimestrales sobre usabilidad e inclusión.',
          'Puedes solicitar ajustes razonables escribiendo al correo dedicado o usando el chat de soporte.',
        ],
      },
    ],
    lastUpdated: 'Compromiso actualizado el 10 de noviembre de 2025.',
  },
};

const policySlugs = Object.keys(policies);

export function generateStaticParams() {
  return policySlugs.map(policy => ({ policy }));
}

export function generateMetadata({ params }: { params: { policy: string } }): Metadata {
  const config = policies[params.policy];
  if (!config) {
    return {
      title: 'Centro de confianza | Civic Pulse',
      description: 'Consulta la información clave sobre Civic Pulse.',
    };
  }
  return {
    title: `${config.title} | Civic Pulse`,
    description: config.summary,
  };
}

export default function PolicyPage({ params }: { params: { policy: string } }) {
  const content = policies[params.policy];

  if (!content) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Centro de confianza Civic Pulse</p>
        <h1 className="text-3xl font-semibold">{content.title}</h1>
        <p className="text-base text-[var(--text-muted)]">{content.summary}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {content.highlights.map(item => (
          <div key={item.label} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
            <p className="text-lg font-semibold text-[var(--text)]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
        <p className="text-xs uppercase tracking-wide text-[var(--accent)]">Contexto del proyecto</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{CIVIC_CONTEXT}</p>
      </div>

      <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 text-sm text-[var(--text-muted)]">
        {content.intro}
      </article>

      {content.sections.map(section => (
        <section key={section.title} className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 p-5">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text)]">{section.title}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{section.body}</p>
          </div>
          {section.bullets && (
            <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--text-muted)]">
              {section.bullets.map(point => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 text-sm text-[var(--text-muted)]">
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Actualización</p>
        <p className="mt-2">{content.lastUpdated}</p>
      </div>
    </section>
  );
}
