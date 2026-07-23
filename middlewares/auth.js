// Chargement des variables d'environnement
require("dotenv").config();

const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

module.exports = (request, reply, done) => {
  try {
    // Vérifie que le header Authorization est présent
    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.status(401).send({
        error: "Token d'authentification manquant.",
      });
    }

    // Vérifie le format "Bearer <token>"
    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return reply.status(401).send({
        error: "Format du token invalide.",
      });
    }

    const token = parts[1];

    // Vérification du JWT
    const decodedToken = jwt.verify(token, secretKey);

    // Ajout des informations utilisateur à la requête
    request.auth = {
      userId: decodedToken.userId,
    };

    done();
  } catch (error) {
    return reply.status(401).send({
      error: "Token invalide ou expiré.",
    });
  }
};
