'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { fetchNotifications } from '@/lib/api';
import { useProfileStore } from '@/store/profile';

const MAX_DAYS = 21;

type NotificationItem = Awaited<ReturnType<typeof fetchNotifications>>[number];

export default function NotificationsPage() {
  const { profile } = useProfileStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNotifications(profile.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [profile.id]);

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const limit = MAX_DAYS * 24 * 60 * 60 * 1000;
    return [...items]
      .filter(item => {
        const timestamp = new Date(item.published_at).getTime();
        if (Number.isNaN(timestamp)) return true;
        return now - timestamp <= limit;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [items]);

  const formatRelativeTime = (value: string | undefined) => {
    if (!value) return 'Reciente';
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return 'Reciente';
    const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Centro de alertas</p>
          <h1 className="text-3xl font-semibold">Notificaciones para {profile.municipality}</h1>
          <p className="text-sm text-[var(--text-muted)]">Mostrando lo más reciente hasta 3 semanas atrás.</p>
        </div>
        <Link href="/" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
          ← Volver al feed
        </Link>
      </header>

      <section className="glass-panel space-y-4 px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <span>
            {filteredItems.length ? `${filteredItems.length} alertas activas` : 'Sin alertas en las últimas 3 semanas'}
          </span>
          <span>Actualizado hace unos segundos</span>
        </header>

        {isLoading && <p className="text-sm text-[var(--text-muted)]">Cargando alertas…</p>}

        {!isLoading && !filteredItems.length && (
          <p className="text-sm text-[var(--text-muted)]">
            No se registraron notificaciones para tu comunidad durante las últimas tres semanas.
          </p>
        )}

        <ul className="space-y-3">
          {filteredItems.map(item => (
            <li key={`page-${item.id}`} className="rounded-2xl border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{item.tags?.[0] ?? 'general'}</p>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(item.published_at)}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{item.body}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {(item.tags ?? ['prioridad']).map(tag => (
                  <span key={`${item.id}-${tag}`} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[var(--text)]">
                    {tag}
                  </span>
                ))}
                {item.municipality && (
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-muted)]">
                    {item.municipality}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
