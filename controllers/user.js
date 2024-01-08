require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

    // Envoi de l'e-mail de confirmation

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

//_____________________________________________________________________
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

    // Vérification si l'user existant
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

    // Génération du JWT valide pendant une demi-heure (30 minutes)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "60m",
    });

    console.log(token);

    reply.send({ message: "Connexion réussie", token });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    reply.code(500).send({ message: "Erreur lors de la connexion" });
  }
}

//_____________________________________________________________________
// Gestion de la réinitialisation du mot de passe perdu
async function resetPassword(request, reply) {
  const { email, buttonTrue } = request.body;

  // Validation et logique pour réinitialiser le mot de passe (simulation)
  // Logique de réinitialisation du mot de passe ici

  // Envoi de l'e-mail de confirmation

  reply.send({ message: "Email de réinitialisation de mot de passe envoyé" });
}

//_____________________________________________________________________
// Contrôleur pour mettre à jour le mot de passe
async function updatePassword(request, reply) {
  const { email, password } = request.body;

  // Logique pour mettre à jour le mot de passe ici

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
  resetPassword,
  updatePassword,
  updateEmail,
};
