// src/components/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-violet-600">
          Swipeshape
        </Link>
        <div className="space-x-4">
          <Link to="/programs" className="text-gray-700 hover:text-violet-600">
            Programmes
          </Link>
          <Link to="/blog" className="text-gray-700 hover:text-violet-600">
            Blog
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-violet-600">
                Tableau de bord
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="text-gray-700 hover:text-violet-600">
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-gray-700 hover:text-red-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-violet-600">
                Connexion
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-violet-600">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
