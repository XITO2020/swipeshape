import { GetServerSideProps } from 'next';
import { prisma } from '../../lib/prisma';
import { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';

interface Props {
  title: string;
  content: string;
  slug: string;
  comments: {
    id: string;
    content: string;
    authorName: string;
    createdAt: string;
  }[];
}

interface Params extends ParsedUrlQuery {
  slug: string;
}

export const getServerSideProps: GetServerSideProps<Props, Params> = async ({ params }) => {
  const slug = params?.slug || '';

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      comments: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              name: true,
            },
          },
          createdAt: true,
        },
      },
    },
  });

  if (!article) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      slug: article.slug,
      title: article.title,
      content: article.content,
      comments: article.comments.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        authorName: comment.user?.name || 'Anonyme',
        createdAt: comment.createdAt.toString(),
      })),
    },
  };
};

export default function BlogPost({ title, content, comments, slug }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Head>
        <title>{title} | Swipeshape Blog</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <article className="prose prose-lg" dangerouslySetInnerHTML={{ __html: content }} />
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Commentaires</h2>
        {comments.length === 0 ? (
          <p>Aucun commentaire pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id}>
                <p className="text-sm text-gray-600">
                  {comment.authorName} – {new Date(comment.createdAt).toLocaleDateString()}
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
