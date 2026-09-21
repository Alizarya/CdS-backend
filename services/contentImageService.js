const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "data", "images");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function saveContentImage(image) {
  if (!image || typeof image !== "string") {
    return "";
  }

  // Déjà une URL externe
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Déjà une image de contenu enregistrée
  if (image.startsWith("/images/")) {
    return image;
  }

  // L'image doit être du Base64
  if (!image.startsWith("data:image/")) {
    return image;
  }

  await ensureUploadDir();

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");

  const buffer = Buffer.from(base64, "base64");

  const filename = `${crypto.randomUUID()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    await sharp(buffer)
      .rotate()
      .resize({
        width: 500,
        height: 500,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toFile(filepath);

    return `/images/${filename}`;
  } catch (err) {
    throw new Error("Image invalide ou corrompue.");
  }
}

async function deleteContentImage(imagePath) {
  if (
    !imagePath ||
    typeof imagePath !== "string" ||
    !imagePath.startsWith("/images/")
  ) {
    return;
  }

  const filename = path.basename(imagePath);
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.unlink(filepath);
  } catch {
    // Le fichier n'existe peut-être déjà plus.
  }
}

module.exports = {
  saveContentImage,
  deleteContentImage,
};
