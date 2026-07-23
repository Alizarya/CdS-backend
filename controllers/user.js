require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../services/mailer");

//_____________________________________________________________________
// POUR LES TESTS
function test() {
  return { message: "Route GET /user fonctionnelle et valide avec controller" };
}

//_____________________________________________________________________
// Gestion de l'inscription d'un user

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

async function signup(request, reply) {
  const { code, password, radioButtonChecked } = request.body;
  const email = request.body.email?.trim().toLowerCase();

  if (!code || !email || !password || !radioButtonChecked) {
    return reply.code(400).send({
      message: "Champs requis manquants",
    });
  }

  if (!passwordRegex.test(password)) {
    return reply.code(400).send({
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule et un chiffre.",
    });
  }

  try {
    if (code !== process.env.SIGNUP_CODE) {
      return reply.code(403).send({
        message:
          "Code d'inscription incorrect, rapprochez-vous du bureau de l'association pour obtenir un code valide.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    try {
      const mailOptions = {
        from: '"Le café des sciences" <no-reply@cafe-sciences.org>',
        to: email,
        subject: "Confirmation d'inscription",
        html: `
          <p>Bonjour,</p>

          <p>Votre inscription sur le site du Café des Sciences a bien été prise en compte.</p>

          <p>
            Vous pouvez désormais vous connecter en
            <a href="https://cafe-sciences.org/login">cliquant ici</a>.
          </p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      // Le compte est déjà créé : on journalise simplement l'erreur.
      console.error(
        "Erreur lors de l'envoi du mail de confirmation :",
        mailError,
      );
    }

    return reply.code(201).send({
      message: "Inscription réussie.",
      user: {
        id: savedUser._id,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);

    if (error.name === "ValidationError" || error.code === 11000) {
      return reply.code(409).send({
        message: "Cet e-mail est déjà enregistré.",
      });
    }

    return reply.code(500).send({
      message: "Erreur lors de l'inscription.",
    });
  }
}

//_____________________________________________________________________
// Gestion de la connexion du user

async function login(request, reply) {
  const { password } = request.body;
  const email = request.body.email?.trim().toLowerCase();

  if (!email || !password) {
    return reply.code(400).send({
      message: "Veuillez fournir l'email et le mot de passe.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return reply.code(401).send({
        message: "Adresse e-mail ou mot de passe incorrect.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.code(401).send({
        message: "Adresse e-mail ou mot de passe incorrect.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "60m",
    });

    reply.send({
      message: "Connexion réussie",
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);

    reply.code(500).send({
      message: "Erreur lors de la connexion.",
    });
  }
}

//_____________________________________________________________________
// Gestion de l'envoi du mail pour mot de passe perdu
async function mailToResetPassword(request, reply) {
  const email = request.body.email?.trim().toLowerCase();
  const resetToken = crypto.randomBytes(20).toString("hex");

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return reply.send({
        message:
          "Si cette adresse existe, un e-mail de réinitialisation a été envoyé.",
      });
    }

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 heure

    await user.save();

    const resetLink = `https://www.cafe-sciences.org/ResetPassword/${resetToken}`;

    const mailOptions = {
      from: '"Le café des sciences" <no-reply@cafe-sciences.org>',
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: `
        <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant :</p>

        <p>
          <a href="${resetLink}">
            ${resetLink}
          </a>
        </p>

        <p>Vous disposez d'une heure pour modifier votre mot de passe.</p>

        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez simplement ignorer cet e-mail.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    reply.send({
      message:
        "Si cette adresse existe, un e-mail de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de réinitialisation :",
      error,
    );

    reply.code(500).send({
      message: "Erreur lors de l'envoi de l'email de réinitialisation.",
    });
  }
}

//_____________________________________________________________________
// Gestion de la réinitialisation du mot de passe

async function resetPassword(request, reply) {
  const { resetToken, password } = request.body;
  const email = request.body.email?.trim().toLowerCase();

  try {
    const user = await User.findOne({
      resetToken,
      email,
    });

    if (!user) {
      return reply.code(404).send({
        message: "Utilisateur ou utilisatrice non trouvé(e).",
      });
    }

    if (!user.resetTokenExpiration || user.resetTokenExpiration < Date.now()) {
      return reply.code(400).send({
        message: "Le lien de réinitialisation du mot de passe a expiré.",
      });
    }

    if (!passwordRegex.test(password)) {
      return reply.code(400).send({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule et un chiffre.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiration = null;

    await user.save();

    const mailOptions = {
      from: '"Le café des sciences" <no-reply@cafe-sciences.org>',
      to: email,
      subject: "Confirmation de réinitialisation de mot de passe",
      html: `
        <p>Votre mot de passe a été réinitialisé avec succès.</p>

        <p>
          Vous pouvez maintenant vous connecter à votre compte
          avec votre nouveau mot de passe.
        </p>

        <p>
          Si vous n'êtes pas à l'origine de cette demande,
          veuillez contacter le bureau de l'association.
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);

    reply.send({
      message:
        "Mot de passe réinitialisé avec succès. Un e-mail de confirmation vient de vous être envoyé.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error,
    );

    reply.code(500).send({
      message: "Erreur lors de la réinitialisation du mot de passe.",
    });
  }
}

//_____________________________________________________________________
// Mise à jour du mot de passe (utilisateur connecté)

async function updatePassword(request, reply) {
  const { email, password } = request.body;

  // TODO: ajouter la logique réelle pour mettre à jour le mot de passe
  reply.send({ message: "Mot de passe mis à jour avec succès" });
}

//_____________________________________________________________________
// Mise à jour de l'email (utilisateur connecté)

async function updateEmail(request, reply) {
  const { email, password } = request.body;

  // TODO: ajouter la logique réelle pour mettre à jour l'email
  reply.send({ message: "Email mis à jour avec succès" });
}

//_____________________________________________________________________
module.exports = {
  test,
  signup,
  login,
  mailToResetPassword,
  resetPassword,
  updatePassword,
  updateEmail,
};
