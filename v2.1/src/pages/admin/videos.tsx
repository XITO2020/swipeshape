// src/pages/admin/videos.tsx
import React, { useEffect, useState } from "react";
import { Video } from "@/types";
import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";

interface NewVideo {
  url: string;
  title: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewVideo>({ url: "", title: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAppStore();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/admin/videos');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    
    async function loadVideos() {
      try {
        const { data } = await api.get<Video[]>("/api/admin/videos");
        setVideos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.title.trim() === "" || form.url.trim() === "") {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      const { data } = await api.post("/api/admin/videos", form);
      setVideos([data, ...videos]);
      setForm({ url: "", title: "" });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;

    try {
      await api.delete(`/api/admin/videos?id=${id}`);
      setVideos(videos.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite lors de la suppression");
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
      <h1 className="text-3xl font-bold mb-6">Gestion des Vidéos</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Titre de la vidéo"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="border px-3 py-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="URL (YouTube, TikTok, …)"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          className="border px-3 py-2 rounded w-full"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit">Ajouter la vidéo</Button>
      </form>
      {videos.length === 0 ? (
        <p>Aucune vidéo pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {videos.map((video) => (
            <li key={video.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{video.title}</p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 hover:underline"
                >
                  {video.url}
                </a>
              </div>
              <Button variant="danger" onClick={() => handleDelete(video.id)}>
                Supprimer
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
