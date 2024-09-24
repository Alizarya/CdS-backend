require("dotenv").config();
const nodemailer = require("nodemailer");

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

//_____________________________________________________________________
// Mail de contact classique
async function contact(request, reply) {
  try {
    const { contactFixed, contactMessage } = request.body;

    const mailOptions = {
      from: contactFixed.email,
      to: process.env.SMTP_MAIL,
      subject: `Message de ${contactFixed.name}: ${contactFixed.subject}`,
      text: contactMessage.message,
      replyTo: contactFixed.email,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé :", info.messageId);

    reply.send({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    reply.code(500).send({
      message: "Erreur lors de l'envoi de l'email",
    });
  }
}

//_____________________________________________________________________
// Mail de candidature
async function candidacy(request, reply) {
  reply.send({ message: "route ok - candidacy" });
}

//_____________________________________________________________________
// Mail de parainnage / marainnage
async function sponsorship(request, reply) {
  reply.send({ message: "route ok - sponsorship" });
}

module.exports = {
  contact,
  candidacy,
  sponsorship,
};
