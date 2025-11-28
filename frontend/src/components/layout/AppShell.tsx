"use client";

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import NotificationBell from '@/components/notifications/NotificationBell';
import { usePreferencesStore, type ThemeOption } from '@/store/preferences';
import { useProfileStore } from '@/store/profile';

const LazyChatPanel = dynamic(() => import('@/components/panels/ChatPanel'), {
  ssr: false,
  loading: () => (
    <div className="text-sm text-[var(--text-muted)]">
      Conectando chat...
    </div>
  ),
});

const LazyMapPanel = dynamic(() => import('@/components/panels/MapPanel'), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
      Cargando mapa cívico...
    </div>
  ),
});

const navSections = [
  { id: 'inicio', label: 'Inicio', href: '/#inicio' },
  { id: 'aprende', label: 'Aprende más', href: '/aprende' },
];

const civicSections = [
  { id: 'chat', label: 'Chat Cívico', href: '/#chat' },
  { id: 'mapa', label: 'Mapa', href: '/#mapa' },
  { id: 'notificaciones', label: 'Alertas', href: '/#notificaciones' },
  { id: 'foros', label: 'Foros', href: '/#foros' },
];

const footerLinks = [
  { label: 'Reglas de uso', href: '/reglas-de-uso' },
  { label: 'Política de privacidad', href: '/politica-de-privacidad' },
  { label: 'Acuerdo de usuario', href: '/acuerdo-de-usuario' },
  { label: 'Accesibilidad', href: '/accesibilidad' },
  { label: 'Soporte', href: '#support' },
];

const themeChoices: { label: string; value: ThemeOption }[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Alto contraste', value: 'high-contrast' },
];

const languageOptions = [
  { value: 'es-MX', label: 'ES' },
  { value: 'en-US', label: 'EN' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const [isPrefOpen, setPrefOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const { profile } = useProfileStore();
  const isAuthenticated = Boolean(profile?.id);

  const {
    setTheme,
    theme,
    updateFontScale,
    fontScale,
    accessibility,
    updateAccessibility,
    language,
    setLanguage,
  } = usePreferencesStore();

  const closeSidebarForMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const contentClasses = clsx(
    'flex flex-1 flex-col transition-[margin] duration-300',
    isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0',
  );

  const sidebarWidthPx = 288; // tailwind w-72
  const togglePosition = {
    left: isSidebarOpen ? `${sidebarWidthPx - 12}px` : '14px',
  };
  const toggleTop = '84px';

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <button
        className="fixed z-50 hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-base shadow-lg transition-[left,top] duration-300 lg:flex"
        style={{ ...togglePosition, top: toggleTop }}
        onClick={() => setSidebarOpen(prev => !prev)}
        aria-label={isSidebarOpen ? 'Ocultar navegación' : 'Mostrar navegación'}
      >
        {isSidebarOpen ? '‹' : '☰'}
      </button>

      <aside
        className={clsx(
          'glass-panel fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-6 overflow-y-auto p-6 transition-transform duration-300',
          'bg-[var(--surface)]/95 backdrop-blur-lg',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Civic Pulse</h1>
          <button
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--text-muted)] shadow-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Ocultar navegación"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1 text-sm font-semibold">
          {navSections.map(section => (
            <Link
              key={section.id}
              href={section.href}
              className="block rounded-2xl px-3 py-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
              onClick={closeSidebarForMobile}
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <LazyMapPanel variant="compact" />

        <div className="mt-auto space-y-3 text-xs text-[var(--text-muted)]">
          <div className="space-y-2">
            {footerLinks.map(link => (
              <a key={link.label} href={link.href} className="block hover:text-[var(--text)]">
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-[var(--text-muted)]">© {currentYear} Civic Pulse. Derechos reservados.</p>
        </div>
      </aside>

      <div className={contentClasses}>
        <header className="glass-panel sticky top-0 z-20 flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex w-full items-center gap-3 lg:flex-1">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-base shadow-sm lg:hidden"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label={isSidebarOpen ? 'Ocultar navegación' : 'Mostrar navegación'}
            >
              {isSidebarOpen ? '✕' : '☰'}
            </button>
            <div className="relative flex-1">
              <input
                className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm"
                placeholder="Buscar trámites, foros o respuestas"
                aria-label="Buscar en Civic Pulse"
              />
              <button
                type="button"
                className="absolute right-2 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                aria-label="Buscar"
              >
                🔍
              </button>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-start gap-2 lg:w-auto lg:justify-end">
            <NotificationBell />
            <select
              className="rounded-full border border-[var(--border)] px-3 py-2 text-sm"
              value={language}
              onChange={event => setLanguage(event.target.value)}
              aria-label="Idioma de la interfaz"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className="rounded-full border border-[var(--border)] px-3 py-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Tema claro/oscuro"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {!isAuthenticated && (
              <>
                <button className="rounded-full border border-[var(--border)] px-3 py-2">Iniciar sesión</button>
                <button className="pill-button px-4 py-2">Crear cuenta</button>
              </>
            )}
            {isAuthenticated && (
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                >
                  <span className="h-8 w-8 rounded-full bg-[var(--accent-soft)] text-center text-sm font-semibold leading-8 text-[var(--text)]">
                    {profile.displayName.slice(0, 1)}
                  </span>
                  <span className="hidden text-left text-xs lg:block">
                    {profile.displayName}
                    <br />
                    <span className="text-[var(--text-muted)]">{profile.municipality}</span>
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="glass-panel absolute right-0 mt-2 w-56 space-y-2 p-4 text-sm">
                    <Link className="block" href="/perfil" onClick={() => setUserMenuOpen(false)}>
                      Mi perfil
                    </Link>
                    <button
                      className="block w-full text-left"
                      onClick={() => {
                        setPrefOpen(true);
                        setUserMenuOpen(false);
                      }}
                    >
                      Preferencias
                    </button>
                    <button className="block w-full text-left text-[var(--text-muted)]">Cerrar sesión</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>

        
      </div>

      <button
        className="pill-button fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 text-sm shadow-lg"
        onClick={() => setChatOpen(true)}
        aria-label="Abrir chat Civic Pulse"
      >
        💬 Civic Pulse
      </button>

      {isChatOpen && (
        <div className="fixed inset-0 z-40 flex min-h-full items-start justify-center overflow-y-auto bg-black/40 p-2 sm:items-center sm:p-6">
          <div className="glass-panel relative flex w-full max-w-md flex-col gap-4 rounded-3xl p-5 shadow-2xl sm:max-w-lg sm:p-6 max-h-[94vh]">
            <button
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-base shadow"
              onClick={() => setChatOpen(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
            <header className="mb-1 flex flex-col gap-1 pr-10">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Chat Cívico</p>
              <h2 className="text-lg font-semibold text-[var(--text)]">Asistente Municipal</h2>
            </header>
            {!isAuthenticated ? (
              <div className="space-y-3 text-sm text-[var(--text-muted)]">
                <p>Debes iniciar sesión para usar el chat de Civic Pulse.</p>
                <div className="flex flex-wrap gap-2">
                  <button className="pill-button px-4 py-2">Iniciar sesión</button>
                  <button className="rounded-full border border-[var(--border)] px-4 py-2">Crear cuenta</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <LazyChatPanel variant="embedded" />
              </div>
            )}
          </div>
        </div>
      )}

      {isPrefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="glass-panel mr-4 w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preferencias rápidas</h2>
              <button onClick={() => setPrefOpen(false)}>Cerrar</button>
            </div>
            <section className="space-y-4 text-sm">
              <article>
                <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">Tema</p>
                <div className="grid grid-cols-3 gap-2">
                  {themeChoices.map(option => (
                    <button
                      key={option.value}
                      className={clsx(
                        'rounded-xl border px-3 py-2',
                        theme === option.value
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                          : 'border-[var(--border)]',
                      )}
                      onClick={() => setTheme(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </article>

              <article>
                <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">Tamaño de fuente</p>
                <input
                  type="range"
                  min={0.9}
                  max={1.5}
                  step={0.05}
                  value={fontScale}
                  onChange={event => updateFontScale(parseFloat(event.target.value))}
                  className="w-full"
                />
              </article>

              <article className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span>Text-to-Speech</span>
                  <input
                    type="checkbox"
                    checked={accessibility.ttsEnabled}
                    onChange={event => updateAccessibility({ ttsEnabled: event.target.checked })}
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Lenguaje simplificado</span>
                  <input
                    type="checkbox"
                    checked={accessibility.simplifiedLanguage}
                    onChange={event => updateAccessibility({ simplifiedLanguage: event.target.checked })}
                  />
                </label>
              </article>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
