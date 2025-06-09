import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, Download, Mail } from 'lucide-react';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';
import axios from 'axios';

interface PurchaseDetails {
  programName: string;
  downloadUrl?: string;
  email: string;
  price?: string;
  date: string;
}

const ThankYouPage: React.FC = () => {
  const router = useRouter();
  const { user, addPurchasedProgram } = useAppStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);

  useEffect(() => {
    // Récupérer le session_id de l'URL
    const { session_id } = router.query;
    
    // Si session_id est présent, récupérer les détails de la session Stripe
    if (session_id && typeof session_id === 'string') {
      const fetchSessionDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/stripe/session-details?session_id=${session_id}`);
          
          if (response.data && response.data.purchase) {
            const { purchase, program } = response.data;
            
            // Mettre à jour le state local avec les détails de l'achat
            setPurchaseDetails({
              programName: program.name,
              email: purchase.user_email,
              price: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(program.price),
              date: new Date(purchase.created_at).toLocaleDateString('fr-FR'),
              downloadUrl: `/api/download/${purchase.download_token}`
            });
            
            // Ajouter le programme à la liste des achats de l'utilisateur
            addPurchasedProgram(program.id);
            
            // Afficher une notification de succès
            toast.success("Achat confirmé ! Un email de confirmation vous a été envoyé.");
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des détails de la session:', error);
          toast.error("Une erreur est survenue lors de la récupération des détails de votre achat");
        } finally {
          setLoading(false);
        }
      };
      
      fetchSessionDetails();
    } else {
      setLoading(false);
    }
  }, [router.query, addPurchasedProgram]);

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">
          Merci pour votre achat !
        </h1>
        
        {loading ? (
          <p className="text-xl text-gray-600 mb-6">Chargement des détails de votre achat...</p>
        ) : purchaseDetails ? (
          <div className="text-left p-6 bg-gray-50 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">Détails de votre commande</h2>
            
            <div className="space-y-3 mb-6">
              <p><span className="font-medium">Programme :</span> {purchaseDetails.programName}</p>
              {purchaseDetails.price && (
                <p><span className="font-medium">Prix :</span> {purchaseDetails.price}</p>
              )}
              <p><span className="font-medium">Date :</span> {purchaseDetails.date}</p>
              <p><span className="font-medium">Email :</span> {purchaseDetails.email}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {purchaseDetails.downloadUrl && (
                <a 
                  href={purchaseDetails.downloadUrl}
                  className="flex items-center justify-center px-5 py-2.5 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors text-sm"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger maintenant
                </a>
              )}
              
              <p className="flex items-center justify-center text-sm text-gray-500">
                <Mail size={16} className="mr-2 text-pink-500" />
                Une copie a été envoyée à votre email
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xl text-gray-600 mb-6">
            {user?.email ? (
              <>
                Nous avons envoyé un e-mail à <span className="font-medium">{user.email}</span> avec 
                les détails de votre commande et un lien de téléchargement de votre programme.
              </>
            ) : (
              <>
                Nous avons envoyé un e-mail à votre adresse avec les détails de votre commande
                et un lien de téléchargement de votre programme.
              </>
            )}
          </p>
        )}
        
        <p className="text-gray-500 mb-8">
          Si vous ne recevez pas l&apos;e-mail dans les 5 minutes, veuillez vérifier votre dossier de spam 
          ou contactez-nous à <a href="mailto:support@swipeshape.com" className="text-pink-600 hover:underline">
          support@swipeshape.com</a>
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
          <Link 
            href="/"
            className="flex items-center justify-center px-6 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retourner à l&apos;accueil
          </Link>
          
          <Link 
            href="/programs"
            className="flex items-center justify-center px-6 py-3 bg-white border border-pink-300 text-pink-700 rounded-full font-medium hover:bg-pink-50 transition-colors"
          >
            Découvrir d&apos;autres programmes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
