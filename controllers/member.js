async function getMember(request, reply) {
  reply.send({ message: "route ok - getMember" });
}

async function deleteMember(request, reply) {
  reply.send({ message: "route ok - deleteMember" });
}

async function createMember(request, reply) {
  reply.send({ message: "route ok - createMember" });
}

async function updateMember(request, reply) {
  reply.send({ message: "route ok - updateMember" });
}

module.exports = {
  getMember,
  deleteMember,
  createMember,
  updateMember,
};
