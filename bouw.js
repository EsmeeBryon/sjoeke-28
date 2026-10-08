const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const wortel = __dirname;
const fotoMap = path.join(wortel, "assets", "foto");
const uitvoer = path.join(wortel, "Voor-Shani.html");

// Kleiner dan op de website: het bestand moet via WhatsApp te versturen zijn.
const BREEDTE = 1100;
const KWALITEIT = 72;

const lees = (...p) => fs.readFileSync(path.join(wortel, ...p), "utf8");

(async () => {
  const bestanden = fs.readdirSync(fotoMap).filter((f) => /^foto\d+\.jpg$/.test(f)).sort();

  const fotos = {};
  for (const bestand of bestanden) {
    const buffer = await sharp(path.join(fotoMap, bestand))
      .resize({ width: BREEDTE, height: BREEDTE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: KWALITEIT, mozjpeg: true })
      .toBuffer();
    fotos[bestand] = "data:image/jpeg;base64," + buffer.toString("base64");
  }

  const html = lees("index.html")
    .replace(
      '<link rel="stylesheet" href="assets/css/style.css" />',
      "<style>\n" + lees("assets", "css", "style.css") + "\n</style>"
    )
    .replace(
      '<script src="assets/js/content.js"></script>',
      "<script>window.FOTOS = " + JSON.stringify(fotos) + ";</script>\n  <script>\n" +
        lees("assets", "js", "content.js") +
        "\n</script>"
    )
    .replace(
      '<script src="assets/js/main.js"></script>',
      "<script>\n" + lees("assets", "js", "main.js") + "\n</script>"
    );

  fs.writeFileSync(uitvoer, html);
  const mb = (fs.statSync(uitvoer).size / 1024 / 1024).toFixed(1);
  console.log(`Voor-Shani.html gemaakt: ${mb} MB, ${bestanden.length} foto's ingebakken.`);
})();
