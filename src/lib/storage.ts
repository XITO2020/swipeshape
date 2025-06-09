import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name, defaults to 'images'
 * @param path - Optional subfolder path within the bucket
 * @returns The full URL to the uploaded file
 */
export const uploadFile = async (
  file: File,
  bucket: string = 'images',
  path?: string
): Promise<{ url: string; path: string }> => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Create a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Construct the file path
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Check if the storage bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find(b => b.name === bucket);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucket, {
        public: true // Make files publicly accessible
      });
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return { 
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading file to Supabase Storage:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param path - Path to the file in storage
 * @param bucket - The storage bucket name, defaults to 'images'
 * @returns Success status
 */
export const deleteFile = async (
  path: string,
  bucket: string = 'images'
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file from Supabase Storage:', error);
    return false;
  }
};

/**
 * List files in a Supabase Storage bucket
 * @param bucket - The storage bucket name, defaults to 'images'
 * @param path - Optional subfolder path within the bucket
 * @returns Array of files with metadata
 */
export const listFiles = async (
  bucket: string = 'images',
  path?: string
): Promise<any[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '', {
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing files from Supabase Storage:', error);
    return [];
  }
};

/**
 * Get public URL for a file in storage
 * @param path - Path to the file in storage
 * @param bucket - The storage bucket name, defaults to 'images'
 * @returns Public URL for the file
 */
export const getPublicUrl = (
  path: string,
  bucket: string = 'images'
): string => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};
