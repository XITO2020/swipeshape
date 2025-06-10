// API Route for tests
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';
import { Test } from '@/types';
import { withApiMiddleware } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API tests endpoint called with method:', req.method);

  if (req.method === 'GET') {
    try {
      console.log('Fetching tests from database using PostgreSQL...');
      
      // Récupérer les tests
      const { data: tests, error: testsError } = await executeQuery(`
        SELECT * FROM tests
        ORDER BY created_at DESC
      `);
      
      if (testsError) {
        console.error('Database error in tests API:', testsError);
        return res.status(500).json({ 
          error: 'Erreur lors de la récupération des tests',
          details: testsError instanceof Error ? testsError.message : String(testsError)
        });
      }
      
      // Pour chaque test, récupérer les questions
      if (tests && Array.isArray(tests)) {
        for (const test of tests) {
          const { data: questions, error: questionsError } = await executeQuery(
            'SELECT * FROM test_questions WHERE test_id = $1',
            [test.id]
          );
          
          if (questionsError) {
            console.error(`Error fetching questions for test ${test.id}:`, questionsError);
          } else {
            test.questions = questions || [];
          }
        }
      }

      console.log(`Successfully fetched ${tests?.length || 0} tests with their questions`);
      return res.status(200).json(tests || []);
    } catch (error) {
      console.error('Exception in tests API:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de la récupération des tests',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else if (req.method === 'POST') {
    // For submitting test results
    try {
      const testData = req.body;
      console.log('Submitting test result:', testData);
      
      // Créer les champs dynamiquement pour l'insertion
      const fields = Object.keys(testData).join(', ');
      const placeholders = Object.keys(testData).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(testData);
      
      const query = `
        INSERT INTO user_test_results (${fields})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const { data, error } = await executeQuery(query, values);
      
      if (error) {
        console.error('Error submitting test result:', error);
        return res.status(500).json({ 
          error: 'Erreur lors de la soumission du résultat du test',
          details: error instanceof Error ? error.message : String(error)
        });
      }
      
      return res.status(201).json(data?.[0] || { success: true });
    } catch (error) {
      console.error('Error in POST test results API:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la soumission du résultat du test',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}

// Exporter le handler avec le middleware appliqué
export default withApiMiddleware(handler);
