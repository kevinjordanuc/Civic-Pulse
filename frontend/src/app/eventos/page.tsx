import Link from 'next/link';

import { fetchEvents } from '@/lib/api';

const formatDateLabel = (value?: string) => {
  if (!value) return 'Fecha por confirmar';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Fecha por confirmar';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const toISODate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
};

export default async function AgendaCivicaPage() {
  let events = [] as Awaited<ReturnType<typeof fetchEvents>>;
  try {
    events = await fetchEvents();
  } catch {
    events = [];
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aDate = a.starts_at ? new Date(a.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.starts_at ? new Date(b.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-[var(--accent)]">
          ← Regresar al panel principal
        </Link>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Agenda cívica</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Eventos destacados</h1>
          <p className="text-[var(--text-muted)]">
            Estos datos provienen de convocatorias públicas locales y de los PDFs oficiales del portal HCD
            compartidos para las pruebas. Se muestran aquí para que el mapa use únicamente cartografía de código abierto.
          </p>
        </div>
      </header>

      <section className="space-y-4">
        {!sortedEvents.length && (
          <article className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4 text-sm text-[var(--text-muted)]">
            No hay eventos cargados todavía. Verifica la conexión al backend o revisa los mocks definidos en <code>src/data/civicEvents.ts</code>.
          </article>
        )}
        {sortedEvents.map(event => {
          const isoDate = toISODate(event.starts_at);
          const detailHref = isoDate ? `/eventos/${isoDate}` : '/eventos';
          return (
            <article key={event.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    {event.municipality ?? 'Municipio por confirmar'}
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--text)]">{event.name}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{event.description ?? 'Descripción disponible próximamente.'}</p>
                </div>
                <div className="text-right text-sm text-[var(--text-muted)]">
                  <p>{formatDateLabel(event.starts_at)}</p>
                  {event.address && <p>{event.address}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 capitalize text-[var(--text)]">
                  {event.category}
                </span>
                {event.tags?.map(tag => (
                  <span key={`${event.id}-${tag}`} className="rounded-full border border-[var(--border)] px-3 py-1">
                    {tag}
                  </span>
                ))}
                <Link href={detailHref} className="pill-button px-3 py-1 text-xs">
                  Ver fecha
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
