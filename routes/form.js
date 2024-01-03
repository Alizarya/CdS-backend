const formController = require("../controllers/form");

async function routes(fastify, options) {
  // Route pour s'inscrire avec commentaire de schéma
  fastify.post("/form/contact", {
    schema: {
      description:
        "Route pour permettre à une personne d'envoyer un message libre.",
      tags: ["Form"],
      summary: "Message libre",
      // Autres détails de la documentation
      // ...
    },
    handler: formController.signup,
  });

  // Route pour se connecter avec commentaire de schéma
  fastify.post("/form/candidacy", {
    schema: {
      description:
        "Route pour permettre à une personne d'envoyer une candidature au bureau.",
      tags: ["Form"],
      summary: "Candidature",
      // Autres détails de la documentation
      // ...
    },
    handler: formController.login,
  });

  // Ajoutez des commentaires de schéma pour les autres routes de la même manière

  // Route pour réinitialiser le mot de passe perdu
  fastify.post("/form/sponsorship", {
    schema: {
      description:
        "Route pour permettre à une personne d'envoyer une candidature avec parrainage ou marrainage au bureau.",
      tags: ["Form"], // Tags pour regrouper vos endpoints
      summary: "P-Marrainage",
      // Autres détails de la documentation
      // ...
    },
    handler: formController.resetPassword,
  });
}

module.exports = routes;
