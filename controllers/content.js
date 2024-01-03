async function getContent(request, reply) {
  reply.send({ message: "route ok - getContent" });
}

async function deleteContent(request, reply) {
  reply.send({ message: "route ok - deleteContent" });
}

async function createContent(request, reply) {
  reply.send({ message: "route ok - createContent" });
}

async function updateContent(request, reply) {
  reply.send({ message: "route ok - updateContent" });
}

module.exports = {
  getContent,
  deleteContent,
  createContent,
  updateContent,
};
