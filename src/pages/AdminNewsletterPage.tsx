import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import NewsletterEditor from '@/components/NewsletterEditor';
import { supabase } from '@/lib/supabase';

const AdminNewsletterPage: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    lastSentDate: null as string | null,
  });

  useEffect(() => {
    fetchNewsletterStats();
  }, []);

  const fetchNewsletterStats = async () => {
    try {
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('is_active, last_email_sent');

      if (subscribersError) throw subscribersError;

      const totalSubscribers = subscribers.length;
      const activeSubscribers = subscribers.filter(s => s.is_active).length;
      const lastSentDate = subscribers
        .map(s => s.last_email_sent)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      setStats({
        totalSubscribers,
        activeSubscribers,
        lastSentDate,
      });
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestion de la Newsletter</h1>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            <Plus size={20} />
            Nouvelle Newsletter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Abonnés</h3>
            <p className="text-3xl font-bold text-violet-600">{stats.totalSubscribers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Abonnés Actifs</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeSubscribers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Dernier Envoi</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.lastSentDate 
                ? new Date(stats.lastSentDate).toLocaleDateString()
                : 'Jamais'}
            </p>
          </div>
        </div>
      </div>

      {showEditor && <NewsletterEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
};

export default AdminNewsletterPage;
