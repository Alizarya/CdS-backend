const mongoose = require("mongoose");
const emailValidator = require("email-validator");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: emailValidator.validate,
        message: "Adresse mail invalide",
      },
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(uniqueValidator, {
  message: "Cet e-mail est déjà enregistré.",
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
