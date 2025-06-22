import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { performance } from 'perf_hooks'

// Type pour les réponses de l'API health
type HealthResponse = {
  status: 'ok' | 'error' | 'degraded'
  timestamp: string
  version?: string
  uptime?: number
  env?: string
  checks: {
    database: {
      status: 'ok' | 'error' | 'degraded'
      latency?: number
      message?: string
      details?: any
    }
    api: {
      status: 'ok' | 'error'
      message?: string
    }
    environment: {
      status: 'ok' | 'error' | 'warning'
      missing?: string[]
      message?: string
    }
    storage?: {
      status: 'ok' | 'error' | 'degraded'
      message?: string
    }
    memory?: {
      status: 'ok' | 'warning' | 'error'
      used: number
      total: number
      percentUsed: number
    }
  }
}

// Création du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_VERSION = process.env.APP_VERSION || '1.0.0'
const startTime = Date.now()

// Vérifie les variables d'environnement requises
const checkEnvironment = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName])
  
  return {
    status: missing.length === 0 ? 'ok' : missing.length < requiredEnvVars.length ? 'warning' : 'error',
    missing: missing.length > 0 ? missing : undefined,
    message: missing.length > 0 
      ? `Variables d'environnement manquantes: ${missing.join(', ')}`
      : 'Toutes les variables d'environnement sont présentes'
  }
}

// Vérifie l'état de la mémoire du processus
const checkMemory = () => {
  if (typeof process.memoryUsage !== 'function') {
    return undefined
  }
  
  const memoryUsage = process.memoryUsage()
  const used = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  const total = Math.round(memoryUsage.heapTotal / 1024 / 1024)
  const percentUsed = Math.round((used / total) * 100)
  
  return {
    status: percentUsed > 90 ? 'error' : percentUsed > 75 ? 'warning' : 'ok',
    used,
    total,
    percentUsed
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  // Vérifie la méthode HTTP
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'error', message: 'Not checked' },
        api: { status: 'error', message: 'Method not allowed' },
        environment: { status: 'error', message: 'Not checked' }
      }
    })
  }
  
  // Prépare la réponse
  const healthResponse: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    env: process.env.NODE_ENV,
    checks: {
      database: { status: 'ok' },
      api: { status: 'ok' },
      environment: checkEnvironment()
    }
  }
  
  try {
    // Vérifie la base de données - Test de temps de réponse
    const dbStartTime = performance.now()
    
    // Vérifie que la base de données répond
    const { data: timestamp, error: timestampError } = await supabase.rpc('now')
    
    if (timestampError) {
      healthResponse.checks.database = {
        status: 'error',
        message: `Erreur lors de la vérification du timestamp: ${timestampError.message}`,
        details: timestampError
      }
      healthResponse.status = 'error'
    } else {
      // Vérifie qu'on peut lire des données
      const { data: readData, error: readError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
        .single()
      
      if (readError && readError.code !== 'PGRST116') { // Ignore l'erreur si la table n'existe pas
        healthResponse.checks.database = {
          status: 'degraded',
          message: `Erreur lors de la lecture des données: ${readError.message}`,
          details: readError
        }
        healthResponse.status = 'degraded'
      }
      
      // Calcule la latence
      const dbEndTime = performance.now()
      const latency = Math.round(dbEndTime - dbStartTime)
      
      if (healthResponse.checks.database.status === 'ok') {
        healthResponse.checks.database.latency = latency
        
        // Alerte si la latence est trop élevée
        if (latency > 1000) {
          healthResponse.checks.database.status = 'degraded'
          healthResponse.checks.database.message = `Latence élevée: ${latency}ms`
          healthResponse.status = 'degraded'
        }
      }
    }
    
    // Vérifie le stockage Supabase (si utilisé)
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets()
      
      healthResponse.checks.storage = {
        status: bucketsError ? 'error' : 'ok',
        message: bucketsError 
          ? `Erreur lors de la vérification du stockage: ${bucketsError.message}` 
          : `${buckets?.length || 0} buckets disponibles`
      }
      
      if (bucketsError) {
        healthResponse.status = 'degraded'
      }
    } catch (storageError) {
      healthResponse.checks.storage = {
        status: 'error',
        message: `Exception lors de la vérification du stockage: ${storageError}`
      }
    }
    
    // Vérifie la mémoire
    healthResponse.checks.memory = checkMemory()
    
    // Détermine le statut global
    if (Object.values(healthResponse.checks).some(check => check.status === 'error')) {
      healthResponse.status = 'error'
    } else if (Object.values(healthResponse.checks).some(check => check.status === 'degraded' || check.status === 'warning')) {
      healthResponse.status = 'degraded'
    }
    
    // Renvoie la réponse avec le code HTTP approprié
    const statusCode = healthResponse.status === 'ok' ? 200 : healthResponse.status === 'degraded' ? 207 : 500
    return res.status(statusCode).json(healthResponse)
  } catch (error) {
    // Gestion des erreurs inattendues
    console.error('Health check error:', error)
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'error', message: 'Exception pendant la vérification' },
        api: { status: 'error', message: error instanceof Error ? error.message : String(error) },
        environment: checkEnvironment()
      }
    })
  }
}
