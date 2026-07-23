require("dotenv").config();

const transporter = require("../services/mailer");

//_____________________________________________________________________
// Mail de contact classique

async function contact(request, reply) {
  try {
    const { contactFixed, contactMessage } = request.body;

    const mailOptions = {
      from: `"${contactFixed.name}" <${process.env.SMTP_MAIL}>`,
      to: process.env.MAIL_ORG,
      subject: `Message de ${contactFixed.name} : ${contactFixed.subject}`,
      text: contactMessage.message,
      replyTo: contactFixed.email,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email envoyé :", info.messageId);

    reply.send({
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);

    reply.status(500).send({
      message: "Erreur lors de l'envoi de l'email",
    });
  }
}

//_____________________________________________________________________
// Mail de candidature

async function candidacy(request, reply) {
  reply.send({
    message: "route ok - candidacy",
  });
}

//_____________________________________________________________________
// Mail de parrainage / marrainage

async function sponsorship(request, reply) {
  reply.send({
    message: "route ok - sponsorship",
  });
}

module.exports = {
  contact,
  candidacy,
  sponsorship,
};
