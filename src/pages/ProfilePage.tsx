import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store';
import { updateUserProfile } from '../lib/supabase';
import AvatarUploader from '../components/AvatarUploader';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateUserAvatar } = useAppStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [isAuthenticated, router, user]);

  const handleAvatarUploaded = async (url: string) => {
    if (!user) return;
    
    setAvatarUrl(url);
    setIsUpdating(true);
    setMessage(null);
    
    try {
      const { error } = await updateUserProfile(user.id, { avatar_url: url });
      
      if (error) {
        throw error;
      }
      
      updateUserAvatar(url);
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ 
        text: 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Votre Profil</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-full max-w-xs">
              <h2 className="text-xl font-semibold text-purple-700 mb-4 text-center md:text-left">Avatar</h2>
              <AvatarUploader 
                onAvatarUploaded={handleAvatarUploaded}
                currentAvatar={avatarUrl}
                size="lg"
              />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Information du compte</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Email</label>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Date de création du compte: </label>
                  <p className="text-gray-800 font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {message && (
                <div className={`mt-6 p-3 rounded-lg ${
                  message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;