// Import des besoins
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const emailValidator = require("email-validator");

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
});

// Restriction de l'email : 1 seule adresse pour 1 seul user
userSchema.plugin(uniqueValidator);

// Export du modèle
module.exports = mongoose.model("User", userSchema);
