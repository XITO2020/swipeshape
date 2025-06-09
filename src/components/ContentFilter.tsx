import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Search, Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

interface ContentFilterProps {
  onSearch: (query: string) => void;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
}

const ContentFilter: React.FC<ContentFilterProps> = ({
  onSearch,
  onDateChange,
  placeholder = 'Rechercher...'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Utiliser un délai avant d'appeler l'API pour éviter les appels excessifs
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Si la recherche est vide, lancez-la immédiatement
    if (!query.trim()) {
      onSearch('');
      return;
    }
  };
  
  // Fonction pour soumettre la recherche manuellement
  const submitSearch = () => {
    onSearch(searchQuery);
  };
  
  // Gérer la soumission avec la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Empêcher le comportement par défaut
      submitSearch();
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
          />
          <button 
            onClick={submitSearch}
            className="absolute inset-y-0 right-0 px-3 flex items-center bg-violet-600 text-white rounded-r-md hover:bg-violet-700"
          >
            Rechercher
          </button>
        </div>

        {/* Date Picker */}
        <div className="relative flex items-center">
          <div className="absolute left-3 z-10">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            locale={fr}
            dateFormat="dd/MM/yyyy"
            placeholderText="Filtrer par date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
            isClearable
          />
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || selectedDate) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
              Recherche: {searchQuery}
            </span>
          )}
          {selectedDate && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
              Date: {selectedDate.toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentFilter;
