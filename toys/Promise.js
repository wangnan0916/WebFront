const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

function Promise(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallback = [];
    this.onRejectedCallback = [];

    const resolve = (x) => {
        if (x === this) return reject(new TypeError("循环引用！"));
        if (x instanceof Promise) {
            x.then(resolve, reject);
            return;
        }
        if (["object", "function"].includes(typeof x) && x !== null) {
            let called = false;
            try {
                let then = x.then;
                if (typeof then === "function") {
                    then.call(x, function (y) {
                        if (called) return;
                        called = true;
                        resolve(y);
                    }, function (reason) {
                        if (called) return;
                        called = true;
                        reject(reason);
                    })
                } else fulfill(x);
            } catch (e) {
                if (called) return;
                called = true;
                reject(e);
            }
            return;
        }
        fulfill(x);
    }
    const fulfill = (value) => {
        queueMicrotask(() => {
            if (this.status !== PENDING) return;
            this.status = FULFILLED;
            this.value = value;
            this.onFulfilledCallback.forEach(cb => cb(value));
        })
    }
    const reject = (reason) => {
        queueMicrotask(() => {
            if (this.status !== PENDING) return;
            this.status = REJECTED;
            this.reason = reason;
            this.onRejectedCallback.forEach(cb => cb(reason));
        })

    }
    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
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
    return new Promise((resolve, reject) => {
        if (this.status === PENDING) {
            this.onFulfilledCallback.push(createTask(onFulfilled, resolve, reject));
            this.onRejectedCallback.push(createTask(onRejected, resolve, reject));
        }
        if (this.status === FULFILLED) {
            queueMicrotask(createTask(onFulfilled, resolve, reject, this.value));
        }
        if (this.status === REJECTED) {
            queueMicrotask(createTask(onRejected, resolve, reject, this.reason));
        }
    });
}
Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
}
Promise.prototype.finally = function (callback) {
    return this.then(callback, callback);
}
Promise.resolve = function (x) {
    return new Promise(resolve => resolve(x));
}
Promise.reject = function (reason) {
    return new Promise((_, reject) => reject(reason));
}
Promise.deferred = function () {
    const dfe = {};
    dfe.promise = new Promise((resolve, reject) => {
        dfe.resolve = resolve;
        dfe.reject = reject;
    });
    return dfe;
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

Promise.map = function (items, callback) {
    var prs = items.map(function (item) {
        var pr = Promise.deferred();
        Promise.resolve(item).then(function (res) {
            try {
                var val = callback(res);
                pr.resolve(val);
            } catch (e) {
                pr.resolve(e);
            }
        }).catch(pr.resolve)
        return pr.promise;
    });
    return Promise.all(prs);
}

function createTask(callback, resolve, reject, defaultArg) {
    let usingDefaultArg = arguments.length === 4;
    return function (value) {
        try {
            resolve(callback(usingDefaultArg ? defaultArg : value));
        } catch (e) {
            reject(e);
        }
    }

}

module.exports = Promise;
