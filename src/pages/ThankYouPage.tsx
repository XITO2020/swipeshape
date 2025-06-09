import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex items-center justify-center bg-purple-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        
        <h1 className="text-3xl font-bold text-purple-800 mb-3">Merci, bon développement à toi!</h1>
        
        <p className="text-gray-600 mb-6">
         Ta commande a été traitée avec succès. Le PDF a été envoyé sur ton adresse e-mail.
        </p>
        
        <div className="mb-8 p-4 bg-purple-100 rounded-lg">
          <p className="text-purple-700">
            ne pas oublier de vérifier ta boîte de réception (et le dossier spam) pour trouver l'e-mail de la part de Swipe-Shape contenant ton programme PDF.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/programs"
            className="flex items-center justify-center w-full py-3 px-6 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            Regarder les autres programmes
          </Link>
          
          <Link 
            href="/blog"
            className="flex items-center justify-center w-full py-3 px-6 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors"
          >
            Check nos nouveaux articles pour 2025 sur le blog !
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;