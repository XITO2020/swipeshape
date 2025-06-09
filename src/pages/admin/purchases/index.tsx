import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useAppStore } from '../../../lib/store';
import { ArrowDownUp, Search, FileDown, RefreshCw, Mail } from 'lucide-react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Purchase {
  id: string;
  user_email: string;
  program_id: string;
  amount: number;
  payment_intent_id: string;
  download_token: string;
  download_count: number;
  download_limit: number;
  created_at: string;
  status: string;
  program_name?: string;
}

const AdminPurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user } = useAppStore();
  const router = useRouter();

  // Fonction pour récupérer tous les achats
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/purchases');
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Erreur lors de la récupération des achats:', error);
      toast.error('Impossible de charger les achats. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour renvoyer un email avec le lien de téléchargement
  const resendEmail = async (purchaseId: string) => {
    try {
      await axios.post('/api/admin/purchases/resend-email', { purchaseId });
      toast.success('Email de téléchargement renvoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Impossible d\'envoyer l\'email. Veuillez réessayer.');
    }
  };

  // Fonction pour réinitialiser le compteur de téléchargements
  const resetDownloadCounter = async (purchaseId: string) => {
    try {
      const response = await axios.post('/api/admin/purchases/reset-download', { purchaseId });
      if (response.data.success) {
        fetchPurchases(); // Rafraîchir les données
        toast.success('Compteur de téléchargement réinitialisé');
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du compteur:', error);
      toast.error('Impossible de réinitialiser le compteur. Veuillez réessayer.');
    }
  };

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/login?redirect=/admin/purchases');
      return;
    }
    
    fetchPurchases();
  }, [user, router]);

  // Filtrer les résultats selon le terme de recherche
  const filteredPurchases = purchases.filter((purchase) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      purchase.user_email.toLowerCase().includes(searchTermLower) ||
      purchase.program_name?.toLowerCase().includes(searchTermLower) ||
      purchase.payment_intent_id.toLowerCase().includes(searchTermLower) ||
      purchase.id.toLowerCase().includes(searchTermLower)
    );
  });

  // Trier les résultats
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (sortBy === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortBy === 'amount') {
      return sortOrder === 'asc' 
        ? a.amount - b.amount 
        : b.amount - a.amount;
    }
    
    if (sortBy === 'downloads') {
      return sortOrder === 'asc' 
        ? a.download_count - b.download_count 
        : b.download_count - a.download_count;
    }

    // Tri alphabétique par défaut
    const valA = String(a[sortBy as keyof Purchase] || '').toLowerCase();
    const valB = String(b[sortBy as keyof Purchase] || '').toLowerCase();
    return sortOrder === 'asc' 
      ? valA.localeCompare(valB) 
      : valB.localeCompare(valA);
  });

  // Fonction pour changer le tri
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <AdminLayout title="Gestion des achats">
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des achats ({purchases.length})
        </h1>
        
        <div className="flex gap-2">
          <button 
            onClick={() => fetchPurchases()} 
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <RefreshCw size={16} className="mr-1" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par email, programme, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Tableau des achats */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('user_email')}
                >
                  <div className="flex items-center">
                    Utilisateur
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('program_name')}
                >
                  <div className="flex items-center">
                    Programme
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center">
                    Montant
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('downloads')}
                >
                  <div className="flex items-center">
                    Téléchargements
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center">
                    Statut
                    <ArrowDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Chargement des achats...
                  </td>
                </tr>
              ) : sortedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Aucun achat trouvé
                  </td>
                </tr>
              ) : (
                sortedPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.program_name || `ID: ${purchase.program_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(purchase.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.download_count} / {purchase.download_limit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status === 'completed' ? 'Complété' : 
                         purchase.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/api/download/${purchase.download_token}`, '_blank')}
                          className="text-pink-600 hover:text-pink-900"
                          title="Télécharger le programme"
                        >
                          <FileDown size={18} />
                        </button>
                        <button
                          onClick={() => resendEmail(purchase.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Renvoyer l'email de téléchargement"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => resetDownloadCounter(purchase.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Réinitialiser le compteur de téléchargements"
                        >
                          <RefreshCw size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPurchases;
