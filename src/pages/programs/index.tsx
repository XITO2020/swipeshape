import React, { useEffect, useState } from 'react';
import ProgramCard from '../../components/ProgramCard';
import { useAppStore } from '../../lib/store';
// Utiliser l'API centralisée avec axios
import { getPrograms } from '../../lib/api';
import { Program } from '../../types';

const ProgramsPage: React.FC = () => {
  const { programs, setPrograms } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Vérifier si les variables d'environnement Supabase sont définies
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Variables d\'environnement Supabase manquantes');
          setError('Configuration de la base de données incomplète. Contactez l\'administrateur.');
          return;
        }

        const { data, error } = await getPrograms();
        
        if (error) {
          console.error('Erreur Supabase:', error);
          setError(`Erreur lors du chargement des programmes: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Erreur inconnue'}`);
          return;
        }
        
        console.log(`Programmes récupérés: ${data?.length || 0}`);
        // Stocker dans le store global
        setPrograms(data || []);
        // Stocker aussi localement pour assurer la persistance
        if (typeof window !== 'undefined') {
          localStorage.setItem('cachedPrograms', JSON.stringify(data || []));
        }
      } catch (err: any) {
        console.error('Erreur détaillée programmes:', err);
        setError(`Une erreur est survenue: ${err?.message || 'Erreur inconnue'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [setPrograms]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Programme de Fitness</h1>
        <p className="text-gray-600 mb-6 max-w-2xl">
          Découvrez nos programmes de remise en forme conçus par des professionnels et adaptés aux femmes qui souhaitent développer leur masse musculaire et leur force.
        </p>
        
        {/* Afficher les variables d'environnement en mode développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 p-4 mb-6 rounded-lg text-sm">
            <p>État de la configuration:</p>
            <ul className="list-disc ml-4">
              <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Non définie'}</li>
              <li>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Non définie'}</li>
              <li>USE_MOCK_DATA: {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? '⚠️ Oui (données fictives)' : '✅ Non (vraies données)'}</li>
            </ul>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            <p className="font-semibold">Erreur:</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
        
        {programs && programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Chargement des programmes...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsPage;
