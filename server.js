// Import du framework
const fastify = require("fastify")({ logger: true });

// Import des éléments pour les fichiers statiques
const path = require("path");
const fastifyStatic = require("@fastify/static");

// Gestion de swagger
fastify.register(require("@fastify/swagger"), {
  openapi: {
    info: {
      title: "Le Café des Sciences",
      description:
        "Documentation des routes API de l'application backend du café des sciences",
      version: "1.0.0",
    },
  },
});

fastify.register(require("@fastify/swagger-ui"), {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Connexion à MongoDB
require("dotenv").config();
const fastifyMongo = require("@fastify/mongodb");
fastify
  .register(fastifyMongo, {
    url: `mongodb+srv://cds_admin:${process.env.MONGODB_PASSWORD}@cafedessciences.55uxeqd.mongodb.net`,
  })
  .then(() => {
    console.log("Connexion à DB réussie !");
    start(); // Démarrage du serveur après la connexion à MongoDB
  })
  .catch((err) => {
    console.error("Erreur de connexion à DB :", err);
  });

// Gestion du cors
const fastifyCors = require("@fastify/cors");
fastify.register(fastifyCors, {
  origin: ["http://localhost:3000"], // Ajouter ici la future origine quand je l'aurai
  methods: ["GET", "POST", "PUT", "DELETE"],
});

// Sécuriser contre le DDoS
const fastifyRateLimit = require("@fastify/rate-limit");
const postRateLimit = (req, res, done) => {
  if (req.raw.method === "POST") {
    done();
  } else {
    done(null);
  }
};

fastify.register(fastifyRateLimit, {
  global: false,
  max: 1,
  timeWindow: "20 seconds",
  skipOnError: true,
  skip: postRateLimit,
});

// Utilisation de Fastify Helmet pour sécuriser l'application
// fastify.register(fastifyHelmet);
// à configurer

// Import des routes
fastify.register(require("./routes/user"));
fastify.register(require("./routes/content"));
fastify.register(require("./routes/form"));
fastify.register(require("./routes/member"));
fastify.register(require("./routes/members"));

// Route du serveur
fastify.get("/", async (request, reply) => {
  return { message: "Le serveur te sert le café" };
});

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
    //await fastify.listen({ path: "passenger" });
    console.log("Le serveur est prêt à te servir un café");
  } catch (err) {
    console.error("Erreur lors du démarrage du serveur :", err);
    process.exit(1);
  }
};
