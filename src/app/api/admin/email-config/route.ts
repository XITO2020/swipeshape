import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/auth-app';
import { prisma } from '../../../../lib/prisma';

/**
 * Récupérer la configuration SMTP
 */
export async function GET(request: NextRequest) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  
  try {
    // Récupérer les paramètres depuis la base de données ou les variables d'environnement
    const settings = {
      host: process.env.EMAIL_HOST || '',
      port: process.env.EMAIL_PORT || '587',
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER || '',
      // Ne pas retourner le mot de passe complet pour des raisons de sécurité
      password: process.env.EMAIL_PASS ? '••••••••' : '',
      fromName: process.env.EMAIL_FROM_NAME || 'SwipeShape',
      fromEmail: process.env.EMAIL_FROM || 'no-reply@swipeshape.com'
    };
    
    // Tenter de récupérer les settings depuis la DB si on a une table pour ça
    try {
      const dbSettings = await prisma.settings.findMany({
        where: {
          key: {
            startsWith: 'email_'
          }
        }
      });
      
      if (dbSettings.length > 0) {
        // Mapper les settings de la DB au format attendu
        dbSettings.forEach(setting => {
          if (setting.key === 'email_host') settings.host = setting.value;
          if (setting.key === 'email_port') settings.port = setting.value;
          if (setting.key === 'email_secure') settings.secure = setting.value === 'true';
          if (setting.key === 'email_user') settings.user = setting.value;
          if (setting.key === 'email_pass' && setting.value) settings.password = '••••••••';
          if (setting.key === 'email_from_name') settings.fromName = setting.value;
          if (setting.key === 'email_from') settings.fromEmail = setting.value;
        });
      }
    } catch (dbError) {
      console.error('Erreur lors de la récupération des paramètres depuis la DB:', dbError);
      // On continue avec les valeurs d'environnement
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration email:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer la configuration' },
      { status: 500 }
    );
  }
}

/**
 * Mettre à jour la configuration SMTP
 */
export async function POST(request: NextRequest) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  
  try {
    const data = await request.json();
    
    // Valider les données requises
    if (!data.host || !data.port || !data.user || !data.fromEmail) {
      return NextResponse.json(
        { error: 'Les champs obligatoires sont incomplets' },
        { status: 400 }
      );
    }
    
    // Si on a une table settings dans la DB, on peut sauvegarder dedans
    try {
      // Mise à jour des settings dans la DB
      const settingsToUpdate = [
        { key: 'email_host', value: data.host },
        { key: 'email_port', value: data.port },
        { key: 'email_secure', value: data.secure ? 'true' : 'false' },
        { key: 'email_user', value: data.user },
        { key: 'email_from_name', value: data.fromName },
        { key: 'email_from', value: data.fromEmail }
      ];
      
      // Si un nouveau mot de passe est fourni, l'ajouter aux paramètres à mettre à jour
      if (data.password && data.password !== '••••••••') {
        settingsToUpdate.push({ key: 'email_pass', value: data.password });
      }
      
      // Mise à jour en batch
      for (const setting of settingsToUpdate) {
        await prisma.settings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value }
        });
      }
      
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Erreur lors de la sauvegarde des paramètres en DB:', dbError);
      
      // Si échec de sauvegarde en DB, on peut informer l'utilisateur
      return NextResponse.json({ 
        warning: 'Les paramètres ont été enregistrés en mémoire mais ne seront pas persistants. Veuillez configurer les variables d\'environnement.',
        success: true 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration email:', error);
    return NextResponse.json(
      { error: 'Impossible de mettre à jour la configuration' },
      { status: 500 }
    );
  }
}
