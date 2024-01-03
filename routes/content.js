const contentController = require("../controllers/content");

async function routes(fastify, options) {
  // Route pour afficher les contenus
  fastify.get("/content", {
    schema: {
      description: "Route pour récupérer tous les contenus.",
      tags: ["Content"],
      summary: "Contenus du site",
      // Autres détails de la documentation
      // ...
    },
    handler: contentController.getContent,
  });

  // Route pour supprimer un contenu
  fastify.delete("/content:id", {
    schema: {
      description: "Route pour supprimer un contenu.",
      tags: ["Content"],
      summary: "Suppression contenu",
      // Autres détails de la documentation
      // ...
    },
    handler: contentController.deleteContent,
  });

  // Route pour ajouter un contenu
  fastify.post("/content", {
    schema: {
      description: "Route pour créer un nouveau contenu.",
      tags: ["Content"],
      summary: "Création contenu",
      // Autres détails de la documentation
      // ...
    },
    handler: contentController.createContent,
  });

  // Route pour modifier un membre
  fastify.put("/content:id", {
    schema: {
      description: "Route pour modifier les infos d'un contenu.",
      tags: ["Content"],
      summary: "Modification contenu",
      // Autres détails de la documentation
      // ...
    },
    handler: contentController.updateContent,
  });
}

module.exports = routes;
