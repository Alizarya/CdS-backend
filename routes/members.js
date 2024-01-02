// members.js
async function routes(fastify) {
  fastify.get("/members", async (request, reply) => {
    return { message: "Liste de tous les membres" };
  });
}

module.exports = routes;
