// ----------- SETUP ----------- //

// Number of row-col pairs to test.
// We only have 256x256 = 65,536 possible pairs, but let's loop many times
// to get a more stable time measurement.
const REPEAT = 10_000_000;

// We'll generate random row,col in [0..255].
function getRandomRowCol() {
  const row = (Math.random() * 256) | 0;
  const col = (Math.random() * 256) | 0;
  return [row, col];
}

// We'll store the random pairs here so each approach encodes/decodes the *same* pairs.
const pairs = new Array(REPEAT);
for (let i = 0; i < REPEAT; i++) {
  pairs[i] = getRandomRowCol();
}


// ----------- APPROACHES ----------- //

// 1) Multiply-based approach (knowing mapWidth = 256)
const multiply256 = {
  encode(row, col) {
    return row * 256 + col;
  },
  decode(key) {
    const row = (key / 256) | 0;  // integer division
    const col = key % 256;
    return [row, col];
  }
};

// 2) Bit-shift approach (8 bits for row, 8 bits for col)
const bitShift8 = {
  encode(row, col) {
    return (row << 8) | col;
  },
  decode(key) {
    // Logical right shift to avoid sign extension in JS:
    const row = key >>> 8;
    const col = key & 0xFF;
    return [row, col];
  }
};

// 3) Cantor pairing function (no known width needed)
const cantor = {
  encode(x, y) {
    // pair(x, y) = ((x+y)*(x+y+1))/2 + y
    const s = x + y;
    return (s * (s + 1) / 2) + y;
  },
  decode(pair) {
    // w = floor((sqrt(8*pair + 1) - 1)/2)
    const w = Math.floor((Math.sqrt(8 * pair + 1) - 1) / 2);
    const t = (w * (w + 1)) / 2;
    const y = pair - t;
    const x = w - y;
    return [x, y];
  }
};

// 4) Prime multiplication approach
// We need a prime > 255. Let's pick 257.
const PRIME = 257;
const primeMethod = {
  encode(row, col) {
    return row * PRIME + col;
  },
  decode(key) {
    const row = (key / PRIME) | 0;
    const col = key % PRIME;
    return [row, col];
  }
};


// ----------- BENCHMARK FUNCTION ----------- //

function runBenchmark(label, { encode, decode }) {
  console.log(`\n--- ${label} ---`);

  // 1) Encode benchmark
  console.time(`${label} encode`);
  const encodedArray = new Array(REPEAT);
  for (let i = 0; i < REPEAT; i++) {
    const [r, c] = pairs[i];
    encodedArray[i] = encode(r, c);
  }
  console.timeEnd(`${label} encode`);

  // 2) Decode benchmark
  console.time(`${label} decode`);
  for (let i = 0; i < REPEAT; i++) {
    decode(encodedArray[i]);
  }
  console.timeEnd(`${label} decode`);
}


// ----------- RUN ALL APPROACHES ----------- //

runBenchmark("Multiply-based (width=256)", multiply256);
runBenchmark("Bit-shift (8 bits each)", bitShift8);
runBenchmark("Cantor pairing", cantor);
runBenchmark("Prime-based (prime=257)", primeMethod);
