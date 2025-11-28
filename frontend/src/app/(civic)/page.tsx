import CommunityFeed from '@/components/feed/CommunityFeed';
import { popularHighlights, trendingNews } from '@/data/feedInsights';

const sidebarCommunities = [
  { slug: 'usa/nacional', members: '43k' },
  { slug: 'cdmx/iztapalapa', members: '120k' },
  { slug: 'edomex/nezahualcoyotl', members: '98k' },
  { slug: 'oaxaca/telixtlahuaca', members: '21k' },
  { slug: 'nl/monterrey', members: '75k' },
];

export default function CivicDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2.7fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
      <span id="chat" className="sr-only" aria-hidden="true" />
      <CommunityFeed />
      <aside className="space-y-6">
        <section id="tendencias" className="glass-panel space-y-4 px-5 py-5">
          <header>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Noticias recientes</p>
            <h2 className="text-lg font-semibold">Radar de tendencias</h2>
          </header>
          <div className="divide-y divide-[var(--border)] text-sm">
            {trendingNews.map(item => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.community}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-emerald-500">{item.sentiment}</p>
                  <p className="text-[var(--text-muted)]">{item.comments} comentarios</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="popular" className="glass-panel space-y-4 px-5 py-5">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Lo más votado</p>
              <h2 className="text-lg font-semibold">Popular en tu región</h2>
            </div>
            <button className="text-xs text-[var(--accent)]">Ver todas</button>
          </header>
          <div className="space-y-3">
            {popularHighlights.map(post => (
              <article key={`popular-${post.id}`} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <p className="text-xs text-[var(--text-muted)]">{post.community}</p>
                <h3 className="text-base font-semibold">{post.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{post.summary}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>💬 {post.commentsCount}</span>
                  <span>↗ {post.shares} compartidos</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel space-y-3 px-5 py-5">
          <header>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Comunidades populares</p>
            <h2 className="text-lg font-semibold">Descubre más foros</h2>
          </header>
          <ul className="space-y-2 text-sm">
            {sidebarCommunities.map(group => (
              <li key={`side-${group.slug}`} className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3">
                <div>
                  <p className="font-semibold">{group.slug}</p>
                  <p className="text-xs text-[var(--text-muted)]">{group.members} miembros</p>
                </div>
                <button className="pill-button px-3 py-1 text-xs">Unirme</button>
              </li>
            ))}
          </ul>
          <button className="text-xs text-[var(--accent)]">Ver todas</button>
        </section>
      </aside>
    </div>
  );
}
