/**
 * A Stat contains things that cannot be accumulated and only affected by
 * actions on the map.
 */
function stat_create(overrides) {
  const stat = {
    tilesOwned: 0,
    tilesOccupied: 0,
    pop: 0, // Total population
  };

  return Object.assign(stat, overrides);
}