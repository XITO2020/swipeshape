// src/pages/admin/articles.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Article } from "../../types";
import Button from "../../components/ui/Button";
import { useAppStore } from "../../lib/store";
import api from "../../lib/api";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAppStore();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/admin/articles");
      return;
    }
    if (!isAdmin) {
      router.push("/");
      return;
    }

    async function loadArticles() {
      try {
        const { data } = await api.get<Article[]>("/api/admin/articles");
        setArticles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, [isAuthenticated, isAdmin, router]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article ?")) return;
    try {
      await api.delete(`/api/admin/articles?slug=${slug}`);
      setArticles((prev) => prev.filter((a) => a.slug !== slug));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Articles</h1>
      <Button variant="primary" onClick={() => router.push("/admin/articles/new")}>
        + Nouvel article
      </Button>
      {articles.length === 0 ? (
        <p className="mt-4">Aucun article pour le moment.</p>
      ) : (
        <table className="min-w-full bg-white mt-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Titre</th>
              <th className="py-2 px-4 border-b">Slug</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="py-2 px-4 border-b">{article.title}</td>
                <td className="py-2 px-4 border-b">{article.slug}</td>
                <td className="py-2 px-4 border-b space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/admin/articles/edit/${article.slug}`)}
                  >
                    Éditer
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(article.slug)}>
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
