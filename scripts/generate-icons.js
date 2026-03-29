const sharp = require('sharp');

async function generateIcons() {
  const input = 'public/illustrations/diner-scene.png';

  // Lees de afbeelding metadata om de crop te berekenen
  const metadata = await sharp(input).metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Crop het deel met wijnglas + wijnfles (rechter-midden)
  // Pas deze waarden aan op basis van de werkelijke afbeelding
  const cropSize = Math.min(w, h) * 0.5;
  const left = Math.round(w * 0.40);   // start iets rechts van het midden
  const top = Math.round(h * 0.35);    // start iets onder het midden

  const cropped = sharp(input).extract({
    left: Math.min(left, w - cropSize),
    top: Math.min(top, h - cropSize),
    width: Math.round(cropSize),
    height: Math.round(cropSize),
  });

  await cropped.clone().resize(512, 512).png().toFile('public/icon-512.png');
  await cropped.clone().resize(192, 192).png().toFile('public/icon-192.png');

  console.log('Icons gegenereerd!');
}

generateIcons();
