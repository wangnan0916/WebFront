var PENDING = "PENDING";
var FULFILLED = "FULFILLED";
var REJECTED = "REJECTED";

function Promise(executor) {
    var self = this;

    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallback = [];
    this.onRejectedCallback = [];

    function resolve(value) {
        if (self.status !== PENDING) return;
        if (value instanceof Promise) return value.then(resolve, reject);
        queueMicrotask(function () {
            self.status = FULFILLED;
            self.value = value;
            self.onFulfilledCallback.forEach(cb => cb(value));
        });
    }

    function reject(reason) {
        if (self.status !== PENDING) return;
        queueMicrotask(() => {
            self.status = REJECTED;
            self.reason = reason;
            self.onRejectedCallback.forEach(cb => cb(reason));
        });
    }

    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var base = {};
    base.promise = new Promise(function (resolve, reject) {
        base.resolve = resolve;
        base.reject = reject;
    });
    if (typeof onFulfilled !== "function") {
        onFulfilled = function (value) {
            return value;
        }
    }
    if (typeof onRejected !== "function") {
        onRejected = function (reason) {
            throw reason;
        }
    }
    if (this.status === PENDING) {
        this.onFulfilledCallback.push(createTask(base, onFulfilled));
        this.onRejectedCallback.push(createTask(base, onRejected));
    }
    if (this.status === FULFILLED) {
        queueMicrotask(createTask(base, onFulfilled, this.value));
    }
    if (this.status === REJECTED) {
        queueMicrotask(createTask(base, onRejected, this.reason));
    }
    return base.promise;
}

Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
}

Promise.resolve = function (value) {
    return new Promise(function (resolve) {
        resolve(value);
    });
}

Promise.reject = function (reason) {
    return new Promise(function (_, reject) {
        return reject(reason);
    });
}

Promise.deferred = function () {
    var res = {};
    res.promise = new Promise((resolve, reject) => {
        res.resolve = resolve;
        res.reject = reject;
    });
    return res;
}

function createTask(base, callback, defaultArg) {
    var usingDefaultArg = arguments.length === 3;
    return function (arg) {
        try {
            var x = callback(usingDefaultArg ? defaultArg : arg);
            resolvePromise(base, x);
        } catch (e) {
            base.reject(e);
        }
    }
}

function resolvePromise(base, x) {
    if (base.promise === x) return base.reject(new TypeError("Circular Reference"));
    if (x instanceof Promise) {
        if (x.status === PENDING) {
            x.then(function (y) {
                resolvePromise(base, y);
            }).catch(base.reject);
        } else x.then(base.resolve, base.reject);
        return;
    }
    if (/object|function/.test(typeof x) && x !== null) {
        try {
            var called = false;
            var then = x.then;

            if (typeof then === "function") {
                then.call(x,
                    function (y) {
                        if (called) return;
                        called = true;
                        resolvePromise(base, y);
                    },
                    function (reason) {
                        if (called) return;
                        called = true;
                        base.reject(reason);
                    });
            } else base.resolve(x);
        } catch (e) {
            if (called) return;
            called = true;
            base.reject(e);
        }
        return;
    }

    base.resolve(x);
}

module.exports = Promise;
