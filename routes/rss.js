const rssController = require("../controllers/rss");
const auth = require("../middlewares/auth");

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
    preHandler: auth,
    schema: {
      description: "Route pour ajouter un flux RSS à la liste des sources.",
      tags: ["RSS"],
      summary: "Ajouter un flux RSS",
    },
    handler: rssController.addRss,
  });

  // Supprimer un flux RSS
  fastify.delete("/rss/:id", {
    preHandler: auth,
    schema: {
      description: "Route pour supprimer un flux RSS de la liste des sources.",
      tags: ["RSS"],
      summary: "Supprimer un flux RSS",
    },
    handler: rssController.deleteRss,
  });
}

module.exports = routes;
