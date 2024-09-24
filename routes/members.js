const { getAllMembers } = require("../controllers/members");

async function routes(fastify) {
  fastify.get("/members", getAllMembers);
}

module.exports = routes;
