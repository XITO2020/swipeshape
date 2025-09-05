// src/pages/blog/[slug].tsx
import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Props {
  title: string;
  content: string;
  slug: string;
  comments: Comment[];
}

interface Params extends ParsedUrlQuery {
  slug: string;
}

export const getServerSideProps: GetServerSideProps<Props, Params> = async ({ params }) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const slug = params?.slug as string;

  // Récupérer l'article
  const { data: articles, error: artErr } = await supabase
    .from('articles')
    .select('slug, title, content')
    .eq('slug', slug);

  const article = articles?.[0];
  if (artErr || !article) {
    return { notFound: true };
  }

  // Récupérer les commentaires associés
  const { data: rawComments, error: comErr } = await supabase
    .from('comments')
    .select('id, content, user_id ( name ), created_at')
    .eq('article_slug', slug)
    .order('created_at', { ascending: false });

  const comments: Comment[] = [];
  if (!comErr && rawComments) {
    for (const c of rawComments) {
      comments.push({
        id:         c.id,
        content:    c.content,
        authorName: (c.user_id as any)?.name ?? 'Anonyme',
        createdAt:  new Date(c.created_at).toISOString(),
      });
    }
  }

  return {
    props: {
      slug:     article.slug,
      title:    article.title,
      content:  article.content,
      comments,
    },
  };
};

export default function BlogPost({ title, content, comments }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Head>
        <title>{title} | Swipeshape Blog</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <article
        className="prose prose-lg"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Commentaires</h2>
        {comments.length === 0 ? (
          <p>Aucun commentaire pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id}>
                <p className="text-sm text-gray-600">
                  {comment.authorName} –{' '}
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                <p>{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
