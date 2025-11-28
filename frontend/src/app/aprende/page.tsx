import Link from 'next/link';
import { learningResources } from '@/data/learningResources';

const lawBriefs = [
  {
    id: 'lffmaa',
    acronym: 'LFFMAA',
    title: 'Fomento a la microindustria y la actividad artesanal',
    description:
      'El artículo 1 establece que la Ley es de orden público y aplica en toda la República para impulsar la microindustria y la actividad artesanal.',
    reform: 'Última reforma publicada en el DOF el 27-03-2023.',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFFMAA.pdf',
  },
  {
    id: 'lfprh',
    acronym: 'LFPRH',
    title: 'Presupuesto y responsabilidad hacendaria',
    description:
      'El Título Primero define la programación, presupuestación, aprobación, ejercicio y control de los recursos federales con criterios de responsabilidad hacendaria.',
    reform: 'Texto vigente con reformas al 16-07-2025.',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPRH.pdf',
  },
  {
    id: 'liispcen',
    acronym: 'LIISPCEN',
    title: 'Productividad y competitividad nacional',
    description:
      'El decreto publicado el 06-05-2015 y reformado el 17-04-2024 articula políticas para elevar la productividad y añade el artículo 21 Bis a la Ley de Planeación.',
    reform: 'Sistema Nacional de Productividad actualizado 17-04-2024.',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LIISPCEN.pdf',
  },
];

const complianceSteps = [
  {
    label: 'Identifica el artículo aplicable',
    description: 'Relaciona tu proyecto con el objeto descrito en el artículo 1 de cada ley para documentar su fundamento legal.',
  },
  {
    label: 'Verifica reformas vigentes',
    description: 'Confirma la última fecha del DOF (27-03-2023, 16-07-2025 y 17-04-2024) antes de citar o presentar reportes.',
  },
  {
    label: 'Integra evidencia documental',
    description: 'Guarda el PDF oficial y anexa extractos de capítulos o decretos cuando envíes oficios o convocatorias.',
  },
];

const officialFiles = [
  {
    name: 'LFFMAA.pdf',
    detail: 'Ley Federal para el Fomento de la Microindustria y la Actividad Artesanal · DOF 27-03-2023',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFFMAA.pdf',
  },
  {
    name: 'LFPRH.pdf',
    detail: 'Ley Federal de Presupuesto y Responsabilidad Hacendaria · DOF 16-07-2025',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPRH.pdf',
  },
  {
    name: 'LIISPCEN.pdf',
    detail: 'Ley para Impulsar el Incremento Sostenido de la Productividad y la Competitividad de la Economía Nacional · DOF 17-04-2024',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LIISPCEN.pdf',
  },
];

export default function AprendePage() {
  const topics = Array.from(new Set(learningResources.map(resource => resource.topic)));

  return (
    <div className="space-y-8">
      <section className="glass-panel flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Aprende más</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Consulta marcos legales con información verificable</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Este módulo resume los textos vigentes publicados en el Diario Oficial de la Federación. Usamos directamente los
            archivos LFFMAA.pdf, LFPRH.pdf y LIISPCEN.pdf que compartiste para explicar obligaciones, calendarios y
            oportunidades de cumplimiento.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <Link
              href="https://www.diputados.gob.mx/LeyesBiblio/index.htm"
              className="pill-button px-4 py-2"
              target="_blank"
              rel="noreferrer"
            >
              Ir a Leyes Biblio
            </Link>
            <Link href="/" className="rounded-full border border-[var(--border)] px-4 py-2 text-[var(--text-muted)]">
              Volver al hub
            </Link>
          </div>
        </div>
        <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--text-muted)] lg:max-w-sm">
          <p className="font-semibold text-[var(--text)]">¿Por qué este formato?</p>
          <p>
            El objetivo es ofrecer referencias normativas claras. Cada resumen indica el fundamento legal, la fecha de la
            última reforma y un enlace oficial al PDF para que puedas comprobar la información antes de difundirla.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Rutas normativas</p>
            <h2 className="text-xl font-semibold text-[var(--text)]">Selecciona el marco que necesitas consultar</h2>
          </div>
          <button className="text-xs text-[var(--accent)]">Ver documentos completos</button>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {lawBriefs.map(law => (
            <article key={law.id} className="glass-panel space-y-3 px-5 py-5">
              <p className="text-xs text-[var(--accent)]">{law.acronym}</p>
              <h3 className="text-lg font-semibold text-[var(--text)]">{law.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{law.description}</p>
              <p className="text-xs text-[var(--text-muted)]">{law.reform}</p>
              <Link
                href={law.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--accent)]"
              >
                Revisar documento
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Temas sugeridos</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {topics.map(topic => (
              <span key={topic} className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-muted)]">
                {topic}
              </span>
            ))}
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {learningResources.map(resource => (
            <article key={resource.id} className="glass-panel flex flex-col gap-3 px-5 py-5 text-sm">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{resource.provider}</span>
                <span>{resource.difficulty}</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">{resource.title}</h3>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{resource.topic}</p>
              <p className="text-[var(--text-muted)]">{resource.description}</p>
              <p className="text-xs text-emerald-500">{resource.dopamineHook}</p>
              <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{resource.duration}</span>
                <span>{resource.format}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button className="pill-button px-4 py-2">{resource.cta}</button>
                <button className="rounded-full border border-[var(--border)] px-4 py-2 text-[var(--text-muted)]">
                  Guardar para después
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="glass-panel space-y-4 px-6 py-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Motivación inmediata</p>
              <h2 className="text-xl font-semibold text-[var(--text)]">Logros y recompensas digitales</h2>
            </div>
            <button className="pill-button px-4 py-2 text-xs">Ver tablero</button>
          </header>
          <div className="grid gap-3 md:grid-cols-3">
            {complianceSteps.map(step => (
              <article key={step.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
                <p className="text-[var(--text)]">{step.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="glass-panel space-y-3 px-5 py-5 text-sm text-[var(--text-muted)]">
          <p className="text-xs uppercase tracking-wide">Modo guía</p>
          <h3 className="text-lg font-semibold text-[var(--text)]">Recordatorios empáticos</h3>
          <p>Programa mensajes motivadores por SMS, WhatsApp o correo para continuar aprendiendo cuando tengas tiempo.</p>
          <button className="pill-button px-4 py-2 text-xs">Programar recordatorio</button>
        </aside>
      </section>

      <section className="glass-panel space-y-3 px-6 py-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Fuentes oficiales utilizadas</p>
          <h2 className="text-xl font-semibold text-[var(--text)]">Respaldos descargables</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Cada tarjeta enlaza al documento completo alojado en la Biblioteca de Leyes de la Cámara de Diputados o en el
            portal federal correspondiente.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {officialFiles.map(file => (
            <article key={file.name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              <p className="text-[var(--text)]">{file.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{file.detail}</p>
              <Link href={file.href} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)]">
                Descargar desde la fuente
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
