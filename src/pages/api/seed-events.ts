import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from './db';

// This is a protected API route for seeding events
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Vérifier que la connexion à la base de données est configurée
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database configuration error (DATABASE_URL not set)' });
    }

    // Sample events data
    const events = [
      {
        title: 'Atelier de Yoga et Méditation',
        description: 'Un atelier complet pour apprendre à intégrer le yoga et la méditation dans votre routine quotidienne.',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        location: 'Studio Zen, Paris',
        image_url: '/assets/images/events/yoga-workshop.jpg'
      },
      {
        title: 'Conférence sur la Nutrition Sportive',
        description: 'Découvrez les dernières recherches en nutrition sportive et comment optimiser votre alimentation.',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        location: 'Centre de Conférence, Lyon',
        image_url: '/assets/images/events/nutrition.jpg'
      },
      {
        title: 'Compétition de Fitness Challenge',
        description: 'Participez à notre compétition annuelle de fitness et testez vos limites avec nos défis variés.',
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        location: 'Parc des Sports, Marseille',
        image_url: '/assets/images/events/fitness-challenge.jpg'
      }
    ];

    // Insert events into the database using direct SQL
    const results = [];
    
    for (const event of events) {
      const insertQuery = `
        INSERT INTO events (title, description, event_date, location, image_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (title) DO UPDATE SET
          description = $2,
          event_date = $3,
          location = $4,
          image_url = $5
        RETURNING *
      `;
      
      const { data, error } = await executeQuery(insertQuery, [
        event.title,
        event.description,
        event.event_date,
        event.location,
        event.image_url
      ]);
      
      if (error) {
        console.error(`Error seeding event ${event.title}:`, error);
        return res.status(500).json({ 
          error: 'Failed to seed events', 
          details: error instanceof Error ? error.message : String(error)
        });
      }
      
      if (data && data.length > 0) {
        results.push(data[0]);
      }
    }

    return res.status(200).json({ 
      message: 'Events seeded successfully',
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Unexpected error occurred' });
  }
}
