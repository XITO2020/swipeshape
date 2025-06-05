// src/pages/admin/programs.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";

interface Program {
  id: string;
  name: string;
  description: string;
  price: number;
  downloadUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAppStore();
  
  // Form state for adding/editing programs
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Partial<Program>>({
    name: "",
    description: "",
    price: 0,
    downloadUrl: "",
    thumbnailUrl: ""
  });

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/admin/programs");
      return;
    }
    if (!isAdmin) {
      router.push("/");
      return;
    }

    async function loadPrograms() {
      try {
        const { data } = await api.get<Program[]>("/api/admin/programs");
        setPrograms(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, [isAuthenticated, isAdmin, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce programme ?")) return;
    try {
      await api.delete(`/api/admin/programs?id=${id}`);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (program: Program) => {
    setCurrentProgram(program);
    setIsEditing(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProgram({
      ...currentProgram,
      [name]: name === "price" ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProgram.id) {
        // Update existing program
        await api.put("/api/admin/programs", currentProgram);
        setPrograms((prev) =>
          prev.map((p) => (p.id === currentProgram.id ? { ...p, ...currentProgram } as Program : p))
        );
      } else {
        // Create new program
        const { data } = await api.post("/api/admin/programs", currentProgram);
        setPrograms((prev) => [...prev, data]);
      }
      
      // Reset form
      setCurrentProgram({
        name: "",
        description: "",
        price: 0,
        downloadUrl: "",
        thumbnailUrl: ""
      });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des programmes</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {currentProgram.id ? "Modifier un programme" : "Ajouter un nouveau programme"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1">Nom</label>
            <input
              type="text"
              name="name"
              value={currentProgram.name}
              onChange={handleFormChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={currentProgram.description}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block mb-1">Prix (€)</label>
            <input
              type="number"
              name="price"
              value={currentProgram.price}
              onChange={handleFormChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">URL de téléchargement</label>
            <input
              type="url"
              name="downloadUrl"
              value={currentProgram.downloadUrl}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">URL de la miniature</label>
            <input
              type="url"
              name="thumbnailUrl"
              value={currentProgram.thumbnailUrl}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit">
              {currentProgram.id ? "Mettre à jour" : "Créer"}
            </Button>
            
            {isEditing && (
              <Button
                onClick={() => {
                  setCurrentProgram({
                    name: "",
                    description: "",
                    price: 0,
                    downloadUrl: "",
                    thumbnailUrl: ""
                  });
                  setIsEditing(false);
                }}
                variant="outline"
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Liste des programmes</h2>
      {programs.length === 0 ? (
        <p>Aucun programme trouvé</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Prix</th>
                <th className="px-4 py-2 border">Date de création</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id}>
                  <td className="px-4 py-2 border">{program.name}</td>
                  <td className="px-4 py-2 border">{program.price} €</td>
                  <td className="px-4 py-2 border">
                    {new Date(program.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEdit(program)} size="sm">
                        Modifier
                      </Button>
                      <Button onClick={() => handleDelete(program.id)} variant="danger" size="sm">
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
