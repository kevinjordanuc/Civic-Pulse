"use client";

import clsx from 'clsx';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { CommunityPost } from '@/data/communityPosts';

const communityFilters = [
  { value: 'todos', label: 'Todos los foros' },
  { value: 'cdmx/iztapalapa', label: 'CDMX / Iztapalapa' },
  { value: 'edomex/nezahualcoyotl', label: 'Edomex / Neza' },
  { value: 'oaxaca/telixtlahuaca', label: 'Oaxaca / Telixtlahuaca' },
  { value: 'nl/monterrey', label: 'NL / Monterrey' },
  { value: 'usa/nacional', label: 'USA / Nacional' },
];

type CommunityFeedClientProps = {
  posts: CommunityPost[];
};

export default function CommunityFeedClient({ posts }: CommunityFeedClientProps) {
  const [selectedCommunity, setSelectedCommunity] = useState('todos');
  const [sortOption, setSortOption] = useState<'popular' | 'recientes'>('popular');
  const [view, setView] = useState<'compact' | 'detallado'>('detallado');
  const [shareTarget, setShareTarget] = useState<string | null>(null);

  const getShareUrl = (postId: string) => {
    if (typeof window === 'undefined') return `/foros/${postId}`;
    return `${window.location.origin}/foros/${postId}`;
  };

  const copyShareLink = (postId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(getShareUrl(postId)).catch(() => undefined);
    }
    setShareTarget(null);
  };

  const openShareWindow = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setShareTarget(null);
  };

  const filteredPosts = useMemo(() => {
    let result = selectedCommunity === 'todos' ? posts : posts.filter(post => post.community === selectedCommunity);

    if (sortOption === 'recientes') {
      result = [...result].reverse();
    }
    return result;
  }, [posts, selectedCommunity, sortOption]);

  return (
    <div className="space-y-8">
      <section id="inicio" className="space-y-4">
        <div className="glass-panel flex flex-wrap items-center gap-4 px-5 py-4 text-xs">
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Comunidad</span>
            <select className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2" value={selectedCommunity} onChange={event => setSelectedCommunity(event.target.value)}>
              {communityFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Ordenar</span>
            <select
              className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2"
              value={sortOption}
              onChange={event => setSortOption(event.target.value as typeof sortOption)}
            >
              <option value="popular">Más populares</option>
              <option value="recientes">Más recientes</option>
            </select>
          </label>
          <div className="ml-auto rounded-2xl border border-[var(--border)]">
            {(['compact', 'detallado'] as const).map(option => (
              <button
                key={option}
                className={clsx('px-3 py-2 text-xs font-semibold', view === option ? 'bg-[var(--accent-soft)] text-[var(--text)]' : 'text-[var(--text-muted)]')}
                onClick={() => setView(option)}
              >
                {option === 'compact' ? 'Compacto' : 'Detallado'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPosts.map(item => (
            <article key={item.id} className="glass-panel px-5 py-4" id={item.id}>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text)]">{item.community}</span>
                  <span>•</span>
                  <span>{item.timeAgo}</span>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[var(--text)]">{item.flair}</span>
                </div>
                <Link href={`/foros/${item.id}`} className="text-lg font-semibold hover:underline">
                  {item.title}
                </Link>
                {view === 'detallado' && <p className="text-sm text-[var(--text-muted)]">{item.summary}</p>}
                {item.tags && (
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    {item.tags.map(tag => (
                      <span key={`${item.id}-${tag}`} className="rounded-full border border-[var(--border)] px-2 py-0.5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.source && (
                  <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
                    <p className="font-semibold text-[var(--text)]">{item.source.name}</p>
                    <p className="text-[var(--text-muted)]">{item.source.dataset}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[var(--text-muted)]">
                      <span>Actualizado: {item.source.lastUpdated}</span>
                      <span>Cobertura: {item.source.coverage}</span>
                    </div>
                    <a href={item.source.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[var(--accent)]">
                      Ver ficha oficial ↗
                    </a>
                  </div>
                )}
                <div className="relative flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-muted)]">
                  <Link className="rounded-full border border-[var(--border)] px-3 py-1" href={`/foros/${item.id}`}>
                    💬 {item.commentsCount} comentarios
                  </Link>
                  <button className="rounded-full border border-[var(--border)] px-3 py-1" onClick={() => setShareTarget(prev => (prev === item.id ? null : item.id))}>
                    🔗 Compartir
                  </button>
                  {shareTarget === item.id && (
                    <div className="absolute left-0 top-10 z-20 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs shadow-lg">
                      <p className="mb-2 text-[var(--text-muted)]">Compartir este foro</p>
                      <div className="space-y-2">
                        <button className="w-full rounded-xl border border-[var(--border)] px-3 py-1 text-left" onClick={() => copyShareLink(item.id)}>
                          Copiar enlace
                        </button>
                        <button
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-1 text-left"
                          onClick={() =>
                            openShareWindow(`https://wa.me/?text=${encodeURIComponent(item.title)}%20${encodeURIComponent(getShareUrl(item.id))}`)
                          }
                        >
                          WhatsApp
                        </button>
                        <button
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-1 text-left"
                          onClick={() =>
                            openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(getShareUrl(item.id))}`)
                          }
                        >
                          X / Twitter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="glass-panel flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
          <p className="text-[var(--text-muted)]">Página 1 de 12</p>
          <div className="flex items-center gap-2">
            {['1', '2', '3', '→'].map(page => (
              <button
                key={page}
                className={clsx('rounded-full border px-3 py-1', page === '1' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] text-[var(--text-muted)]')}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
