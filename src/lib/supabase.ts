import { createClient } from '@supabase/supabase-js';
import { Program, Article, Comment, Event, User, Video, Test, TestQuestion, UserTestResult } from '@/types';
import { mockArticles, mockEvents, mockPrograms, mockUsers, mockVideos, mockTests, mockTestQuestions, mockUserTestResults } from '../lib/mockData';
const URL   = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Créer le client Supabase avec la configuration recommandée par Supabase
export const supabase      = createClient(URL, ANON)
export const supabaseAdmin = createClient(URL, ADMIN)

// Flag to control whether to use mock data
const USE_MOCK_DATA = false;




// Log pour confirmer l'initialisation
console.log('Client Supabase initialisé');

// Test de connexion au chargement pour vérifier si tout fonctionne
// Note: Suppression du test côté client pour éviter les erreurs CORS
// Si vous avez besoin de vérifier la connexion, faites-le à travers une API route Next.js
// comme /api/test-supabase-connection qui fera l'appel côté serveur

// Helper function to log and handle errors consistently
const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  return { data: null, error };
};

// Auth functions - using server API route to avoid CORS issues
export const signUp = async (email: string, password: string, userData = {}) => {
  try {
    console.log('Client: Sending signup request to API route');
    // Simplifier la structure des options pour éviter les imbrications inutiles
    const response = await fetch('/api/auth/supabase-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signUp',
        email,
        password,
        // Passer directement les données utilisateur comme options.data
        options: {
          data: userData
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server returned error:', errorData);
      return { data: null, error: errorData.error || 'Server error' };
    }
    
    const result = await response.json();
    console.log('Client: Signup result:', result);
    
    // Vérification explicite des données de réponse
    if (result.error) {
      console.error('Error from API route:', result.error);
      return { data: null, error: result.error };
    }
    
    if (!result.data?.user) {
      console.error('Invalid response format:', result);
      return { data: null, error: { message: 'Invalid response format' } };
    }
    
    return result;
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Client: Sending signin request to API route');
    const response = await fetch('/api/auth/supabase-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signIn',
        email,
        password
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server returned error:', errorData);
      return { data: null, error: errorData.error || 'Server error' };
    }
    
    const result = await response.json();
    console.log('Client: Signin result:', result);
    
    // Vérification explicite des données de réponse
    if (!result.data?.user) {
      console.error('Invalid response format:', result);
      return { data: null, error: { message: 'Invalid response format' } };
    }
    
    return result;
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const response = await fetch('/api/auth/supabase-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signOut'
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { error: new Error(result.error || 'Erreur lors de la déconnexion') };
    }

    return { error: null };
  } catch (error) {
    console.error('Signout error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// User functions
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getUsers');
  }
};

export const getUser = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getUser');
  }
};

export const createUser = async (user: Omit<User, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'createUser');
  }
};

export const updateUser = async (id: string, user: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'updateUser');
  }
};

export const deleteUser = async (id: string) => {
  try {
    // Delete associated data first
    await supabase.from('user_test_results').delete().eq('user_id', id);
    await supabase.from('comments').delete().eq('user_id', id);
    
    // Then delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'deleteUser');
  }
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  // URLs from Supabase Storage are already complete URLs
  // No conversion needed
  
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
  // Log détaillé pour le débogage
  console.log('getPrograms() appelé - URL Supabase:', supabase);
  
  if (USE_MOCK_DATA) {
    console.log('Using mock programs');
    return { data: mockPrograms, error: null };
  }

  try {
    console.log('Fetching programs from Supabase...');
    console.log('Tentative de récupération des programmes depuis Supabase...');
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });
      
    console.log('Réponse Supabase programmes:', { error, count: data?.length });
    if (error) console.error('Erreur Supabase programmes détaillée:', error);

    if (error) {
      console.error('Supabase returned an error fetching programs:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} programs`);
    
    if (data) {
      // Transform data if needed
      data.forEach(program => {
        if (program.image_url) {
          // No need for cidToUrl with Supabase Storage URLs which are complete
          console.log('Program image URL:', program.image_url.substring(0, 30) + '...');
        }
      });
    }

    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getPrograms');
  }
};

export const getProgram = async (id: number) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();
  
  // URLs from Supabase Storage are already complete URLs
  // No conversion needed
  
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
  // Log détaillé pour le débogage
  console.log('getArticles() appelé - URL Supabase:', supabase);
  
  if (USE_MOCK_DATA) {
    console.log('Using mock articles');
    return { data: mockArticles, error: null };
  }

  // Otherwise get data from Supabase
  console.log('Fetching articles from Supabase...');
  try {
    console.log('Tentative de récupération des articles depuis Supabase...');
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Réponse Supabase articles:', { error, count: data?.length });
    if (error) console.error('Erreur Supabase articles détaillée:', error);
    
    if (error) {
      console.error('Supabase error getting articles:', error.message);
      // Return empty array instead of throwing to avoid breaking the UI
      return { data: [], error: error.message };
    }

    console.log(`Successfully fetched ${data?.length || 0} articles from Supabase`);
    
    // Ensure all necessary fields are present and properly formatted
    if (data) {
      data.forEach(article => {
        // Ensure image_url is properly formatted or provide a default
        if (!article.image_url) {
          article.image_url = '/images/placeholder-article.jpg'; // Fallback image
        }
        // Ensure all required fields are present
        if (!article.author) {
          article.author = 'SwipeShape Team';
        }
        if (!article.updated_at) {
          article.updated_at = article.created_at;
        }
      });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getArticles:', error);
    // Return empty array to prevent UI from breaking
    return { data: [], error: error as Error };
  }
};

export const getArticle = async (id: number) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();
  
  // URLs from Supabase Storage are already complete URLs
  // No conversion needed
  
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
  console.log(`Searching articles with query: "${query}"${date ? ` and date: ${date}` : ''}`);
  
  // If mock data is enabled, filter mock articles
  if (USE_MOCK_DATA) {
    console.log('Using mock data for article search');
    try {
      let filteredArticles = [...mockArticles];
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredArticles = filteredArticles.filter(article => 
          article.title.toLowerCase().includes(lowerQuery) || 
          article.content.toLowerCase().includes(lowerQuery)
        );
      }
      
      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        filteredArticles = filteredArticles.filter(article => {
          const articleDate = new Date(article.created_at);
          return articleDate >= startDate && articleDate <= endDate;
        });
      }
      
      console.log(`Found ${filteredArticles.length} mock articles matching criteria`);
      return { data: filteredArticles, error: null };
    } catch (error) {
      console.error('Error searching mock articles:', error);
      return { data: mockArticles, error: null };
    }
  }

  // Otherwise search in Supabase
  try {
    console.log('Searching articles in Supabase database...');
    let queryBuilder = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (query && query.trim() !== '') {
      // Sécuriser la requête en échappant les caractères spéciaux
      const safeQuery = query.replace(/[%_]/g, m => `\\${m}`);
      queryBuilder = queryBuilder.or(`title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`);
      console.log(`Added search filter for: "${safeQuery}"`);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      queryBuilder = queryBuilder.gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      console.log(`Added date filter: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Supabase error searching articles:', error.message);
      // Au lieu de lever une exception, retournons un tableau vide
      return { data: [], error: error.message };
    }
    
    console.log(`Search returned ${data?.length || 0} articles from Supabase`);
    
    // S'assurer que tous les champs nécessaires sont présents
    if (data) {
      data.forEach(article => {
        // Corriger les chemins d'images
        if (!article.image_url || article.image_url.includes('/assets/images/reelles/')) {
          // Mapper les noms de fichiers aux images disponibles dans le public/images
          const imageMap: Record<string, string> = {
            'nutrition.jpg': '/images/nutrition.jpg',
            'sport.jpg': '/images/fitness.jpg',
            'foodsport.jpg': '/images/food.jpg',
            'stress.jpg': '/images/wellness.jpg',
            // Ajouter d'autres mappings au besoin
          };
          
          if (article.image_url) {
            // Extraire le nom du fichier du chemin complet
            const fileName = article.image_url.split('/').pop();
            // Utiliser le mapping ou une image par défaut
            article.image_url = fileName && imageMap[fileName] ? 
              imageMap[fileName] : 
              '/images/placeholder-article.jpg';
          } else {
            // Si pas d'image du tout
            article.image_url = '/images/placeholder-article.jpg';
          }
        }
        
        // S'assurer que tous les champs requis sont présents
        if (!article.author) {
          article.author = 'SwipeShape Team';
        }
        if (!article.updated_at) {
          article.updated_at = article.created_at;
        }
      });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in searchArticles:', error);
    // Retourner un tableau vide pour éviter de casser l'UI
    return { data: [], error: error as Error };
  }
};

export const searchEvents = async (query: string = '', date: Date | null = null) => {
  // If mock data is enabled, filter mock events
  if (USE_MOCK_DATA) {
    console.log('Searching in mock events data');
    try {
      let filteredEvents = [...mockEvents];
      
      // Skip past events
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      filteredEvents = filteredEvents.filter(event => new Date(event.event_date) >= now);
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(lowerQuery) || 
          event.description.toLowerCase().includes(lowerQuery) ||
          event.location.toLowerCase().includes(lowerQuery)
        );
      }
      
      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.event_date);
          return eventDate >= startDate && eventDate <= endDate;
        });
      }
      
      // Calculate days left for each event
      filteredEvents.forEach(event => {
        const eventDate = new Date(event.event_date);
        const today = new Date();
        const diffTime = Math.abs(eventDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        Object.assign(event, { daysLeft: diffDays });
      });
      
      return { data: filteredEvents, error: null };
    } catch (error) {
      console.error('Error searching mock events:', error);
      return { data: mockEvents, error: null };
    }
  }

  // Otherwise search in Supabase
  try {
    console.log('Searching events in Supabase with query:', query);
    console.log('Searching events with query:', query, 'and date:', date ? date.toISOString() : 'none');
    
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

    if (error) {
      console.error('Supabase returned an error fetching events:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} events`);
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'searchEvents');
  }
};

// Comments functions
export const getComments = async () => {
  // Log for debugging
  console.log('getComments() appelé - URL Supabase:', supabase);
  
  if (USE_MOCK_DATA) {
    console.log('Attention: Mock data not implemented for comments. Fetching from database...');
  }

  try {
    console.log('Fetching comments from Supabase...');
    console.log('Tentative de récupération des commentaires depuis Supabase...');
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Réponse Supabase commentaires:', { error, count: data?.length });
    if (error) console.error('Erreur Supabase commentaires détaillée:', error);

    if (error) {
      console.error('Supabase returned an error fetching comments:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} comments`);
    
    // Process avatar URLs if needed
    if (data) {
      data.forEach(comment => {
        if (comment.avatar_url) {
          // URLs from Supabase Storage are already complete URLs
          console.log('Comment has avatar URL:', comment.avatar_url.substring(0, 30) + '...');
        }
      });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getComments():', error);
    return { data: [], error };
  }
};

export const createComment = async (comment: Omit<Comment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select();
  return { data, error };
};

// Comments management functions
export const updateComment = async (id: number, updates: Partial<Comment>) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'updateComment');
  }
};

export const deleteComment = async (id: number) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'deleteComment');
  }
};

// Purchases functions
export const checkUserCanComment = async (userId: string, programId?: string) => {
  try {
    let query = supabase
      .from('purchases')
      .select('id, program_id')
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    if (programId) {
      // Si un programId est spécifié, vérifier que l'utilisateur a acheté ce programme spécifique
      query = query.eq('program_id', programId);
    }
    
    const { data, error } = await query.limit(1);
    
    if (error) throw error;
    
    return { canComment: data && data.length > 0, error: null, programIds: data?.map(p => p.program_id) || [] };
  } catch (error) {
    console.error('Erreur lors de la vérification des achats:', error);
    return { canComment: false, error, programIds: [] };
  }
};

// Videos functions
export const getVideos = async () => {
  try {
    console.log('Fetching videos...');
    if (USE_MOCK_DATA) {
      console.log('Using mock data for videos');
      return { data: mockVideos, error: null };
    }
    
    console.log('Fetching videos from Supabase...');
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase returned an error fetching videos:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} videos`);
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getVideos');
  }
};

export const getVideo = async (id: string) => {
  try {
    console.log(`Fetching video with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Using mock data for video');
      const video = mockVideos.find(v => v.id === id);
      return { data: video || null, error: video ? null : new Error('Video not found') };
    }
    
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getVideo');
  }
};

export const createVideo = async (video: Omit<Video, 'id' | 'created_at'>) => {
  try {
    console.log('Creating new video:', video);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Video creation simulated');
      const mockId = String(Date.now());
      const newVideo = {
        id: mockId,
        ...video,
        created_at: new Date().toISOString(),
      };
      return { data: newVideo, error: null };
    }
    
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'createVideo');
  }
};

export const updateVideo = async (id: string, video: Partial<Video>) => {
  try {
    console.log(`Updating video with id ${id}:`, video);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Video update simulated');
      return { data: { id, ...video }, error: null };
    }
    
    const { data, error } = await supabase
      .from('videos')
      .update(video)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'updateVideo');
  }
};

export const deleteVideo = async (id: string) => {
  try {
    console.log(`Deleting video with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Video deletion simulated');
      return { data: true, error: null };
    }
    
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'deleteVideo');
  }
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

export const unsubscribeFromNewsletter = async (token: string) => {
  try {
    // Validate token
    const { data, error } = await supabase
      .from('newsletters')
      .select('id')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error validating newsletter token:', error);
      return { success: false, message: 'Invalid token', error };
    }
    
    // Delete the record
    const { error: deleteError } = await supabase
      .from('newsletters')
      .delete()
      .eq('token', token);

    if (deleteError) {
      console.error('Error unsubscribing from newsletter:', deleteError);
      return { success: false, message: 'Failed to unsubscribe', error: deleteError };
    }

    return { success: true, message: 'Successfully unsubscribed', error: null };
  } catch (error) {
    console.error('Error in unsubscribeFromNewsletter:', error);
    return { success: false, message: 'An unexpected error occurred', error };
  }
};

// Tests functions
export const getTests = async () => {
  try {
    console.log('Fetching tests...');
    if (USE_MOCK_DATA) {
      console.log('Using mock data for tests');
      return { data: mockTests, error: null };
    }
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getTests');
  }
};

export const getTest = async (id: number) => {
  try {
    console.log(`Fetching test with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Using mock data for test');
      const test = mockTests.find(t => t.id === id);
      if (!test) return { data: null, error: new Error('Test not found') };
      
      // Get test questions from mock data
      const questions = mockTestQuestions.filter(q => q.test_id === id);
      const testWithQuestions = {
        ...test,
        questions: questions || []
      };
      
      return { data: testWithQuestions, error: null };
    }
    
    // Get test with its questions
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get test questions
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', id)
      .order('id');

    if (questionsError) throw questionsError;

    const testWithQuestions = {
      ...data,
      questions: questions || []
    };

    return { data: testWithQuestions, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getTest');
  }
};

export const createTest = async (test: Omit<Test, 'id' | 'created_at'>) => {
  try {
    console.log('Creating new test:', test);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test creation simulated');
      const mockId = Date.now();
      const newTest = {
        id: mockId,
        ...test,
        created_at: new Date().toISOString(),
      };
      return { data: newTest, error: null };
    }
    
    const { data, error } = await supabase
      .from('tests')
      .insert([test])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'createTest');
  }
};

export const updateTest = async (id: number, test: Partial<Test>) => {
  try {
    console.log(`Updating test with id ${id}:`, test);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test update simulated');
      return { data: { id, ...test }, error: null };
    }
    
    // Extract questions if any
    const { questions, ...testData } = test;
    
    const { data, error } = await supabase
      .from('tests')
      .update(testData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'updateTest');
  }
};

export const deleteTest = async (id: number) => {
  try {
    console.log(`Deleting test with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test deletion simulated');
      return { data: true, error: null };
    }
    
    // First delete associated questions due to foreign key constraint
    const { error: questionsError } = await supabase
      .from('test_questions')
      .delete()
      .eq('test_id', id);

    if (questionsError) throw questionsError;

    // Then delete the test
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'deleteTest');
  }
};

// Test Questions functions
export const getTestQuestions = async (testId: number) => {
  try {
    console.log(`Fetching test questions for test ${testId}...`);
    if (USE_MOCK_DATA) {
      console.log('Using mock data for test questions');
      const questions = mockTestQuestions.filter(q => q.test_id === testId);
      return { data: questions, error: null };
    }
    
    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('id');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getTestQuestions');
  }
};

export const getTestQuestion = async (id: number) => {
  try {
    console.log(`Fetching test question with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Using mock data for test question');
      const question = mockTestQuestions.find(q => q.id === id);
      return { data: question || null, error: question ? null : new Error('Test question not found') };
    }
    
    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getTestQuestion');
  }
};

export const createTestQuestion = async (question: Omit<TestQuestion, 'id' | 'created_at'>) => {
  try {
    console.log('Creating new test question:', question);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test question creation simulated');
      const mockId = Date.now();
      const newQuestion = {
        id: mockId,
        ...question,
        created_at: new Date().toISOString(),
      };
      return { data: newQuestion, error: null };
    }
    
    const { data, error } = await supabase
      .from('test_questions')
      .insert([question])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'createTestQuestion');
  }
};

export const updateTestQuestion = async (id: number, question: Partial<TestQuestion>) => {
  try {
    console.log(`Updating test question with id ${id}:`, question);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test question update simulated');
      return { data: { id, ...question }, error: null };
    }
    
    const { data, error } = await supabase
      .from('test_questions')
      .update(question)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'updateTestQuestion');
  }
};

export const deleteTestQuestion = async (id: number) => {
  try {
    console.log(`Deleting test question with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test question deletion simulated');
      return { data: true, error: null };
    }
    
    const { error } = await supabase
      .from('test_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'deleteTestQuestion');
  }
};

// User Test Results functions
export const getUserTestResults = async (userId: string) => {
  try {
    console.log(`Fetching test results for user ${userId}...`);
    if (USE_MOCK_DATA) {
      console.log('Using mock data for user test results');
      const results = mockUserTestResults.filter(r => r.user_id === userId);
      return { data: results, error: null };
    }
    
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*, tests(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getUserTestResults');
  }
};

export const getTestResult = async (id: number) => {
  try {
    console.log(`Fetching test result with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Using mock data for test result');
      const result = mockUserTestResults.find(r => r.id === id);
      return { data: result || null, error: result ? null : new Error('Test result not found') };
    }
    
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*, tests(title)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'getTestResult');
  }
};

export const createTestResult = async (result: Omit<UserTestResult, 'id' | 'created_at'>) => {
  try {
    console.log('Creating new test result:', result);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test result creation simulated');
      const mockId = Date.now();
      const newResult = {
        id: mockId,
        ...result,
        created_at: new Date().toISOString(),
      };
      return { data: newResult, error: null };
    }
    
    const { data, error } = await supabase
      .from('user_test_results')
      .insert([result])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'createTestResult');
  }
};

export const updateTestResult = async (id: number, updates: Partial<UserTestResult>) => {
  try {
    console.log(`Updating test result with id ${id}:`, updates);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test result update simulated');
      return { data: { id, ...updates }, error: null };
    }
    
    const { data, error } = await supabase
      .from('user_test_results')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    return handleSupabaseError(error, 'updateTestResult');
  }
};

export const deleteTestResult = async (id: number) => {
  try {
    console.log(`Deleting test result with id ${id}...`);
    if (USE_MOCK_DATA) {
      console.log('Mock mode: Test result deletion simulated');
      return { data: true, error: null };
    }
    
    const { error } = await supabase
      .from('user_test_results')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return handleSupabaseError(error, 'deleteTestResult');
  }
};