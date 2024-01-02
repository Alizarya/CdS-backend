// Import du framework
const fastify = require("fastify")({ logger: true });

// Import des éléments pour les fichiers statiques
const path = require("path");
const fastifyStatic = require("@fastify/static");

// Import des controllers

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
fastify.register(fastifyHelmet);

// Import des routes
fastify.register(require("./routes/auth"));
fastify.register(require("./routes/content"));
fastify.register(require("./routes/form"));
fastify.register(require("./routes/member"));
fastify.register(require("./routes/members"));

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
    //await fastify.listen({ path: "passenger" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Le serveur est prêt à te servir un café");
};
start();
