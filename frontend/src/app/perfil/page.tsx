'use client';

import Link from 'next/link';

import { usePreferencesStore } from '@/store/preferences';
import { useProfileStore } from '@/store/profile';

const contributionStats = [
  { label: 'Publicaciones', value: 12 },
  { label: 'Foros seguidos', value: 8 },
  { label: 'Reportes resueltos', value: 5 },
];

const upcomingActions = [
  { title: 'Recordatorio de cabildo', detail: 'Próxima sesión abierta el 5 de diciembre.' },
  { title: 'Encuesta de movilidad', detail: 'Comparte tu opinión sobre ciclovías en tu alcaldía.' },
];

export default function ProfilePage() {
  const { profile } = useProfileStore();
  const { language, accessibility, mode } = usePreferencesStore();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--text-muted)]">
        <Link href="/" className="text-[var(--accent)]">
          ← Volver al feed
        </Link>
      </nav>

      <section className="glass-panel space-y-4 px-6 py-6">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Perfil cívico</p>
            <h1 className="text-3xl font-semibold">{profile.displayName}</h1>
            <p className="text-sm text-[var(--text-muted)]">Municipio: {profile.municipality}</p>
          </div>
          <div className="rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--text-muted)]">
            Cuenta demo · ID {profile.id}
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {contributionStats.map(stat => (
            <div key={stat.label} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-center">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">Intereses principales</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {profile.interests.map(interest => (
              <span key={interest} className="rounded-full border border-[var(--border)] px-4 py-2">
                #{interest}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel grid gap-5 px-6 py-6 lg:grid-cols-2">
        <div className="space-y-3">
          <header>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Actividad reciente</p>
            <h2 className="text-lg font-semibold">Participación comunitaria</h2>
            <p className="text-sm text-[var(--text-muted)]">Resumen de tus interacciones públicas de los últimos días.</p>
          </header>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            <li className="rounded-2xl border border-[var(--border)] px-4 py-3 text-[var(--text)]">
              Comentaste en "Alertas de movilidad" · hace 2 h
            </li>
            <li className="rounded-2xl border border-[var(--border)] px-4 py-3 text-[var(--text)]">
              Compartiste una actualización en "Educación pública" · ayer
            </li>
            <li className="rounded-2xl border border-[var(--border)] px-4 py-3 text-[var(--text)]">
              Seguimiento enviado sobre "Luminarias" · hace 3 días
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <header>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Siguientes pasos</p>
            <h2 className="text-lg font-semibold">Trámites y eventos</h2>
          </header>
          <ul className="space-y-3 text-sm text-[var(--text-muted)]">
            {upcomingActions.map(action => (
              <li key={action.title} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-[var(--text)]">
                <p className="font-semibold">{action.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{action.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glass-panel space-y-4 px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Preferencias activas</p>
            <h2 className="text-lg font-semibold">Cómo ves Civic Pulse</h2>
          </div>
          <Link href="/" className="text-sm text-[var(--accent)]">
            Ajustar desde el panel principal ↗
          </Link>
        </header>
        <dl className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Idioma</dt>
            <dd className="text-lg font-semibold">{language}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Modo</dt>
            <dd className="text-lg font-semibold">{mode === 'advanced' ? 'Avanzado' : 'Básico'}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Accesibilidad</dt>
            <dd className="text-sm text-[var(--text-muted)]">
              TTS {accessibility.ttsEnabled ? 'activado' : 'desactivado'} · Lectura simple {accessibility.simplifiedLanguage ? 'sí' : 'no'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
