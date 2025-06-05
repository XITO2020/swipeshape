// src/components/AdminDashboard.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/articles"
          className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 text-center"
        >
          Gérer les articles
        </Link>
        <Link
          to="/admin/videos"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
        >
          Gérer les vidéos
        </Link>
        <Link
          to="/admin/users"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
        >
          Gérer les utilisateurs
        </Link>
        <Link
          to="/admin/comments"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-center"
        >
          Modérer les commentaires
        </Link>
      </div>
    </div>
  );
}
