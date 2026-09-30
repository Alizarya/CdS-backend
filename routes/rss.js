const rssController = require("../controllers/rss");

const communicationAuth = require("../middlewares/communicationAuth");

async function routes(fastify, options) {
  // Récupérer le flux RSS agrégé
  fastify.get("/rss", {
    schema: {
      description: "Route pour récupérer le flux RSS agrégé des membres.",
      tags: ["RSS"],
      summary: "Flux RSS agrégé",
    },
    handler: rssController.getRss,
  });

  // Ajouter un flux RSS
  fastify.post("/rss", {
    preHandler: communicationAuth,
    schema: {
      description: "Route pour ajouter un flux RSS à la liste des sources.",
      tags: ["RSS"],
      summary: "Ajouter un flux RSS",
    },
    handler: rssController.addRss,
  });

  // Modifier un flux RSS
  fastify.put("/rss/:id", {
    preHandler: communicationAuth,
    schema: {
      description: "Route pour modifier un flux RSS.",
      tags: ["RSS"],
      summary: "Modifier un flux RSS",
    },
    handler: rssController.updateRss,
  });

  // Supprimer un flux RSS
  fastify.delete("/rss/:id", {
    preHandler: communicationAuth,
    schema: {
      description: "Route pour supprimer un flux RSS de la liste des sources.",
      tags: ["RSS"],
      summary: "Supprimer un flux RSS",
    },
    handler: rssController.deleteRss,
  });
}

module.exports = routes;
