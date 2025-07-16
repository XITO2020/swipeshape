import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from '../../styles/AdminDashboard.module.css';

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
      <main className={styles.dashboard}>
        <h1 className={styles.title}>Dashboard</h1>
        {loading && <p className={styles.loading}>Chargement des statistiques...</p>}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.grid}>
          {metrics.map((m, i) => (
            <Link href={m.link} key={i} className={styles.card} style={{ borderColor: m.color }}>
              <div className={styles.cardHeader} style={{ backgroundColor: m.color + '20' }}>
                {m.icon}
                <h2 className={styles.cardLabel}>{m.label}</h2>
              </div>
              <p className={styles.cardCount}>{m.count}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}