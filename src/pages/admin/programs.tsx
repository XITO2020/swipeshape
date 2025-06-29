// src/pages/admin/programs.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "../../components/ui/Button";
import { useAppStore } from "../../lib/store";
import api from "../../lib/api";
import axios from "axios";

interface Program {
  id: string;
  name: string;
  description: string;
  price: number;
  downloadUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
  
  // État pour l'envoi d'emails
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{success: boolean, message: string} | null>(null);

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

    async function loadInitialData() {
      try {
        setLoading(true);
        // Charger les programmes
        const programsResponse = await api.get<Program[]>("/api/admin/programs");
        setPrograms(programsResponse.data);
        
        // Charger les utilisateurs pour l'envoi d'emails
        const usersResponse = await api.get<User[]>("/api/admin/users");
        setUsers(usersResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
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
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Nom</th>
                <th className="border p-2 text-left">Prix</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="border p-2">{program.name}</td>
                  <td className="border p-2">{program.price} €</td>
                  <td className="border p-2 space-x-2">
                    <Button
                      onClick={() => handleEdit(program)}
                      size="sm"
                      variant="outline"
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedProgram(program);
                        setShowEmailModal(true);
                        setEmailSubject(`Votre programme: ${program.name}`);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      Envoyer par email
                    </Button>
                    <Button
                      onClick={() => handleDelete(program.id)}
                      size="sm"
                      variant="danger"
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal d'envoi d'email */}
      {showEmailModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Envoyer {selectedProgram.name} par email</h3>
            
            {emailStatus && (
              <div className={`p-3 mb-4 rounded ${emailStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {emailStatus.message}
              </div>
            )}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedProgram || !selectedUserId) return;
              
              setSendingEmail(true);
              setEmailStatus(null);
              
              try {
                const response = await axios.post('/api/admin/email-templates/send-program', {
                  userId: selectedUserId,
                  programId: selectedProgram.id,
                  subject: emailSubject,
                  message: emailMessage
                });
                
                setEmailStatus({
                  success: true,
                  message: 'Email envoyé avec succès!'
                });
                
                // Reset form after success
                setTimeout(() => {
                  setShowEmailModal(false);
                  setSelectedProgram(null);
                  setSelectedUserId('');
                  setEmailSubject('');
                  setEmailMessage('');
                  setEmailStatus(null);
                }, 2000);
              } catch (error: any) {
                setEmailStatus({
                  success: false,
                  message: `Erreur: ${error.response?.data?.error || error.message}`
                });
              } finally {
                setSendingEmail(false);
              }
            }}>
              <div className="mb-4">
                <label className="block mb-2">Destinataire</label>
                <select 
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Sélectionnez un utilisateur</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} {user.first_name && user.last_name ? `(${user.first_name} ${user.last_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2">Sujet</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2">Message (optionnel)</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Message personnalisé à inclure dans l'email"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedProgram(null);
                    setEmailStatus(null);
                  }}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
