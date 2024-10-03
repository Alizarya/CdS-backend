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
  // Route pour se connecter
  fastify.post("/user/login", {
    schema: {
      description: "Route pour permettre à un ou une membre de se connecter.",
      tags: ["User"],
      summary: "Connexion à l'espace membre",
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Adresse e-mail de l'utilisateur",
          },
          password: {
            type: "string",
            description: "Mot de passe de l'utilisateur",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Message de confirmation de connexion",
            },
            token: {
              type: "string",
              description: "Jeton JWT pour l'authentification",
            },
            userId: {
              type: "string",
              description: "Id de l'utilisateurice",
            },
          },
        },
        400: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Erreur si des données requises sont manquantes",
            },
          },
        },
        401: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Erreur si l'adresse e-mail ou le mot de passe est incorrect",
            },
          },
        },
        500: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Erreur lors de la connexion",
            },
          },
        },
      },
    },
    handler: userController.login,
  });

  //____________________________________________
  // Route pour recevoir le lien de réinitialisation du mot de passe perdu
  fastify.post("/user/reset-password", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de réinitialiser son mot de passe.",
      tags: ["User"],
      summary: "Réinitialisation du mot de passe",
      body: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description:
              "Adresse e-mail de l'utilisateur pour la réinitialisation",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Message de confirmation de l'envoi de l'email de réinitialisation",
            },
          },
        },
        404: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Erreur si l'utilisateur n'est pas trouvé",
            },
          },
        },
        500: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Erreur lors de l'envoi de l'email de réinitialisation",
            },
          },
        },
      },
    },
    handler: userController.mailToResetPassword,
  });

  //____________________________________________
  // Route pour réinitialiser le mot de passe perdu
  fastify.patch("/user/reset-password", {
    schema: {
      description:
        "Permet à un utilisateur de réinitialiser son mot de passe perdu en utilisant un lien de réinitialisation.",
      tags: ["User"],
      summary: "Réinitialisation du mot de passe perdu",
      body: {
        type: "object",
        properties: {
          resetToken: {
            type: "string",
            description: "Token de réinitialisation",
          },
          email: {
            type: "string",
            format: "email",
            description: "Adresse e-mail de l'utilisateur",
          },
          password: {
            type: "string",
            description: "Nouveau mot de passe à définir",
          },
        },
        required: ["resetToken", "email", "password"],
      },
      response: {
        200: {
          description: "Succès de la réinitialisation du mot de passe",
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Message indiquant que le mot de passe a été réinitialisé avec succès.",
            },
          },
        },
        400: {
          description: "Erreur lors de la réinitialisation du mot de passe",
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Message d'erreur indiquant le problème lors de la réinitialisation du mot de passe.",
            },
          },
        },
        404: {
          description: "Utilisateur non trouvé",
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Message indiquant que l'utilisateur n'a pas été trouvé.",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Message d'erreur en cas de problème interne du serveur.",
            },
          },
        },
      },
    },
    handler: userController.resetPassword,
  });

  //____________________________________________
  // Route pour mettre à jour le mot de passe
  fastify.patch("/user/update-password", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de mettre à jour son mot de passe.",
      tags: ["User"],
      summary: "Mise à jour du mot de passe",
    },
    preHandler: auth,
    handler: userController.updatePassword,
  });

  //____________________________________________
  // Route pour mettre à jour l'email
  fastify.patch("/user/update-email", {
    schema: {
      description:
        "Route pour permettre à un ou une membre de mettre à jour son adresse email.",
      tags: ["User"],
      summary: "Mise à jour de l'email",
    },
    preHandler: auth,
    handler: userController.updateEmail,
  });
}

module.exports = routes;
