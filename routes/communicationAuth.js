const communicationAuthController = require("../controllers/communicationAuth");

async function routes(fastify, options) {
  fastify.post("/communication/login", {
    schema: {
      description: "Connexion à l'espace de gestion de la communication.",
      tags: ["Communication"],
      summary: "Connexion communication",

      body: {
        type: "object",
        required: ["password"],
        properties: {
          password: {
            type: "string",
            description: "Mot de passe de communication",
          },
        },
      },

      response: {
        200: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            token: {
              type: "string",
            },
          },
        },

        400: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },

        401: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },

        500: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
      },
    },

    config: {
      rateLimit: {
        max: 5,
        timeWindow: "15 minutes",
      },
    },

    handler: communicationAuthController.communicationLogin,
  });
}

module.exports = routes;
