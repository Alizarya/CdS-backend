require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//_____________________________________________________________________
// POUR MES TESTS
function test() {
  return { message: "route GET user fonctionnelle et valide avec controller" };
}

//_____________________________________________________________________
// Gestion de l'inscription d'un user

// Regex pour validation du mot de passe
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

async function signup(request, reply) {
  const { code, email, password, radioButtonChecked } = request.body;

  // Validation des données
  if (!code || !email || !password || !radioButtonChecked) {
    return reply.code(400).send({ message: "Champs requis manquants" });
  }

  // Validation du mot de passe
  if (!passwordRegex.test(password)) {
    return reply.code(400).send({
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule et un chiffre.",
    });
  }

  try {
    // Vérification du code d'inscription
    const signupCode = process.env.SIGNUP_CODE;

    if (code !== signupCode) {
      return reply.code(403).send({
        message:
          "Code d'inscription incorrect, rapprochez vous du bureau de l'association pour obtenir un code valide.",
      });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'une nouvelle instance User
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    // Enregistrement dans la base de données
    const savedUser = await newUser.save();

    // Envoi de l'e-mail de confirmation d'inscription
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: "Le café des sciences",
        to: email,
        subject: "Confirmation d'inscription",
        html: `
        <p>Bonjour, votre inscription sur le site du café des sciences a bien été prise en compte !</p>
        <p>Vous pouvez désormais vous connecter en <a href="http://localhost:3000/Login">cliquant ici</a>.</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      reply.code(200).send({ message: "Inscription réussie", user: savedUser });
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'e-mail de confirmation :",
        error
      );
      reply.code(500).send({ message: "Erreur lors de l'inscription" });
    }
    reply.code(200).send({ message: "Inscription réussie", user: savedUser });
  } catch (error) {
    if (
      error.name === "ValidationError" &&
      error.errors &&
      error.errors.email
    ) {
      return reply
        .code(409)
        .send({ message: "Cet e-mail est déjà enregistré." });
    } else {
      console.error("Erreur lors de l'enregistrement :", error);
      reply.code(500).send({ message: "Erreur lors de l'inscription" });
    }
  }
}

// Gestion de la connexion du user
async function login(request, reply) {
  const { email, password } = request.body;

  // Vérification des données requises
  if (!email || !password) {
    return reply
      .code(400)
      .send({ message: "Veuillez fournir l'email et le mot de passe." });
  }

  try {
    // Recherche par email dans la BDD
    const user = await User.findOne({ email });
    console.log("User trouvé :", user);

    // Vérification si l'utilisateurice existe
    if (!user) {
      return reply
        .code(401)
        .send({ message: "Adresse e-mail ou mot de passe incorrect." });
    }

    // Vérification du mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply
        .code(401)
        .send({ message: "Adresse e-mail ou mot de passe incorrect." });
    }

    // Génération du JWT valide pendant une heure
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "60m",
    });

    // Log de l'ID avant de l'envoyer
    console.log("UserID à renvoyer :", user._id);

    // Renvoi de la réponse avec le token et l'ID
    reply.send({
      message: "Connexion réussie",
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    reply.code(500).send({ message: "Erreur lors de la connexion" });
  }
}

//_____________________________________________________________________
// Gestion de l'envoi du mail pour mot de passe perdu

async function mailToResetPassword(request, reply) {
  const { email } = request.body;

  // Génération d'un token unique
  const resetToken = crypto.randomBytes(20).toString("hex");

  try {
    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
      return reply.code(404).send({ message: "Utilisateur non trouvé." });
    }

    // Enregistrez le token et sa date d'expiration pour l'utilisateur
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;

    // Sauvegarde des modifications dans la base de données
    await user.save();

    // Configuration pour l'envoi d'email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Création du lien de réinitialisation avec le token généré
    const resetLink = `http://localhost:3000/ResetPassword/${resetToken}`;

    // Envoi de l'email avec le lien de réinitialisation au format HTML
    const mailOptions = {
      from: "Le café des sciences",
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: `
        <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant : <a href="${resetLink}">${resetLink}</a></p>
        <p>Vous avez une heure pour changer votre mot de passe</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
      `,
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email de réinitialisation envoyé :", info.messageId);

    // Réponse pour email envoyé avec succès
    reply.send({ message: "Email de réinitialisation de mot de passe envoyé" });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de réinitialisation :",
      error
    );
    reply.code(500).send({
      message: "Erreur lors de l'envoi de l'email de réinitialisation",
    });
  }
}

//_____________________________________________________________________
// Gestion de la réinitialisarion du mot de passe
async function resetPassword(request, reply) {
  const { resetToken, email, password } = request.body;

  try {
    // Recherche de l'utilisateur dans la base de données par le resetToken et l'email
    const user = await User.findOne({ resetToken, email });

    if (!user) {
      return reply
        .code(404)
        .send({ message: "Utilisateur ou utilisatrice non trouvée." });
    }

    // Vérification validité resetToken
    if (user.resetTokenExpiration < Date.now()) {
      return reply.code(400).send({
        message: "Le lien de réinitialisation du mot de passe a expiré.",
      });
    }

    // Vérification du format du nouveau mot de passe
    const regex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!regex.test(password)) {
      return reply.code(400).send({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule et un chiffre.",
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    user.password = hashedPassword;

    // Supprimer le resetToken une fois utilisé
    user.resetToken = null;
    user.resetTokenExpiration = null;

    // Enregistrer les modifications dans la base de données
    await user.save();

    // Envoi du mail de confirmation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Envoi de l'e-mail de confirmation
    const mailOptions = {
      from: "Le café des sciences",
      to: email,
      subject: "Confirmation de réinitialisation de mot de passe",
      html: `
        <p>Votre mot de passe a été réinitialisé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter à votre compte en utilisant votre nouveau mot de passe.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez contacter le bureau de l'association.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    reply.send({
      message:
        "Mot de passe réinitialisé avec succès, un mail vient de vous être envoyé.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error
    );
    reply
      .code(500)
      .send({ message: "Erreur lors de la réinitialisation du mot de passe" });
  }
}

//_____________________________________________________________________
// Gestion de la mise à jour du mot de passe
async function updatePassword(request, reply) {
  const { email, password } = request.body;

  // Logique pour mettre à jour le mdp ici

  // Logique pour envoyer un e-mail de confirmation ici

  reply.send({ message: "Mot de passe mis à jour avec succès" });
}

//_____________________________________________________________________
// Contrôleur pour mettre à jour l'email
async function updateEmail(request, reply) {
  const { email, password } = request.body;

  // Logique pour mettre à jour l'email ici

  // Logique pour envoyer un e-mail de confirmation ici

  reply.send({ message: "Email mis à jour avec succès" });
}

module.exports = {
  test,
  signup,
  login,
  mailToResetPassword,
  resetPassword,
  updatePassword,
  updateEmail,
};
