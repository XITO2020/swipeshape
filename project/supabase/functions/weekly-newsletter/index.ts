import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as SendGrid from 'https://esm.sh/@sendgrid/mail'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')!
const fromEmail = 'your@email.com' // Replace with your verified SendGrid sender

interface NewsletterContent {
  subject: string
  content: string
}

const getWeeklyContent = (): NewsletterContent => {
  const currentDate = new Date()
  const weekNumber = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))

  // Rotate through different content each week
  const contents = [
    {
      subject: '🏋️‍♀️ Cette semaine chez SwipeShape: Conseils Fitness',
      content: `
        <h2>Bonjour {name},</h2>
        <p>Voici vos conseils fitness de la semaine :</p>
        <ul>
          <li>5 exercices essentiels pour un core solide</li>
          <li>Recette healthy de la semaine</li>
          <li>Témoignage inspirant d'une membre</li>
        </ul>
      `
    },
    {
      subject: '💪 SwipeShape: Motivation et Progrès',
      content: `
        <h2>Bonjour {name},</h2>
        <p>Cette semaine, focus sur :</p>
        <ul>
          <li>Comment rester motivée</li>
          <li>Suivre ses progrès efficacement</li>
          <li>Nouveaux programmes disponibles</li>
        </ul>
      `
    },
    {
      subject: '🌟 SwipeShape: Bien-être et Équilibre',
      content: `
        <h2>Bonjour {name},</h2>
        <p>Découvrez cette semaine :</p>
        <ul>
          <li>Techniques de respiration pour la récupération</li>
          <li>Équilibrer fitness et vie personnelle</li>
          <li>Astuces nutrition post-entraînement</li>
        </ul>
      `
    }
  ]

  return contents[weekNumber % contents.length]
}

const sendNewsletter = async (manualContent?: NewsletterContent) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  SendGrid.setApiKey(sendGridApiKey)

  // Get active subscribers
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('is_active', true)
    .is('last_email_sent', null)
    .or('last_email_sent.lt.now()-interval\'6 days\'')

  if (error) {
    console.error('Error fetching subscribers:', error)
    return
  }

  const { subject, content } = manualContent || getWeeklyContent()

  // Send emails in batches of 100
  const batchSize = 100
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    
    const messages = batch.map(subscriber => ({
      to: subscriber.email,
      from: fromEmail,
      subject: subject,
      html: content.replace('{name}', subscriber.email.split('@')[0]) + `
        <br><br>
        <p style="color: #666; font-size: 12px;">
          Pour vous désabonner, <a href="${supabaseUrl}/unsubscribe?token=${subscriber.unsubscribe_token}">cliquez ici</a>
        </p>
      `,
    }))

    try {
      await SendGrid.send(messages)
      
      // Update last_email_sent for successful sends
      await supabase
        .from('newsletter_subscribers')
        .update({ last_email_sent: new Date().toISOString() })
        .in('email', batch.map(s => s.email))
      
    } catch (error) {
      console.error('Error sending emails:', error)
    }
  }
}

serve(async (req) => {
  try {
    // Handle manual newsletter sending from admin interface
    if (req.method === 'POST') {
      const { subject, content, manual } = await req.json()
      
      if (manual && (!subject || !content)) {
        return new Response('Subject and content are required', { status: 400 })
      }

      await sendNewsletter(manual ? { subject, content } : undefined)
      return new Response('Newsletter sent successfully', { status: 200 })
    }

    // Handle automated weekly sending
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    await sendNewsletter()
    return new Response('Newsletter sent successfully', { status: 200 })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
})
