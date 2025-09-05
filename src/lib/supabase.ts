// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import {
  Program,
  Article,
  Comment,
  Event,
  Video,
  Test,
  TestQuestion,
  UserTestResult,
} from '@/types'
import {
  mockArticles,
  mockEvents,
  mockPrograms,
  mockVideos,
  mockTests,
  mockTestQuestions,
  mockUserTestResults,
} from '../lib/mockData'



/**
 * Authentification utilisateur : gérée désormais par Clerk.
 * Tous les flux qui dépendent de l'utilisateur doivent obtenir `userId`
 * via Clerk (`getAuth` côté API / `useUser` côté client) et le passer ici
 * comme identifiant (ex : purchase.user_id, comment.user_id, etc.).
 */

export const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
export const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!URL) {
  console.warn('⚠️ SUPABASE URL manquante')
}
if (!ANON) {
  console.warn('⚠️ SUPABASE ANON KEY manquante')
}

// Client front/public (utilise la clé anon, ne doit pas être utilisé pour des opérations sensibles)
export const supabase = createClient(URL, ANON, {
  global: {
    headers: {
      'X-Client-Info': `supabase-js/${process.env.NEXT_PUBLIC_SUPABASE_VERSION || 'latest'}`,
    },
    fetch: async (...args) => {
      try {
        return await fetch(...args)
      } catch (error) {
        console.error('Erreur réseau Supabase:', error)
        throw error
      }
    },
  },
})

// Client serveur avec droits élevés si besoin (service role)
export const supabaseAdmin = createClient(URL, SERVICE_ROLE)

// Mode mock pour dev/test
const USE_MOCK_DATA = false

// Helper d'erreur
const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error)
  return { data: null, error }
}

/** PROGRAMS **/

export const getPrograms = async () => {
  if (USE_MOCK_DATA) {
    return { data: mockPrograms, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur Supabase getPrograms:', error)
      return { data: [], error }
    }
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getPrograms')
  }
}

export const getProgram = async (id: string | number) => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getProgram')
  }
}

export const createProgram = async (program: Omit<Program, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase.from('programs').insert([program]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createProgram')
  }
}

export const updateProgram = async (id: number, program: Partial<Program>) => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .update(program)
      .eq('id', id)
      .select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateProgram')
  }
}

export const deleteProgram = async (id: number) => {
  try {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteProgram')
  }
}

/** ARTICLES **/

export const getArticles = async () => {
  if (USE_MOCK_DATA) {
    return { data: mockArticles, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur Supabase getArticles:', error)
      return { data: [], error }
    }

    if (data) {
      data.forEach(article => {
        if (!article.image_url) {
          article.image_url = '/images/placeholder-article.jpg'
        }
        if (!article.author) {
          article.author = 'SwipeShape Team'
        }
        if (!article.updated_at) {
          article.updated_at = article.created_at
        }
      })
    }

    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getArticles')
  }
}

export const getArticle = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getArticle')
  }
}

export const createArticle = async (article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase.from('articles').insert([article]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createArticle')
  }
}

export const updateArticle = async (id: number, article: Partial<Article>) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update(article)
      .eq('id', id)
      .select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateArticle')
  }
}

export const deleteArticle = async (id: number) => {
  try {
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteArticle')
  }
}

export const searchArticles = async (query: string = '', date: Date | null = null) => {
  if (USE_MOCK_DATA) {
    try {
      let filtered = [...mockArticles]
      if (query) {
        const lower = query.toLowerCase()
        filtered = filtered.filter(
          a =>
            a.title.toLowerCase().includes(lower) ||
            a.content.toLowerCase().includes(lower)
        )
      }
      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        filtered = filtered.filter(article => {
          const d = new Date(article.created_at)
          return d >= start && d <= end
        })
      }
      return { data: filtered, error: null }
    } catch (err) {
      console.error('Erreur mock searchArticles:', err)
      return { data: mockArticles, error: null }
    }
  }

  try {
    let builder: any = supabase.from('articles').select('*').order('created_at', { ascending: false })

    if (query.trim()) {
      const safe = query.replace(/[%_]/g, m => `\\${m}`)
      builder = builder.or(`title.ilike.%${safe}%,content.ilike.%${safe}%`)
    }

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      builder = builder.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
    }

    const { data, error } = await builder
    if (error) {
      console.error('Erreur Supabase searchArticles:', error)
      return { data: [], error }
    }

    if (data) {
      data.forEach((article:any) => {
        if (!article.image_url) article.image_url = '/images/placeholder-article.jpg'
        if (!article.author) article.author = 'SwipeShape Team'
        if (!article.updated_at) article.updated_at = article.created_at
      })
    }

    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'searchArticles')
  }
}

/** EVENTS **/

export const searchEvents = async (query: string = '', date: Date | null = null) => {
  if (USE_MOCK_DATA) {
    try {
      let filtered = [...mockEvents]
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      filtered = filtered.filter(e => new Date(e.event_date) >= now)

      if (query) {
        const lower = query.toLowerCase()
        filtered = filtered.filter(
          e =>
            e.title.toLowerCase().includes(lower) ||
            e.description.toLowerCase().includes(lower) ||
            e.location.toLowerCase().includes(lower)
        )
      }

      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        filtered = filtered.filter(e => {
          const d = new Date(e.event_date)
          return d >= start && d <= end
        })
      }

      filtered.forEach((event:any) => {
        const eventDate = new Date(event.event_date)
        const today = new Date()
        const diffTime = Math.abs(eventDate.getTime() - today.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        Object.assign(event, { daysLeft: diffDays })
      })

      return { data: filtered, error: null }
    } catch (err) {
      console.error('Erreur mock searchEvents:', err)
      return { data: mockEvents, error: null }
    }
  }

  try {
    let builder: any = supabase.from('events').select('*').order('event_date', { ascending: true })

    if (query) {
      builder = builder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      builder = builder.gte('event_date', start.toISOString()).lte('event_date', end.toISOString())
    }

    const { data, error } = await builder
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'searchEvents')
  }
}


export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getUserProfile')
  }
}

export const updateUserProfile = async (
  userId: string,
  updates: { avatar_url?: string; [key: string]: any }
) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateUserProfile')
  }
}

/** COMMENTS **/

export const getComments = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur Supabase getComments:', error)
      return { data: [], error }
    }

    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getComments')
  }
}

export const createComment = async (comment: Omit<Comment, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase.from('comments').insert([comment]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createComment')
  }
}

export const updateComment = async (id: number, updates: Partial<Comment>) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateComment')
  }
}

export const deleteComment = async (id: number) => {
  try {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteComment')
  }
}

/** PURCHASE / RIGHTS **/

export const checkUserCanComment = async (userId: string, programId?: string) => {
  try {
    let query = supabase
      .from('purchases')
      .select('id, program_id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (programId) {
      query = query.eq('program_id', programId)
    }

    const { data, error } = await query.limit(1)
    if (error) throw error
    return {
      canComment: Array.isArray(data) && data.length > 0,
      error: null,
      programIds: data?.map((p: any) => p.program_id) || [],
    }
  } catch (error) {
    console.error('Erreur checkUserCanComment:', error)
    return { canComment: false, error, programIds: [] }
  }
}

/** VIDEOS **/

export const getVideos = async () => {
  try {
    if (USE_MOCK_DATA) {
      return { data: mockVideos, error: null }
    }
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getVideos')
  }
}

export const getVideo = async (id: string) => {
  try {
    if (USE_MOCK_DATA) {
      const video = mockVideos.find(v => v.id === id)
      return { data: video || null, error: video ? null : new Error('Video not found') }
    }
    const { data, error } = await supabase
      .from('videos') 
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getVideo')
  }
}

export const createVideo = async (video: Omit<Video, 'id' | 'created_at'>) => {
  try {
    if (USE_MOCK_DATA) {
      const mockId = String(Date.now())
      const newVideo = { id: mockId, ...video, created_at: new Date().toISOString() }
      return { data: newVideo, error: null }
    }
    const { data, error } = await supabase.from('videos').insert([video]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createVideo')
  }
}

export const updateVideo = async (id: string, video: Partial<Video>) => {
  try {
    if (USE_MOCK_DATA) {
      return { data: { id, ...video }, error: null }
    }
    const { data, error } = await supabase
      .from('videos')
      .update(video)
      .eq('id', id)
      .select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateVideo')
  }
}

export const deleteVideo = async (id: string) => {
  try {
    if (USE_MOCK_DATA) {
      return { data: true, error: null }
    }
    const { error } = await supabase.from('videos').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteVideo')
  }
}

/** NEWSLETTER **/

export const subscribeToNewsletter = async (email: string) => {
  try {
    const { data, error } = await supabase.from('newsletter_subscribers').insert([{ email }])
    if (error) {
      // unique violation code can vary depending on driver; on Postgres it's 23505
      if ((error as any).code === '23505') {
        return { data: null, error: "Cette adresse email est déjà inscrite à notre newsletter." }
      }
      throw error
    }
    return { data, error: null }
  } catch (error) {
    console.error('Erreur subscribeToNewsletter:', error)
    return { data: null, error: 'Une erreur est survenue lors de l’inscription.' }
  }
}

export const unsubscribeFromNewsletter = async (token: string) => {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('id')
      .eq('token', token)
      .single()

    if (error) {
      return { success: false, message: 'Token invalide', error }
    }

    const { error: deleteError } = await supabase
      .from('newsletters')
      .delete()
      .eq('token', token)

    if (deleteError) {
      return { success: false, message: 'Impossible de se désabonner', error: deleteError }
    }

    return { success: true, message: 'Désabonné avec succès', error: null }
  } catch (error) {
    console.error('Erreur unsubscribeFromNewsletter:', error)
    return { success: false, message: 'Erreur inattendue', error }
  }
}

/** TESTS & QUESTIONS & RESULTS **/

export const getTests = async () => {
  try {
    if (USE_MOCK_DATA) return { data: mockTests, error: null }
    const { data, error } = await supabase.from('tests').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getTests')
  }
}

export const getTest = async (id: number) => {
  try {
    if (USE_MOCK_DATA) {
      const test = mockTests.find(t => t.id === id)
      const questions = mockTestQuestions.filter(q => q.test_id === id)
      return { data: { ...(test || {}), questions }, error: null }
    }
    const { data, error } = await supabase.from('tests').select('*').eq('id', id).single()
    if (error) throw error
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', id)
      .order('id')
    if (questionsError) throw questionsError
    return { data: { ...data, questions }, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getTest')
  }
}

export const createTest = async (test: Omit<Test, 'id' | 'created_at'>) => {
  try {
    if (USE_MOCK_DATA) {
      const mockId = Date.now()
      return { data: { id: mockId, ...test, created_at: new Date().toISOString() }, error: null }
    }
    const { data, error } = await supabase.from('tests').insert([test]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createTest')
  }
}

export const updateTest = async (id: number, test: Partial<Test>) => {
  try {
    if (USE_MOCK_DATA) return { data: { id, ...test }, error: null }
    const { questions, ...testData } = test as any
    const { data, error } = await supabase.from('tests').update(testData).eq('id', id).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateTest')
  }
}

export const deleteTest = async (id: number) => {
  try {
    if (USE_MOCK_DATA) return { data: true, error: null }
    await supabase.from('test_questions').delete().eq('test_id', id)
    const { error } = await supabase.from('tests').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteTest')
  }
}

export const getTestQuestions = async (testId: number) => {
  try {
    if (USE_MOCK_DATA) {
      const questions = mockTestQuestions.filter(q => q.test_id === testId)
      return { data: questions, error: null }
    }
    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('id')
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getTestQuestions')
  }
}

export const getTestQuestion = async (id: number) => {
  try {
    if (USE_MOCK_DATA) {
      const question = mockTestQuestions.find(q => q.id === id)
      return { data: question || null, error: question ? null : new Error('Test question not found') }
    }
    const { data, error } = await supabase.from('test_questions').select('*').eq('id', id).single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getTestQuestion')
  }
}

export const createTestQuestion = async (question: Omit<TestQuestion, 'id' | 'created_at'>) => {
  try {
    if (USE_MOCK_DATA) {
      const mockId = Date.now()
      return { data: { id: mockId, ...question, created_at: new Date().toISOString() }, error: null }
    }
    const { data, error } = await supabase.from('test_questions').insert([question]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createTestQuestion')
  }
}

export const updateTestQuestion = async (id: number, question: Partial<TestQuestion>) => {
  try {
    if (USE_MOCK_DATA) return { data: { id, ...question }, error: null }
    const { data, error } = await supabase.from('test_questions').update(question).eq('id', id).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateTestQuestion')
  }
}

export const deleteTestQuestion = async (id: number) => {
  try {
    if (USE_MOCK_DATA) return { data: true, error: null }
    const { error } = await supabase.from('test_questions').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteTestQuestion')
  }
}

export const getUserTestResults = async (userId: string) => {
  try {
    if (USE_MOCK_DATA) {
      const results = mockUserTestResults.filter(r => r.user_id === userId)
      return { data: results, error: null }
    }
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*, tests(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getUserTestResults')
  }
}

export const getTestResult = async (id: number) => {
  try {
    if (USE_MOCK_DATA) {
      const result = mockUserTestResults.find(r => r.id === id)
      return { data: result || null, error: result ? null : new Error('Test result not found') }
    }
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*, tests(title)')
      .eq('id', id)
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'getTestResult')
  }
}

export const createTestResult = async (result: Omit<UserTestResult, 'id' | 'created_at'>) => {
  try {
    if (USE_MOCK_DATA) {
      const mockId = Date.now()
      return { data: { id: mockId, ...result, created_at: new Date().toISOString() }, error: null }
    }
    const { data, error } = await supabase.from('user_test_results').insert([result]).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'createTestResult')
  }
}

export const updateTestResult = async (id: number, updates: Partial<UserTestResult>) => {
  try {
    if (USE_MOCK_DATA) return { data: { id, ...updates }, error: null }
    const { data, error } = await supabase.from('user_test_results').update(updates).eq('id', id).select()
    if (error) throw error
    return { data: data?.[0] ?? null, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'updateTestResult')
  }
}

export const deleteTestResult = async (id: number) => {
  try {
    if (USE_MOCK_DATA) return { data: true, error: null }
    const { error } = await supabase.from('user_test_results').delete().eq('id', id)
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    return handleSupabaseError(error, 'deleteTestResult')
  }
}
