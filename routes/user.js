const userController = require("../controllers/user");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  //____________________________________________
  // Route GET pour mes tests avec commentaire de schéma
  fastify.get("/user", {
    schema: {
      description: "Route pour effectuer des tests.",
      tags: ["User"],
      summary: "Endpoint de test",
      response: {
        200: {
          properties: {
            message: { type: "string", description: "Réussite" },
            data: {
              type: "object",
              description: "Données envoyées avec message de test",
            },
          },
        },
        401: {
          properties: {
            message: { type: "string", description: "Unauthorized" },
            data: {
              type: "object",
              description: "User non authorisé à acceder au contenu",
            },
          },
        },
        404: {
          properties: {
            message: { type: "string", description: "Error 404" },
            data: {
              type: "object",
              description: "Redirection vers la page d'erreur",
            },
          },
        },
      },
    },
    handler: userController.test,
  });

  //____________________________________________
  // Route pour s'inscrire
  fastify.post("/user/signup", {
    schema: {
      description: "Route pour permettre à un ou une membre de s'inscrire.",
      tags: ["User"],
      summary: "Inscription à l'espace membre",
      body: {
        type: "object",
        required: ["code", "email", "password", "radioButtonChecked"],
        properties: {
          code: { type: "string" },
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            minLength: 8,
            pattern: "^(?=.*[A-Z])(?=.*[0-9]).{8,}$",
          },
          radioButtonChecked: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            user: { type: "object" },
          },
        },
        400: { type: "object", properties: { message: { type: "string" } } },
        403: { type: "object", properties: { message: { type: "string" } } },
        409: { type: "object", properties: { message: { type: "string" } } },
        500: { type: "object", properties: { message: { type: "string" } } },
      },
    },
    handler: userController.signup,
  });

  //____________________________________________
  // Route pour se connecter avec commentaire de schéma
  fastify.post("/user/login", {
    schema: {
      description: "Route pour permettre à un ou une membre de se connecter.",
      tags: ["User"],
      summary: "Connexion à l'espace membre",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.login,
  });

  // Ajoutez des commentaires de schéma pour les autres routes de la même manière

  //____________________________________________
  // Route pour recevoir le lien de réinitialisation du mot de passe perdu
  fastify.post("/user/reset-password", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de réinitialiser son mot de passe.",
      tags: ["User"],
      summary: "Réinitialisation du mot de passe",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.mailToResetPassword,
  });

  //____________________________________________
  // Route pour réinitialiser le mot de passe perdu
  fastify.patch("/user/reset-password", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de réinitialiser son mot de passe.",
      tags: ["User"],
      summary: "Réinitialisation du mot de passe",
      // Autres détails de la documentation
      // ...
    },
    handler: userController.resetPassword,
  });

  //____________________________________________
  // Route pour mettre à jour le mot de passe
  fastify.patch("/user/update-password", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de mettre à jour son mot de passe.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Mise à jour du mot de passe",
      // Autres détails de la documentation
      // ...
    },
    preHandler: auth,
    handler: userController.updatePassword,
  });

  //____________________________________________
  // Route pour mettre à jour l'email
  fastify.put("/user/update-email", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de mettre à jour son adresse email.",
      tags: ["User"], // Tags pour regrouper vos endpoints
      summary: "Mise à jour de l'email",
      // Autres détails de la documentation
      // ...
    },
    preHandler: auth,
    handler: userController.updateEmail,
  });
}

module.exports = routes;
