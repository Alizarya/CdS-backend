const memberController = require("../controllers/member");

async function routes(fastify, options) {
  // Route pour afficher un membre
  fastify.get("/member:id", {
    schema: {
      description: "Route pour récupérer les infos d'un ou d'une membre.",
      tags: ["Member"],
      summary: "Fiche membre",
      // Autres détails de la documentation
      // ...
    },
    handler: memberController.getMember,
  });

  // Route pour supprimer un membre
  fastify.delete("/member:id", {
    schema: {
      description: "Route pour supprimer un ou une membre.",
      tags: ["Member"],
      summary: "Suppression membre",
      // Autres détails de la documentation
      // ...
    },
    handler: memberController.deleteMember,
  });

  // Route pour ajouter un membre
  fastify.post("/member:id", {
    schema: {
      description: "Route pour créer un ou une membre.",
      tags: ["Member"],
      summary: "Création membre",
      // Autres détails de la documentation
      // ...
    },
    handler: memberController.createMember,
  });

  // Route pour modifier un membre
  fastify.put("/member:id", {
    schema: {
      description: "Route pour modifier les infos d'un ou d'une membre.",
      tags: ["Member"],
      summary: "Modification membre",
      // Autres détails de la documentation
      // ...
    },
    handler: memberController.updateMember,
  });
}

module.exports = routes;
