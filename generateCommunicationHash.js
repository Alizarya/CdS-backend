const bcrypt = require("bcrypt");

const password = "";

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);

  console.log(hash);
}

generateHash();
