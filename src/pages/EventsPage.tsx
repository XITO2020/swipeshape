import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { searchEvents } from '../lib/supabase';
import ContentFilter from '../components/ContentFilter';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url?: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (query: string = '', date: Date | null = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await searchEvents(query, date);
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Une erreur est survenue lors du chargement des événements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (query: string) => {
    fetchEvents(query);
  };

  const handleDateChange = (date: Date | null) => {
    fetchEvents('', date);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Événements</h1>

      <ContentFilter
        onSearch={handleSearch}
        onDateChange={handleDateChange}
        placeholder="Rechercher des événements..."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          Aucun événement trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const { date, time } = formatEventDate(event.event_date);
            return (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    {event.title}
                  </h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{date} à {time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {event.description}
                  </p>

                  <button className="w-full px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors">
                    S'inscrire
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
