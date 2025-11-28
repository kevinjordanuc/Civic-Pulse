"use client";

import clsx from 'clsx';
import L from 'leaflet';
import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { fetchEvents } from '@/lib/api';
import { getOfflineEvents } from '@/data/civicEvents';
import { usePreferencesStore } from '@/store/preferences';
import { useProfileStore } from '@/store/profile';

type CivicEvent = Awaited<ReturnType<typeof fetchEvents>>[number];
type IdleWindow = typeof window & {
  requestIdleCallback?: (callback: IdleRequestCallback) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const layerOptions = [
  { id: 'movilidad', label: 'Movilidad' },
  { id: 'salud', label: 'Salud' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'educacion', label: 'Educación' },
  { id: 'legislativo', label: 'Legislativo' },
];
const fallbackCenter: [number, number] = [19.432608, -99.133209];
const categoryColors: Record<string, string> = {
  movilidad: '#2563eb',
  salud: '#16a34a',
  seguridad: '#f97316',
  educacion: '#9333ea',
  legislativo: '#0ea5e9',
};
// Convierte la primera letra en mayúscula para mantener consistencia visual.
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// Calcula etiquetas localizadas de lunes a domingo para el idioma indicado.
const buildWeekdayLabels = (locale: string) =>
  Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + index)),
  );

// Construye la lista de meses sin hardcodearlos uno a uno.
const buildMonthLabels = (locale: string) =>
  Array.from({ length: 12 }, (_, index) =>
    capitalize(new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, index, 1))),
  );

type DayStatus = 'empty' | 'active';

// Genera una matriz de fechas (incluyendo espacios vacíos) para el mes mostrado.
const buildCalendarDays = (anchor: Date) => {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const leadingEmpty = (firstOfMonth.getDay() + 6) % 7; // shift so Monday = 0
  const totalCells = Math.max(42, Math.ceil((leadingEmpty + daysInMonth) / 7) * 7);

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingEmpty + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }
    return new Date(anchor.getFullYear(), anchor.getMonth(), dayNumber);
  });
};

const toISODate = (date: Date) => date.toISOString().split('T')[0];
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

type MapPanelProps = {
  variant?: 'default' | 'compact';
};

export default function MapPanel({ variant = 'default' }: MapPanelProps) {
  const { profile } = useProfileStore();
  const { mode, language } = usePreferencesStore(state => ({ mode: state.mode, language: state.language }));
  const router = useRouter();
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [activeLayers, setActiveLayers] = useState(() => layerOptions.map(layer => layer.id));
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isMapReady, setMapReady] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const isCompact = variant === 'compact';
  const layersMenuRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const filteredEvents = useMemo(() => {
    if (!activeLayers.length) {
      return events;
    }
    // Solo mostramos los eventos cuyas categorías están activas.
    return events.filter(event => activeLayers.includes(event.category));
  }, [activeLayers, events]);

  const eventsWithCoordinates = useMemo(
    () =>
      filteredEvents.filter(
        event => typeof event.latitude === 'number' && typeof event.longitude === 'number',
      ),
    [filteredEvents],
  );

  const mapCenter = useMemo(() => {
    const primary = eventsWithCoordinates[0];
    if (primary) {
      return [primary.latitude, primary.longitude] as [number, number];
    }
    return fallbackCenter;
  }, [eventsWithCoordinates]);

  useEffect(() => {
    // Carga los eventos en cuanto conocemos el municipio del perfil.
    let cancelled = false;
    const loadEvents = () => {
      fetchEvents(profile.municipality)
        .then(data => {
          if (!cancelled) {
            setEvents(data?.length ? data : getOfflineEvents(profile.municipality));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setEvents(getOfflineEvents(profile.municipality));
          }
        });
    };

    if (typeof window !== 'undefined') {
      const idleWindow = window as IdleWindow;
      if (idleWindow.requestIdleCallback) {
        const handle = idleWindow.requestIdleCallback(() => loadEvents());
        return () => {
          cancelled = true;
          idleWindow.cancelIdleCallback?.(handle);
        };
      }
      const timeoutId = window.setTimeout(loadEvents, 200);
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [profile.municipality]);

  useEffect(() => {
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!isMapReady || typeof window === 'undefined') return;
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [isMapReady, mapCenter]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(mapCenter, undefined, { animate: true });
  }, [mapCenter]);

  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    eventsWithCoordinates.forEach(event => {
      const marker = L.circleMarker([event.latitude, event.longitude], {
        color: categoryColors[event.category] ?? '#2563eb',
        fillColor: '#fff',
        fillOpacity: 0.9,
        radius: 8,
        weight: 2,
      }).addTo(markersLayerRef.current!);

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.4;">
          <p style="margin:0; text-transform:uppercase; color:#475569; letter-spacing:0.08em;">${event.category}</p>
          <strong style="display:block; margin:2px 0; color:#0f172a;">${event.name}</strong>
          <p style="margin:0; color:#475569;">${formatEventDate(event.starts_at)}</p>
          ${event.address ? `<p style="margin:0; color:#475569;">${event.address}</p>` : ''}
          <a href="${buildEventLink(event)}" style="color:#0284c7; font-weight:600;" target="_blank" rel="noreferrer">
            Abrir agenda ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [eventsWithCoordinates, language]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId],
    );
  };

  useEffect(() => {
    // Cierra el menú de capas si el usuario hace clic fuera.
    const handleClickOutside = (event: MouseEvent) => {
      if (layersMenuRef.current && !layersMenuRef.current.contains(event.target as Node)) {
        setLayersMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const eventsByDate = useMemo(() => {
    // Agrupa eventos por fecha en formato ISO para consultas rápidas.
    const grouped = new Map<string, CivicEvent[]>();
    events.forEach(event => {
      if (!event.starts_at) return;
      const timestamp = new Date(event.starts_at);
      if (Number.isNaN(timestamp.getTime())) return;
      const iso = toISODate(timestamp);
      const bucket = grouped.get(iso) ?? [];
      bucket.push(event);
      grouped.set(iso, bucket);
    });
    return grouped;
  }, [events]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const weekdayLabels = useMemo(() => buildWeekdayLabels(language), [language]);
  const monthLabels = useMemo(() => buildMonthLabels(language), [language]);
  const currentMonthIndex = calendarMonth.getMonth();
  const currentYearValue = calendarMonth.getFullYear();
  const yearOptions = useMemo(() => {
    const baseYear = currentYearValue - 2;
    return Array.from({ length: 5 }, (_, index) => baseYear + index);
  }, [currentYearValue]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const fullDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        dateStyle: 'full',
      }),
    [language],
  );
  const buildAvailabilityLabel = (hasEvents: boolean, formattedDate: string) => {
    if (language.startsWith('es')) {
      return `${hasEvents ? 'Ver' : 'Sin'} eventos para el ${formattedDate}`;
    }
    return `${hasEvents ? 'View' : 'No'} events for ${formattedDate}`;
  };

  const buildEventLink = (event: CivicEvent) => {
    if (!event.starts_at) return '/eventos';
    const eventDate = new Date(event.starts_at);
    if (Number.isNaN(eventDate.getTime())) return '/eventos';
    return `/eventos/${toISODate(eventDate)}`;
  };

  const getDayStatus = (date: Date | null): DayStatus => {
    if (!date) return 'empty';
    const iso = toISODate(date);
    const total = eventsByDate.get(iso)?.length ?? 0;
    return total ? 'active' : 'empty';
  };

  const handleDateSelection = (date: Date) => {
    // Navega hacia la página de /eventos/[fecha] únicamente si hay incidencias en esa fecha.
    const iso = toISODate(date);
    const dayEvents = eventsByDate.get(iso);
    if (!dayEvents?.length) return;
    router.push(`/eventos/${iso}`);
    setCalendarOpen(false);
  };

  const changeCalendarMonth = (offset: number) => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleMonthSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = Number(event.target.value);
    setCalendarMonth(prev => new Date(prev.getFullYear(), monthIndex, 1));
  };

  const handleYearSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = Number(event.target.value);
    setCalendarMonth(prev => new Date(year, prev.getMonth(), 1));
  };

  const getDayCellClassNames = (status: DayStatus) =>
    clsx(
      'flex h-14 flex-col items-center justify-center gap-1 bg-transparent px-1 text-sm font-semibold text-slate-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
      status === 'empty' && 'cursor-default text-slate-300',
      status === 'active' && 'hover:text-black',
    );

  const getStatusDotClassNames = (status: DayStatus) =>
    clsx(
      'h-1.5 w-1.5 rounded-full transition-colors',
      status === 'active' ? 'bg-slate-900 shadow-sm shadow-slate-500/50' : 'opacity-0',
    );

  const formatEventDate = (value?: string) => {
    if (!value) return 'Por confirmar';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Por confirmar';
    // Mostramos fecha y hora amigables en el idioma preferido.
    return new Intl.DateTimeFormat(language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <section
      id="mapa"
      className={clsx(
        'glass-panel space-y-5 px-6 py-6',
        isCompact && 'space-y-4 px-4 py-4 text-sm',
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Mapa cívico</p>
          <h2 className={clsx('font-semibold', isCompact ? 'text-lg' : 'text-2xl')}>
            Eventos en {profile.municipality}
          </h2>
        </div>
        <button className="pill-button px-4 py-2 text-xs" onClick={() => setCalendarOpen(true)}>
          Ver calendario
        </button>
      </header>

      <div className="relative" ref={layersMenuRef}>
        <button
          className="pill-button flex items-center gap-2 px-4 py-2 text-xs"
          onClick={() => setLayersMenuOpen(prev => !prev)}
        >
          Capas ({activeLayers.length})
          <span aria-hidden="true">▾</span>
        </button>
        {layersMenuOpen && (
          <div className="absolute z-[60] mt-2 w-56 rounded-2xl border border-[var(--border)] bg-white p-4 text-slate-900 shadow-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Selecciona capas
            </p>
            <ul className="space-y-2 text-sm">
              {layerOptions.map(option => {
                const checked = activeLayers.includes(option.id);
                return (
                  <li key={option.id} className="flex items-center gap-2">
                    <input
                      id={`layer-${option.id}`}
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--accent)]"
                      checked={checked}
                      onChange={() => toggleLayer(option.id)}
                    />
                    <label htmlFor={`layer-${option.id}`} className="flex-1 text-[var(--text)]">
                      {option.label}
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex gap-2 text-xs">
              <button
                className="flex-1 rounded-full border border-[var(--border)] px-3 py-1"
                onClick={() => setActiveLayers(layerOptions.map(layer => layer.id))}
              >
                Activar todas
              </button>
              <button
                className="flex-1 rounded-full border border-[var(--border)] px-3 py-1"
                onClick={() => setActiveLayers([])}
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={clsx(
          'relative z-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-slate-900/20',
          isCompact ? 'h-48' : 'h-64',
        )}
      >
        <div ref={mapContainerRef} className="h-full w-full" />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Inicializando mapa libre...
          </div>
        )}
        {!eventsWithCoordinates.length && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-white/80">
            Activa una capa para visualizar eventos.
          </p>
        )}
      </div>

      {mode === 'advanced' && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)]">Conectar Azure Maps</p>
          <p>Habilita rutas en tiempo real, datos de tránsito y capas 3D desde Azure Maps Data Manager.</p>
        </div>
      )}

      {mode === 'advanced' && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)]">Conectar Azure Maps</p>
          <p>Habilita rutas en tiempo real, datos de tránsito y capas 3D desde Azure Maps Data Manager.</p>
        </div>
      )}

      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-black/10 bg-white p-5 text-black shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-4 flex flex-col gap-2">
              <div className="text-right">
                <button
                  className="px-2 py-1 text-base text-black hover:text-slate-700"
                  onClick={() => setCalendarOpen(false)}
                  aria-label="Cerrar calendario"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[90px] flex-1 max-w-[130px]">
                <label className="sr-only" htmlFor="calendar-month-select">
                  Seleccionar mes
                </label>
                <select
                  id="calendar-month-select"
                  value={currentMonthIndex}
                  onChange={handleMonthSelect}
                    className="w-full rounded-full border border-black/20 px-2 py-1 text-xs font-semibold text-black"
                  >
                    {monthLabels.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-16 shrink-0">
                  <label className="sr-only" htmlFor="calendar-year-select">
                    Seleccionar año
                  </label>
                  <select
                    id="calendar-year-select"
                    value={currentYearValue}
                    onChange={handleYearSelect}
                    className="w-full rounded-full border border-black/20 px-2 py-1 text-xs font-semibold text-black"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              {weekdayLabels.map(label => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <span key={`empty-${index}`} className="h-14" />;
                }
                const status = getDayStatus(date);
                const hasEvents = status === 'active';
                const formattedDate = fullDateFormatter.format(date);
                const accessibleLabel = buildAvailabilityLabel(hasEvents, formattedDate);
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!hasEvents}
                    onClick={() => hasEvents && handleDateSelection(date)}
                    className={getDayCellClassNames(status)}
                    aria-label={accessibleLabel}
                  >
                    <span>{date.getDate()}</span>
                    <span className={getStatusDotClassNames(status)} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
