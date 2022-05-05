export default function run(fn, args) {
    if (typeof fn !== "function")
        throw new TypeError("fn is not a function!");
    let gen = fn.apply(this, args);

    let deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    function next(value) {
        try {
            let ret = gen.next(value);
            Promise.resolve(ret.value).then(res => {
                if (ret.done) {
                    deferred.resolve(res);
                } else next(res);
            }).catch(deferred.reject);
        } catch (e) {
            deferred.reject(e);
        }
    }

    next();
    return deferred.promise;
}
