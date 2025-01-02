/**
 * A Tab contains things that can be accumulated and spent by a government.
 */
function tab_create(overrides) {
  const tab = {
    /**
     * Production Defined:
     *
     * The equivalent mobilizable manpower available to the state
     * without affecting basic food security.
     */
    prod: 0,
  };

  return Object.assign(tab, overrides);
}