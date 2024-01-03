async function contact(request, reply) {
  reply.send({ message: "route ok - contact" });
}

async function candidacy(request, reply) {
  reply.send({ message: "route ok - candidacy" });
}

async function sponsorship(request, reply) {
  reply.send({ message: "route ok - sponsorship" });
}

module.exports = {
  contact,
  candidacy,
  sponsorship,
};
