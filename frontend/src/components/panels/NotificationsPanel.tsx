"use client";

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { fetchNotifications } from '@/lib/api';
import { usePreferencesStore } from '@/store/preferences';
import { useProfileStore } from '@/store/profile';

type NotificationItem = Awaited<ReturnType<typeof fetchNotifications>>[number];

const quickFilters = ['todos', 'servicios', 'movilidad', 'seguridad', 'participación'];

export default function NotificationsPanel() {
  const { profile } = useProfileStore();
  const { mode, accessibility } = usePreferencesStore(state => ({
    mode: state.mode,
    accessibility: state.accessibility,
  }));
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('todos');

  useEffect(() => {
    fetchNotifications(profile.id)
      .then(setItems)
      .catch(() => setItems([]));
  }, [profile.id]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => (item.tags ?? []).forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'todos') {
      return items;
    }
    return items.filter(item => (item.tags ?? []).includes(activeFilter));
  }, [activeFilter, items]);

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
    <section id="notificaciones" className="glass-panel space-y-5 px-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Notificaciones recientes</h2>
          <p className="text-sm text-[var(--text-muted)]">Filtradas para {profile.municipality}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] px-4 py-2 text-xs text-[var(--text-muted)]">
          {accessibility.reducedMotion ? 'Entrega simplificada' : 'Modo interactivo'}
        </div>
      </header>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3">
          <p className="text-[var(--text-muted)]">Hoy</p>
          <p className="text-2xl font-semibold">{items.length}</p>
          <p className="text-xs">alertas asignadas</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
          <p className="text-[var(--text-muted)]">Intereses</p>
          <p className="text-lg font-semibold">{profile.interests.join(', ') || 'General'}</p>
          <p className="text-xs">Sincronizado con tu perfil</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
          <p className="text-[var(--text-muted)]">Canales</p>
          <p className="text-lg font-semibold">WhatsApp · Email</p>
          <p className="text-xs">Azure Communication Services</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {quickFilters.map(filter => (
          <button
            key={filter}
            className={clsx(
              'rounded-full border px-3 py-1 capitalize',
              activeFilter === filter
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                : 'border-[var(--border)] text-[var(--text-muted)]',
            )}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
        {!availableTags.length && <span className="text-[var(--text-muted)]">Etiquetas listas cuando conectes Azure AI Search.</span>}
      </div>

      <ul className="space-y-3">
        {filteredItems.map(item => (
          <li key={item.id} className="rounded-2xl border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-[var(--text-muted)]">{item.tags?.[0] ?? 'general'}</p>
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {formatRelativeTime(item.published_at)}
              </span>
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
        {!filteredItems.length && (
          <p className="text-sm text-[var(--text-muted)]">No hay alertas para este filtro.</p>
        )}
      </ul>

      {mode === 'advanced' && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)]">Activar multi-canal</p>
          <p>Conecta Azure Event Grid + Communication Services para enviar estas alertas como SMS o WhatsApp.</p>
        </div>
      )}
    </section>
  );
}
