// members.js
async function routes(fastify) {
  // Route GET pour /members affichant "Tous les membres"
  fastify.get("/members", async (request, reply) => {
    // Traitement de la route /members
    return { message: "Liste de tous les membres" };
  });
}

module.exports = routes;
