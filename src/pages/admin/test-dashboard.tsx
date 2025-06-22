import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Types pour les tests
type EntityType = 'articles' | 'programs' | 'purchases' | 'users' | 'comments' | 'videos' | 'events' | 'newsletter';
type ActionType = 'create' | 'read' | 'update' | 'delete' | 'list';

// Données de formulaire par défaut pour chaque entité
const defaultFormData: Record<EntityType, any> = {
  articles: {
    title: 'Test Article',
    content: 'Contenu de test pour l\'article',
    published: true,
    author_name: 'Admin Test',
    image_url: 'https://picsum.photos/800/600',
  },
  programs: {
    name: 'Programme Test',
    description: 'Description du programme de test',
    price: 99.99,
    duration: '8 semaines',
  },
  purchases: {
    user_email: 'test@example.com',
    product_id: '1234',
    amount: 99.99,
    status: 'completed',
  },
  users: {
    email: 'testuser@example.com',
    name: 'Utilisateur Test',
    role: 'user',
  },
  comments: {
    content: 'Commentaire de test',
    user_name: 'Utilisateur Test',
    article_id: '1234',
  },
  videos: {
    title: 'Vidéo Test',
    url: 'https://example.com/video.mp4',
    duration: 120,
  },
  events: {
    title: 'Événement Test',
    description: 'Description de l\'événement test',
    date: new Date().toISOString(),
    location: 'En ligne',
  },
  newsletter: {
    email: 'test@example.com',
    name: 'Abonné Test',
    subscribed: true,
  }
};

export default function TestDashboard() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('TEST_ADMIN_KEY_FOR_PREPRODUCTION');
  const [entity, setEntity] = useState<EntityType>('articles');
  const [action, setAction] = useState<ActionType>('list');
  const [id, setId] = useState('');
  const [formData, setFormData] = useState<any>(defaultFormData.articles);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Mettre à jour le formulaire lorsque l'entité change
  useEffect(() => {
    setFormData(defaultFormData[entity]);
  }, [entity]);

  // Récupérer les logs de test au chargement
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/admin/test-logs', {
        headers: { 'X-API-Key': apiKey }
      });
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/test-crud', {
        entity,
        action,
        id: id || undefined,
        data: formData
      }, {
        headers: { 'X-API-Key': apiKey }
      });
      
      setResponse(res.data);
      setTimeout(fetchLogs, 1000); // Rafraîchir les logs après l'action
    } catch (error: any) {
      setResponse({ error: error.response?.data || 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le statut CSS en fonction du statut du log
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard de Test CRUD - Préproduction</h1>
      
      {/* Formulaire de test */}
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Clé API Admin:</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Entité:</label>
              <select 
                value={entity}
                onChange={(e) => setEntity(e.target.value as EntityType)}
                className="w-full p-2 border rounded"
              >
                {Object.keys(defaultFormData).map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2">Action:</label>
              <select 
                value={action}
                onChange={(e) => setAction(e.target.value as ActionType)} 
                className="w-full p-2 border rounded"
              >
                <option value="create">Créer</option>
                <option value="read">Lire</option>
                <option value="update">Mettre à jour</option>
                <option value="delete">Supprimer</option>
                <option value="list">Lister</option>
              </select>
            </div>
          </div>
          
          {/* ID pour les opérations read, update et delete */}
          {(action === 'read' || action === 'update' || action === 'delete') && (
            <div>
              <label className="block mb-2">ID:</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}
          
          {/* Formulaire dynamique pour create et update */}
          {(action === 'create' || action === 'update') && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Données:</h3>
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block mb-1">{key}:</label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    name={key}
                    value={String(formData[key] || '')}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
          )}
          
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? 'Traitement en cours...' : 'Exécuter'}
          </button>
        </form>
      </div>
      
      {/* Résultat */}
      {response && (
        <div className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-3">Résultat:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Logs */}
      <div className="bg-white p-6 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Logs de test:</h2>
          <button 
            onClick={fetchLogs}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Rafraîchir
          </button>
        </div>
        
        <div className="overflow-auto max-h-[400px]">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Action</th>
                <th className="py-2 px-3 text-left">Statut</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">ID Résultat</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{log.action}</td>
                    <td className={`py-2 px-3 ${getStatusClass(log.status)}`}>{log.status}</td>
                    <td className="py-2 px-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3">{log.result_id || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    Aucun log disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
