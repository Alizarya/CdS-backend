const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Sous-modèle pour les liens
const linkSchema = mongoose.Schema({
  website: String,
  blog: String,
  youtube: String,
  twitch: String,
  tiktok: String,
  twitter: String,
  bluesky: String,
  mastodon: String,
  facebook: String,
  instagram: String,
  threads: String,
  linkedin: String,
  podcast: String,
  financement: String,
  autres: String,
});

// Sous-modèle pour le contenu
const contentSchema = mongoose.Schema({
  image: String,
  link: String,
  title: String,
  description: String,
});

// Modèle des membres
const memberSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pseudo: { type: String, default: "" },
  nom: { type: String, default: "" },
  image: { type: String, default: "" },
  tags: { type: [String], default: [] }, // Si vous utilisez un tableau
  shortdescription: { type: String, default: "" },
  description: { type: String, default: "" },
  links: { type: Object, default: {} },
  content_format: { type: String, default: "" },
  content: { type: Array, default: [] },
  softDelete: { type: Boolean, default: true },
});

// Application du plugin uniqueValidator pour la vérification des champs uniques
memberSchema.plugin(uniqueValidator);

// Export du modèle 'Member'
module.exports = mongoose.model("Member", memberSchema);
