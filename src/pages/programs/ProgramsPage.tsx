import React, { useEffect } from 'react';
import ProgramCard from '@/components/ProgramCard';
import { useAppStore } from '@/lib/store';
import { getPrograms } from '@/lib/supabase';

const ProgramsPage: React.FC = () => {
  const { programs, setPrograms } = useAppStore();

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data, error } = await getPrograms();
      if (error) {
        console.error('Error fetching programs:', error);
        return;
      }
      setPrograms(data || []);
    };

    fetchPrograms();
  }, [setPrograms]);

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Programme de Fitness</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Découvrez nos programmes de remise en forme conçus par des professionnels et adaptés aux femmes qui souhaitent développer leur masse musculaire et leur force.
        </p>
        
        {programs.length > 0 ? (
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