const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "members");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function saveMemberImage(image) {
  if (!image || typeof image !== "string") {
    return "";
  }

  // Déjà une URL ou un chemin local
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/uploads/")
  ) {
    return image;
  }

  // Pas du Base64
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
      .rotate() // respecte l'orientation EXIF
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

    return `/uploads/members/${filename}`;
  } catch (err) {
    throw new Error("Image invalide ou corrompue.");
  }
}

async function deleteMemberImage(imagePath) {
  if (
    !imagePath ||
    typeof imagePath !== "string" ||
    !imagePath.startsWith("/uploads/")
  ) {
    return;
  }

  const filepath = path.join(__dirname, "..", "public", imagePath);

  try {
    await fs.unlink(filepath);
  } catch {
    // Le fichier n'existe peut-être déjà plus.
  }
}

module.exports = {
  saveMemberImage,
  deleteMemberImage,
};
