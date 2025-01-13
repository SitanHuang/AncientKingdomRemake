// ============================================================
// CONFIGURATION
// ============================================================

const MAX_KEY = 65025; // keys: 0 .. 65024
const keys = new Array(MAX_KEY);
for (let i = 0; i < MAX_KEY; i++) {
  keys[i] = i;
}

// ============================================================
// BENCHMARK FUNCTIONS
// ============================================================

// ----- Insertion Benchmark -----
function benchmarkSetInsertion() {
  console.time("Set insertion");
  const set = new Set();
  for (let i = 0; i < keys.length; i++) {
    set.add(keys[i]);
  }
  console.timeEnd("Set insertion");
  return set;
}

function benchmarkMapInsertion() {
  console.time("Map insertion");
  const map = new Map();
  for (let i = 0; i < keys.length; i++) {
    // use true as the value, per the requirement.
    map.set(keys[i], true);
  }
  console.timeEnd("Map insertion");
  return map;
}

// ----- Membership Benchmark -----
function benchmarkSetMembership(set) {
  let count = 0;
  console.time("Set membership (has)");
  for (let i = 0; i < keys.length; i++) {
    if (set.has(keys[i])) {
      count++;
    }
  }
  console.timeEnd("Set membership (has)");
  // count is expected to equal keys.length
  return count;
}

function benchmarkMapMembership(map) {
  let count = 0;
  console.time("Map membership (has)");
  for (let i = 0; i < keys.length; i++) {
    if (map.has(keys[i])) {
      count++;
    }
  }
  console.timeEnd("Map membership (has)");
  return count;
}

// ----- Iteration Benchmark -----
function benchmarkSetIteration(set) {
  let sum = 0;
  console.time("Set iteration");
  for (let key of set) {
    sum += key;
  }
  console.timeEnd("Set iteration");
  return sum;
}

function benchmarkMapIteration(map) {
  let sum = 0;
  console.time("Map iteration");
  for (let [key, value] of map) {
    sum += key;
  }
  console.timeEnd("Map iteration");
  return sum;
}

// ----- Deletion Benchmark -----
function benchmarkSetDeletion(set) {
  console.time("Set deletion");
  for (let i = 0; i < keys.length; i++) {
    set.delete(keys[i]);
  }
  console.timeEnd("Set deletion");
}

function benchmarkMapDeletion(map) {
  console.time("Map deletion");
  for (let i = 0; i < keys.length; i++) {
    map.delete(keys[i]);
  }
  console.timeEnd("Map deletion");
}

// ============================================================
// RUN THE BENCHMARKS
// ============================================================

for (let i = 0;i < 50;i++) {
  console.log('################')
  console.log("=== Insertion Benchmark ===");
  const mySet = benchmarkSetInsertion();
  const myMap = benchmarkMapInsertion();

  console.log("\n=== Membership Benchmark ===");
  const setCount = benchmarkSetMembership(mySet);
  const mapCount = benchmarkMapMembership(myMap);
  console.log("Set membership count:", setCount, "Map membership count:", mapCount);

  console.log("\n=== Iteration Benchmark ===");
  const setSum = benchmarkSetIteration(mySet);
  const mapSum = benchmarkMapIteration(myMap);
  console.log("Set iteration sum:", setSum, "Map iteration sum:", mapSum);

  console.log("\n=== Deletion Benchmark ===");
  benchmarkSetDeletion(mySet);
  benchmarkMapDeletion(myMap);
}
