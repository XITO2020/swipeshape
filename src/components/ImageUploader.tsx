import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadFile, getPublicUrl } from '../lib/storage';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  label?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  currentImage, 
  label = 'Upload Image',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial image URL when component mounts or currentImage changes
  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload to Supabase Storage
      const { url } = await uploadFile(file, 'images', 'uploads');
      
      // Pass the URL to the parent component
      onImageUploaded(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      
      // Revert to previous image if upload fails
      if (currentImage) {
        setPreviewUrl(currentImage);
      } else {
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    const resetPreview = () => {
      setPreviewUrl(currentImage || null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    e.stopPropagation();
    resetPreview();
    onImageUploaded('');
  };

  return (
    <div className={`${className}`}>
      {label && <label className="block text-gray-700 mb-2">{label}</label>}
      
      <div 
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isUploading 
            ? 'border-purple-300 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
      >
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded-lg"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="py-4">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 size={32} className="text-purple-500 animate-spin mb-2" />
                <p className="text-purple-500">En chargement...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-500">Clic pour télécharger une image</p>
                <p className="text-gray-400 text-sm mt-1">De format PNG, JPG, GIF jusque 5MB</p>
              </div>
            )}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;