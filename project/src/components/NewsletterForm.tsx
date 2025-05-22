import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { subscribeToNewsletter } from '../lib/supabase';

interface NewsletterFormProps {}

const NewsletterForm: React.FC<NewsletterFormProps> = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const { error } = await subscribeToNewsletter(email);

    if (error) {
      setMessage({ text: error, type: 'error' });
    } else {
      setMessage({ 
        text: 'Merci de votre inscription ! Vous recevrez bientôt nos actualités.', 
        type: 'success' 
      });
      setEmail('');
    }

    setIsSubmitting(false);
  };

  return (
    <>

 
    <section className="nsl bg-gradient-to-r from-stone-100 via-orange-50 to-pink-100 py-10 sm:py-12 md:py-16 px-4 sm:px-6 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto text-center p-2">
        <Mail size={30} className="mx-auto text-violet-200 mb-3 sm:mb-4 sm:size-40" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient-deux mb-2 sm:mb-3">
          Restez au courant des news avec Swipe-Shape
        </h2>
        <p className="text-gradient-deux mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
          Abonnez-vous à notre newsletter pour des conseils de remise en forme exclusifs, des annonces de nouveaux programmes et des offres spéciales.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="flex-grow px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full bg-white/90 border border-transparent focus:border-violet-300 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-stone-200 text-gray-500 rounded-full font-medium hover:bg-violet-200 hover:text-violet-700 transition-colors duration-500 disabled:opacity-70"
            >
              {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </div>
          {message && (
            <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </section>
    </>
  );
};

export default NewsletterForm;