
describe('CacheManager', function () {
  let cacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  describe("addFreshObj and getFreshObj", () => {
    const testObj = { id: 1 };

    beforeEach(() => {
      cacheManager = new CacheManager();
      cacheManager.addFreshObj(testObj, "key1", "key2");
    });

    it("should add and retrieve a fresh object", () => {
      expect(cacheManager.getFreshObj("key1")).toBeNull();
      expect(cacheManager.getFreshObj("key1", "key2")).toBe(testObj);
      expect(cacheManager.getFreshObj("key1", "key2", "sub")).toBeNull();
      expect(cacheManager.getFreshObj("key1", "key3")).toBeNull();
    });
    it("should replace object if doesn't exist", () => {
      expect(cacheManager.getFreshObj("key1", "key2", "sub")).toBeNull();
      expect(cacheManager.getFreshObjOrReplace((orig) => {
        expect(orig).toBeNull();
        return 123;
      }, "key1", "key2", "sub")).toEqual(123);
    });
    it("should replace object if dirty", () => {
      expect(cacheManager.getFreshObj("key1", "key2", "sub")).toBeNull();
      expect(cacheManager.getFreshObjOrReplace((orig) => {
        expect(orig).toBeNull();
        return 123;
      }, "key1", "key2", "sub")).toEqual(123);
      cacheManager.setDirty("key1");
      expect(() => cacheManager.getFreshObj("key1", "key2", "sub")).toThrowError("accessing a dirty parent: key=key1,key2,sub, dirtyKey=key1");
      cacheManager.setFreshKey("key1");
      expect(() => cacheManager.getFreshObj("key1", "key2", "sub")).toThrowError("accessing a dirty parent: key=key1,key2,sub, dirtyKey=key1,key2");
      cacheManager.setFreshKey("key1", "key2");
      expect(() => cacheManager.getFreshObj("key1", "key2", "sub")).toThrowError("accessing a dirty object: key1,key2,sub");
      cacheManager.setDirty("key1");
      expect(cacheManager.getFreshObjOrReplace((orig) => {
        expect(orig).toEqual(123);
        return 125;
      }, "key1", "key2", "sub")).toEqual(125);
    });

    it("should throw an error when trying to access a dirty key", () => {
      cacheManager.setDirty("key1");
      expect(() => cacheManager.getFreshObj("key1", "key2")).toThrowError("accessing a dirty parent: key=key1,key2, dirtyKey=key1");
    });

    it("should throw an error when trying to access a dirty object", () => {
      cacheManager.setDirty("key1", "key2");
      expect(() => cacheManager.getFreshObj("key1", "key2")).toThrowError("accessing a dirty object: key1,key2");
    });
  });

  describe("setDirty and refreshDirtyObjsAsync", () => {
    it("should mark an object as dirty and then refresh it", async () => {
      cacheManager.addFreshObj({ id: 1, data: "original" }, "key1", "key2");
      cacheManager.addFreshObj({ id: 2, data: "original" }, "key1", "key3");
      cacheManager.addFreshObj({ id: 3, data: "original" }, "key4", "key5");
      cacheManager.setDirty("key1", "key2");

      expect(() => cacheManager.getFreshObj("key1", "key2")).toThrowError("accessing a dirty object: key1,key2");
      expect(cacheManager.getFreshObj("key1", "key3").data).toEqual("original");
      expect(cacheManager.getFreshObj("key4", "key5").data).toEqual("original");

      cacheManager.setDirty("key1");

      expect(() => cacheManager.getFreshObj("key1", "key2")).toThrowError("accessing a dirty parent: key=key1,key2, dirtyKey=key1");
      expect(() => cacheManager.getFreshObj("key1", "key3")).toThrowError("accessing a dirty parent: key=key1,key3, dirtyKey=key1");
      expect(cacheManager.getFreshObj("key4", "key5").data).toEqual("original");

      cacheManager.setDirty("key4");

      expect(() => cacheManager.getFreshObj("key4", "key5")).toThrowError("accessing a dirty parent: key=key4,key5, dirtyKey=key4");

      await cacheManager.refreshDirtyObjsAsync(async (keys, obj) => {
        expect(keys[0]).toEqual("key1");
        expect(keys[1]).toEqual("key2");
        expect(keys.length).toEqual(2);
        obj.data = "updated";
      }, "key1", "key2");

      expect(() => cacheManager.getFreshObj("key4", "key5")).toThrowError("accessing a dirty parent: key=key4,key5, dirtyKey=key4");

      cacheManager.setFreshKey("key1");
      cacheManager.setFreshKey("key4");
      cacheManager.setDirty("key4", "key5");

      expect(cacheManager.getFreshObj("key1", "key2").data).toEqual("updated");
      expect(() => cacheManager.getFreshObj("key1", "key3")).toThrowError("accessing a dirty object: key1,key3");

      cacheManager.setFreshKey("key1", "key3");

      expect(cacheManager.getFreshObj("key1", "key3").data).toEqual("original");

      cacheManager.setDirty("key1", "key3");
      expect(() => cacheManager.getFreshObj("key1", "key3")).toThrowError("accessing a dirty object: key1,key3");
      expect(() => cacheManager.getFreshObj("key4", "key5")).toThrowError("accessing a dirty object: key4,key5");

      await cacheManager.refreshDirtyObjsAsync(async (keys, obj) => {
        expect(keys[0]).toEqual("key1");
        expect(keys[1]).toEqual("key3");
        expect(keys.length).toEqual(2);
        expect(obj.data).toEqual("original");
        obj.data = "updated";
      }, "key1");

      expect(cacheManager.getFreshObj("key1", "key2").data).toEqual("updated");
      expect(cacheManager.getFreshObj("key1", "key3").data).toEqual("updated");
    });

    it("should only refresh specified dirty objects based on targetKeysPrefix", async () => {
      cacheManager.addFreshObj({ id: 1 }, "key1");
      cacheManager.addFreshObj({ id: 2 }, "key1", "key2");
      cacheManager.addFreshObj({ id: 3 }, "key3");
      cacheManager.setDirty("key1");
      cacheManager.setDirty("key3");

      await cacheManager.refreshDirtyObjsAsync(async (keys, obj) => {
        obj.id += 100;
      }, "key1");

      expect(cacheManager.getFreshObj("key1").id).toBe(101);
      expect(cacheManager.getFreshObj("key1", "key2").id).toBe(102);
      expect(cacheManager.getObjForce("key3").id).toBe(3); // Not refreshed
    });
  });

  describe("deleteContainer", () => {
    it("should delete a container and its object should not be accessible", () => {
      cacheManager.addFreshObj({ id: 1 }, "key1", "key2");
      cacheManager.deleteContainer("key1", "key2");
      expect(cacheManager.getFreshObj("key1", "key2")).toBeNull();
    });
  });
});
