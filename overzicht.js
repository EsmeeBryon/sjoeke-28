const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const map = path.join(__dirname, "assets", "foto");
const CEL = 200;
const KOLOMMEN = 6;

function muurVolgorde() {
  if (process.argv[2] === "alles") {
    return fs.readdirSync(map).filter((f) => /^foto\d+\.jpg$/.test(f)).sort();
  }
  const code = fs.readFileSync(path.join(__dirname, "assets", "js", "content.js"), "utf8");
  const haal = new Function(code + "; return CONTENT;");
  return haal().muur.fotos;
}

(async () => {
  const bestanden = muurVolgorde();
  const rijen = Math.ceil(bestanden.length / KOLOMMEN);

  const lagen = [];
  for (let i = 0; i < bestanden.length; i++) {
    const x = (i % KOLOMMEN) * CEL;
    const y = Math.floor(i / KOLOMMEN) * CEL;
    const nummer = bestanden[i].match(/\d+/)[0];

    lagen.push({
      input: await sharp(path.join(map, bestanden[i]))
        .resize(CEL - 6, CEL - 6, { fit: "cover" })
        .toBuffer(),
      left: x + 3,
      top: y + 3,
    });

    const label = Buffer.from(
      `<svg width="56" height="40"><rect x="0" y="0" width="56" height="34" rx="8" fill="#ff3d81" stroke="#1d1430" stroke-width="3"/><text x="28" y="25" font-family="Arial" font-size="22" font-weight="bold" fill="#fff" text-anchor="middle">${nummer}</text></svg>`
    );
    lagen.push({ input: label, left: x + 8, top: y + 8 });
  }

  await sharp({
    create: {
      width: KOLOMMEN * CEL,
      height: rijen * CEL,
      channels: 3,
      background: "#fff8ef",
    },
  })
    .composite(lagen)
    .jpeg({ quality: 82 })
    .toFile(path.join(__dirname, "overzicht.jpg"));

  console.log(`Overzicht gemaakt met ${bestanden.length} foto's.`);
})();
