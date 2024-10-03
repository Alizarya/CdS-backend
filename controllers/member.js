// Import du modèle
const Member = require("../models/member");

async function getMember(request, reply) {
  reply.send({ message: "route ok - getMember" });
}

async function deleteMember(request, reply) {
  reply.send({ message: "route ok - deleteMember" });
}

// __________________________
// Créer un nouveau membre

async function createMember(request, reply) {
  try {
    // Récupérer les données envoyées dans la requête
    const {
      userId,
      pseudo = "", // valeur par défaut
      nom = "", // valeur par défaut
      image = "", // valeur par défaut
      tags = "", // valeur par défaut
      shortdescription = "", // valeur par défaut
      description = "", // valeur par défaut
      links = {}, // valeur par défaut, un objet vide
      content_format = "", // valeur par défaut
      content = [], // valeur par défaut, un tableau vide
      softDelete = true, // valeur par défaut
    } = request.body;

    // Vérifiez les valeurs reçues dans les logs
    console.log("Données reçues:", request.body);

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

    // Filtrer et ne garder que les liens complétés, et limiter à 3
    const validLinks = Object.entries(parsedLinks)
      .filter(([key, value]) => value && value.trim() !== "")
      .slice(0, 3)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    // Créer un nouveau membre sans définir explicitement l'_id
    const newMember = new Member({
      userId, // Utiliser userId comme un champ normal
      pseudo,
      nom,
      image,
      tags: tags.split(",").map((tag) => tag.trim()),
      shortdescription,
      description,
      links: validLinks,
      content_format,
      content: parsedContent.map((item) => ({
        image: item.image || "",
        link: item.link || "",
        title: item.title || "",
        description: item.description || "",
      })),
      softDelete, // Utiliser la valeur fournie pour softDelete
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

async function updateMember(request, reply) {
  reply.send({ message: "route ok - updateMember" });
}

module.exports = {
  getMember,
  deleteMember,
  createMember,
  updateMember,
};
