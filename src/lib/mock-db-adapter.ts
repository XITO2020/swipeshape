/**
 * Adaptateur de base de données en mémoire pour les tests CRUD en préproduction
 * Ce module crée une couche d'abstraction qui simule une base de données PostgreSQL
 */

import { v4 as uuidv4 } from 'uuid';

// Type pour les opérations de base de données
type DbOperation = 'create' | 'read' | 'update' | 'delete' | 'list';

// Interface pour les entités de base
interface BaseEntity {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  [key: string]: any;
}

// Type pour les collections de données stockées en mémoire
type DataStore = {
  [collection: string]: Record<string, BaseEntity>;
};

// Base de données en mémoire
const inMemoryDb: DataStore = {
  articles: {},
  programs: {},
  purchases: {},
  users: {},
  comments: {},
  videos: {},
  events: {},
  newsletter: {},
  test_logs: {}
};

// Enregistrement d'opération pour les logs
interface OperationLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
  result_id?: string;
}

// Fonction pour générer des données de test initiales
export function seedTestData() {
  // Articles de test
  createEntity('articles', {
    title: 'Article de test 1',
    content: 'Contenu de test pour le premier article',
    published: true,
    author_name: 'Admin Test',
    image_url: 'https://picsum.photos/800/600'
  });
  
  createEntity('articles', {
    title: 'Article de test 2',
    content: 'Contenu de test pour le second article',
    published: true,
    author_name: 'Admin Test',
    image_url: 'https://picsum.photos/800/601'
  });

  // Programmes de test
  createEntity('programs', {
    name: 'Programme de test 1',
    description: 'Description du programme de test 1',
    price: 99.99,
    duration: '8 semaines'
  });
  
  // Utilisateurs de test
  createEntity('users', {
    email: 'test@example.com',
    name: 'Utilisateur Test',
    role: 'user'
  });
  
  createEntity('users', {
    email: 'admin@example.com',
    name: 'Admin Test',
    role: 'admin'
  });
}

// Fonction pour générer un ID unique
export function generateId(): string {
  return uuidv4();
}

// Fonctions CRUD de base

// CREATE - Crée une nouvelle entité
export function createEntity(collection: string, data: any): BaseEntity {
  const id = data.id || generateId();
  const now = new Date();
  
  const entity: BaseEntity = {
    ...data,
    id,
    created_at: now,
    updated_at: now,
    is_test_data: true
  };
  
  // S'assurer que la collection existe
  if (!inMemoryDb[collection]) {
    inMemoryDb[collection] = {};
  }
  
  inMemoryDb[collection][id] = entity;
  
  // Enregistrer l'opération dans les logs
  logOperation('create', collection, entity);
  
  return entity;
}

// READ - Lit une entité par son ID
export function readEntity(collection: string, id: string): BaseEntity | null {
  // S'assurer que la collection existe
  if (!inMemoryDb[collection]) {
    return null;
  }
  
  const entity = inMemoryDb[collection][id];
  
  if (!entity) {
    return null;
  }
  
  // Enregistrer l'opération dans les logs
  logOperation('read', collection, entity);
  
  return { ...entity };
}

// UPDATE - Met à jour une entité existante
export function updateEntity(collection: string, id: string, data: any): BaseEntity | null {
  // S'assurer que la collection existe
  if (!inMemoryDb[collection] || !inMemoryDb[collection][id]) {
    return null;
  }
  
  const now = new Date();
  const updatedEntity: BaseEntity = {
    ...inMemoryDb[collection][id],
    ...data,
    updated_at: now
  };
  
  inMemoryDb[collection][id] = updatedEntity;
  
  // Enregistrer l'opération dans les logs
  logOperation('update', collection, updatedEntity);
  
  return { ...updatedEntity };
}

// DELETE - Supprime une entité
export function deleteEntity(collection: string, id: string): boolean {
  // S'assurer que la collection existe
  if (!inMemoryDb[collection] || !inMemoryDb[collection][id]) {
    return false;
  }
  
  const entity = inMemoryDb[collection][id];
  
  delete inMemoryDb[collection][id];
  
  // Enregistrer l'opération dans les logs
  logOperation('delete', collection, entity);
  
  return true;
}

// LIST - Liste toutes les entités d'une collection
export function listEntities(collection: string, filter: Record<string, any> = {}): BaseEntity[] {
  // S'assurer que la collection existe
  if (!inMemoryDb[collection]) {
    return [];
  }
  
  let entities = Object.values(inMemoryDb[collection]);
  
  // Appliquer les filtres si spécifiés
  if (Object.keys(filter).length > 0) {
    entities = entities.filter(entity => {
      return Object.entries(filter).every(([key, value]) => entity[key] === value);
    });
  }
  
  // Enregistrer l'opération dans les logs
  logOperation('list', collection, { filter });
  
  return entities.map(entity => ({ ...entity }));
}

// Fonction pour enregistrer une opération dans les logs
function logOperation(operation: DbOperation, collection: string, data: any): void {
  const logEntry: OperationLog = {
    id: generateId(),
    action: `${operation}_${collection}`,
    details: JSON.stringify(data),
    timestamp: new Date(),
    status: 'completed',
    result_id: data.id
  };
  
  // Enregistrer dans la collection test_logs
  if (!inMemoryDb.test_logs) {
    inMemoryDb.test_logs = {};
  }
  
  inMemoryDb.test_logs[logEntry.id] = logEntry;
}

// Fonction pour obtenir les logs d'opération
export function getOperationLogs(): OperationLog[] {
  if (!inMemoryDb.test_logs) {
    return [];
  }
  
  return Object.values(inMemoryDb.test_logs)
    .map(entity => entity as unknown as OperationLog)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Fonction pour nettoyer la base de données (utile pour les tests)
export function clearDatabase(collection?: string): void {
  if (collection) {
    inMemoryDb[collection] = {};
  } else {
    Object.keys(inMemoryDb).forEach(key => {
      inMemoryDb[key] = {};
    });
  }
}

// Vérifier si l'environnement est en mode test
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true';
}

// Initialisation - Peupler avec des données de test si nécessaire
if (isTestEnvironment()) {
  seedTestData();
}

// Exporter l'instance de la base de données en mémoire pour les tests
export default {
  createEntity,
  readEntity, 
  updateEntity,
  deleteEntity,
  listEntities,
  getOperationLogs,
  clearDatabase,
  isTestEnvironment,
  seedTestData
};
