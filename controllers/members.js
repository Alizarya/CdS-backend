const Member = require("../models/member");

// Contrôleur pour récupérer tous les membres
const getAllMembers = async (request, reply) => {
  try {
    const members = await Member.find();
    return members;
  } catch (err) {
    reply
      .status(500)
      .send({ error: "Erreur lors de la récupération des membres" });
  }
};

module.exports = {
  getAllMembers,
};
