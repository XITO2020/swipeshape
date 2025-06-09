// src/pages/programs/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Program } from "@/types";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";

export default function ProgramDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAppStore();

  useEffect(() => {
    async function loadProgram() {
      if (id) {
        try {
          const { data } = await axios.get<Program>(`/api/programs/${id}`);
          setProgram(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadProgram();
  }, [id]);

  const handleBuy = async () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post("/api/purchase", {
        programId: id,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const { sessionId } = res.data;
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
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

  if (!program) return <p>Programme non trouvé.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{program.name}</h1>
      <p className="text-gray-700 mb-8">Prix : {program.price} €</p>
      <button
        onClick={handleBuy}
        className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
      >
        {isAuthenticated ? "Acheter" : "Se connecter pour acheter"}
      </button>
    </div>
  );
}
