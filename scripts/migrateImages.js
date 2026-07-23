require("dotenv").config();

const mongoose = require("mongoose");

const Member = require("../models/member");
const { saveMemberImage } = require("../services/imageService");

async function migrate() {
  console.log("Connexion à MongoDB...");

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connecté !");

  const members = await Member.find();

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of members) {
    if (
      !member.image ||
      typeof member.image !== "string" ||
      !member.image.startsWith("data:image/")
    ) {
      skipped++;
      continue;
    }

    try {
      console.log(
        `Migration de ${member.pseudo || member.nom || member._id}...`,
      );

      const newImage = await saveMemberImage(member.image);

      member.image = newImage;

      await member.save();

      migrated++;

      console.log("OK");
    } catch (err) {
      errors++;
      console.error(`Erreur sur ${member.pseudo || member.nom || member._id}`);
      console.error(err.message);
    }
  }

  console.log("");
  console.log("===== TERMINÉ =====");
  console.log(`Migrés : ${migrated}`);
  console.log(`Ignorés : ${skipped}`);
  console.log(`Erreurs : ${errors}`);

  await mongoose.disconnect();
}

migrate().catch(console.error);
