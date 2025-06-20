/*
Ce que fait ce fichier /pages/download/[token].tsx :

    Récupère le token depuis l’URL

    Vérifie dans la base de données :

        que l’achat existe

        que le token est valide

        que le nombre de téléchargements restants est > 0

        que le lien n’a pas expiré

    Si tout est bon :

        augmente le compteur de téléchargements

        redirige l’utilisateur vers le fichier PDF

    Sinon :

        affiche un message d’erreur (lien expiré ou usage dépassé) 
*/

// pages/download/[token].tsx
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabase";
import { add } from "date-fns";

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const token = params?.token as string;

  // Récupérer l'achat avec le token de téléchargement
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select(`
      id,
      download_token,
      expires_at,
      download_count,
      program_id
    `)
    .eq('download_token', token)
    .single();
    
  // Si l'achat est trouvé, récupérer le programme associé
  let programDetails = null;
  if (purchase) {
    const { data: program } = await supabase
      .from('programs')
      .select('id, name, download_url')
      .eq('id', purchase.program_id)
      .single();
      
    programDetails = program;
  }

  if (purchaseError || !purchase) {
    return { notFound: true };
  }

  const isExpired = new Date() > new Date(purchase.expires_at);
  const tooManyDownloads = purchase.download_count >= 2;

  if (isExpired || tooManyDownloads) {
    return {
      props: {
        error: isExpired ? "Lien expiré" : "Téléchargement déjà effectué 2 fois",
      },
    };
  }

  // Incrémenter le compteur de téléchargements
  const { error: updateError } = await supabase
    .from('purchases')
    .update({ download_count: purchase.download_count + 1 })
    .eq('id', purchase.id);

  if (updateError) {
    console.error('Erreur lors de la mise à jour du compteur de téléchargement:', updateError);
    return {
      props: {
        error: "Erreur lors du téléchargement. Veuillez réessayer.",
      },
    };
  }

  // Redirection vers le PDF/fichier du programme
  if (programDetails?.download_url) {
    res.writeHead(302, {
      Location: programDetails.download_url,
    });
    res.end();
  } else {
    return {
      props: {
        error: "Le fichier du programme est introuvable.",
        programId: purchase.program_id,
      },
    };
  }

  return { props: {} }; // Ne s'affichera jamais grâce à la redirection
};

export default function DownloadPage({ error }: { error?: string }) {
  return (
    <div className="p-10 text-center">
      {error ? (
        <h1 className="text-xl font-bold text-red-500">{error}</h1>
      ) : (
        <p>Téléchargement en cours...</p>
      )}
    </div>
  );
}
