import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase';

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>
});

// Import the CSS only on the client side
const QuillCSS = () => {
  useEffect(() => {
    // This code only runs on the client
    import('react-quill/dist/quill.snow.css');
  }, []);
  return null;
};

interface NewsletterEditorProps {
  onClose: () => void;
}

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ onClose }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'link', 'image'
  ];

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      setMessage({ text: 'Le sujet et le contenu sont requis', type: 'error' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const { error } = await supabase.functions.invoke('weekly-newsletter', {
        body: { subject, content, manual: true }
      });

      if (error) throw error;

      setMessage({ 
        text: 'Newsletter envoyée avec succès !', 
        type: 'success' 
      });
      setSubject('');
      setContent('');
      
      // Close the editor after a short delay
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setMessage({ 
        text: 'Erreur lors de l\'envoi de la newsletter', 
        type: 'error' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <QuillCSS />
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Créer une Newsletter</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Entrez le sujet de la newsletter"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>
            <div className="h-[400px] border border-gray-300 rounded-md">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="h-[350px]"
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm ${
              message.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`}>
              {message.text}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={handleSendNewsletter}
              disabled={isSending}
              className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {isSending ? 'Envoi...' : 'Envoyer la newsletter'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default NewsletterEditor;
