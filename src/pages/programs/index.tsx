import React, { useEffect, useState, useRef } from 'react';
import ProgramCard from '../../components/ProgramCard';
import { useAppStore } from '../../lib/store';
import { getPrograms } from '../../lib/api';
// Utilisation de la version SSR-safe pour getServerSideProps
import { ssrGetPrograms } from '../../lib/ssr-api';
import { Program } from '../../types';

// Server-side data fetching
export async function getServerSideProps() {
  try {
    // Fetch programs on the server side using the SSR-safe API implementation
    const { data, error } = await ssrGetPrograms();
    
    if (error) {
      console.error('Error fetching programs in getServerSideProps:', error);
      return { props: { initialPrograms: [] } };
    }
    
    return { props: { initialPrograms: data || [] } };
  } catch (err) {
    console.error('Exception in getServerSideProps:', err);
    return { props: { initialPrograms: [] } };
  }
}

interface ProgramsPageProps {
  initialPrograms?: Program[];
}

const ProgramsPage: React.FC<ProgramsPageProps> = ({ initialPrograms = [] }) => {
  const { programs, setPrograms } = useAppStore();
  const [isLoading, setIsLoading] = useState(!initialPrograms?.length);
  const [error, setError] = useState<string | null>(null);
  
  // Référence pour éviter les doubles initialisations
  const initializedRef = useRef(false);
  
  // Utilisation de useRef pour stabiliser la fonction fetchPrograms
  const fetchProgramsRef = useRef(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Supabase environment variables are defined
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Variables d\'environnement Supabase manquantes');
        setError('Configuration de la base de données incomplète. Contactez l\'administrateur.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await getPrograms();
      
      if (error) {
        console.error('Erreur Supabase:', error);
        setError(`Erreur lors du chargement des programmes: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Erreur inconnue'}`);
        setIsLoading(false);
        return;
      }
      
      console.log(`Programmes récupérés: ${data?.length || 0}`);
      
      // Comparaison profonde avant de mettre à jour le store pour éviter les boucles infinies
      const currentDataString = JSON.stringify(data || []);
      const existingDataString = JSON.stringify(programs);
      
      if (currentDataString !== existingDataString) {
        // Store in global store uniquement si les données ont changé
        setPrograms(data || []);
        // Also store locally for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('cachedPrograms', JSON.stringify(data || []));
        }
      } else {
        console.log('Les données des programmes sont identiques, mise à jour du store évitée');
      }
    } catch (err: any) {
      console.error('Erreur détaillée programmes:', err);
      setError(`Une erreur est survenue: ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  });

  // Set initial programs from server-side props if available
  useEffect(() => {
    // Éviter de réinitialiser plusieurs fois
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    
    // Check if we already have programs (either from SSR or previous fetch)
    if (initialPrograms.length > 0) {
      // Comparaison profonde avant de mettre à jour le store
      const initialDataString = JSON.stringify(initialPrograms);
      const existingDataString = JSON.stringify(programs);
      
      if (initialDataString !== existingDataString) {
        // Si des programmes sont déjà disponibles via SSR et différents de ceux du store
        setPrograms(initialPrograms);
      }
      
      setIsLoading(false);
      // Log pour debug sans créer de re-render
      console.log('Using server-side programs:', initialPrograms.length);
      return;
    }
    
    // Seulement si on n'a pas encore de programmes dans le state global
    if (programs.length === 0) {
      // Utilise la fonction fetchPrograms stable via useRef
      fetchProgramsRef.current();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendance vide pour éviter les re-renders multiples

  // Accès à la fonction fetchPrograms via la référence pour les cas où on veut la réutiliser
  const fetchPrograms = fetchProgramsRef.current;
  
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
        
        {/* Show environment variables in development mode */}
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
            <p className="text-gray-500">Aucun programme disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsPage;
