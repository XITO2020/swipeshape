import path from "path";
import fs from "fs";

export function generateDownloadLink(fileId: string): string {
  // Génère un lien sécurisé avec un token temporaire, simplifié ici
  return `${process.env.BASE_URL}/download/${fileId}`;
}

export function cleanUpTempFiles(dir: string) {
  fs.readdir(dir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      if (file.endsWith(".tmp")) {
        fs.unlink(path.join(dir, file), () => {});
      }
    });
  });
}
