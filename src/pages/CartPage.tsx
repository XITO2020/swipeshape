import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { useAppStore } from '../lib/store';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, isAuthenticated } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=cart');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // In a real app, this would be where you'd integrate with Stripe or another payment processor
      alert('Payment successful! The PDF has been sent to your email.');
      clearCart();
      router.push('/thank-you');
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link 
          href="/programs"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Continuer vos achats
        </Link>
        
        <h1 className="text-3xl font-bold text-purple-800 mb-6">votre séléction</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-10 bg-purple-50 rounded-xl">
            <p className="text-gray-600 mb-4">Il n'y a pas de programme séléctionné, ni d'article</p>
            <Link 
              href="/programs"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
            >
              Choisissez le programme qui vous convient
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 w-full md:w-24 h-24 mb-4 md:mb-0">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow md:ml-6">
                      <h3 className="text-lg font-medium text-purple-800">{item.title}</h3>
                      <p className="text-gray-500 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 md:mt-0">
                      <span className="text-xl font-bold text-pink-600">${item.price}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-purple-800">${calculateTotal()}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="flex items-center justify-center w-full py-3 px-6 rounded-full font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-70"
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2" />
                    Passer au paiement
                  </>
                )}
              </button>
              
              {!isAuthenticated && (
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Connectez-vous ou inscrivez-vous pour recevoir votre séléction
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;