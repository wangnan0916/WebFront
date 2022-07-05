function MyNew(constructor, ...args) {
    let o = Object.create(constructor.prototype);
    let res = constructor.apply(o, args);
    if (typeof res === "object" && res !== null) return res;
    return o;
}
