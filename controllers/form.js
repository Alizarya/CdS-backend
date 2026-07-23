require("dotenv").config();

const transporter = require("../services/mailer");

//_____________________________________________________________________
// Mail de contact classique

async function contact(request, reply) {
  try {
    const { contactFixed, contactMessage } = request.body;

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: process.env.MAIL_ORG,
      replyTo: contactFixed.email,
      subject: `Message de ${contactFixed.name} : ${contactFixed.subject}`,
      text: contactMessage.message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email envoyé :", info.messageId);

    return reply.send({
      success: true,
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      success: false,
      message: error.message,
    });
  }
}

//_____________________________________________________________________
// Mail de candidature

async function candidacy(request, reply) {
  try {
    const { contactFixed, contactMessage } = request.body;

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: process.env.MAIL_ORG,
      replyTo: contactFixed.email,
      subject: contactFixed.subject,
      text: contactMessage.message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email envoyé :", info.messageId);

    return reply.send({
      success: true,
      message: "Candidature envoyée.",
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      success: false,
      message: error.message,
    });
  }
}

//_____________________________________________________________________
// Mail de parrainage / marrainage

async function sponsorship(request, reply) {
  try {
    const { contactFixed, contactMessage } = request.body;

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: process.env.MAIL_ORG,
      replyTo: contactFixed.email,
      subject: contactFixed.subject,
      text: contactMessage.message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email envoyé :", info.messageId);

    return reply.send({
      success: true,
      message: "Demande envoyée.",
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  contact,
  candidacy,
  sponsorship,
};
