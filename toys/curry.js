function curry(fn, ...args) {
    return function F() {
        if (arguments.length === 0) return fn.apply(this, args);
        args.push(...arguments);
        return F;
    }
}
