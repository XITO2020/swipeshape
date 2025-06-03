import { createClient } from '@supabase/supabase-js';
import { Program, Article, Comment, Video } from '../types';
import { cidToUrl } from './pinata';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (data && data.avatar_url) {
    data.avatar_url = cidToUrl(data.avatar_url);
  }
  
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: { avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  return { data, error };
};

// Programs functions
export const getPrograms = async () => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      return {
        data: data.map(program => ({
          ...program,
          image_url: program.image_url ? cidToUrl(program.image_url) : null
        })),
        error: null
      };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error('Error fetching programs:', error);
    return { data: null, error };
  }
};

export const getProgram = async (id: number) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (data) {
    data.image_url = cidToUrl(data.image_url);
  }
  
  return { data, error };
};

export const createProgram = async (program: Omit<Program, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('programs')
    .insert([program])
    .select();
  return { data, error };
};

export const updateProgram = async (id: number, program: Partial<Program>) => {
  const { data, error } = await supabase
    .from('programs')
    .update(program)
    .eq('id', id)
    .select();
  return { data, error };
};

export const deleteProgram = async (id: number) => {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);
  return { error };
};

// Articles functions
export const getArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Convert IPFS CIDs to gateway URLs
  if (data) {
    data.forEach(article => {
      if (article.image_url) {
        article.image_url = cidToUrl(article.image_url);
      }
    });
  }
  
  return { data, error };
};

export const getArticle = async (id: number) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (data && data.image_url) {
    data.image_url = cidToUrl(data.image_url);
  }
  
  return { data, error };
};

export const createArticle = async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('articles')
    .insert([article])
    .select();
  return { data, error };
};

export const updateArticle = async (id: number, article: Partial<Article>) => {
  const { data, error } = await supabase
    .from('articles')
    .update(article)
    .eq('id', id)
    .select();
  return { data, error };
};

export const deleteArticle = async (id: number) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  return { error };
};

export const searchArticles = async (query: string = '', date: Date | null = null) => {
  try {
    let queryBuilder = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      queryBuilder = queryBuilder.gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching articles:', error);
    return { data: null, error };
  }
};

export const searchEvents = async (query: string = '', date: Date | null = null) => {
  try {
    let queryBuilder = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      queryBuilder = queryBuilder.gte('event_date', startDate.toISOString())
        .lte('event_date', endDate.toISOString());
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching events:', error);
    return { data: null, error };
  }
};

// Comments functions
export const getComments = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Convert IPFS CIDs to gateway URLs for avatars
  if (data) {
    data.forEach(comment => {
      if (comment.avatar_url) {
        comment.avatar_url = cidToUrl(comment.avatar_url);
      }
    });
  }
  
  return { data, error };
};

export const createComment = async (comment: Omit<Comment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select();
  return { data, error };
};

export const adminDeleteComment = async (id: number) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting comment by admin:', error);
    return { error };
  }
};

// Purchases functions
export const checkUserCanComment = async (userId: string) => {
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('payment_status', 'completed')
    .limit(1)
    .single();
  
  return { canComment: !!data, error };
};

// Newsletter functions
export const subscribeToNewsletter = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { 
          data: null, 
          error: 'Cette adresse email est déjà inscrite à notre newsletter.' 
        };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { 
      data: null, 
      error: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.' 
    };
  }
};

// Video functions

export const getVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // TODO: Handle potential IPFS CID to URL conversion for video_url and thumbnail_url if needed, similar to articles.
    // For now, returning raw data.
    // if (data) {
    //   return {
    //     data: data.map(video => ({
    //       ...video,
    //       video_url: video.video_url ? cidToUrl(video.video_url) : null, // Assuming cidToUrl exists and is relevant
    //       thumbnail_url: video.thumbnail_url ? cidToUrl(video.thumbnail_url) : null
    //     })),
    //     error: null
    //   };
    // }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { data: null, error };
  }
};

export const getVideo = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // TODO: Handle potential IPFS CID to URL conversion
    // if (data) {
    //   data.video_url = data.video_url ? cidToUrl(data.video_url) : null;
    //   data.thumbnail_url = data.thumbnail_url ? cidToUrl(data.thumbnail_url) : null;
    // }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching video:', error);
    return { data: null, error };
  }
};

export const createVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // TODO: Handle potential URL to IPFS CID conversion before insert if URLs are gateway URLs
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating video:', error);
    return { data: null, error };
  }
};

export const updateVideo = async (id: number, video: Partial<Video>) => {
  try {
    // TODO: Handle potential URL to IPFS CID conversion
    const { data, error } = await supabase
      .from('videos')
      .update(video)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating video:', error);
    return { data: null, error };
  }
};

export const deleteVideo = async (id: number) => {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { error };
  }
};

export const unsubscribeFromNewsletter = async (token: string) => {
  try {
    const { data, error } = await supabase
      .rpc('unsubscribe_newsletter', { token });

    if (error) throw error;

    return { success: data, error: null };
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de la désinscription. Veuillez réessayer.' 
    };
  }
};