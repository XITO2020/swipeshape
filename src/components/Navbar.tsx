import React from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isSignedIn } = useUser();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-violet-600">
          Swipeshape
        </Link>
        <div className="space-x-4">
          <Link href="/programs" className="text-gray-700 hover:text-violet-600">
            Programmes
          </Link>
          <Link href="/blog" className="text-gray-700 hover:text-violet-600">
            Blog
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-violet-600">
                Tableau de bord
              </Link>
              {user?.publicMetadata?.role === "admin" && (
                <Link href="/admin" className="text-gray-700 hover:text-violet-600">
                  Admin
                </Link>
              )}
              <UserButton afterSignOutUrl="/login" />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-violet-600">
                Connexion
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-violet-600">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
