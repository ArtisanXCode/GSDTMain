
// Polyfill for Array.from (for IE)
if (!Array.from) {
  Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
    const C = this;
    const items = Object(arrayLike);
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    const mapFunction = mapFn === undefined ? undefined : mapFn;
    if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
      throw new TypeError('Array.from: when provided, the second argument must be a function');
    }
    const len = parseInt(items.length, 10) || 0;
    const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
    let k = 0;
    let kValue;
    while (k < len) {
      kValue = items[k];
      if (mapFunction) {
        A[k] = typeof thisArg === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(thisArg, kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }
    A.length = len;
    return A;
  };
}

// Polyfill for Object.assign (for IE)
if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(target);
    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Polyfill for String.includes (for IE)
if (!String.prototype.includes) {
  String.prototype.includes = function(search: string, start?: number) {
    if (typeof start !== 'number') {
      start = 0;
    }
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill for Array.includes (for IE)
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
    return this.indexOf(searchElement, fromIndex) !== -1;
  };
}

export {};
