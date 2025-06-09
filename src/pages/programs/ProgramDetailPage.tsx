import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { getProgram } from '../../lib/supabase';
import { Program } from '../../types';
import { useAppStore } from '../../lib/store';

const ProgramDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cart, addToCart } = useAppStore();

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Gérer le cas où id pourrait être un tableau de chaînes avec Next.js router
        const programId = Array.isArray(id) ? id[0] : id;
        const { data, error } = await getProgram(parseInt(programId));
        
        if (error) {
          throw error;
        }
        
        setProgram(data);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Failed to load the program. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  // Ensure we're properly typing cart items to avoid implicit 'any' types
  const isInCart = program ? cart.some((item: Program) => item.id === program.id) : false;

  const handleAddToCart = () => {
    if (program) {
      addToCart(program);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex items-center justify-center">
        <p className="text-gray-500">Détails des programmes en chargement...</p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">{error || 'Program not found'}</p>
        <Link 
          href="/programs"
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour à la séléction des programmes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link 
          href="/programs"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour à la séléction des programmes
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <img 
              src={program.image_url} 
              alt={program.title} 
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-purple-800 mb-4">{program.title}</h1>
            <p className="text-3xl font-bold text-pink-600 mb-6">${program.price}</p>
            
            <div className="prose prose-purple mb-8">
              <p>{program.description}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">What You'll Get:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-2 mt-0.5" />
                  <span>guide PDF de workout accompagné</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-2 mt-0.5" />
                  <span>Instructions d'exercice détaillées avec images</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-2 mt-0.5" />
                  <span>Recommandations nutritionnelles et idées de repas</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-2 mt-0.5" />
                  <span>Outils de suivi des progrès</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex items-center justify-center w-full py-3 px-6 rounded-full font-medium text-white ${
                isInCart 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } transition-colors`}
            >
              {isInCart ? (
                <>
                  <Check size={20} className="mr-2" />
                  Ajouté à votre séléction
                </>
              ) : (
                <>
                  <ShoppingCart size={20} className="mr-2" />
                  Voir votre séléction
                </>
              )}
            </button>
            
            {isInCart && (
              <Link
                href="/cart"
                className="flex items-center justify-center w-full mt-4 py-3 px-6 rounded-full font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
              >
                Voir votre séléction
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;