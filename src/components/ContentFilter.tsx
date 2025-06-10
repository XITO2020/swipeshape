import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';

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
  // État pour la recherche uniquement
  const [searchQuery, setSearchQuery] = useState('');
  
  // Gestionnaire simplifié pour la recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // Appliquer la recherche pour champs vides
    if (!e.target.value.trim()) {
      onSearch('');
    }
  };
  
  // Soumission du formulaire
  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchQuery);
  };
  
  // Gestionnaire simplifié pour la date (sans DatePicker)
  const handleDateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      // Aucun filtre de date
      onDateChange(null);
    } else {
      // Créer une date pour aujourd'hui, hier, semaine dernière, ou mois dernier
      const now = new Date();
      let dateFilter: Date | null = null;
      
      if (value === 'today') {
        dateFilter = now;
      } else if (value === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        dateFilter = yesterday;
      } else if (value === 'last-week') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        dateFilter = lastWeek;
      } else if (value === 'last-month') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        dateFilter = lastMonth;
      }
      
      onDateChange(dateFilter);
    }
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    }
  };
  
  // Pour afficher les filtres actifs
  const [activeDate, setActiveDate] = useState<string>('');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <form onSubmit={submitSearch} className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
          />
          <button 
            type="submit"
            className="absolute inset-y-0 right-0 px-3 flex items-center bg-violet-600 text-white rounded-r-md hover:bg-violet-700"
          >
            Rechercher
          </button>
        </div>

        {/* Remplacement du DatePicker par un select standard */}
        <div className="relative flex items-center">
          <div className="absolute left-3 z-10">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            onChange={(e) => {
              handleDateSelect(e);
              setActiveDate(e.target.options[e.target.selectedIndex].text);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm appearance-none"
            defaultValue=""
          >
            <option value="">Filtrer par date</option>
            <option value="today">Aujourd'hui</option>
            <option value="yesterday">Hier</option>
            <option value="last-week">7 derniers jours</option>
            <option value="last-month">30 derniers jours</option>
          </select>
        </div>
      </form>

      {/* Active Filters */}
      {(searchQuery || activeDate !== '') && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
              Recherche: {searchQuery}
            </span>
          )}
          {activeDate !== '' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
              Date: {activeDate}
              <button 
                onClick={() => {
                  onDateChange(null);
                  setActiveDate('');
                }} 
                className="ml-2 text-violet-600 hover:text-violet-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentFilter;
