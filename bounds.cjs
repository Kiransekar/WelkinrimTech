const fs = require('fs');

function getBounds(str) {
  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
  const numbers = str.match(/[-+]?\d*\.\d+|[-+]?\d+/g);
  if (!numbers) return;
  // A crude approximation: any pair of numbers is likely a coordinate
  for (let i = 0; i < numbers.length; i++) {
    const val = parseFloat(numbers[i]);
    // It's hard to tell x from y without parsing the SVG path format
    // But since bird X is around 800-950 and Y is 400-600 we can heuristically split by value!
    if (val > 650 && val < 1500) {
      if (val < minX) minX = val;
      if (val > maxX) maxX = val;
    }
    if (val > 200 && val < 650) {
      if (val < minY) minY = val;
      if (val > maxY) maxY = val;
    }
  }
  return {minX, maxX, minY, maxY};
}

const bird = fs.readFileSync('public/haemng-bird.svg', 'utf8');
const text = fs.readFileSync('public/haemng-text.svg', 'utf8');

console.log("Bird bounds:", getBounds(bird));
console.log("Text bounds:", getBounds(text));
