import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../lib/supabase';
import { Upload } from 'lucide-react';

interface ArticleEditorProps {
  onClose: () => void;
  editArticle?: {
    id: string;
    title: string;
    content: string;
    image_url: string;
  };
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ onClose, editArticle }) => {
  const [title, setTitle] = useState(editArticle?.title || '');
  const [content, setContent] = useState(editArticle?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(editArticle?.image_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('article-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ text: 'Le titre et le contenu sont requis', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      let imageUrl = editArticle?.image_url || '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const articleData = {
        title,
        content,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      if (editArticle) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editArticle.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([{ ...articleData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      setMessage({ 
        text: `Article ${editArticle ? 'modifié' : 'créé'} avec succès !`, 
        type: 'success' 
      });

      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error saving article:', error);
      setMessage({ 
        text: `Erreur lors de la ${editArticle ? 'modification' : 'création'} de l'article`, 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {editArticle ? 'Modifier l\'article' : 'Créer un article'}
          </h2>
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
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de l'article"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image principale
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload size={20} />
                Choisir une image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>
            <div className="border border-gray-300 rounded-md">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="h-[400px] mb-12"
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
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
