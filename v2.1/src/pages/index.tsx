import React, { useEffect, useState } from "react";
import { ToastSimple } from "../components/ToastSimple";
import { sendProgramPurchaseEmail } from "../lib/sendProgramPurchaseEmail.ts";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";

export default function Home() {
  const { isAuthenticated, user } = useAppStore();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; price: number }>>([]);

  useEffect(() => {
    async function fetchPrograms() {
      const res = await fetch("/api/programs");
      const data = await res.json();
      setPrograms(data);
    }
    fetchPrograms();
  }, []);

  async function handlePurchase(programId: string, programName: string) {
    if (!isAuthenticated || !user) {
      setToast({ message: "Veuillez vous connecter pour acheter un programme.", type: "error" });
      return;
    }

    const token = localStorage.getItem('token');
    
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ programId }),
    });

    if (res.ok) {
      const { downloadUrl } = await res.json();
      setToast({ message: `Achat réussi ! Un mail a été envoyé à ${user.email}.`, type: "success" });
      // Optionnel : envoyer le mail directement côté client, sinon l'API s'en charge
      // await sendProgramPurchaseEmail(user.email, programName, downloadUrl);
    } else {
      setToast({ message: "Erreur lors de l'achat, merci de réessayer.", type: "error" });
    }
  }

  return (
    <>
      <main>
        <h1>Programmes PDF à acheter</h1>
        {programs.length === 0 && <p>Aucun programme disponible pour le moment.</p>}
        <ul>
          {programs.map((p) => (
            <li key={p.id}>
              {p.name} — {p.price} €
              <button onClick={() => handlePurchase(p.id, p.name)}>Acheter</button>
            </li>
          ))}
        </ul>
      </main>

      {toast && <ToastSimple message={toast.message} type={toast.type} />}
    </>
  );
}
