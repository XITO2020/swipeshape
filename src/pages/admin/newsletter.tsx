import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAppStore } from '../../lib/store';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

interface NewsletterTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
}

const AdminNewsletter: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAppStore();
  
  // États pour les abonnés
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  
  // États pour les templates
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // États pour l'envoi de newsletter
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, message: string} | null>(null);
  
  // États pour la programmation
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<{success: boolean, message: string} | null>(null);

  // Chargement des données
  useEffect(() => {
    // Vérifier l'authentification et les permissions
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        router.push('/login?returnUrl=/admin/newsletter');
        return;
      }
      
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }
    }
    
    fetchSubscribers();
    fetchTemplates();
  }, [isAuthenticated, isAdmin, router]);

  // Récupérer les abonnés
  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const response = await axios.get('/api/newsletter/subscribers');
      setSubscribers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnés:', error);
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  // Récupérer les templates
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await axios.get('/api/newsletter/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Gérer la sélection d'un template
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setContent(template.content);
      }
    }
  };

  // Envoyer une newsletter
  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);
    
    try {
      const response = await axios.post('/api/newsletter/send', {
        subject,
        content
      });
      
      setSendResult({
        success: true,
        message: `Newsletter envoyée avec succès à ${response.data.recipientCount} abonnés.`
      });
      
    } catch (error: any) {
      setSendResult({
        success: false,
        message: `Erreur lors de l'envoi: ${error.response?.data?.error || error.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  // Programmer une newsletter
  const handleScheduleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    setScheduleResult(null);
    
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    try {
      const response = await axios.post('/api/newsletter/schedule', {
        subject,
        content,
        scheduledAt: scheduledDateTime.toISOString()
      });
      
      setScheduleResult({
        success: true,
        message: `Newsletter programmée pour le ${scheduledDate} à ${scheduledTime}.`
      });
      
    } catch (error: any) {
      setScheduleResult({
        success: false,
        message: `Erreur lors de la programmation: ${error.response?.data?.error || error.message}`
      });
    } finally {
      setIsScheduling(false);
    }
  };

  // Sauvegarder un template
  const handleSaveTemplate = async () => {
    try {
      const templateName = window.prompt('Nom du template:');
      if (!templateName) return;
      
      await axios.post('/api/newsletter/templates', {
        name: templateName,
        subject,
        content
      });
      
      fetchTemplates();
      alert('Template sauvegardé avec succès.');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
      alert('Erreur lors de la sauvegarde du template.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administration Newsletter</h1>
      
      {/* Section Abonnés */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Abonnés ({subscribers.length})</h2>
        {isLoadingSubscribers ? (
          <p>Chargement des abonnés...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Date d'inscription</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length > 0 ? (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b">
                      <td className="px-4 py-2">{sub.email}</td>
                      <td className="px-4 py-2">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-white ${sub.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                          {sub.is_active ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center">Aucun abonné pour le moment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      
      {/* Section Création/Envoi de Newsletter */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Créer et envoyer une newsletter</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Utiliser un template :</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedTemplate}
            onChange={handleTemplateChange}
          >
            <option value="">-- Sélectionner un template --</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
        
        <form onSubmit={handleSendNewsletter}>
          <div className="mb-4">
            <label className="block mb-2">Sujet:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Contenu (HTML):</label>
            <textarea
              className="w-full p-2 border rounded h-64 font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isSending}
            >
              {isSending ? 'Envoi en cours...' : 'Envoyer maintenant'}
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleSaveTemplate}
            >
              Sauvegarder comme template
            </button>
          </div>
        </form>
        
        {sendResult && (
          <div className={`mt-4 p-3 rounded ${sendResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {sendResult.message}
          </div>
        )}
      </section>
      
      {/* Section Programmation */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Programmer un envoi</h2>
        
        <form onSubmit={handleScheduleNewsletter}>
          <div className="mb-4">
            <label className="block mb-2">Date:</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Heure:</label>
            <input
              type="time"
              className="w-full p-2 border rounded"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
            disabled={isScheduling || !subject || !content || !scheduledDate || !scheduledTime}
          >
            {isScheduling ? 'Programmation en cours...' : 'Programmer l\'envoi'}
          </button>
        </form>
        
        {scheduleResult && (
          <div className={`mt-4 p-3 rounded ${scheduleResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {scheduleResult.message}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminNewsletter;
