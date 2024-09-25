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
    // 1. Récupérer les données envoyées dans la requête
    const {
      userId,
      email,
      pseudo,
      nom,
      image,
      tags,
      shortdescription,
      description,
      links,
      content,
    } = request.body;

    // Vérifiez les valeurs reçues dans les logs
    console.log("Données reçues:", request.body);

    // 2. Validation des champs obligatoires
    if (!userId || !email || !pseudo || !tags || !shortdescription) {
      return reply
        .status(400)
        .send({ message: "Certains champs obligatoires sont manquants." });
    }

    // 3. Vérification et traitement de 'content'
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

    // 4. Vérification et traitement de 'links'
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

    // 5. Créer un nouveau membre
    const newMember = new Member({
      userId,
      email,
      pseudo,
      nom: nom || "",
      image: image || "",
      tags: tags.split(",").map((tag) => tag.trim()),
      shortdescription,
      description: description || "",
      links: parsedLinks, // Utiliser le lien analysé
      content: parsedContent.map((item) => ({
        image: item.image || "",
        link: item.link || "", // Assurez-vous que c'est 'link'
        title: item.title || "", // Assurez-vous que c'est 'title'
        description: item.description || "",
      })),
    });

    // 6. Sauvegarder le membre dans la base de données
    await newMember.save();

    // 7. Retourner une réponse de succès
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
