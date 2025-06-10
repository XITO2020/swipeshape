// Configuration de sécurité pour la production
// Ce fichier s'assure que les contournements de sécurité ne sont utilisés qu'en développement

// Réinitialiser NODE_TLS_REJECT_UNAUTHORIZED à sa valeur par défaut en production
if (process.env.NODE_ENV === 'production') {
  // Supprimer la variable pour utiliser le comportement par défaut en production
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    console.log('✅ Sécurité SSL restaurée pour l\'environnement de production');
  }
}

export default function ensureProductionSafety() {
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Vérifications de sécurité pour la production effectuées');
  }
}
