const mongoose = require("mongoose");

// Sous-modèle pour les réseaux sociaux
const linkSchema = new mongoose.Schema(
  {
    website: { type: String, default: "" },
    blog: { type: String, default: "" },
    youtube: { type: String, default: "" },
    twitch: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    twitter: { type: String, default: "" },
    bluesky: { type: String, default: "" },
    mastodon: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    threads: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    podcast: { type: String, default: "" },
    financement: { type: String, default: "" },
    autres: { type: String, default: "" },
  },
  { _id: false },
);

// Sous-modèle pour le contenu
const contentSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    link: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

// Modèle principal
const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    pseudo: {
      type: String,
      default: "",
      trim: true,
    },

    nom: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    shortdescription: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    links: {
      type: linkSchema,
      default: () => ({}),
    },

    content_format: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: [contentSchema],
      default: [],
    },

    softDelete: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Member", memberSchema);
