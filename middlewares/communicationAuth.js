require("dotenv").config();

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secretKey = process.env.JWT_SECRET;

module.exports = async (request, reply) => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.status(401).send({
        error: "Token d'authentification manquant.",
      });
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return reply.status(401).send({
        error: "Format du token invalide.",
      });
    }

    const token = parts[1];

    const decodedToken = jwt.verify(token, secretKey);

    // Connexion avec le mot de passe communication
    if (decodedToken.role === "communication") {
      request.auth = {
        role: "communication",
      };

      return;
    }

    // Connexion avec le compte membre association@cafe-sciences.org
    if (decodedToken.userId) {
      const user = await User.findById(decodedToken.userId);

      if (
        user &&
        user.email.toLowerCase() === "association@cafe-sciences.org"
      ) {
        request.auth = {
          role: "communication",
          userId: user._id,
        };

        return;
      }
    }

    return reply.status(403).send({
      error: "Accès réservé à la communication.",
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(401).send({
      error: "Token invalide ou expiré.",
    });
  }
};
