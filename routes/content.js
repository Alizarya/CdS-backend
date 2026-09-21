const contentController = require("../controllers/content");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  // Récupérer tous les contenus
  fastify.get("/content", {
    schema: {
      description: "Route pour récupérer tous les contenus.",
      tags: ["Content"],
      summary: "Liste des contenus",
    },
    handler: contentController.getContent,
  });

  // Récupérer un contenu par son ID
  fastify.get("/content/:id", {
    schema: {
      description: "Route pour récupérer un contenu par son ID.",
      tags: ["Content"],
      summary: "Contenu par ID",
    },
    handler: contentController.getContentById,
  });

  // Créer un contenu
  fastify.post("/content", {
    preHandler: auth,
    schema: {
      description: "Route pour créer un nouveau contenu.",
      tags: ["Content"],
      summary: "Création contenu",
    },
    handler: contentController.createContent,
  });

  // Modifier un contenu
  fastify.put("/content/:id", {
    preHandler: auth,
    schema: {
      description: "Route pour modifier un contenu.",
      tags: ["Content"],
      summary: "Modification contenu",
    },
    handler: contentController.updateContent,
  });

  // Supprimer un contenu
  fastify.delete("/content/:id", {
    preHandler: auth,
    schema: {
      description: "Route pour supprimer un contenu.",
      tags: ["Content"],
      summary: "Suppression contenu",
    },
    handler: contentController.deleteContent,
  });
}

module.exports = routes;
