async function gui_gc_place_capital(um) {
  const gcs = GameControllerSingleton;

  await um.animateLeftPane({
    $child: gui_get$Template('template-gc-capital-placement').clone(),
    title: 'Action Required',
    width: 'auto',
    closeable: false
  });

  gcs.renderer.selectableMask = map_mask_uncivilized_tiles(gcs.gameState.map, true);
  gcs.renderer.beginSelection({
    onTileSelect: async _ => false,
    callback: async (pts) => {
      await api_place_capital(gcs.gameState, pts[0]);
      await gcs.clearGamestateDirtyTiles();
      await um.closeLeftPane();
    }
  });
}