"use client";

import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { fetchNotifications } from '@/lib/api';
import { useProfileStore } from '@/store/profile';

type NotificationItem = Awaited<ReturnType<typeof fetchNotifications>>[number];

type IdleWindow = typeof window & {
  requestIdleCallback?: (callback: IdleRequestCallback) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function NotificationBell() {
  const { profile } = useProfileStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadNotifications = () => {
      fetchNotifications(profile.id)
        .then(data => {
          if (!cancelled) {
            setItems(data);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setItems([]);
          }
        });
    };

    if (typeof window !== 'undefined') {
      const idleWindow = window as IdleWindow;
      if (idleWindow.requestIdleCallback) {
        const idleHandle = idleWindow.requestIdleCallback(() => loadNotifications());
        return () => {
          cancelled = true;
          idleWindow.cancelIdleCallback?.(idleHandle);
        };
      }
      const timeoutHandle = window.setTimeout(loadNotifications, 150);
      return () => {
        cancelled = true;
        clearTimeout(timeoutHandle);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatRelativeTime = (value: string | undefined) => {
    if (!value) return 'Reciente';
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return 'Reciente';
    const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} d`;
  };

  const latestItems = items.slice(0, 5);

  return (
    <div className="relative" ref={containerRef}>
      <button
        className={clsx(
          'relative rounded-full border border-[var(--border)] px-3 py-2 text-lg',
          isOpen ? 'bg-[var(--accent-soft)]' : 'bg-transparent',
        )}
        onClick={() => setOpen(prev => !prev)}
        aria-label="Abrir notificaciones"
      >
        🔔
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass-panel absolute left-0 z-40 mt-2 w-72 max-w-[calc(100vw-32px)] space-y-3 p-4 sm:left-auto sm:right-0 sm:w-80"
        >
          <header className="flex items-center justify-between text-sm">
            <span className="font-semibold">Notificaciones</span>
            <Link className="text-[var(--accent)]" href="/notificaciones" onClick={() => setOpen(false)}>
              Ver panel ↗
            </Link>
          </header>
          <ul className="space-y-2">
            {latestItems.map(item => (
              <li key={`bell-${item.id}`} className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm">
                <p className="font-semibold text-[var(--text)]">{item.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.body}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{formatRelativeTime(item.published_at)}</p>
              </li>
            ))}
            {!latestItems.length && (
              <li className="rounded-2xl border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--text-muted)]">
                No hay alertas nuevas para {profile.municipality}.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
