const fs = require('fs');

const escData = `
4.1 E40 V2 12S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 60.2 x 31.0 x 16.0 mm
Power Line | 16 AWG
Continuous Current | 40 A (under good cooling conditions)
Current Limiting | 48 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | No
Weight (with wires) | 57 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 12S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | No
Protection Grade | IPX4
Motor Line | 16 AWG

4.2 E60 12S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 70.2 x 31.0 x 16.0 mm
Power Line | 14 AWG
Continuous Current | 60 A (under good cooling conditions)
Current Limiting | 72 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | No
Weight (with wires) | 108 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 12S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | No
Protection Grade | IPX4
Motor Line | 14 AWG

4.3 E120 12S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 81.8 x 41.2 x 23.2 mm
Power Line | 12 AWG
Continuous Current | 120 A (under good cooling conditions)
Current Limiting | 120 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | Yes
Weight (with wires) | 215 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 12S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | Yes
Protection Grade | IP67
Motor Line | 12 AWG

4.4 EH200 24S
BEC | 5V / 200mA output
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 160.7 x 72 x 46 mm
Power Line | 8 AWG
Continuous Current | 200 A (under good cooling conditions)
Current Limiting | 200 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | Yes
Weight (with wires) | 725 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 24S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | Yes
Protection Grade | IPX4
Motor Line | 8 AWG

4.5 E260 14S
BEC | 5V / 200mA output
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 130.0 x 65.3 x 43.0 mm
Power Line | 8 AWG
Continuous Current | 260 A (under good cooling conditions)
Current Limiting | 260 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | Yes
Weight (with wires) | 537 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 14S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | Yes
Protection Grade | IPX4
Motor Line | 8 AWG

4.6 E150 14S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 98.0 x 50.0 x 33.9 mm
Power Line | 10 AWG
Continuous Current | 150 A (under good cooling conditions)
Current Limiting | 150 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | Yes
Weight (with wires) | 357 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 14S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | Yes
Protection Grade | IP67
Motor Line | 12 AWG

4.7 E200 14S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 117.5 x 56.3 x 42.8 mm
Power Line | 8 AWG
Continuous Current | 200 A (under good cooling conditions)
Current Limiting | 200 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | Yes
Weight (without lines) | 320 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 14S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | Yes
Protection Grade | IP67
Motor Line | 8 AWG

4.8 F120A 12S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 123.5 x 58.6 x 30.25 mm
Power Line | 10 AWG
Continuous Current | 150 A (under good cooling conditions)
Current Limiting | 150 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | No
Weight (without lines) | 248 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 12S – 14S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | Yes
Protection Grade | IP67
Motor Line | 12 AWG

4.9 F30 6S
BEC | No
PWM Input Signal Voltage | 3.3V / 5V (compatible)
Throttle Loss Protection | Yes
Phase Short Circuit Protection | Yes
Size (L x W x H) | 95 x 30 x 19.5 mm
Power Line | 16 AWG
Continuous Current | 30 A (under good cooling conditions)
Current Limiting | 35 A
Throttle Pulse Width | 1050 us – 1940 us
Voltage Protection | Yes
Temperature Protection | Yes
Speed Signal Output | No
Weight (without wires) | 65 g
Working Environmental Temperature | -20 to 65 C
Recommended Battery | 6S
Compatible Signal Frequency | 50–500 Hz
Stall Protection | Yes
Error Signal Output | No
Protection Grade | IPX4
Motor Line | 16 AWG

### 5. Auto Pilot
Operating Voltage | 4.5 – 5.5 V
Operating Temperature | -20 to 70 C
Size | 95.1 x 62 x 23 mm
Weight | 155 g
PWM Output | 8 PWM + 6 AUX (PWM/GPIO)
RC IN | PPM / SBUS
USB | Type C
Power Monitor | 2 (Analog / CAN)
Power Input | 8 pin ClickMate Molex
Output Connector | J30J – 51 Pin MIL Std connector
Software Support | Mission Planner / Q Ground Control
Sensors | Triple IMU, Dual Barometer, Compass
Communication | 5 UART, 3 I2C, 2 CAN, 2 ADC
`;

const blocks = escData.split('\n\n');
const products = [];

for (const block of blocks) {
  const lines = block.trim().split('\n');
  const titleLine = lines[0];
  if (!titleLine || titleLine.trim() === '') continue;
  
  let nameStr = titleLine.replace(/^### 5\.\s*/, '').replace(/^4\.\d+\s*/, '').trim();
  
  let series = "esc";
  let seriesLabel = "ESCs";
  if (nameStr.startsWith("Auto Pilot")) { series = "fc"; seriesLabel = "Flight Controller"; }

  const id = Math.random().toString(36).substr(2, 9);
  
  const allSpecs = [];
  const keySpecs = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('|')) {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 2) {
        allSpecs.push({ label: parts[0], value: parts[1] });
      }
    }
  }

  let cont = allSpecs.find(s => s.label === "Continuous Current" || s.label === "Continuous");
  let bat = allSpecs.find(s => s.label === "Recommended Battery");
  
  if (series === "esc") {
    if (cont) keySpecs.push({ label: "Continuous", value: cont.value });
    if (bat) keySpecs.push({ label: "Battery", value: bat.value });
    if (keySpecs.length < 3) {
      let weight = allSpecs.find(s => s.label.includes("Weight"));
      if(weight) keySpecs.push({ label: "Weight", value: weight.value });
    }
  } else if (series === "fc") {
    keySpecs.push({ label: "Core", value: "Triple IMU" });
    keySpecs.push({ label: "PWM", value: "8+6" });
    keySpecs.push({ label: "Weight", value: "155 g" });
  }

  products.push({
    id: `${series}-${id}`,
    series,
    seriesLabel,
    model: nameStr,
    name: nameStr,
    tag: series.toUpperCase(),
    application: series === "esc" ? "UAV / Multi-Rotor" : "Multi-Mission",
    keySpecs,
    allSpecs,
  });
}

let fileContent = "";

products.forEach(p => {
  fileContent += `  {
    id: "${p.id}",
    series: "${p.series}", seriesLabel: "${p.seriesLabel}",
    model: "${p.model}", name: "${p.name}", tag: "${p.tag}", application: "${p.application}",
    keySpecs: ${JSON.stringify(p.keySpecs, null, 6).replace(/\n\s+/g, ' ').replace(/\r/g, '').replace(/\}/g, ' }')},
    allSpecs: ${JSON.stringify(p.allSpecs, null, 6).replace(/\n      /g, '\n      ').replace(/\n    \}/g, '\n    }')},
  },\n`;
});

const currentTs = fs.readFileSync('src/data/products.ts', 'utf8');
const insertPos = currentTs.lastIndexOf('];');
const newTs = currentTs.slice(0, insertPos) + fileContent + "];\n";

fs.writeFileSync('src/data/products.ts', newTs);
console.log("Successfully injected ESCs and FC");
