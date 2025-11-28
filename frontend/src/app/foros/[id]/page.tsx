"use client";

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CommentNode } from '@/data/communityPosts';
import { communityPosts } from '@/data/communityPosts';

const getEngagementStats = (key: string) => {
  const seed = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    up: 30 + (seed % 60),
    down: seed % 8,
  };
};

function CommentThread({ nodes, depth = 0 }: { nodes: CommentNode[]; depth?: number }) {
  const [replyTarget, setReplyTarget] = useState<string | null>(null);

  if (!nodes?.length) {
    return null;
  }

  return (
    <div className={depth === 0 ? 'space-y-4' : 'mt-4 border-l border-[var(--border)] pl-4'}>
      {nodes.map((comment) => (
        <div key={comment.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">{comment.author}</span>
            {comment.role && <span className="rounded-full bg-[var(--border)] px-2 py-[2px] text-xs">{comment.role}</span>}
            <span>{comment.timeAgo}</span>
          </div>
          <p className="mt-2 text-sm text-[var(--text-primary)]">{comment.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--text-muted)]">
            {(() => {
              const stats = getEngagementStats(comment.id);
              return (
                <>
                  <button type="button" className="flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-primary)]">
                    ▲ {stats.up}
                  </button>
                  <button type="button" className="flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1">
                    ▼ {stats.down}
                  </button>
                </>
              );
            })()}
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-primary)]"
              onClick={() => setReplyTarget((current) => (current === comment.id ? null : comment.id))}
            >
              💬 Responder
            </button>
          </div>
          {replyTarget === comment.id && (
            <div className="mt-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/60 p-3">
              <textarea
                className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                rows={3}
                placeholder={`Responder a ${comment.author}`}
              />
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <button type="button" className="rounded-full bg-[var(--accent-soft)] px-4 py-1 text-[var(--accent-strong)]">
                  Publicar respuesta
                </button>
                <button type="button" className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-muted)]" onClick={() => setReplyTarget(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {comment.children && comment.children.length > 0 && (
            <CommentThread nodes={comment.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ForoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const post = communityPosts.find((item) => item.id === resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Volver al feed
        </Link>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">
          {post.community}
        </span>
      </div>

      <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-primary)]">{post.flair}</span>
          <span>{post.author}</span>
          <span>•</span>
          <span>{post.timeAgo}</span>
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{post.title}</h1>
        <p className="mt-2 text-base text-[var(--text-muted)]">{post.summary}</p>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-primary)]">{post.body}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-muted)]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Respuestas de la comunidad</h2>
          <span className="text-sm text-[var(--text-muted)]">{post.commentsCount} comentarios</span>
        </div>
        <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <textarea
            className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none"
            rows={3}
            placeholder="Añade tu respuesta"
          />
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button type="button" className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-[var(--accent-strong)]">
              Publicar
            </button>
          </div>
        </div>

        {post.commentTree.length > 0 ? (
          <div className="mt-4 space-y-4">
            <CommentThread nodes={post.commentTree} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-muted)]">Aún no hay comentarios en este foro.</p>
        )}
      </section>
    </div>
  );
}
