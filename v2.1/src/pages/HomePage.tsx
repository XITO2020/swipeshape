import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import HeroVideo from '../components/HeroVideo';
import ProgramCard from '../components/ProgramCard';
import NewsletterForm from '../components/NewsletterForm';
import CommentSection from '../components/CommentSection';
import { getPrograms } from '../lib/supabase';
import { Program } from '../types';
import Thumbnails from '../components/Thumbnails';

interface HomePageProps {
  useVideoHero?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ useVideoHero = false }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await getPrograms();
        if (error) {
          setError('Erreur lors du chargement des programmes');
          return;
        }
        setPrograms(data || []);
      } catch (err) {
        setError('Erreur lors du chargement des programmes');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen pt-16"> {/* Add min-height and padding for header */}
      {/* Hero Section */}
      {useVideoHero ? <HeroVideo /> : <HeroSlider />}

      {/* Main Content */}
      <div id="main-content" className="container mx-auto">
        {/* Programs Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gradient mb-2 text-center">
              Nos programmes minceur et fitness
            </h2>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              Transformez votre corps avec nos programmes de remise en forme conçus par des professionnels 
              et adaptés aux femmes qui souhaitent développer leur masse musculaire et leur force.
            </p>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-violet-700 text-white rounded hover:bg-violet-800"
                >
                  Réessayer
                </button>
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucun programme disponible pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Thumbnails Section */}
        <section className="py-16 bg-stone-100">
          <Thumbnails />
        </section>

        {/* Newsletter Section */}
        <section className="relative mt-64 mb-32">
          <svg width="0" height="0">
              <defs>
                <clipPath id="waveClipDefault" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.2 C0.1 0, 0.3 0.4, 0.6 0.2 V0.4 H0 Z" />
                </clipPath>
                <clipPath id="waveClipSmall" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.1 C0.05 0, 0.15 0.2, 0.3 0.1 V0.2 H0 Z" />
                </clipPath>
                <clipPath id="waveClipMedium" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.15 C0.075 0, 0.225 0.3, 0.45 0.15 V0.3 H0 Z" />
                </clipPath>
                <clipPath id="waveClipLarge" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.25 C0.125 0, 0.375 0.5, 0.75 0.25 V0.5 H0 Z" />
                </clipPath>
                <clipPath id="waveClipXLarge" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.3 C0.15 0, 0.45 0.6, 0.9 0.3 V0.6 H0 Z" />
                </clipPath>
              </defs>
            </svg>
          <div className="wave bg-gradient-to-r from-violet-300 via-pink-200 to-yellow-300"></div>
          <div className="newsletter-container pb-16 bg-gradient-to-r from-violet-300 via-pink-200 to-yellow-300">
            <NewsletterForm />
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-16">

          <div className="max-w-4xl mx-auto">
            <CommentSection />
          </div>

        </section>
      </div>
    </div>
  );
};

export default HomePage;
