import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/router';
import EmailTemplateEditor from '@/components/admin/EmailTemplateEditor';
import EmailPreview from '@/components/admin/EmailPreview';

interface EmailConfig {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  created_at?: string;
}

const AdminEmailSettings: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAppStore();

  // États pour la configuration SMTP
  const [smtpConfig, setSmtpConfig] = useState<EmailConfig>({
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
    fromName: '',
    fromEmail: ''
  });

  // États pour les templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // États pour les tests
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, message: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification et les permissions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        router.push('/login?returnUrl=/admin/email-settings');
        return;
      }
      
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }
    }

    // Charger la configuration SMTP
    fetchSmtpConfig();
    
    // Charger les templates
    fetchTemplates();
  }, [isAuthenticated, isAdmin, router]);

  // Charger la configuration SMTP
  const fetchSmtpConfig = async () => {
    try {
      const response = await axios.get('/api/admin/email-config');
      if (response.data) {
        setSmtpConfig({
          host: response.data.host || '',
          port: response.data.port || '587',
          secure: response.data.secure === 'true',
          user: response.data.user || '',
          password: response.data.password || '',
          fromName: response.data.fromName || '',
          fromEmail: response.data.fromEmail || ''
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration SMTP:', error);
      setIsLoading(false);
    }
  };

  // Charger les templates d'email
  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/admin/email-templates');
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    }
  };

  // Gérer les changements de configuration SMTP
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setSmtpConfig(prev => ({ ...prev, [name]: checked }));
    } else {
      setSmtpConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  // Sauvegarder la configuration SMTP
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/admin/email-config', smtpConfig);
      setSendResult({
        success: true,
        message: 'Configuration SMTP sauvegardée avec succès'
      });
    } catch (error: any) {
      setSendResult({
        success: false,
        message: `Erreur lors de la sauvegarde: ${error.response?.data?.error || error.message}`
      });
    }
  };

  // Envoyer un email de test
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setSendResult({
        success: false,
        message: 'Veuillez saisir une adresse email de test'
      });
      return;
    }
    
    setIsSending(true);
    setSendResult(null);
    
    try {
      const response = await axios.post('/api/admin/test-email', {
        email: testEmail
      });
      
      setSendResult({
        success: true,
        message: `Email de test envoyé avec succès à ${testEmail}`
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

  // Gérer la sélection d'un template
  const handleSelectTemplate = (template: EmailTemplate | null) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    setIsCreatingNew(false);
  };

  // Gérer la sauvegarde d'un template
  const handleTemplateSave = (savedTemplate: EmailTemplate) => {
    // Actualiser la liste des templates
    fetchTemplates();
    
    // Sélectionner le template sauvegardé et quitter le mode édition
    setSelectedTemplate(savedTemplate);
    setIsEditing(false);
    setIsCreatingNew(false);
    
    // Afficher un message de succès
    setSendResult({
      success: true,
      message: `Template "${savedTemplate.name}" sauvegardé avec succès`
    });
  };

  // Supprimer un template
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/email-templates/${id}`);
      
      // Actualiser la liste et réinitialiser la sélection
      fetchTemplates();
      setSelectedTemplate(null);
      
      setSendResult({
        success: true,
        message: 'Template supprimé avec succès'
      });
    } catch (error: any) {
      setSendResult({
        success: false,
        message: `Erreur lors de la suppression: ${error.response?.data?.error || error.message}`
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Configuration des Emails</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Configuration des Emails</h1>
      
      {/* Message de résultat */}
      {sendResult && (
        <div className={`mb-6 p-4 rounded ${sendResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          {sendResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche: Configuration SMTP */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Configuration SMTP</h2>
            
            <form onSubmit={handleSaveConfig}>
              <div className="mb-4">
                <label className="block mb-1">Serveur SMTP</label>
                <input
                  type="text"
                  name="host"
                  className="w-full p-2 border rounded"
                  value={smtpConfig.host}
                  onChange={handleConfigChange}
                  placeholder="ex: smtp.gmail.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Port</label>
                <input
                  type="text"
                  name="port"
                  className="w-full p-2 border rounded"
                  value={smtpConfig.port}
                  onChange={handleConfigChange}
                  placeholder="ex: 587"
                  required
                />
              </div>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="secure"
                  id="secure"
                  className="mr-2"
                  checked={smtpConfig.secure}
                  onChange={handleConfigChange}
                />
                <label htmlFor="secure">Utiliser TLS/SSL</label>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Utilisateur SMTP</label>
                <input
                  type="text"
                  name="user"
                  className="w-full p-2 border rounded"
                  value={smtpConfig.user}
                  onChange={handleConfigChange}
                  placeholder="ex: votre@email.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Mot de passe SMTP</label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-2 border rounded"
                  value={smtpConfig.password}
                  onChange={handleConfigChange}
                  placeholder="••••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pour Gmail, utilisez un mot de passe d'application
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Nom d'expéditeur</label>
                <input
                  type="text"
                  name="fromName"
                  className="w-full p-2 border rounded"
                  value={smtpConfig.fromName}
                  onChange={handleConfigChange}
                  placeholder="ex: SwipeShape"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-1">Email d'expéditeur</label>
                <input
                  type="email"
                  name="fromEmail"
                  className="w-full p-2 border rounded"
                  value={smtpConfig.fromEmail}
                  onChange={handleConfigChange}
                  placeholder="ex: contact@swipeshape.com"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Sauvegarder la configuration
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test d'envoi</h2>
            
            <div className="mb-4">
              <label className="block mb-1">Email de test</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="ex: votre@email.com"
              />
            </div>
            
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              onClick={handleSendTestEmail}
              disabled={isSending || !testEmail}
            >
              {isSending ? 'Envoi en cours...' : 'Envoyer un email de test'}
            </button>
          </div>
        </div>
        
        {/* Colonne du milieu: Liste des templates */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Templates d'emails</h2>
              <button
                type="button"
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(false);
                  setIsCreatingNew(true);
                }}
              >
                Nouveau template
              </button>
            </div>
            
            {templates.length > 0 ? (
              <div className="space-y-2">
                {templates.map(template => (
                  <div 
                    key={template.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedTemplate?.id === template.id ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.subject}</div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {template.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun template disponible
              </div>
            )}
          </div>
        </div>
        
        {/* Colonne de droite: Détails du template sélectionné */}
        <div className="lg:col-span-1">
          {isCreatingNew ? (
            <EmailTemplateEditor 
              isNew={true}
              onSave={handleTemplateSave}
              onCancel={() => setIsCreatingNew(false)}
            />
          ) : isEditing && selectedTemplate ? (
            <EmailTemplateEditor 
              initialTemplate={selectedTemplate}
              onSave={handleTemplateSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : selectedTemplate ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                <div className="space-x-2">
                  <button 
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier
                  </button>
                  <button 
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="font-medium">Sujet:</div>
                <div className="p-2 bg-gray-50 rounded border mt-1">
                  {selectedTemplate.subject}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="font-medium mb-2">Aperçu:</div>
                <EmailPreview 
                  subject={selectedTemplate.subject}
                  content={selectedTemplate.content}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center h-full text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">Sélectionnez un template ou créez-en un nouveau</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSettings;
