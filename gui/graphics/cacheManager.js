
/**
 * Manages caching and dirty states of arbitrary objects in a tree structure
 *
 * Data structure:
 *
 *  ex. calling getObj(1, 2) traverses map as follows:
 *
 *  Map
 *   -> Map (key1 = ex. "1" for tile row)
 *     -> Map (key2 = ex. "2" for tile col)
 *       -> "self"
 */
class CacheManager {
  static SYM_SELF = Symbol("self");
  static SYM_DIRTY = Symbol("dirty");
  static SYM_KEYS = Symbol("keys");
  static SYM_PARENT_MAP = Symbol("parentMap");

  dirtyQueue = new Array();

  store;
  config;

  log;

  constructor(config) {
    this.store = new Map();

    this.config = Object.assign({
      name: "gui.graphics.cachemanager",
      dirtyQueuePruneThre: 50,
    }, config);

    this.log = Logger.get(this.config.name);
  }

  getFreshObj(...keys) {
    const con = this.#getContainerMap(keys, true, true);
    const obj = con.get(CacheManager.SYM_SELF);

    if (con?.get(CacheManager.SYM_DIRTY))
      throw new Error(`accessing a dirty object: ${keys}`);

    return obj || null;
  }
  getFreshObjOrNull(...keys) {
    try {
      return this.getFreshObj(...keys);
    } catch (_) {
      return null;
    }
  }

  getFreshObjOrReplace(replaceFunc, ...keys) {
    const con = this.#getContainerMap(keys, true, false);
    let obj = con.get(CacheManager.SYM_SELF) || null;

    if (!obj || con.get(CacheManager.SYM_DIRTY)) {
      obj = replaceFunc(obj);
      con.set(CacheManager.SYM_SELF, obj);
      con.set(CacheManager.SYM_DIRTY, false);
    }

    return obj;
  }

  async getFreshObjOrReplaceAsync(replaceFunc, ...keys) {
    const con = this.#getContainerMap(keys, true, false);
    let obj = con.get(CacheManager.SYM_SELF) || null;

    if (!obj || con.get(CacheManager.SYM_DIRTY)) {
      obj = await replaceFunc(obj);
      con.set(CacheManager.SYM_SELF, obj);
      con.set(CacheManager.SYM_DIRTY, false);
    }

    return obj;
  }

  getObjForce(...keys) {
    const con = this.#getContainerMap(keys, true, true);
    const obj = con?.get(CacheManager.SYM_SELF);

    return obj || null;
  }

  /**
   * refreshes all dirty objects by traversing recusively the dirty Maps
   *
   * @param {function} callback the async callback func to receive each dirty obj; optionally returns replacement object
   */
  async refreshDirtyObjsAsync(refreshFunc = async function (_keys, _obj) {}, ...targetKeysPrefix) {
    const timeLabel = "refreshDirtyObjsAsync, queue size=" + this.dirtyQueue.length;
    this.log.time(timeLabel);

    for (let i = 0; i < this.dirtyQueue.length; i++) {
      const map = this.dirtyQueue[i];
      const keys = map.get(CacheManager.SYM_KEYS);

      if (targetKeysPrefix.length && !this.#matchKeys(keys, targetKeysPrefix))
        continue;

      if (!map.get(CacheManager.SYM_DIRTY))
        continue;

      if (map.has(CacheManager.SYM_SELF)) {
        const result = await refreshFunc(keys, map.get(CacheManager.SYM_SELF));
        if (typeof result != 'undefined')
          map.set(CacheManager.SYM_SELF, result);
      }

      map.set(CacheManager.SYM_DIRTY, false);
    }

    if (this.dirtyQueue.length > (this.config.dirtyQueuePruneThre || 50))
      this.dirtyQueue = this.dirtyQueue.filter(x => x.get(CacheManager.SYM_DIRTY));

    this.log.timeEnd(timeLabel);

    return this;
  }

  addFreshObj(obj, ...keys) {
    this.#getContainerMap(keys, true)
      .set(CacheManager.SYM_SELF, obj)
      .set(CacheManager.SYM_DIRTY, false);

    return this;
  }

  addDirtyObj(obj, ...keys) {
    this.dirtyQueue.push(
      this.#getContainerMap(keys, true)
        .set(CacheManager.SYM_SELF, obj)
        .set(CacheManager.SYM_DIRTY, true)
    );

    return this;
  }

  setFreshKey(...keys) {
    this.#getContainerMap(keys, true, false)
      .set(CacheManager.SYM_DIRTY, false);

    return this;
  }

  isDirty(...keys) {
    return !!this.#getContainerMap(keys, true, false)
      .get(CacheManager.SYM_DIRTY);
  }

  setDirty(...keys) {
    const parent = this.#getContainerMap(keys, true);

    const stack = [parent];

    while (stack.length) {
      const parent = stack.pop();

      parent.set(CacheManager.SYM_DIRTY, true);
      this.dirtyQueue.push(parent);

      parent.forEach((val, key) => {
        if (key === CacheManager.SYM_DIRTY ||
          key === CacheManager.SYM_KEYS ||
          key === CacheManager.SYM_SELF ||
          key === CacheManager.SYM_PARENT_MAP ||
          !(val instanceof Map))
          return;

        stack.push(val);
      });
    }

    return this;
  }


  deleteContainer(...keys) {
    this.#removeFromDirtyQueue(keys);
    this.#getContainerMap(keys, false, false)
      ?.get(CacheManager.SYM_PARENT_MAP)
      ?.delete(keys.at(-1));
    return this;
  }

  #removeFromDirtyQueue(targetKeysPrefix) {
    this.dirtyQueue = this.dirtyQueue.filter(map => {
      const keys = map.get(CacheManager.SYM_KEYS);

      return this.#matchKeys(keys, targetKeysPrefix);
    });
  }

  #matchKeys(keys, targetKeysPrefix) {
    if (!keys)
      return false;

    for (let i = 0; i < targetKeysPrefix.length; i++) {
      if (targetKeysPrefix[i] !== keys[i])
        return false;
    }

    return true;
  }

  #getContainerMap(keys, autoCreate=false, throwOnDirtyParent=false) {
    let parent = this.store;

    const path = [];
    for (const key of keys) {
      if (autoCreate)
        path.push(key);

      if (throwOnDirtyParent && parent.get(CacheManager.SYM_DIRTY))
        throw new Error(`accessing a dirty parent: key=${keys}, dirtyKey=${parent.get(CacheManager.SYM_KEYS)}`);

      let child = parent.get(key);
      if (!child) {
        if (autoCreate) {
          parent.set(key, child = new Map());
          child.set(CacheManager.SYM_KEYS, [...path]);
          child.set(CacheManager.SYM_PARENT_MAP, parent);
        } else {
          return null;
        }
      }
      parent = child;
    }

    return parent;
  }
}