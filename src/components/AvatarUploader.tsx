import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { uploadFile } from '../lib/storage';

interface AvatarUploaderProps {
  onAvatarUploaded: (url: string) => void;
  currentAvatar?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ 
  onAvatarUploaded, 
  currentAvatar, 
  size = 'md',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial avatar URL when component mounts or currentAvatar changes
  useEffect(() => {
    if (currentAvatar) {
      setAvatarUrl(currentAvatar);
    }
  }, [currentAvatar]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar size should be less than 2MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file);
      setAvatarUrl(localPreview);

      // Upload to Supabase Storage
      const { url } = await uploadFile(file, 'avatars', 'users');
      
      // Pass the URL to the parent component
      onAvatarUploaded(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload avatar. Please try again.');
      
      // Revert to previous avatar if upload fails
      if (currentAvatar) {
        setAvatarUrl(currentAvatar);
      } else {
        setAvatarUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      <div 
        onClick={triggerFileInput}
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden cursor-pointer border-2 border-purple-200 mx-auto`}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-100">
            <User size={size === 'lg' ? 48 : size === 'md' ? 32 : 24} className="text-purple-400" />
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 size={24} className="text-white animate-spin" />
          ) : (
            <Camera size={24} className="text-white" />
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
      
      <p className="mt-2 text-xs text-gray-500 text-center">
        Clic ici pour télécharger une nouvelle image
      </p>
    </div>
  );
};

export default AvatarUploader;