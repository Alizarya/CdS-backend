const userController = require("../controllers/user");
const auth = require("../middlewares/auth");

async function routes(fastify, options) {
  // Route GET pour mes test
  fastify.get("/user", userController.test);

  // Route pour s'inscrire
  fastify.post("/user/signup", userController.signup);

  // Route pour se connecter
  fastify.post("/user/login", userController.login);

  // Route pour réinitialiser le mot de passe perdu
  fastify.post("/user/reset-password", userController.resetPassword);

  // Route pour mettre à jour le mot de passe
  fastify.put(
    "/user/update-password",
    { preHandler: auth },
    userController.updatePassword
  );

  // Route pour mettre à jour l'email
  fastify.put(
    "/user/update-email",
    { preHandler: auth },
    userController.updateEmail
  );
}

module.exports = routes;
