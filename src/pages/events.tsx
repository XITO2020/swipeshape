import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import ContentFilter from '../components/ContentFilter';
import axios from 'axios';

// Server-side data fetching
export async function getServerSideProps() {
  try {
    // Fetch events on the server side
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/events`);
    return { props: { initialEvents: response.data || [] } };
  } catch (err) {
    console.error('Exception in getServerSideProps for events:', err);
    return { props: { initialEvents: [] } };
  }
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url?: string;
}

interface EventsPageProps {
  initialEvents?: Event[];
}

const EventsPage: React.FC<EventsPageProps> = ({ initialEvents = [] }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(!initialEvents?.length);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (query: string = '', date: Date | null = null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construire les paramètres de requête
      const params: Record<string, string> = {};
      if (query) params.search = query;
      if (date) params.date = date.toISOString().split('T')[0];

      // Appeler l'API route Next.js
      const response = await axios.get('/api/events', { params });
      
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Une erreur est survenue lors du chargement des événements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Skip fetching if we already have events from server-side props
    if (initialEvents.length > 0) {
      console.log('Using server-side fetched events:', initialEvents.length);
      return;
    }
    
    fetchEvents();
  }, [initialEvents.length]);

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
