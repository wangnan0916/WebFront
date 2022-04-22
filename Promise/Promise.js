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

    function fulfill(value) {
        queueMicrotask(function () {
            if (self.status !== PENDING) return;
            self.status = FULFILLED;
            self.value = value;
            self.onFulfilledCallback.forEach(cb => cb(value));
        });
    }

    function reject(reason) {
        queueMicrotask(() => {
            if (self.status !== PENDING) return;
            self.status = REJECTED;
            self.reason = reason;
            self.onRejectedCallback.forEach(cb => cb(reason));
        });
    }

    function resolve(value) {
        resolvePromise({promise: self, fulfill, reject}, value);
    }

    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var base = Promise.deferred();

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
    var base = Promise.deferred();
    base.resolve(value);
    return base.promise;
}

Promise.reject = function (reason) {
    var base = Promise.deferred();
    base.reject(reason);
    return base.promise;
}

Promise.deferred = function () {
    var dfe = {};
    dfe.promise = new Promise((resolve, reject) => {
        dfe.resolve = resolve;
        dfe.reject = reject;
    });
    return dfe;
}

function createTask(base, callback, defaultArg) {
    var usingDefaultArg = arguments.length === 3;
    return function (arg) {
        try {
            var x = callback(usingDefaultArg ? defaultArg : arg);
            base.resolve(x);
        } catch (e) {
            base.reject(e);
        }
    }
}

function resolvePromise(base, x) {
    if (base.promise === x) {
        base.reject(new TypeError("Circular Reference"));
        return;
    }

    if (x instanceof Promise) {
        if (x.status === PENDING) {
            x.then(function (y) {
                resolvePromise(base, y);
            }).catch(base.reject);
        } else x.then(base.fulfill, base.reject);
        return;
    }

    if (/object|function/.test(typeof x) && x !== null) {
        try {
            var called = false;
            var then = x.then;

            if (typeof then === "function") {
                then.call(x, function (y) {
                    if (called) return;
                    called = true;
                    resolvePromise(base, y);
                }, function (reason) {
                    if (called) return;
                    called = true;
                    base.reject(reason);
                });
            } else {
                base.fulfill(x);
                return;
            }
        } catch (e) {
            if (called) return;
            called = true;
            base.reject(e);
        }
        return;
    }

    base.fulfill(x);
}

Promise.all = function (prs) {
    var n = prs.length, rest = n;
    var res = new Array(n).fill(undefined);
    var def = Promise.deferred();
    for (var i = 0; i < n; i++) {
        (function (i) {
            var p = prs[i];
            Promise.resolve(p).then(function (val) {
                res[i] = val;
                rest--;
                if (rest == 0) def.resolve(res);
            }).catch(function (err) {
                def.reject(err);
            })
        })(i);
    }
    return def.promise;
}

Promise.race = function (prs) {
    var n = prs.length;
    var def = Promise.deferred();
    for (var i = 0; i < n; i++) {
        (function (i) {
            Promise.resolve(prs[i]).then(def.resolve).catch(def.reject)
        })(i);
    }
    return def.promise;
}

module.exports = Promise;
