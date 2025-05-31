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
import { prisma } from "@/lib/prisma";
import { add } from "date-fns";

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const token = params?.token as string;

  const purchase = await prisma.purchase.findUnique({
    where: { downloadToken: token },
    include: { program: true },
  });

  if (!purchase) {
    return { notFound: true };
  }

  const isExpired = new Date() > purchase.expiresAt;
  const tooManyDownloads = purchase.downloadCount >= 2;

  if (isExpired || tooManyDownloads) {
    return {
      props: {
        error: isExpired ? "Lien expiré" : "Téléchargement déjà effectué 2 fois",
      },
    };
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      downloadCount: { increment: 1 },
    },
  });

  // Redirection vers le PDF
  res.writeHead(302, {
    Location: purchase.program.fileUrl,
  });
  res.end();

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
