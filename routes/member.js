const memberController = require("../controllers/member");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  // Route pour afficher un membre
  fastify.get("/member:id", {
    schema: {
      description: "Route pour récupérer les infos d'un ou d'une membre.",
      tags: ["Member"],
      summary: "Fiche membre",
    },
    handler: memberController.getMember,
  });

  // Route pour supprimer un membre
  fastify.delete("/member:id", {
    schema: {
      description: "Route pour supprimer un ou une membre.",
      tags: ["Member"],
      summary: "Suppression membre",
    },
    handler: memberController.deleteMember,
  });

  // Route pour ajouter un membre
  fastify.post("/member", {
    schema: {
      description: "Route pour créer un ou une membre.",
      tags: ["Member"],
      summary: "Création membre",
    },
    handler: memberController.createMember,
  });

  // Route pour modifier un membre
  fastify.put("/member:id", {
    schema: {
      description: "Route pour modifier les infos d'un ou d'une membre.",
      tags: ["Member"],
      summary: "Modification membre",
    },
    handler: memberController.updateMember,
  });
}

module.exports = routes;
