const memberController = require("../controllers/members");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  // Route pour récupérer tous les membres
  fastify.get("/members", {
    schema: {
      description: "Route pour récupérer la liste de tous les membres.",
      tags: ["Member"],
      summary: "Liste des membres",
    },
    handler: memberController.getAllMembers,
  });

  // Route pour afficher un membre
  fastify.get("/members/:id", {
    schema: {
      description: "Route pour récupérer les infos d'un ou d'une membre.",
      tags: ["Member"],
      summary: "Fiche membre",
    },
    handler: memberController.getMember,
  });

  // Route pour supprimer un membre
  fastify.delete("/members/:id", {
    schema: {
      description: "Route pour supprimer un ou une membre.",
      tags: ["Member"],
      summary: "Suppression membre",
    },
    handler: memberController.deleteMember,
  });

  // Route pour ajouter un membre
  fastify.post("/members", {
    schema: {
      description: "Route pour créer un ou une membre.",
      tags: ["Member"],
      summary: "Création membre",
    },
    handler: memberController.createMember,
  });

  // Route pour modifier un membre
  fastify.put("/members/:id", {
    schema: {
      description: "Route pour modifier les infos d'un ou d'une membre.",
      tags: ["Member"],
      summary: "Modification membre",
    },
    handler: memberController.updateMember,
  });
}

module.exports = routes;
