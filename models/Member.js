const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const emailValidator = require("email-validator");

// Sous-modèle pour les liens avec logo
const linkWithLogoSchema = mongoose.Schema({
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
  lien: String,
  titre: String,
  description: String,
});

// Modèle des membres
const memberSchema = mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  softDelete: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: emailValidator.validate,
      message: "Adresse mail invalide",
    },
  },
  pseudo: {
    type: String,
    required: true,
  },
  nom: String,
  prénom: String,
  image: String,
  tags: {
    type: [String],
    required: true,
  },
  liens_avec_logo: linkWithLogoSchema,
  description_courte: {
    type: String,
    required: true,
  },
  description_longue: String,
  contenu: [contentSchema],
});

// Application du plugin uniqueValidator pour la vérification des champs uniques
memberSchema.plugin(uniqueValidator);

// Export du modèle 'Member'
module.exports = mongoose.model("Member", memberSchema);
