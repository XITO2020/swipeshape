// src/pages/admin/comments.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Comment } from "../../types";
import Button from "../../components/ui/Button";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      try {
        const { data } = await axios.get<Comment[]>("/api/admin/comments");
        setComments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await axios.put("/api/admin/comments", { id, isApproved: true });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
    try {
      await axios.delete(`/api/admin/comments?id=${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
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
      <h1 className="text-3xl font-bold mb-6">Modération des Commentaires</h1>
      {comments.length === 0 ? (
        <p>Aucun commentaire en attente.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border p-4 rounded">
              <p className="text-gray-800 mb-2">{comment.content}</p>
              <div className="flex space-x-2">
                <Button variant="primary" onClick={() => handleApprove(comment.id)}>
                  Approuver
                </Button>
                <Button variant="danger" onClick={() => handleDelete(comment.id)}>
                  Supprimer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
