// npm install bcrypt
const bcrypt = require("bcrypt");
const hash = "$2b$10$OMVSQQrZjcfAtSUa8m97w.x0R7fs/QDyZFUmomb2HbaYySTAtTKg2";
const candidate = "8989";

bcrypt.compare(candidate, hash, (err, res) => {
  if (err) throw err;
  console.log(res ? "MATCH" : "NO MATCH");
});
