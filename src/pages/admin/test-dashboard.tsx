import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';

interface Metric {
  label: string;
  count: number;
  link: string;
  color: string;
  icon: React.ReactNode;
}

const icons = {
  articles: <svg className={styles.icon} viewBox="0 0 24 24"><path d="M4 4h16v2H4zM4 8h16v2H4zM4 12h16v2H4z"/></svg>,
  programs: <svg className={styles.icon} viewBox="0 0 24 24"><path d="M12 2l4 4h-3v6h-2V6H8z"/></svg>,
  subscribers: <svg className={styles.icon} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22v-2c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v2"/></svg>,
  users: <svg className={styles.icon} viewBox="0 0 24 24"><path d="M16 7a4 4 0 10-8 0 4 4 0 008 0zm-8 9c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z"/></svg>,
  videos: <svg className={styles.icon} viewBox="0 0 24 24"><path d="M10 8l6 4-6 4V8z"/></svg>,
  comments: <svg className={styles.icon} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
};

export default function TestDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const endpoints = {
          articles: '/api/admin/articles',
          programs: '/api/admin/programs',
          subscribers: '/api/newsletter',
          users: '/api/admin/users',
          videos: '/api/admin/videos',
          comments: '/api/admin/comments'
        };
        const results = await Promise.all(Object.values(endpoints).map(url => fetch(url)));
        const datas = await Promise.all(results.map(res => res.json()));
        setMetrics([
          { label: 'Articles', count: datas[0].articles.length, link: '/admin/articles', color: '#6B46C1', icon: icons.articles },
          { label: 'Programs', count: datas[1].programs.length, link: '/admin/programs', color: '#2B6CB0', icon: icons.programs },
          { label: 'Subscribers', count: datas[2].subscribers?.length ?? 0, link: '/admin/newsletter', color: '#2F855A', icon: icons.subscribers },
          { label: 'Users', count: datas[3].users.length, link: '/admin/users', color: '#D69E2E', icon: icons.users },
          { label: 'Videos', count: datas[4].videos.length, link: '/admin/videos', color: '#DD6B20', icon: icons.videos },
          { label: 'Comments', count: datas[5].comments.length, link: '/admin/comments', color: '#E53E3E', icon: icons.comments }
        ]);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <main className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        {loading && <p className="text-gray-600 italic">Chargement des statistiques...</p>}
        {error && <p className="text-red-600 font-bold">{error}</p>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 p-4">
          {metrics.map((m, i) => (
            <Link href={m.link} key={i} className="bg-white rounded-lg p-6 shadow-sm transition-transform duration-200 hover:transform hover:-translate-y-1" style={{ borderColor: m.color }}>
              <div className="flex items-center gap-2 mb-4" style={{ backgroundColor: m.color + '20' }}>
                {m.icon}
                <h2 className="text-xl font-medium text-gray-800">{m.label}</h2>
              </div>
              <p className="text-2xl font-bold text-gray-900">{m.count}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}