const formController = require("../controllers/form");

async function routes(fastify, options) {
  // Route pour envoyer un message
  fastify.post("/form/contact", {
    schema: {
      description:
        "Route pour permettre à une personne d'envoyer un message libre.",
      tags: ["Form"],
      summary: "Message libre",
      // Autres détails de la documentation
      // ...
    },
    handler: formController.contact,
  });

  // Route pour candidater
  fastify.post("/form/candidacy", {
    schema: {
      description:
        "Route pour permettre à une personne d'envoyer une candidature au bureau.",
      tags: ["Form"],
      summary: "Candidature",
      // Autres détails de la documentation
      // ...
    },
    handler: formController.candidacy,
  });

  // Route pour être p-marrainé-e
  fastify.post("/form/sponsorship", {
    schema: {
      description:
        "Route pour permettre à une personne d'envoyer une candidature avec parrainage ou marrainage au bureau.",
      tags: ["Form"], // Tags pour regrouper vos endpoints
      summary: "P-Marrainage",
      // Autres détails de la documentation
      // ...
    },
    handler: formController.sponsorship,
  });
}

module.exports = routes;
