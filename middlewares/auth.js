// Charger la variable d'environnement
require("dotenv").config();

// Import de la clef secrète
const secretKey = process.env.SECRET_KEY;

// Import de jwt
const jwt = require("jsonwebtoken");

module.exports = (req, reply, next) => {
  try {
    // Extraction du token JWT dans le header `Authorization`
    const token = req.headers.authorization.split(" ")[1];
    // Vérification de la validité du token
    const decodedToken = jwt.verify(token, secretKey);
    // Récupération de l'ID de l'utilisateur à partir du token décodé
    const userId = decodedToken.userId;
    // Ajout de l'ID de l'utilisateur authentifié à l'objet `auth` de la requête
    req.auth = {
      userId: userId,
    };
    next(); // Appel du middleware suivant
  } catch (error) {
    reply.status(401).send({ error: "Unauthorized" }); // Fastify utilise `send()` au lieu de `json()`
  }
};
