const Member = require("../models/member");

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

// __________________________
// Récupérer tous les membres
const getAllMembers = async (request, reply) => {
  try {
    const members = await Member.find();
    return members;
  } catch (err) {
    reply
      .status(500)
      .send({ error: "Erreur lors de la récupération des membres" });
  }
};

// __________________________
// Créer un nouveau membre
async function createMember(request, reply) {
  try {
    // Récupérer les données envoyées dans la requête
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
      softDelete = true,
    } = request.body;

    // Vérification et traitement de 'content'
    let parsedContent = [];
    try {
      if (typeof content === "string") {
        parsedContent = JSON.parse(content);
      } else if (Array.isArray(content)) {
        parsedContent = content;
      }
    } catch (parseError) {
      return reply
        .status(400)
        .send({ message: "Le format du contenu est incorrect." });
    }

    // Vérification et traitement des liens
    let parsedLinks = {};
    try {
      if (typeof links === "string") {
        parsedLinks = JSON.parse(links); // Parser si c'est une chaîne JSON
      } else if (typeof links === "object" && links !== null) {
        parsedLinks = links; // Si c'est déjà un objet
      }
    } catch (parseError) {
      return reply
        .status(400)
        .send({ message: "Le format des liens est incorrect." });
    }

    // Assurer que tous les liens (y compris ceux vides) soient enregistrés avec "" si non renseignés
    const validLinks = Object.keys(SocialsLogos).reduce((acc, key) => {
      // Si l'utilisateur a fourni un lien, l'utiliser, sinon mettre une chaîne vide ""
      acc[key] = parsedLinks[key] || "";
      return acc;
    }, {});

    // Créer un nouveau membre sans définir explicitement l'_id
    const newMember = new Member({
      userId,
      pseudo,
      nom,
      image,
      tags: tags.split(",").map((tag) => tag.trim()),
      shortdescription,
      description,
      links: validLinks, // Utiliser les liens traités avec toutes les clés
      content_format,
      content: parsedContent.map((item) => ({
        image: item.image || "",
        link: item.link || "",
        title: item.title || "",
        description: item.description || "",
      })),
      softDelete,
    });

    // Sauvegarder le membre dans la base de données
    await newMember.save();

    // Retourner une réponse de succès
    reply
      .status(201)
      .send({ message: "Membre créé avec succès", member: newMember });
  } catch (error) {
    console.error("Erreur lors de la création du membre:", error);

    // Vérifier si l'erreur est une violation d'unicité
    if (error.code === 11000) {
      return reply
        .status(400)
        .send({ message: "L'adresse e-mail ou l'userId est déjà utilisé." });
    }

    // Gérer d'autres types d'erreurs
    reply.status(500).send({
      message: "Une erreur est survenue lors de la création du membre.",
    });
  }
}

// __________________________
// Mettre à jour un membre
async function updateMember(request, reply) {
  try {
    // Récupérer l'ID du membre à mettre à jour depuis les paramètres
    const memberId = request.params.id;

    // Récupérer les données envoyées dans la requête
    const {
      pseudo = "",
      nom = "",
      image = "",
      tags = "",
      shortdescription = "",
      description = "",
      links = {},
      content_format = "",
      content = [],
      softDelete = true,
    } = request.body;

    // Assurer que softDelete est un booléen
    const isSoftDelete =
      softDelete === "true" || softDelete === true ? true : false;

    // Vérification et traitement des 'tags'
    let updatedTags = [];
    if (Array.isArray(tags)) {
      updatedTags = tags.slice(0, 3);
    }

    // Vérification et traitement de 'content'
    let updatedContent = [];
    try {
      if (typeof content === "string") {
        updatedContent = JSON.parse(content);
      } else if (Array.isArray(content)) {
        updatedContent = content;
      }
    } catch (parseError) {
      return reply
        .status(400)
        .send({ message: "Le format du contenu est incorrect." });
    }

    // Vérification et traitement des links
    let parsedLinks = {};
    try {
      if (typeof links === "string") {
        parsedLinks = JSON.parse(links);
      } else if (typeof links === "object" && links !== null) {
        parsedLinks = links;
      }
    } catch (parseError) {
      return reply
        .status(400)
        .send({ message: "Le format des liens est incorrect." });
    }

    // Assurer que tous les liens (y compris ceux vides) soient enregistrés avec "" si non renseignés
    const validLinks = Object.keys(SocialsLogos).reduce((acc, key) => {
      // Si l'utilisateur a fourni un lien, l'utiliser, sinon mettre une chaîne vide ""
      acc[key] = parsedLinks[key] || "";
      return acc;
    }, {});

    // Mettre à jour les champs dans la base de données
    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      {
        $set: {
          pseudo,
          nom,
          image,
          tags: updatedTags,
          shortdescription,
          description,
          links: validLinks,
          content_format,
          content: updatedContent.map((item) => ({
            image: item.image || "",
            link: item.link || "",
            title: item.title || "",
            description: item.description || "",
          })),
          softDelete: isSoftDelete,
        },
      },
      { new: true, runValidators: true }
    );

    // Si le membre n'existe pas
    if (!updatedMember) {
      return reply.status(404).send({ message: "Membre non trouvé" });
    }

    // Retourner une réponse de succès avec les données mises à jour
    reply.send({
      message: "Membre mis à jour avec succès",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error);

    // Gérer les autres types d'erreurs
    reply.status(500).send({
      message: "Une erreur est survenue lors de la mise à jour du membre.",
    });
  }
}

// __________________________
// Récupérer un membre par son ID
async function getMember(request, reply) {
  try {
    // Récupérer l'ID du membre à partir des paramètres
    const memberId = request.params.id;

    // Chercher le membre par ID
    const member = await Member.findById(memberId);

    // Si le membre n'existe pas, retourner une réponse 404
    if (!member) {
      return reply.status(404).send({ message: "Membre non trouvé" });
    }

    // Retourner le membre trouvé
    reply.send({ message: "Membre trouvé", member });
  } catch (error) {
    console.error("Erreur lors de la récupération du membre:", error);

    // Vérifier si l'erreur est liée à un ID invalide
    if (error.name === "CastError") {
      return reply.status(400).send({ message: "ID de membre invalide" });
    }

    // Gérer les autres types d'erreurs
    reply.status(500).send({
      message: "Une erreur est survenue lors de la récupération du membre.",
    });
  }
}

// __________________________
// Supprimer un membre par son ID
async function deleteMember(request, reply) {
  const { id } = request.params; // Obtenez l'ID du membre depuis les paramètres de la requête

  try {
    // Validation du format de l'ID (facultatif)
    if (!id) {
      return reply.status(400).send({ message: "L'ID du membre est requis" });
    }

    // Tentez de trouver et de supprimer le membre
    const deletedMember = await Member.findByIdAndDelete(id);

    // Vérifiez si le membre a été trouvé et supprimé
    if (!deletedMember) {
      return reply.status(404).send({ message: "Membre non trouvé" });
    }

    // Répondez avec un message de succès
    reply.send({ message: "Membre supprimé avec succès" });
  } catch (error) {
    // Gérez les erreurs qui surviennent pendant le processus de suppression
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
