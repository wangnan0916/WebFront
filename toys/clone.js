function shadowClone(target) {
    if (typeof target !== "object" || target === null) return target;
    const res = {};
    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            res[key] = target[key];
        }
    }
    return res;
}

function deepClone(target, map = new Map) {
    //循环引用
    if (map.get(target)) return map.get(target);
    if (!["object", "function"].includes(typeof target) || target === null) return target;
    if (target instanceof Date) return new Date(target);
    if (target instanceof RegExp) return new RegExp(target);

    let res = new target.constructor();
    map.set(target, res);
    if (target instanceof Set) {
        target.forEach(item => {
            res.add(deepClone(item));
        })
        return res;
    }
    if (target instanceof Map) {
        target.forEach((value, key) => {
            res.set(deepClone(key, map), deepClone(value, map));
        });
        return res;
    }
    if (typeof target === "function") {
        res = new Function(`return ${target.toString()}`)();
        res.prototype = target.prototype;
    }
    for (let key in target) {
        res[key] = deepClone(target[key], map);
    }
    return res;
}

