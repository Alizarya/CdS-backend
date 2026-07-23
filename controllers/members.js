// controllers/members.js
const mongoose = require("mongoose");
const Member = require("../models/Member");

const {
  saveMemberImage,
  deleteMemberImage,
} = require("../services/imageService");

const SocialsLogos = {
  website: "fa-solid fa-globe",
  blog: "fa-solid fa-square-pen",
  youtube: "fa-brands fa-square-youtube",
  twitch: "fa-brands fa-twitch",
  tiktok: "fa-brands fa-tiktok",
  twitter: "fa-brands fa-square-x-twitter",
  bluesky: "fa-solid fa-square",
  mastodon: "fa-brands fa-mastodon",
  facebook: "fa-brands fa-square-facebook",
  instagram: "fa-brands fa-square-instagram",
  threads: "fa-brands fa-square-threads",
  linkedin: "fa-brands fa-linkedin",
  podcast: "fa-solid fa-podcast",
  financement: "fa-solid fa-circle-dollar-to-slot",
  autres: "fa-solid fa-brain",
};

/* ==========================
 * Helpers (normalisation)
 * ========================== */

function normalizeTags(input, max = 3) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(",");
  const cleaned = arr
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter((t) => t.length > 0);

  // dédoublonne + borne à 3
  return Array.from(new Set(cleaned)).slice(0, max);
}

function parseJsonIfString(value, fallback = {}) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  if (typeof value === "object" && value !== null) return value;
  return fallback;
}

function normalizeLinks(linksObj) {
  const parsed = parseJsonIfString(linksObj, {});
  return Object.keys(SocialsLogos).reduce((acc, key) => {
    acc[key] = typeof parsed[key] === "string" ? parsed[key] : "";
    return acc;
  }, {});
}

function normalizeContent(content) {
  const arr = Array.isArray(content)
    ? content
    : typeof content === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return arr.map((item) => ({
    image: (item && item.image) || "",
    link: (item && item.link) || "",
    title: (item && item.title) || "",
    description: (item && item.description) || "",
  }));
}

function toBooleanLoose(val, defaultVal) {
  if (val === undefined) return defaultVal;
  if (val === true || val === false) return val;
  if (typeof val === "string") {
    const v = val.toLowerCase().trim();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return defaultVal;
}

/* ==========================
 * GET /members  — avec email
 * ========================== */
const getAllMembers = async (request, reply) => {
  try {
    // Optionnel : filtrer via query ?visible=true/false
    const { visible } = request.query || {};
    const matchStage = [];
    if (visible === "true") matchStage.push({ $match: { softDelete: false } });
    if (visible === "false") matchStage.push({ $match: { softDelete: true } });

    const pipeline = [
      ...matchStage,
      {
        $lookup: {
          from: "users",
          let: { uid: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  // User._id (ObjectId) -> string pour matcher Member.userId (string)
                  $eq: [{ $toString: "$_id" }, "$$uid"],
                },
              },
            },
            { $project: { email: 1 } },
          ],
          as: "userInfo",
        },
      },
      {
        $addFields: {
          email: { $ifNull: [{ $arrayElemAt: ["$userInfo.email", 0] }, ""] },
        },
      },
      { $project: { userInfo: 0 } },
      { $sort: { pseudo: 1, nom: 1, _id: 1 } },
    ];

    const members = await Member.aggregate(pipeline);
    return reply.send(members);
  } catch (err) {
    console.error("Erreur lors de la récupération des membres:", err);
    return reply
      .status(500)
      .send({ error: "Erreur lors de la récupération des membres" });
  }
};

/* ==========================
 * POST /members
 * ========================== */
async function createMember(request, reply) {
  try {
    const {
      userId,
      pseudo = "",
      nom = "",
      image = "",
      tags = "",
      shortdescription = "",
      description = "",
      links = {},
      content_format = "",
      content = [],
      softDelete,
    } = request.body;

    if (!userId) {
      return reply.status(400).send({ message: "userId est requis." });
    }

    const normalizedTags = normalizeTags(tags, 3);
    const validLinks = normalizeLinks(links);
    const normalizedContent = normalizeContent(content);
    const softDeleteValue = toBooleanLoose(softDelete, undefined);

    // Conversion de l'image en WebP si nécessaire
    const imagePath = await saveMemberImage(image);

    const newMember = new Member({
      userId,
      pseudo,
      nom,
      image: imagePath,
      tags: normalizedTags,
      shortdescription,
      description,
      links: validLinks,
      content_format,
      content: normalizedContent,
      ...(softDeleteValue !== undefined ? { softDelete: softDeleteValue } : {}),
    });

    await newMember.save();

    reply.status(201).send({
      message: "Membre créé avec succès",
      member: newMember,
    });
  } catch (error) {
    console.error("Erreur lors de la création du membre:", error);

    if (error.code === 11000) {
      return reply.status(400).send({
        message: "Conflit d'unicité (email/userId déjà utilisé ?).",
      });
    }

    if (error.message === "Image invalide ou corrompue.") {
      return reply.status(400).send({
        message: error.message,
      });
    }

    reply.status(500).send({
      message: "Une erreur est survenue lors de la création du membre.",
    });
  }
}

/* ==========================
 * PATCH/PUT /members/:id
 * ========================== */
async function updateMember(request, reply) {
  try {
    const memberId = request.params.id;

    if (!memberId) {
      return reply.status(400).send({ message: "ID de membre requis" });
    }

    // Récupération du membre actuel
    const member = await Member.findById(memberId);

    if (!member) {
      return reply.status(404).send({ message: "Membre non trouvé" });
    }

    const {
      pseudo,
      nom,
      image,
      tags,
      shortdescription,
      description,
      links,
      content_format,
      content,
      softDelete,
    } = request.body;

    const update = {};

    if (pseudo !== undefined) update.pseudo = String(pseudo);
    if (nom !== undefined) update.nom = String(nom);

    if (image !== undefined) {
      const newImage = await saveMemberImage(image);

      if (newImage !== member.image) {
        await deleteMemberImage(member.image);
      }

      update.image = newImage;
    }

    if (tags !== undefined) {
      update.tags = normalizeTags(tags, 3);
    }

    if (shortdescription !== undefined) {
      update.shortdescription = String(shortdescription);
    }

    if (description !== undefined) {
      update.description = String(description);
    }

    if (links !== undefined) {
      update.links = normalizeLinks(links);
    }

    if (content_format !== undefined) {
      update.content_format = String(content_format);
    }

    if (content !== undefined) {
      update.content = normalizeContent(content);
    }

    if (softDelete !== undefined) {
      update.softDelete = toBooleanLoose(softDelete, true);
    }

    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      { $set: update },
      {
        new: true,
        runValidators: true,
      },
    );

    reply.send({
      message: "Membre mis à jour avec succès",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error);

    if (error.message === "Image invalide ou corrompue.") {
      return reply.status(400).send({
        message: error.message,
      });
    }

    reply.status(500).send({
      message: "Une erreur est survenue lors de la mise à jour du membre.",
    });
  }
}

/* ==========================
 * GET /members/:id  — avec email
 * ========================== */
async function getMember(request, reply) {
  try {
    const memberId = request.params.id;

    // Pipeline pour inclure l'email
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(memberId) } },
      {
        $lookup: {
          from: "users",
          let: { uid: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$uid"],
                },
              },
            },
            { $project: { email: 1 } },
          ],
          as: "userInfo",
        },
      },
      {
        $addFields: {
          email: { $ifNull: [{ $arrayElemAt: ["$userInfo.email", 0] }, ""] },
        },
      },
      { $project: { userInfo: 0 } },
      { $limit: 1 },
    ];

    const result = await Member.aggregate(pipeline);
    const member = result[0];

    if (!member) {
      return reply.status(404).send({ message: "Membre non trouvé" });
    }

    reply.send({ message: "Membre trouvé", member });
  } catch (error) {
    console.error("Erreur lors de la récupération du membre:", error);

    if (error.name === "CastError") {
      return reply.status(400).send({ message: "ID de membre invalide" });
    }

    reply.status(500).send({
      message: "Une erreur est survenue lors de la récupération du membre.",
    });
  }
}

/* ==========================
 * DELETE /members/:id
 * ========================== */
async function deleteMember(request, reply) {
  const { id } = request.params;

  try {
    if (!id) {
      return reply.status(400).send({ message: "L'ID du membre est requis" });
    }

    const deletedMember = await Member.findByIdAndDelete(id);

    if (!deletedMember) {
      return reply.status(404).send({ message: "Membre non trouvé" });
    }

    reply.send({ message: "Membre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du membre :", error);
    reply.status(500).send({
      message: "Une erreur est survenue lors de la suppression du membre",
    });
  }
}

module.exports = {
  getAllMembers,
  getMember,
  deleteMember,
  createMember,
  updateMember,
};
