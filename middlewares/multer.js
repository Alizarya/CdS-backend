const multer = require("fastify-multer");
const path = require("path");

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images")); // Assurez-vous que le chemin est correct
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const memberId = req.params.id || "default";

    cb(null, `${memberId}-${timestamp}.webp`); // Renommer le fichier
  },
});

// Filtrer les fichiers (seulement les images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error("Le fichier doit être une image"), false); // Rejeter si ce n'est pas une image
  }
};

// Initialisation de multer avec le stockage et le filtre de fichiers
const upload = multer({ storage, fileFilter });

module.exports = upload;
