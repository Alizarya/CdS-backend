// Import des besoins
const mongoose = require("mongoose");
const emailValidator = require("email-validator");
const uniqueValidator = require("mongoose-unique-validator");

// Construction du modèle
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      // Vérification que l'email est bien valide
      validator: emailValidator.validate,
      message: "Adresse mail invalide",
    },
  },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
});

// Possibilité de n'enregistrer qu'une fois le même email
userSchema.plugin(uniqueValidator, {
  message: "Cet e-mail est déjà enregistré.",
});

// Export du modèle
module.exports = mongoose.model("User", userSchema);
