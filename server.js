// Import du framework
const fastify = require("fastify")({
  logger: {
    level: "info",

    redact: {
      paths: [
        "req.headers.authorization",
        "req.body.password",
        "req.body.resetToken",
        "req.body.newPassword",
        "req.body.token",
        "res.headers['set-cookie']",
      ],
      censor: "[REDACTED]",
    },
  },
});

// Import des éléments pour les fichiers statiques
const path = require("path");
const fastifyStatic = require("@fastify/static");

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "data", "images"),
  prefix: "/images/",
  decorateReply: false,
});

// Gestion de swagger
fastify.register(require("@fastify/swagger"), {
  openapi: {
    info: {
      title: "Le Café des Sciences",
      description:
        "Documentation des routes API de l'application backend du Café des Sciences",
      version: "1.0.0",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Saisissez uniquement votre token JWT, sans le préfixe 'Bearer '.",
        },
      },
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

// Connexion à MongoDB avec Mongoose
require("dotenv").config();
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connexion à MongoDB avec Mongoose réussie !");
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB avec Mongoose :", err);
  });

// Gestion du cors
const fastifyCors = require("@fastify/cors");

fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "https://www.cafe-sciences.org",
      "https://cafe-sciences.org",
      "http://localhost:3000",
    ];
    // Si pas d'origine (Postman, curl) ou l'origine est dans la liste
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Sécuriser contre le DDoS
const fastifyRateLimit = require("@fastify/rate-limit");

fastify.register(fastifyRateLimit, {
  global: false,
  skipOnError: true,
  errorResponseBuilder(request, context) {
    return {
      code: 429,
      error: "Too Many Requests",
      message: "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
    };
  },
});

// Utilisation de Fastify Helmet pour sécuriser l'application
const fastifyHelmet = require("@fastify/helmet");

fastify.register(fastifyHelmet, {
  contentSecurityPolicy: false,
});

// Import des routes
fastify.register(require("./routes/user"));
fastify.register(require("./routes/content"));
fastify.register(require("./routes/rss"));
fastify.register(require("./routes/form"));
fastify.register(require("./routes/members"));

// Route du serveur
fastify.get("/", async (request, reply) => {
  return { message: "Le serveur te sert le café" };
});

// Gestionnaire global des erreurs
fastify.setErrorHandler((error, request, reply) => {
  // Journalise l'erreur complète
  request.log.error(error);

  // Erreur de validation Fastify
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      message: "Les données envoyées sont invalides.",
      errors: error.validation,
    });
  }

  // Erreur HTTP connue
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
    });
  }

  // Erreur inattendue
  return reply.status(500).send({
    success: false,
    message: "Une erreur interne est survenue.",
  });
});

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
