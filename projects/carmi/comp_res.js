(function () {
      'use strict';
      return function instance($model, $funcLib) {
    'use strict';
    const $res = { $model };
    const $listeners = new Set();
    const $trackingMap = new WeakMap();
    const $trackedMap = new WeakMap();
    const $trackingWildcards = new WeakMap();
    const $invalidatedMap = new WeakMap();
    const $parentObjectMap = new WeakMap();
    const $parentKeyMap = new WeakMap();
    const $invalidatedRoots = new Set();
    let $tainted = new WeakSet();
    $invalidatedMap.set($res, $invalidatedRoots);

    const $uniquePersistentObjects = new Map();
    const getUniquePersistenObject = id => {
      if (!$uniquePersistentObjects.has(id)) {
        $uniquePersistentObjects.set(id, {});
      }
      return $uniquePersistentObjects.get(id);
    };

    const collectAllItems = (res, obj, prefix) => {
      if (typeof obj !== 'object') {
        return;
      }
      res.set(obj, prefix);
      const keys = Array.isArray(obj) ? new Array(obj.length).fill().map((_, idx) => idx) : Object.keys(obj);
      keys.forEach(idx => {
        const child = obj[idx];
        if (typeof child === 'object') {
          collectAllItems(res, child, `${prefix}.${idx}`);
        }
      });
    };

    const serialize = (all, obj) => {
      if (all.has(obj)) {
        return all.get(obj);
      } else if (obj instanceof WeakMap) {
        return Array.from(all.keys()).reduce((acc, item) => {
          if (obj.has(item)) {
            acc[all.get(item)] = serialize(all, obj.get(item));
          }
          return acc;
        }, {});
      } else if (obj instanceof Map) {
        return Array.from(obj.keys()).reduce((acc, item) => {
          if (all.has(item)) {
            acc[all.get(item)] = serialize(all, obj.get(item));
          } else {
            acc[item] = serialize(all, obj.get(item));
          }
          return acc;
        }, {});
      } else if (obj instanceof Set || obj instanceof Array) {
        return Array.from(obj).map(x => (all.has(x) ? all.get(x) : serialize(all, x)));
      } else if (typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
          acc[key] = serialize(all, obj[key]);
          return acc;
        }, {});
      } else {
        return obj;
      }
    };

    const debug = () => {
      const all = new Map();
      collectAllItems(all, $model, '$model');
      collectAllItems(all, $res, '$res');
      console.log(`Found ${all.size} records`);
      console.log(JSON.stringify(serialize(all, { $trackingMap, $invalidatedMap }), null, 2));
    };

    const untrack = ($targetKeySet, $targetKey) => {
      const $tracked = $trackedMap.get($targetKeySet);
      if (!$tracked || !$tracked[$targetKey]) {
        return;
      }
      $tracked[$targetKey].forEach(({ $sourceObj, $sourceKey, $target }) => {
        const $trackingSource = $trackingMap.get($sourceObj);
        $trackingSource[$sourceKey].delete($target);
      });
      delete $tracked[$targetKey];
    };

    const invalidate = ($targetKeySet, $targetKey) => {
      if ($targetKeySet.has($targetKey)) {
        return;
      }
      $targetKeySet.add($targetKey);
      untrack($targetKeySet, $targetKey);
      if ($parentObjectMap.has($targetKeySet)) {
        invalidate($parentObjectMap.get($targetKeySet), $parentKeyMap.get($targetKeySet));
      }
    };

    function setOnObject($target, $key, $val, $invalidates) {
      let $changed = false;
      let $hard = false;
      if ($invalidates) {
        if (typeof $target[$key] === 'object' && $target[$key] && $target[$key] !== $val) {
          $hard = true;
        }
        if (
          $hard ||
          $target[$key] !== $val ||
          (typeof $val === 'object' && $tainted.has($val)) ||
          (!$target.hasOwnProperty($key) && $target[$key] === undefined)
        ) {
          $changed = true;
          triggerInvalidations($target, $key, $hard);
        }
      }
      $target[$key] = $val;
      return $changed;
    }

    function deleteOnObject($target, $key, $invalidates) {
      let $hard = false;
      if ($invalidates) {
        if (typeof $target[$key] === 'object' && $target[$key]) {
          $hard = true;
        }
        triggerInvalidations($target, $key, $hard);
      }
      delete $target[$key];
    }

    function setOnArray($target, $key, $val, $invalidates) {
      let $hard = false;
      if ($invalidates) {
        if (typeof $target[$key] === 'object' && $target[$key] && $target[$key] !== $val) {
          $hard = true;
        }
        if (
          $hard ||
          $target[$key] !== $val ||
          (typeof $target[$key] === 'object' && $tainted.has($val)) ||
          (!$target.hasOwnProperty($key) && $target[$key] === undefined)
        ) {
          triggerInvalidations($target, $key, $hard);
        }
      }
      $target[$key] = $val;
    }

    function track($target, $sourceObj, $sourceKey, $soft) {
      if (!$trackingMap.has($sourceObj)) {
        $trackingMap.set($sourceObj, {});
      }
      const $track = $trackingMap.get($sourceObj);
      $track[$sourceKey] = $track[$sourceKey] || new Map();
      $track[$sourceKey].set($target, $soft);
      const $tracked = $trackedMap.get($target[0]);
      $tracked[$target[1]] = $tracked[$target[1]] || [];
      $tracked[$target[1]].push({ $sourceKey, $sourceObj, $target });
    }

    function trackPath($target, $path) {
      if (!$trackedMap.has($target[0])) {
        $trackedMap.set($target[0], {});
      }
      const $end = $path.length - 2;
      let $current = $path[0];
      for (let i = 0; i <= $end; i++) {
        track($target, $current, $path[i + 1], i !== $end);
        $current = $current[$path[i + 1]];
      }
    }

    function triggerInvalidations($sourceObj, $sourceKey, $hard) {
      $tainted.add($sourceObj);
      const $track = $trackingMap.get($sourceObj);
      if ($track && $track.hasOwnProperty($sourceKey)) {
        $track[$sourceKey].forEach(($soft, $target) => {
          if (!$soft || $hard) {
            invalidate($target[0], $target[1]);
          }
        });
      }
      if ($trackingWildcards.has($sourceObj)) {
        $trackingWildcards.get($sourceObj).forEach($targetInvalidatedKeys => {
          invalidate($targetInvalidatedKeys, $sourceKey);
        });
      }
    }

    function initOutput($targetObj, $targetKey, src, func, createDefaultValue) {
      let $new = false;
      func.output = func.output || new WeakMap();
      if (!func.output.has($targetObj)) {
        func.output.set($targetObj, new WeakMap());
      }
      const $targetOutputs = func.output.get($targetObj);
      if (!$targetOutputs.has(src)) {
        $targetOutputs.set(src, {});
      }
      const $targetSources = $targetOutputs.get(src);
      if (!$targetSources.hasOwnProperty($targetKey)) {
        $targetSources[$targetKey] = createDefaultValue();
        const $parentInvalidatedKeys = $invalidatedMap.get($targetObj);
        const $invalidatedKeys = new Set();
        $parentObjectMap.set($invalidatedKeys, $parentInvalidatedKeys);
        $parentKeyMap.set($invalidatedKeys, $targetKey);
        $invalidatedMap.set($targetSources[$targetKey], $invalidatedKeys);
        if (!$trackingWildcards.has(src)) {
          $trackingWildcards.set(src, new Set());
        }
        $trackingWildcards.get(src).add($invalidatedKeys);
        $new = true;
      }
      const $out = $targetSources[$targetKey];
      return { $out, $new };
    }

    const emptyObj = () => {
      return {};
    };
    const emptyArr = () => [];

    function forObject($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyObj);
      const $invalidatedKeys = $invalidatedMap.get($out);
      (($new && Object.keys(src)) || $invalidatedKeys).forEach(key => {
        func($invalidatedKeys, src, key, $out, context);
      });
      $invalidatedKeys.clear();
      return $out;
    }

    function forArray($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyArr);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        for (let key = 0; key < src.length; key++) {
          func($invalidatedKeys, src, key, $out, context);
        }
      } else {
        $invalidatedKeys.forEach(key => {
          func($invalidatedKeys, src, key, $out, context);
        });
      }
      $invalidatedKeys.clear();
      return $out;
    }

    function recursiveSteps(key, $localInvalidatedKeys, $localKey) {
      const { $dependencyMap, $currentStack, $invalidatedKeys, $out, func, src, context } = this;
      if ($currentStack.length > 0) {
        const prevKey = $currentStack[$currentStack.length - 1];
        if (!$dependencyMap.has(key)) {
          $dependencyMap.set(key, []);
        }
        $dependencyMap.get(key).push({ $localInvalidatedKeys, $localKey });
      }
      if ($invalidatedKeys.has(key)) {
        $currentStack.push(key);
        $invalidatedKeys.delete(key);
        func($invalidatedKeys, src, key, $out, context, this);
        $currentStack.pop();
      }
      return $out[key];
    }

    function cascadeRecursiveInvalidations($loop) {
      const { $dependencyMap, $invalidatedKeys } = $loop;
      $invalidatedKeys.forEach(key => {
        if ($dependencyMap.has(key)) {
          $dependencyMap.get(key).forEach(({ $localInvalidatedKeys, $localKey }) => {
            invalidate($localInvalidatedKeys, $localKey);
          });
          $dependencyMap.delete(key);
        }
      });
    }

    const $recursiveMapCache = new WeakMap();

    function recursiveMapArray($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyArr);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        $recursiveMapCache.set($out, {
          $dependencyMap: new Map(),
          $currentStack: [],
          $invalidatedKeys,
          $out,
          func,
          src,
          context,
          recursiveSteps
        });
      }
      const $loop = $recursiveMapCache.get($out);
      $loop.context = context;
      if ($new) {
        for (let key = 0; key < src.length; key++) {
          $invalidatedKeys.add(key);
        }
        for (let key = 0; key < src.length; key++) {
          $loop.recursiveSteps(key, $invalidatedKeys, key);
        }
      } else {
        cascadeRecursiveInvalidations($loop);
        $invalidatedKeys.forEach(key => {
          $loop.recursiveSteps(key, $invalidatedKeys, key);
        });
      }
      $invalidatedKeys.clear();
      return $out;
    }

    function recursiveMapObject($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyObj);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        $recursiveMapCache.set($out, {
          $dependencyMap: new Map(),
          $currentStack: [],
          $invalidatedKeys,
          $out,
          func,
          src,
          context,
          recursiveSteps
        });
      }
      const $loop = $recursiveMapCache.get($out);
      $loop.context = context;
      if ($new) {
        Object.keys(src).forEach(key => $invalidatedKeys.add(key));
        Object.keys(src).forEach(key => $loop.recursiveSteps(key, $invalidatedKeys, key));
      } else {
        cascadeRecursiveInvalidations($loop);
        $invalidatedKeys.forEach(key => {
          $loop.recursiveSteps(key, $invalidatedKeys, key);
        });
      }
      $invalidatedKeys.clear();
      return $out;
    }

    const $keyByCache = new WeakMap();

    function keyByArray($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyObj);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        $keyByCache.set($out, []);
      }
      const $idxToKey = $keyByCache.get($out);
      if ($new) {
        for (let key = 0; key < src.length; key++) {
          func($invalidatedKeys, $idxToKey, src, key, $out, context);
        }
      } else {
        const keysPendingDelete = new Set();
        $invalidatedKeys.forEach(key => keysPendingDelete.add($idxToKey[key]));
        $invalidatedKeys.forEach(key => {
          keysPendingDelete.delete(func($invalidatedKeys, $idxToKey, src, key, $out, context));
        });
        keysPendingDelete.forEach(key => {
          triggerInvalidations($out, key);
          delete $out[key];
        });
      }
      $idxToKey.length = src.length;
      $invalidatedKeys.clear();
      return $out;
    }

    const $mapKeysCache = new WeakMap();

    function mapKeysObject($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyObj);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        $mapKeysCache.set($out, {});
      }
      const $keyToKey = $mapKeysCache.get($out);
      if ($new) {
        Object.keys(src).forEach(key => {
          $keyToKey[key] = func($invalidatedKeys, src, key, $out, context);
        });
      } else {
        const keysPendingDelete = new Set();
        $invalidatedKeys.forEach(key => {
          if ($keyToKey.hasOwnProperty(key)) {
            keysPendingDelete.add($keyToKey[key]);
            delete $keyToKey[key];
          }
        });
        $invalidatedKeys.forEach(key => {
          if (src.hasOwnProperty(key)) {
            const newKey = func($invalidatedKeys, src, key, $out, context);
            $keyToKey[key] = newKey;
            keysPendingDelete.delete(newKey);
          }
        });
        keysPendingDelete.forEach(key => {
          triggerInvalidations($out, key);
          delete $out[key];
        });
      }
      $invalidatedKeys.clear();
      return $out;
    }

    const $filterCache = new WeakMap();

    function filterArray($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyArr);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        $filterCache.set($out, [0]);
      }
      const $idxToIdx = $filterCache.get($out);
      if ($new) {
        for (let key = 0; key < src.length; key++) {
          func($invalidatedKeys, $idxToIdx, src, key, $out, context);
        }
      } else {
        let firstIndex = Number.MAX_SAFE_INTEGER;
        $invalidatedKeys.forEach(key => (firstIndex = Math.min(firstIndex, key)));
        for (let key = firstIndex; key < src.length; key++) {
          func($invalidatedKeys, $idxToIdx, src, key, $out, context);
        }
        $idxToIdx.length = src.length + 1;
        for (let key = $idxToIdx[$idxToIdx.length - 1]; key < $out.length; key++) {
          triggerInvalidations($out, key);
        }
        $out.length = $idxToIdx[$idxToIdx.length - 1];
      }
      $invalidatedKeys.clear();
      return $out;
    }

    function anyObject($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyArr);
      const $invalidatedKeys = $invalidatedMap.get($out);
      // $out has at most 1 key - the one that stopped the previous run because it was truthy
      if ($new) {
        Object.keys(src).forEach(key => $invalidatedKeys.add(key));
      }
      const $prevStop = $out.length > 0 ? $out[0] : false;
      if ($prevStop) {
        if ($invalidatedKeys.has($prevStop)) {
          $invalidatedKeys.delete($prevStop);
          if (func($invalidatedKeys, src, $prevStop, $out, context)) {
            return true;
          } else {
            $out.length = 0;
          }
        } else {
          return true;
        }
      }
      for (let key of $invalidatedKeys) {
        $invalidatedKeys.delete(key);
        if (func($invalidatedKeys, src, key, $out, context)) {
          $out[0] = key;
          return true;
        }
      }
      return false;
    }

    function anyArray($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyArr);
      const $invalidatedKeys = $invalidatedMap.get($out);
      // $out has at most 1 key - the one that stopped the previous run because it was truthy
      if ($new) {
        for (let key = 0; key < src.length; key++) {
          $invalidatedKeys.add(key);
        }
      }
      const $prevStop = $out.length > 0 ? $out[0] : -1;
      if ($prevStop !== -1) {
        if ($invalidatedKeys.has($prevStop)) {
          $invalidatedKeys.delete($prevStop);
          if (func($invalidatedKeys, src, $prevStop, $out, context)) {
            return true;
          } else {
            $out.length = 0;
          }
        } else {
          return true;
        }
      }
      for (let key of $invalidatedKeys) {
        $invalidatedKeys.delete(key);
        if (func($invalidatedKeys, src, key, $out, context)) {
          $out[0] = key;
          return true;
        }
      }
      return false;
    }

    const $groupByCache = new WeakMap();

    function groupByObject($targetObj, $targetKey, func, src, context) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, func, emptyObj);
      const $invalidatedKeys = $invalidatedMap.get($out);
      if ($new) {
        $groupByCache.set($out, {});
      }
      const $keyToKey = $groupByCache.get($out);
      if ($new) {
        Object.keys(src).forEach(key => func($invalidatedKeys, $keyToKey, src, key, $out, context));
      } else {
        const keysPendingDelete = {};
        $invalidatedKeys.forEach(key => {
          keysPendingDelete[$keyToKey[key]] = keysPendingDelete[$keyToKey[key]] || new Set();
          keysPendingDelete[$keyToKey[key]].add(key);
        });
        $invalidatedKeys.forEach(key => {
          if (func($invalidatedKeys, $keyToKey, src, key, $out, context)) {
            if (keysPendingDelete.hasOwnProperty($keyToKey[key])) {
              keysPendingDelete[$keyToKey[key]].delete(key);
            }
          }
        });
        Object.keys(keysPendingDelete).forEach(res => {
          if (keysPendingDelete[res].size > 0) {
            keysPendingDelete[res].forEach(key => {
              triggerInvalidations($out[res], key);
              delete $out[res][key];
            });
            triggerInvalidations($out, res);
            if (Object.keys($out[res]).length == 0) {
              delete $out[res];
            }
          }
        });
      }
      $invalidatedKeys.clear();
      return $out;
    }

    const $valuesOrKeysCache = new WeakMap();

    function valuesOrKeysForObject($targetObj, $targetKey, identifier, src, getValues) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, identifier, emptyArr);
      if ($new) {
        const $keyToIdx = {};
        const $idxToKey = [];
        $valuesOrKeysCache.set($out, { $keyToIdx, $idxToKey });
        Object.keys(src).forEach((key, idx) => {
          $out[idx] = getValues ? src[key] : key;
          $idxToKey[idx] = key;
          $keyToIdx[key] = idx;
        });
      } else {
        const $invalidatedKeys = $invalidatedMap.get($out);
        const { $keyToIdx, $idxToKey } = $valuesOrKeysCache.get($out);
        const $deletedKeys = [];
        const $addedKeys = [];
        const $touchedKeys = [];
        $invalidatedKeys.forEach(key => {
          if (src.hasOwnProperty(key) && !$keyToIdx.hasOwnProperty(key)) {
            $addedKeys.push(key);
          } else if (!src.hasOwnProperty(key) && $keyToIdx.hasOwnProperty(key)) {
            $deletedKeys.push(key);
          } else {
            if ($keyToIdx.hasOwnProperty(key)) {
              $out[$keyToIdx[key]] = src[key];
              triggerInvalidations($out, $keyToIdx[key]);
            }
          }
        });
        if ($addedKeys.length < $deletedKeys.length) {
          $deletedKeys.sort((a, b) => $keyToIdx[a] - $keyToIdx[b]);
        }
        const $finalOutLength = $out.length - $deletedKeys.length + $addedKeys.length;
        // keys both deleted and added fill created holes first
        for (let i = 0; i < $addedKeys.length && i < $deletedKeys.length; i++) {
          const $addedKey = $addedKeys[i];
          const $deletedKey = $deletedKeys[i];
          const $newIdx = $keyToIdx[$deletedKey];
          delete $keyToIdx[$deletedKey];
          $keyToIdx[$addedKey] = $newIdx;
          $idxToKey[$newIdx] = $addedKey;
          $out[$newIdx] = getValues ? src[$addedKey] : $addedKey;
          triggerInvalidations($out, $newIdx);
        }
        // more keys added - append to end
        for (let i = $deletedKeys.length; i < $addedKeys.length; i++) {
          const $addedKey = $addedKeys[i];
          const $newIdx = $out.length;
          $keyToIdx[$addedKey] = $newIdx;
          $idxToKey[$newIdx] = $addedKey;
          $out[$newIdx] = getValues ? src[$addedKey] : $addedKey;
          triggerInvalidations($out, $newIdx);
        }
        // more keys deleted - move non deleted items at the tail to the location of deleted
        const $deletedNotMoved = $deletedKeys.slice($addedKeys.length);
        const $deletedNotMovedSet = new Set($deletedKeys.slice($addedKeys.length));
        const $keysToMoveInside = new Set(
          $idxToKey.slice($finalOutLength).filter(key => !$deletedNotMovedSet.has(key))
        );
        let $savedCount = 0;
        for (let $tailIdx = $finalOutLength; $tailIdx < $out.length; $tailIdx++) {
          const $currentKey = $idxToKey[$tailIdx];
          if ($keysToMoveInside.has($currentKey)) {
            // need to move this key to one of the pending delete
            const $switchedWithDeletedKey = $deletedNotMoved[$savedCount];
            const $newIdx = $keyToIdx[$switchedWithDeletedKey];
            $out[$newIdx] = getValues ? src[$currentKey] : $currentKey;
            $keyToIdx[$currentKey] = $newIdx;
            $idxToKey[$newIdx] = $currentKey;
            delete $keyToIdx[$switchedWithDeletedKey];
            triggerInvalidations($out, $newIdx);
            $savedCount++;
          } else {
            delete $keyToIdx[$currentKey];
          }
          triggerInvalidations($out, $tailIdx);
        }
        $out.length = $finalOutLength;
        $idxToKey.length = $out.length;
        $invalidatedKeys.clear();
      }
      return $out;
    }

    const $arrayCache = new WeakMap();
    function getEmptyArray($invalidatedKeys, key, token) {
      if (!$arrayCache.has($invalidatedKeys)) {
        $arrayCache.set($invalidatedKeys, {});
      }
      const $cacheByKey = $arrayCache.get($invalidatedKeys);
      $cacheByKey[key] = $cacheByKey[key] || new Map();
      if (!$cacheByKey[key].has(token)) {
        $cacheByKey[key].set(token, []);
      }
      return $cacheByKey[key].get(token);
    }

    const $objectCache = new WeakMap();
    function getEmptyObject($invalidatedKeys, key, token) {
      if (!$objectCache.has($invalidatedKeys)) {
        $objectCache.set($invalidatedKeys, {});
      }
      const $cacheByKey = $objectCache.get($invalidatedKeys);
      $cacheByKey[key] = $cacheByKey[key] || new Map();
      if (!$cacheByKey[key].has(token)) {
        $cacheByKey[key].set(token, {});
      }
      return $cacheByKey[key].get(token);
    }

    function array($invalidatedKeys, key, newVal, identifier, len, invalidates) {
      const res = getEmptyArray($invalidatedKeys, key, identifier);
      invalidates = invalidates && res.length === len;
      for (let i = 0; i < len; i++) {
        setOnArray(res, i, newVal[i], invalidates);
      }
      return res;
    }

    function object($invalidatedKeys, key, newVal, identifier, keysList, invalidates) {
      const res = getEmptyObject($invalidatedKeys, key, identifier);
      invalidates = invalidates && keysList.length && res.hasOwnProperty(keysList[0]);
      for (let i = 0; i < keysList.length; i++) {
        const name = keysList[i];
        setOnObject(res, name, newVal[name], invalidates);
      }
      return res;
    }

    const $callCache = new WeakMap();
    function call($invalidatedKeys, key, newVal, identifier, len, invalidates) {
      const arr = getEmptyArray($invalidatedKeys, key, identifier);
      invalidates = true;
      for (let i = 0; i < len; i++) {
        setOnArray(arr, i, newVal[i], invalidates);
      }
      if (!$callCache.has(arr) || $tainted.has(arr)) {
        $callCache.set(arr, $funcLib[arr[0]].apply($res, arr.slice(1)));
      }
      return $callCache.get(arr);
    }

    const $bindCache = new WeakMap();
    function bind($invalidatedKeys, key, newVal, identifier, len) {
      const arr = getEmptyArray($invalidatedKeys, key, identifier);
      for (let i = 0; i < len; i++) {
        arr[i] = newVal[i];
      }
      if (!$bindCache.has(arr)) {
        $bindCache.set(arr, (...extraArgs) => {
          const fn = $funcLib[arr[0]] || $res[arr[0]];
          return fn.apply($res, arr.slice(1).concat(extraArgs));
        });
      }
      return $bindCache.get(arr);
    }

    function assignOrDefaults($targetObj, $targetKey, identifier, src, assign, invalidates) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, identifier, emptyObj);
      if (!assign) {
        src = [...src].reverse();
      }
      if ($new) {
        Object.assign($out, ...src);
      } else {
        const $invalidatedKeys = $invalidatedMap.get($out);
        const $keysPendingDelete = new Set(Object.keys($out));
        const res = Object.assign({}, ...src);
        Object.keys(res).forEach(key => {
          $keysPendingDelete.delete(key);
          setOnObject($out, key, res[key], invalidates);
        });
        $keysPendingDelete.forEach(key => {
          delete $out[key];
          triggerInvalidations($out, key);
        });
        $invalidatedKeys.clear();
      }
      return $out;
    }

    function size($targetObj, $targetKey, src, identifier) {
      const { $out, $new } = initOutput($targetObj, $targetKey, src, identifier, emptyArr);
      if ($new) {
        $out[0] = Array.isArray(src) ? src.length : Object.keys(src).length;
      }
      if (!$new) {
        const $invalidatedKeys = $invalidatedMap.get($out);
        $out[0] = Array.isArray(src) ? src.length : Object.keys(src).length;
        $invalidatedKeys.clear();
      }
      return $out[0];
    }

    function range($targetObj, $targetKey, end, start, step, identifier) {
      const { $out, $new } = initOutput($targetObj, $targetKey, size, identifier, emptyArr);
      if ($new) {
        for (let val = start; (step > 0 && val < end) || (step < 0 && val > end); val += step) {
          $out.push(val);
        }
      } else {
        let len = 0;
        for (let val = start; (step > 0 && val < end) || (step < 0 && val > end); val += step) {
          if ($out[len] !== val) {
            triggerInvalidations($out, len);
          }
          $out[len] = val;
          len++;
        }
        if ($out.length > len) {
          for (let i = len; i < $out.length; i++) {
            triggerInvalidations($out, i);
          }
          $out.length = len;
        }
      }
      return $out;
    }

    $invalidatedRoots.add('doubleNegated');
  function $doubleNegatedBuild() {
    const acc = $res;
    const key = 'doubleNegated';
    const $invalidatedKeys = $invalidatedRoots;
    let $tracked = [$invalidatedKeys,key];
    const newValue = doubleNegated;
    setOnObject($res, 'doubleNegated', newValue, true);
    $invalidatedRoots.delete('doubleNegated');
    // invalidatedPath: ["*topLevel*","$map0"], false, undefined
 trackPath($tracked, [$res,"$map0"]);
// tracking ["*topLevel*","$map0"]
    return $res.doubleNegated;
  }

$invalidatedRoots.add('doubleNegated');
  function $doubleNegatedBuild() {
    const acc = $res;
    const key = 'doubleNegated';
    const $invalidatedKeys = $invalidatedRoots;
    let $tracked = [$invalidatedKeys,key];
    const newValue = doubleNegated;
    setOnObject($res, 'doubleNegated', newValue, true);
    $invalidatedRoots.delete('doubleNegated');
    // invalidatedPath: ["*topLevel*","$map0"], false, undefined
 trackPath($tracked, [$res,"$map0"]);
// tracking ["*topLevel*","$map0"]
    return $res.doubleNegated;
  }

function $map0$3($invalidatedKeys, src, key, acc, context) {
    let $changed = false;
    let $tracked = [$invalidatedKeys,key];
    const val = src[key];
    if (key >= src.length) {
      $changed = true;
      setOnArray(acc, key, undefined, true);
      acc.length = src.length;
    } else {
      const res = !(val);
      setOnArray(acc, key, res, true);
      
    }
  }

$invalidatedRoots.add('$map0');
  function $map0Build() {
    const acc = $res;
    const key = '$map0';
    const $invalidatedKeys = $invalidatedRoots;
    let $tracked = [$invalidatedKeys,key];
    const newValue = forArray(acc, key, $map0$3, $model, null);
    setOnObject($res, '$map0', newValue, true);
    $invalidatedRoots.delete('$map0');
    // invalidatedPath: ["*root*"], false, root
// tracking ["*root*"]
    return $res.$map0;
  }

    let $inBatch = false;
    function recalculate() {
      if ($inBatch) {
        return;
      }
      $invalidatedRoots.has('$map0') && $map0Build();
$invalidatedRoots.has('doubleNegated') && $doubleNegatedBuild();
      $tainted = new WeakSet();
      $listeners.forEach(callback => callback());
    }
    Object.assign(
      $res,
      {
        set:(arg0,value) => {
              triggerInvalidations($model, arg0, true);
              $tainted.add($model);
              if (typeof value === 'undefined') {
                delete $model[arg0]
              } else {
                $model[arg0]  = value;
              }
              recalculate();
          }
      },
      {
        $startBatch: () => ($inBatch = true),
        $endBatch: () => {
          $inBatch = false;
          recalculate();
        },
        $runInBatch: func => {
          $inBatch = true;
          func();
          $inBatch = false;
          recalculate();
        },
        $addListener: func => {
          $listeners.add(func);
        },
        $removeListener: func => {
          $listeners.delete(func);
        },
        
        $ast: () => {
          return {
  "doubleNegated": [
    "*func*",
    [
      "*not*",
      [
        "*get*",
        "$map0",
        "*topLevel*"
      ]
    ]
  ],
  "$map0": [
    "*map*",
    [
      "*func*",
      [
        "*not*",
        "*val*"
      ]
    ],
    "*root*"
  ]
};
        },
        $source: () => {
          return {};
        }
        
      }
    );
    recalculate();
    return $res;
  }

    })()