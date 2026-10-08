const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const bron = path.join(__dirname, "_uitpak");
const doel = path.join(__dirname, "assets", "foto");

(async () => {
  const bestanden = fs.readdirSync(bron).filter((f) => /\.jpe?g$/i.test(f)).sort();
  let i = 1;
  for (const bestand of bestanden) {
    const naam = `foto${String(i).padStart(2, "0")}.jpg`;
    await sharp(path.join(bron, bestand))
      .rotate()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(doel, naam));
    i++;
  }
  console.log(`${bestanden.length} foto's verkleind.`);
})();
