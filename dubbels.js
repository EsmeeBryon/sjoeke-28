const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const map = path.join(__dirname, "assets", "foto");
const GROOTTE = 16;
const BIJNA_IDENTIEK = 46; // dezelfde foto, net iets anders -> eentje houden
const ZELFDE_MOMENT = 62; // zelfde dag of plek -> ver uit elkaar zetten

async function vingerafdruk(bestand) {
  const data = await sharp(path.join(map, bestand))
    .greyscale()
    .resize(GROOTTE, GROOTTE, { fit: "fill" })
    .raw()
    .toBuffer();
  const gemiddelde = data.reduce((a, b) => a + b, 0) / data.length;
  return Array.from(data, (v) => (v > gemiddelde ? 1 : 0));
}

const afstand = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0);

function groepeer(lijst, hashes, drempel) {
  const groepen = [];
  for (const b of lijst) {
    const groep = groepen.find((g) => g.some((lid) => afstand(hashes[b], hashes[lid]) <= drempel));
    if (groep) groep.push(b);
    else groepen.push([b]);
  }
  return groepen;
}

(async () => {
  const bestanden = fs.readdirSync(map).filter((f) => /^foto\d+\.jpg$/.test(f)).sort();
  const hashes = {};
  for (const b of bestanden) hashes[b] = await vingerafdruk(b);

  const identiek = groepeer(bestanden, hashes, BIJNA_IDENTIEK);
  identiek
    .filter((g) => g.length > 1)
    .forEach((g) => console.log("Dubbel, eentje gehouden:", g.join(" ")));

  const uniek = identiek.map((g) =>
    g.sort((x, y) => fs.statSync(path.join(map, y)).size - fs.statSync(path.join(map, x)).size)[0]
  );

  const momenten = groepeer(uniek, hashes, ZELFDE_MOMENT).sort((a, b) => b.length - a.length);
  momenten
    .filter((g) => g.length > 1)
    .forEach((g) => console.log("Zelfde moment:", g.join(" ")));

  // Om de beurt uit elke groep pakken, zodat hetzelfde moment nooit naast elkaar komt
  const volgorde = [];
  for (let ronde = 0; ronde < momenten[0].length; ronde++) {
    for (const groep of momenten) {
      if (groep[ronde]) volgorde.push(groep[ronde]);
    }
  }

  console.log(`\n${bestanden.length} foto's, ${uniek.length} uniek, ${momenten.length} momenten.\n`);
  console.log(JSON.stringify(volgorde));
})();
