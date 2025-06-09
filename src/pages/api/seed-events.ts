import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// This is a protected API route for seeding events
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Use service role key from server environment (not exposed client-side)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Insert events into the database
    const { data, error } = await supabase
      .from('events')
      .upsert(events, { onConflict: 'title' })
      .select();

    if (error) {
      console.error('Error seeding events:', error);
      return res.status(500).json({ error: 'Failed to seed events' });
    }

    return res.status(200).json({ 
      message: 'Events seeded successfully',
      count: data?.length || 0,
      data 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Unexpected error occurred' });
  }
}
