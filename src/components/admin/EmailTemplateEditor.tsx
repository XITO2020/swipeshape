import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes de rendu côté serveur
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  created_at?: string;
}

interface EmailTemplateEditorProps {
  initialTemplate?: EmailTemplate;
  onSave?: (template: EmailTemplate) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

const EMAIL_TEMPLATE_TYPES = [
  { value: 'welcome', label: 'Email de bienvenue' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'invoice', label: 'Facture' },
  { value: 'reset_password', label: 'Réinitialisation de mot de passe' },
  { value: 'custom', label: 'Personnalisé' },
];

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onCancel,
  isNew = false
}) => {
  const [template, setTemplate] = useState<EmailTemplate>({
    id: initialTemplate?.id || '',
    name: initialTemplate?.name || '',
    subject: initialTemplate?.subject || '',
    content: initialTemplate?.content || '<p>Écrivez le contenu de votre email ici...</p>',
    type: initialTemplate?.type || 'custom'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<{tag: string, description: string}[]>([]);

  // Charger les balises disponibles en fonction du type d'email
  useEffect(() => {
    // Balises communes à tous les types d'email
    const commonTags = [
      { tag: '{{siteUrl}}', description: 'URL du site' },
      { tag: '{{currentYear}}', description: 'Année courante' },
      { tag: '{{unsubscribeUrl}}', description: 'Lien de désabonnement' }
    ];
    
    // Balises spécifiques selon le type
    let typeTags: {tag: string, description: string}[] = [];
    
    switch(template.type) {
      case 'welcome':
        typeTags = [
          { tag: '{{firstName}}', description: 'Prénom' },
          { tag: '{{lastName}}', description: 'Nom' },
          { tag: '{{email}}', description: 'Email' }
        ];
        break;
      case 'newsletter':
        typeTags = [
          { tag: '{{name}}', description: 'Nom de l\'abonné' },
          { tag: '{{email}}', description: 'Email' },
        ];
        break;
      case 'invoice':
        typeTags = [
          { tag: '{{firstName}}', description: 'Prénom' },
          { tag: '{{lastName}}', description: 'Nom' },
          { tag: '{{invoiceNumber}}', description: 'Numéro de facture' },
          { tag: '{{invoiceDate}}', description: 'Date de facture' },
          { tag: '{{amount}}', description: 'Montant' },
          { tag: '{{downloadLink}}', description: 'Lien de téléchargement' }
        ];
        break;
      case 'reset_password':
        typeTags = [
          { tag: '{{firstName}}', description: 'Prénom' },
          { tag: '{{resetLink}}', description: 'Lien de réinitialisation' },
          { tag: '{{expiryTime}}', description: 'Délai d\'expiration' }
        ];
        break;
    }
    
    setAvailableTags([...commonTags, ...typeTags]);
  }, [template.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setTemplate(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!template.name || !template.subject || !template.content) {
      setError('Tous les champs sont requis');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let response;
      
      if (isNew) {
        response = await axios.post('/api/admin/email-templates', template);
      } else {
        response = await axios.put(`/api/admin/email-templates/${template.id}`, template);
      }
      
      if (onSave) {
        onSave(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde du template');
      console.error('Erreur:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertTag = (tag: string) => {
    // Insérer la balise à la position du curseur dans l'éditeur
    // Note: Cette fonctionnalité nécessiterait une référence à l'éditeur Quill
    // Pour cette version simplifiée, on ajoute simplement à la fin du contenu actuel
    setTemplate(prev => ({
      ...prev,
      content: prev.content + ' ' + tag
    }));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        {isNew ? 'Nouveau Template Email' : 'Modifier Template Email'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Type de template</label>
          <select
            name="type"
            className="w-full p-2 border rounded"
            value={template.type}
            onChange={handleInputChange}
          >
            {EMAIL_TEMPLATE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Nom du template</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border rounded"
            value={template.name}
            onChange={handleInputChange}
            placeholder="ex: Newsletter Mensuelle"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Sujet de l'email</label>
          <input
            type="text"
            name="subject"
            className="w-full p-2 border rounded"
            value={template.subject}
            onChange={handleInputChange}
            placeholder="ex: Votre newsletter mensuelle de SwipeShape"
            required
          />
        </div>
        
        <div className="mb-2">
          <label className="block mb-1">Balises disponibles</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {availableTags.map(tag => (
              <button
                key={tag.tag}
                type="button"
                className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
                onClick={() => handleInsertTag(tag.tag)}
                title={tag.description}
              >
                {tag.tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic">
            Cliquez sur une balise pour l'insérer dans votre contenu
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block mb-1">Contenu HTML</label>
          {typeof window !== 'undefined' && (
            <ReactQuill
              theme="snow"
              modules={modules}
              value={template.content}
              onChange={handleEditorChange}
              className="bg-white border rounded min-h-[300px]"
            />
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={isSaving}
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? 'Sauvegarde...' : (isNew ? 'Créer' : 'Mettre à jour')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailTemplateEditor;
