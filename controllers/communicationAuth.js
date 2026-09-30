const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const communicationLogin = async (request, reply) => {
  try {
    const { password } = request.body;

    if (!password) {
      return reply.status(400).send({
        message: "Mot de passe requis.",
      });
    }

    const passwordHash = process.env.COMMUNICATION_PASSWORD_HASH;

    if (!passwordHash) {
      request.log.error("COMMUNICATION_PASSWORD_HASH n'est pas configuré.");

      return reply.status(500).send({
        message: "Configuration du serveur incorrecte.",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, passwordHash);

    if (!passwordIsValid) {
      return reply.status(401).send({
        message: "Mot de passe incorrect.",
      });
    }

    const token = jwt.sign(
      {
        role: "communication",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      },
    );

    return reply.status(200).send({
      message: "Connexion réussie.",
      token,
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      message: "Une erreur interne est survenue.",
    });
  }
};

module.exports = {
  communicationLogin,
};
