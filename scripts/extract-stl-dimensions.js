const fs = require('fs');
const path = require('path');

function includeVertex(bounds, x, y, z) {
  if (![x, y, z].every(Number.isFinite)) {
    throw new Error('STL contains a non-finite vertex');
  }

  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.minZ = Math.min(bounds.minZ, z);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
  bounds.maxZ = Math.max(bounds.maxZ, z);
}

function emptyBounds() {
  return {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };
}

function readBinaryStl(buffer) {
  const triangleCount = buffer.readUInt32LE(80);
  const expectedBytes = 84 + triangleCount * 50;
  if (triangleCount === 0 || expectedBytes > buffer.length) return null;

  const bounds = emptyBounds();
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const triangleOffset = 84 + triangle * 50;
    for (let vertex = 0; vertex < 3; vertex += 1) {
      const offset = triangleOffset + 12 + vertex * 12;
      includeVertex(
        bounds,
        buffer.readFloatLE(offset),
        buffer.readFloatLE(offset + 4),
        buffer.readFloatLE(offset + 8)
      );
    }
  }

  return { bounds, triangleCount, format: 'binary' };
}

function readAsciiStl(buffer) {
  const source = buffer.toString('utf8');
  const vertexPattern = /^\s*vertex\s+([-+\deE.]+)\s+([-+\deE.]+)\s+([-+\deE.]+)/gm;
  const bounds = emptyBounds();
  let vertexCount = 0;
  let match;

  while ((match = vertexPattern.exec(source))) {
    includeVertex(bounds, Number(match[1]), Number(match[2]), Number(match[3]));
    vertexCount += 1;
  }

  if (!vertexCount) throw new Error('No STL vertices found');
  return { bounds, triangleCount: vertexCount / 3, format: 'ascii' };
}

function readStl(file) {
  const buffer = fs.readFileSync(file);
  const parsed = buffer.length >= 84 ? readBinaryStl(buffer) : null;
  const result = parsed || readAsciiStl(buffer);
  const { bounds } = result;
  return {
    ...result,
    bytes: buffer.length,
    dimensions: {
      length: bounds.maxZ - bounds.minZ,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    },
  };
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function main() {
  const directory = path.resolve(process.argv[2] || 'stls');
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`STL directory not found: ${directory}`);
  }

  const files = fs.readdirSync(directory)
    .filter(file => file.toLowerCase().endsWith('.stl'))
    .sort((a, b) => a.localeCompare(b));

  const rows = files.map(file => {
    const result = readStl(path.join(directory, file));
    return {
      file,
      format: result.format,
      triangles: result.triangleCount,
      bytes: result.bytes,
      lengthMm: round(result.dimensions.length),
      widthMm: round(result.dimensions.width),
      heightMm: round(result.dimensions.height),
    };
  });

  process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
}

if (require.main === module) main();

module.exports = { readStl, round };
