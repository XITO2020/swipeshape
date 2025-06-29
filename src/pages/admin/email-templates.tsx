// src/pages/admin/email-templates.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAppStore } from '../../lib/store';
import Button from '../../components/ui/Button';

// Types d'emails supportés
const EMAIL_TYPES = [
  { id: 'welcome', name: 'Email de bienvenue' },
  { id: 'invoice', name: 'Email de facture' },
  { id: 'program_delivery', name: 'Email d\'envoi de programme' },
  { id: 'subscription_end', name: 'Email de fin d\'abonnement' },
];

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

const AdminEmailTemplates: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAppStore();
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  // État pour le formulaire d'édition
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: '',
  });
  
  // État pour les messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Chargement des données
  useEffect(() => {
    // Vérifier l'authentification et les permissions
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        router.push('/login?returnUrl=/admin/email-templates');
        return;
      }
      
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }
    }
    
    fetchTemplates();
  }, [isAuthenticated, isAdmin, router]);

  // Récupérer les templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/email-templates');
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des templates' });
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un template pour édition
  const selectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
    });
  };

  // Créer un nouveau template
  const createNewTemplate = (type: string) => {
    // Vérifier si ce type existe déjà
    const existingTemplate = templates.find(t => t.type === type);
    
    if (existingTemplate) {
      selectTemplate(existingTemplate);
      return;
    }
    
    const typeInfo = EMAIL_TYPES.find(t => t.id === type);
    
    setSelectedTemplate(null);
    setFormData({
      name: typeInfo ? typeInfo.name : `Nouveau template ${type}`,
      subject: '',
      content: getDefaultTemplate(type),
      type: type,
    });
  };

  // Obtenir un template par défaut selon le type
  const getDefaultTemplate = (type: string) => {
    switch (type) {
      case 'welcome':
        return `
<h1>Bienvenue sur SwipeShape, {'{'}'{'}userName{'}'}{'}'}</h1>
<p>Nous sommes ravis de vous compter parmi nos membres.</p>
<p>Vous pouvez dès maintenant accéder à tous nos services premium.</p>
<p>N'hésitez pas à nous contacter si vous avez des questions.</p>
<p>Cordialement,<br>L'équipe SwipeShape</p>
`;
      case 'invoice':
        return `
<h1>Votre facture SwipeShape</h1>
<p>Bonjour {'{'}'{'}userName{'}'}{'}'}</p>
<p>Nous vous confirmons le paiement de votre abonnement.</p>
<p><strong>Montant:</strong> {'{'}'{'}amount{'}'{'}'}</p>
<p><strong>Date:</strong> {'{'}'{'}date{'}'{'}'}</p>
<p><strong>Référence:</strong> {'{'}'{'}reference{'}'{'}'}</p>
<p>Merci pour votre confiance.</p>
<p>Cordialement,<br>L'équipe SwipeShape</p>
`;
      case 'program_delivery':
        return `
<h1>Votre programme SwipeShape</h1>
<p>Bonjour {'{'}'{'}userName{'}'}{'}'}</p>
<p>Voici votre programme <strong>{'{'}'{'}programName{'}'{'}'}</strong>.</p>
<p>{'{'}'{'}programDescription{'}'{'}'}</p>
<p>{'{'}'{'}message{'}'{'}'}</p>
<p>Vous trouverez le programme en pièce jointe de cet email.</p>
<p>Cordialement,<br>L'équipe SwipeShape</p>
`;
      case 'subscription_end':
        return `
<h1>Fin de votre abonnement SwipeShape</h1>
<p>Bonjour {'{'}'{'}userName{'}'}{'}'}</p>
<p>Votre abonnement SwipeShape arrive à échéance le {'{'}'{'}endDate{'}'{'}'}</p>
<p>Pour continuer à profiter de tous nos services, nous vous invitons à renouveler votre abonnement.</p>
<p><a href="{'{'}'{'}renewLink{'}'{'}'}">Cliquez ici pour renouveler</a></p>
<p>Cordialement,<br>L'équipe SwipeShape</p>
`;
      default:
        return '';
    }
  };

  // Gérer les changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (selectedTemplate) {
        // Mettre à jour un template existant
        response = await axios.put('/api/admin/email-templates', {
          id: selectedTemplate.id,
          ...formData
        });
      } else {
        // Créer un nouveau template
        response = await axios.post('/api/admin/email-templates', formData);
      }
      
      setMessage({ type: 'success', text: 'Template sauvegardé avec succès' });
      fetchTemplates();
      
      // Si c'était un nouveau template, sélectionner le template créé
      if (!selectedTemplate && response.data) {
        setSelectedTemplate(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde du template' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Templates d'emails</h1>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-wrap -mx-2 mb-8">
        {EMAIL_TYPES.map((type) => (
          <div key={type.id} className="px-2 mb-4">
            <Button 
              onClick={() => createNewTemplate(type.id)}
              variant="outline"
              className="w-full"
            >
              {type.name}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Templates existants</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="bg-white shadow rounded-lg p-4">
              {templates.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {templates.map((template) => {
                    const typeInfo = EMAIL_TYPES.find(t => t.id === template.type);
                    return (
                      <li key={template.id} className="py-3">
                        <button
                          onClick={() => selectTemplate(template)}
                          className={`w-full text-left px-3 py-2 rounded-md ${selectedTemplate?.id === template.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{typeInfo?.name || template.type}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500">Aucun template trouvé.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">
            {selectedTemplate ? 'Modifier le template' : 'Nouveau template'}
          </h2>
          
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du template
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type d'email
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={!!selectedTemplate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                {EMAIL_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet de l'email
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu HTML
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Variables disponibles: {'{'}'{'}userName{'}'{'}'}, {'{'}'{'}amount{'}'{'}'}, {'{'}'{'}date{'}'{'}'}, etc.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" className="px-6">
                {selectedTemplate ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailTemplates;
