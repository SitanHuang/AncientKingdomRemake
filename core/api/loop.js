function api_loop_repopulate_orders(gs) {
  gs.currentOrders = [];

  for (const civId in gs.civs) {
    const civ = gs.civs[civId];
    const govs = civ_get_govs_list(civ)
      .sort((a, b) => a === "c" ? -1 : b === "c" ? 1 : a > b)
      // ^ central always first, then simple uuid string sort
      .map(gov => ({
        civ: civId,
        gov: gov.id
      }));

    gs.currentOrders.push(...govs);
  }

  api_loop_select_order(gs, 0);
}

function api_loop_increment_order(gs) {
  api_loop_select_order(gs, gs.currentOrderInd + 1);
}
function api_loop_increment_date(gs) {
  gs.currentStamp = gs.beginStamp + (++gs.turns) * 604800000 * gs.weeksPerTurn;
}

function api_loop_select_order(gs, ind) {
  gs.currentOrderInd = ind;
  const order = gs.currentOrders[ind];
  gs.currentCiv = order?.civ;
  gs.currentGov = order?.gov;
}