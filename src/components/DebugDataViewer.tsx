import React, { useState, useEffect } from 'react';
// Utiliser les fonctions d'API centralisées avec axios
import { getPrograms, getArticles, getEvents } from '../lib/api';

const DebugDataViewer: React.FC = () => {
  const [programsData, setProgramsData] = useState<any[]>([]);
  const [articlesData, setArticlesData] = useState<any[]>([]);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'programs' | 'articles' | 'events'>('programs');

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Récupération des programmes
      const programsResult = await getPrograms();
      console.log('DEBUG - Programmes récupérés:', programsResult);
      setProgramsData(programsResult.data || []);
      
      // Récupération des articles
      const articlesResult = await getArticles();
      console.log('DEBUG - Articles récupérés:', articlesResult);
      setArticlesData(articlesResult.data || []);
      
      // Récupération des événements
      const eventsResult = await getEvents();
      console.log('DEBUG - Événements récupérés:', eventsResult);
      setEventsData(eventsResult.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données de debug:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-white border border-gray-300 rounded-tl-lg shadow-lg z-50 max-w-xl max-h-[600px] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Visualisation des données</h3>
        <div className="space-x-2">
          <button
            className={`px-3 py-1 rounded ${activeTab === 'programs' ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('programs')}
          >
            Programmes ({programsData.length})
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === 'articles' ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('articles')}
          >
            Articles ({articlesData.length})
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === 'events' ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('events')}
          >
            Événements ({eventsData.length})
          </button>
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          onClick={loadData}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>
      
      <div className="overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 h-[300px]">
        {activeTab === 'programs' && (
          <pre className="text-xs">{JSON.stringify(programsData, null, 2)}</pre>
        )}
        {activeTab === 'articles' && (
          <pre className="text-xs">{JSON.stringify(articlesData, null, 2)}</pre>
        )}
        {activeTab === 'events' && (
          <pre className="text-xs">{JSON.stringify(eventsData, null, 2)}</pre>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</p>
        <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</p>
      </div>
    </div>
  );
};

export default DebugDataViewer;
