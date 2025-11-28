import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fetchEvents } from '@/lib/api';
import { getEventsForDate } from '@/data/civicEvents';

const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'full',
  }).format(date);

const formatTimeRange = (start?: string, end?: string) => {
  if (!start) return 'Horario por confirmar';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : undefined;
  if (Number.isNaN(startDate.getTime())) return 'Horario por confirmar';

  const baseOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const startLabel = new Intl.DateTimeFormat('es-MX', baseOptions).format(startDate);
  if (!endDate || Number.isNaN(endDate.getTime())) {
    return `Inicia ${startLabel}`;
  }
  const endLabel = new Intl.DateTimeFormat('es-MX', baseOptions).format(endDate);
  return `${startLabel} - ${endLabel}`;
};

const toISODate = (value: Date) => value.toISOString().split('T')[0];

export default async function EventosPorDiaPage({ params }: { params: { date: string } }) {
  const { date } = params;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    notFound();
  }
  const isoDate = toISODate(parsed);

  let events = [] as Awaited<ReturnType<typeof fetchEvents>>;
  try {
    events = await fetchEvents();
  } catch {
    events = [];
  }

  let eventsForDay = events.filter(event => {
    if (!event.starts_at) return false;
    const eventDate = new Date(event.starts_at);
    if (Number.isNaN(eventDate.getTime())) return false;
    return toISODate(eventDate) === isoDate;
  });

  if (!eventsForDay.length) {
    eventsForDay = getEventsForDate(isoDate);
  }

  if (!eventsForDay.length) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="text-sm text-[var(--accent)]">
          ← Regresar al panel principal
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">No hay eventos programados</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          No encontramos eventos para el {formatDateLabel(parsed)}. Vuelve a intentarlo más tarde o selecciona otro día en el panel.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="text-sm text-[var(--accent)]">
        ← Regresar al panel principal
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Eventos del {formatDateLabel(parsed)}</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        {eventsForDay.length === 1
          ? 'Un evento coincide con la fecha seleccionada.'
          : `${eventsForDay.length} eventos coinciden con la fecha seleccionada.`}
      </p>

      <ul className="mt-6 space-y-4">
        {eventsForDay.map(event => (
          <li key={event.id} className="rounded-2xl border border-[var(--border)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  {event.municipality ?? 'Municipio por confirmar'}
                </p>
                <h2 className="text-2xl font-semibold">{event.name}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {event.description ?? 'Descripción disponible próximamente.'}
                </p>
              </div>
              <div className="text-right text-sm text-[var(--text-muted)]">
                <p>{formatTimeRange(event.starts_at, event.ends_at)}</p>
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
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
