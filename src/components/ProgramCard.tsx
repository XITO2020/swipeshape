import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Program } from '../types';
import { useAppStore } from '../lib/store';

interface ProgramCardProps {
  program: Program;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const { addToCart } = useAppStore();

  const handleAddToCart = () => {
    addToCart(program);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 overflow-hidden">
        <img 
          src={program.image_url} 
          alt={program.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-purple-800 mb-2">{program.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-pink-600">${program.price}</span>
          <div className="flex space-x-2">
            <Link 
              href={`/programs/${program.id}`}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              Details
            </Link>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;