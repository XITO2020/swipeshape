import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import HeroVideo from '../components/HeroVideo';
import ProgramCard from '../components/ProgramCard';
import NewsletterForm from '../components/NewsletterForm';
import CommentSection from '../components/CommentSection';
import { Program, Article } from '../types';
import Thumbnails from '../components/Thumbnails';
import Link from 'next/link';
import axios from 'axios';

interface HomePageProps {
  useVideoHero?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ useVideoHero = false }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction pour charger les programmes avec fetch direct
    const fetchPrograms = async () => {
      try {
        console.log('Tentative de récupération des programmes...');
        const response = await fetch('/api/programs');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Programmes récupérés avec succès:', data);
        setPrograms(data || []);
      } catch (err: any) {
        console.error('Erreur lors du chargement des programmes:', err);
        setProgramsError(`Erreur: ${err?.message || 'Erreur inconnue'}`);
      } finally {
        setLoadingPrograms(false);
      }
    };

    // Fonction pour charger les articles avec fetch direct
    const fetchArticles = async () => {
      try {
        console.log('Tentative de récupération des articles...');
        const response = await fetch('/api/articles');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Articles récupérés avec succès:', data);
        setArticles(data || []);
      } catch (err: any) {
        console.error('Erreur détaillée articles:', err);
        setArticlesError(`Erreur lors du chargement des articles: ${err?.message || 'Erreur inconnue'}`);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchPrograms();
    fetchArticles();
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

            {loadingPrograms ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
              </div>
            ) : programsError ? (
              <div className="text-center py-10">
                <p className="text-red-500">{programsError}</p>
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

        {/* Articles Section */}
        <section className="py-16 bg-gradient-to-b from-white to-purple-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2 text-center">
              Nos derniers articles
            </h2>
            <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
              Découvrez nos conseils, astuces et témoignages pour vous accompagner dans votre transformation
            </p>
            
            {loadingArticles ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
              </div>
            ) : articlesError ? (
              <div className="text-center py-10">
                <p className="text-red-500">{articlesError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-violet-700 text-white rounded hover:bg-violet-800"
                >
                  Réessayer
                </button>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucun article disponible pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(0, 6).map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                    {article.image_url && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105" 
                        />
                      </div>
                    )}
                    <div className="p-5 flex-grow">
                      <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                      <div className="text-gray-600 mb-4 text-sm">
                        {new Date(article.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-700 mb-4" 
                        dangerouslySetInnerHTML={{ 
                          __html: article.content.substring(0, 120) + '...' 
                        }}>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-block w-full text-center py-2 px-4 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        Lire l'article
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-block py-2 px-6 bg-violet-700 text-white rounded-full hover:bg-violet-800 transition-colors"
              >
                Voir tous les articles
              </Link>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="relative mt-32 mb-32">
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
