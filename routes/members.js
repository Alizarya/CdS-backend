const memberController = require("../controllers/members");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  // ____________________________________________
  // Liste des membres
  fastify.get("/members", {
    schema: {
      description: "Route pour récupérer la liste de tous les membres.",
      tags: ["Member"],
      summary: "Liste des membres",
    },
    handler: memberController.getAllMembers,
  });

  // ____________________________________________
  // Fiche membre
  fastify.get("/members/:id", {
    schema: {
      description: "Route pour récupérer les informations d'un membre.",
      tags: ["Member"],
      summary: "Fiche membre",
      params: {
        type: "object",
        required: ["id"],
        additionalProperties: false,
        properties: {
          id: { type: "string" },
        },
      },
    },
    handler: memberController.getMember,
  });

  // ____________________________________________
  // Suppression
  fastify.delete("/members/:id", {
    preHandler: auth,
    schema: {
      description: "Route pour supprimer un membre.",
      tags: ["Member"],
      summary: "Suppression membre",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        additionalProperties: false,
        properties: {
          id: { type: "string" },
        },
      },
    },
    handler: memberController.deleteMember,
  });

  // ____________________________________________
  // Création
  fastify.post("/members", {
    preHandler: auth,
    schema: {
      description: "Route pour créer un membre.",
      tags: ["Member"],
      summary: "Création membre",
      security: [{ bearerAuth: [] }],

      body: {
        type: "object",
        additionalProperties: false,
        required: ["userId"],
        properties: {
          userId: {
            type: "string",
            maxLength: 100,
          },

          pseudo: {
            type: "string",
            maxLength: 100,
          },

          nom: {
            type: "string",
            maxLength: 100,
          },

          image: {
            type: "string",
          },

          tags: {
            type: "array",
            items: {
              type: "string",
              maxLength: 50,
            },
          },

          shortdescription: {
            type: "string",
            maxLength: 500,
          },

          description: {
            type: "string",
            maxLength: 10000,
          },

          content_format: {
            type: "string",
            maxLength: 100,
          },

          softDelete: {
            type: "boolean",
          },

          links: {
            type: "object",
            additionalProperties: false,
            properties: {
              website: { type: "string" },
              blog: { type: "string" },
              youtube: { type: "string" },
              twitch: { type: "string" },
              tiktok: { type: "string" },
              twitter: { type: "string" },
              bluesky: { type: "string" },
              mastodon: { type: "string" },
              facebook: { type: "string" },
              instagram: { type: "string" },
              threads: { type: "string" },
              linkedin: { type: "string" },
              podcast: { type: "string" },
              financement: { type: "string" },
              autres: { type: "string" },
            },
          },

          content: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                image: { type: "string" },
                link: { type: "string" },
                title: {
                  type: "string",
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  maxLength: 5000,
                },
              },
            },
          },
        },
      },
    },
    handler: memberController.createMember,
  });

  // ____________________________________________
  // Modification
  fastify.put("/members/:id", {
    preHandler: auth,
    schema: {
      description: "Route pour modifier un membre.",
      tags: ["Member"],
      summary: "Modification membre",
      security: [{ bearerAuth: [] }],

      params: {
        type: "object",
        required: ["id"],
        additionalProperties: false,
        properties: {
          id: { type: "string" },
        },
      },

      body: {
        type: "object",
        additionalProperties: false,
        properties: {
          userId: {
            type: "string",
            maxLength: 100,
          },

          pseudo: {
            type: "string",
            maxLength: 100,
          },

          nom: {
            type: "string",
            maxLength: 100,
          },

          image: {
            type: "string",
          },

          tags: {
            type: "array",
            items: {
              type: "string",
              maxLength: 50,
            },
          },

          shortdescription: {
            type: "string",
            maxLength: 500,
          },

          description: {
            type: "string",
            maxLength: 10000,
          },

          content_format: {
            type: "string",
            maxLength: 100,
          },

          softDelete: {
            type: "boolean",
          },

          links: {
            type: "object",
            additionalProperties: false,
            properties: {
              website: { type: "string" },
              blog: { type: "string" },
              youtube: { type: "string" },
              twitch: { type: "string" },
              tiktok: { type: "string" },
              twitter: { type: "string" },
              bluesky: { type: "string" },
              mastodon: { type: "string" },
              facebook: { type: "string" },
              instagram: { type: "string" },
              threads: { type: "string" },
              linkedin: { type: "string" },
              podcast: { type: "string" },
              financement: { type: "string" },
              autres: { type: "string" },
            },
          },

          content: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                image: { type: "string" },
                link: { type: "string" },
                title: {
                  type: "string",
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  maxLength: 5000,
                },
              },
            },
          },
        },
      },
    },
    handler: memberController.updateMember,
  });
}

module.exports = routes;
