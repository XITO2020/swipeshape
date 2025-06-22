import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

// Ajout du type pour les logs de test
type TestLog = {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
  result_id?: string;
}

// Extension du client Prisma pour permettre l'accès dynamique aux modèles
interface CustomPrismaClient extends PrismaClient {
  test_logs: {
    create: (args: { data: Omit<TestLog, 'id'> }) => Promise<TestLog>;
    updateMany: (args: { where: any; data: Partial<TestLog> }) => Promise<{ count: number }>;
  };
  [key: string]: any; // Permet l'accès dynamique aux modèles
}

const prisma = new PrismaClient() as CustomPrismaClient;

// Fake admin auth middleware
const isFakeAdmin = (req: NextApiRequest): boolean => {
  const apiKey = req.headers['x-api-key'];
  return apiKey === 'TEST_ADMIN_KEY_FOR_PREPRODUCTION';
};

// Helper to generate unique identifiers
const generateId = () => crypto.randomBytes(16).toString('hex');

// Handler for all CRUD operations
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify if admin
  if (!isFakeAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { entity, action, data, id } = req.body;
    
    // All allowed entities for CRUD tests
    const allowedEntities = [
      'articles', 
      'programs', 
      'purchases', 
      'users', 
      'comments', 
      'videos', 
      'events',
      'newsletter'
    ];
    
    if (!entity || !allowedEntities.includes(entity)) {
      return res.status(400).json({ error: 'Invalid entity' });
    }
    
    // Record test activity
    await prisma.test_logs.create({
      data: {
        action: `${action}_${entity}`,
        details: JSON.stringify(data || {}),
        timestamp: new Date(),
        status: 'pending'
      }
    });
    
    // Execute different CRUD operations based on action
    switch (action) {
      case 'create':
        return await handleCreate(entity, data, res);
      
      case 'read':
        return await handleRead(entity, id, res);
      
      case 'update':
        return await handleUpdate(entity, id, data, res);
      
      case 'delete':
        return await handleDelete(entity, id, res);
      
      case 'list':
        return await handleList(entity, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Error in test-crud handler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error?.message || String(error) });
  }
}

// CREATE operation handler
async function handleCreate(entity: string, data: any, res: NextApiResponse) {
  try {
    // Add test identifier to track test data
    const testData = {
      ...data,
      test_id: generateId(),
      is_test_data: true,
      created_at: new Date()
    };
    
    // Execute the create operation on the appropriate entity
    const result = await prisma[entity].create({ data: testData });
    
    // Update test log
    await prisma.test_logs.updateMany({
      where: { action: `create_${entity}`, status: 'pending' },
      data: { status: 'completed', result_id: result.id }
    });
    
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error creating ${entity}:`, error);
    return res.status(500).json({ error: `Failed to create ${entity}`, details: error?.message || String(error) });
  }
}

// READ operation handler
async function handleRead(entity: string, id: string, res: NextApiResponse) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const result = await prisma[entity].findUnique({
      where: { id }
    });
    
    if (!result) {
      return res.status(404).json({ error: `${entity} not found` });
    }
    
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error reading ${entity}:`, error);
    return res.status(500).json({ error: `Failed to read ${entity}`, details: error?.message || String(error) });
  }
}

// UPDATE operation handler
async function handleUpdate(entity: string, id: string, data: any, res: NextApiResponse) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Ensure we're only updating test data
    const existingItem = await prisma[entity].findUnique({
      where: { id }
    });
    
    if (!existingItem || existingItem.is_test_data !== true) {
      return res.status(403).json({ error: 'Can only update test data items' });
    }
    
    const result = await prisma[entity].update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
    
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error updating ${entity}:`, error);
    return res.status(500).json({ error: `Failed to update ${entity}`, details: error?.message || String(error) });
  }
}

// DELETE operation handler
async function handleDelete(entity: string, id: string, res: NextApiResponse) {
  try {
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Ensure we're only deleting test data
    const existingItem = await prisma[entity].findUnique({
      where: { id }
    });
    
    if (!existingItem || existingItem.is_test_data !== true) {
      return res.status(403).json({ error: 'Can only delete test data items' });
    }
    
    await prisma[entity].delete({
      where: { id }
    });
    
    return res.status(200).json({ success: true, message: `${entity} deleted successfully` });
  } catch (error: any) {
    console.error(`Error deleting ${entity}:`, error);
    return res.status(500).json({ error: `Failed to delete ${entity}`, details: error?.message || String(error) });
  }
}

// LIST operation handler (for testing queries)
async function handleList(entity: string, res: NextApiResponse) {
  try {
    // Only return test data
    const results = await prisma[entity].findMany({
      where: { is_test_data: true },
      take: 50
    });
    
    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    console.error(`Error listing ${entity}:`, error);
    return res.status(500).json({ error: `Failed to list ${entity}`, details: error?.message || String(error) });
  }
}
