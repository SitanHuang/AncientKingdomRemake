
describe('map', function () {
  describe('basics', function () {
    const map = map_create({ width: 111, height: 239 });

    it('should default to unlocked', function () {
      expect(map.locked).toBeFalse();
    });

    it('should lock/unlock', function () {
      expect(map.locked).toBeFalse();

      map.locked = true;

      expect(map_at(map, [0, 0])).toBeNull();
      expect(function () {
        map_set(map, [0, 0], {});
      }).toThrow("Cannot replace a tile in a Locked Map!");
      expect(function () {
        map_del(map, [0, 0], {});
      }).toThrow("Cannot delete a tile in a Locked Map!");

      map.locked = false;
    });

    it('should set/del/get', function () {
      expect(map_at(map, [0, 0])).toBeNull();
      expect(map_at(map, [-1, 0])).toBeUndefined();
      expect(map_at(map, [239, 111])).toBeUndefined();
      expect(map_at(map, [238, 110])).toBeNull();

      expect(function () {
        map_set(map, [239, 111], {});
      }).toThrow("Cannot set tile at undefined ([239, 111])!");

      map_set(map, [238, 110], { test: true });

      expect(map_at(map, [238, 110])?.test).toBeTrue();

      map_del(map, [238, 110]);

      expect(map_at(map, [238, 110])).toBeNull();
    });

    it('should create blank map', function () {
      expect(map.width).toEqual(111);
      expect(map.height).toEqual(239);

      expect(map.tiles.length).toEqual(239);
      expect(map.tiles[0].length).toEqual(111);

      // should start with all null
      for (let r = 0; r < 239; r++) {
        for (let c = 0; c < 111; c++) {
          expect(map.tiles[r][c] + "").toEqual("null");
        }
      }
    });

    it('should fill map with default terrain', function () {
      map_fill_blank(map);

      for (let r = 0; r < 239; r++) {
        for (let c = 0; c < 111; c++) {
          expect(map.tiles[r][c].ter).toEqual(KEY_TER_DEFAULT);
        }
      }
    });
  });

  describe('tile basics', function () {
    const map = map_create({ width: 111, height: 239 });

    map_fill_blank(map);

    it('has properties row, col', function () {
      expect(map_at(map, [0, 1]).row).toEqual(0);
      expect(map_at(map, [0, 1]).col).toEqual(1);
    });

    describe("Tile ID Conversions", function () {
      it("converts between points and IDs", function () {
        let row = 50;
        let col = 50;
        let id = tile_id_from_pt(row, col);
        expect(id).toEqual(50 * MAP_MAX_LENGTH + 50);
        let [recoveredRow, recoveredCol] = tile_pt_from_id(id);
        expect(recoveredRow).toEqual(row);
        expect(recoveredCol).toEqual(col);

        row = 0;
        col = 0;
        id = tile_id_from_pt(row, col);
        expect(id).toEqual(0);
        [recoveredRow, recoveredCol] = tile_pt_from_id(id);
        expect(recoveredRow).toEqual(row);
        expect(recoveredCol).toEqual(col);
      });

      it("reversibility for multiple points", function () {
        for (let row = 0; row < MAP_MAX_LENGTH; row++) {
          for (let col = 0; col < MAP_MAX_LENGTH; col++) {
            const id = tile_id_from_pt(row, col);
            const tile = tile_create({ row, col })
            expect(tile_id(tile)).toEqual(id);
            expect(tile.id).toEqual(id);
            const [recoveredRow, recoveredCol] = tile_pt_from_id(id);
            expect(recoveredRow).toEqual(row);
            expect(recoveredCol).toEqual(col);
          }
        }
      });
    });
  });

});
