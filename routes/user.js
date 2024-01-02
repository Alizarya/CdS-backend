const userController = require("../controllers/user");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  // Route GET pour mes tests avec commentaire de schéma
  fastify.get("/user", {
    schema: {
      description: "Route pour effectuer des tests.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Endpoint de test",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.test,
  });

  // Route pour s'inscrire avec commentaire de schéma
  fastify.post("/user/signup", {
    schema: {
      description: "Route pour permettre à un utilisateur de s'inscrire.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Inscription d'un nouvel utilisateur",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.signup,
  });

  // Route pour se connecter avec commentaire de schéma
  fastify.post("/user/login", {
    schema: {
      description: "Route pour permettre à un utilisateur de se connecter.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Connexion d'un utilisateur",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.login,
  });

  // Ajoutez des commentaires de schéma pour les autres routes de la même manière

  // Route pour réinitialiser le mot de passe perdu
  fastify.post("/user/reset-password", {
    schema: {
      description:
        "Route pour permettre à un utilisateur de réinitialiser son mot de passe.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Réinitialisation du mot de passe pour un utilisateur",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.resetPassword,
  });

  // Route pour mettre à jour le mot de passe
  fastify.put("/user/update-password", {
    schema: {
      description:
        "Route pour permettre à un utilisateur de mettre à jour son mot de passe.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Mise à jour du mot de passe pour un utilisateur",
      // Autres détails de la documentation
      // ...
    },
    preHandler: auth,
    handler: userController.updatePassword,
  });

  // Route pour mettre à jour l'email
  fastify.put("/user/update-email", {
    schema: {
      description:
        "Route pour permettre à un utilisateur de mettre à jour son email.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Mise à jour de l'email pour un utilisateur",
      // Autres détails de la documentation
      // ...
    },
    preHandler: auth,
    handler: userController.updateEmail,
  });
}

module.exports = routes;
