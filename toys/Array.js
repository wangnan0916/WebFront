Array.prototype.map = function (callback, thisArg) {
    //array
    if (this === null || this === undefined)
        throw new TypeError('the object is not an Array or liked Array');
    if (typeof callback !== "function")
        throw new TypeError('the first parameter is must be callback function');

    let len = this.length < 0 ? 0 : this.length,
        T = (thisArg === undefined || thisArg === null) ? undefined : Object(thisArg);
    let res = new Array(len);
    for (let i = 0; i < len; i++) {
        if (i in this) {
            res[i] = callback.apply(T, [this[i], i]);
        }
    }
    return res;
}

Array.prototype.filter = function (callback, thisArg) {
    //array
    if (this === null || this === undefined)
        throw new TypeError('the object is not an Array or liked Array');
    if (typeof callback !== "function")
        throw new TypeError('the first parameter is must be callback function');
    let len = this.length < 0 ? 0 : this.length,
        T = (thisArg === undefined || thisArg === null) ? undefined : Object(thisArg);
    let res = [];
    for (let i = 0; i < len; i++) {
        if (callback.apply(T, [this[i], i])) res.push(this[i]);
    }
    return res;
}
Array.prototype.reduce = function (callback, base) {
    if (this === null || this === undefined)
        throw new TypeError('the object is not an Array or liked Array');
    if (typeof callback !== "function")
        throw new TypeError('the first parameter is must be callback function');
    let len = this.length < 0 ? 0 : this.length;
    let i = 0;
    if (base === undefined || base === null) {
        while (i < len) {
            if (i in this) {
                base = this[i];
                i++;
                break;
            }
            i++;
        }
    }
    if (i == len && base === undefined)
        throw new TypeError("the array is empty");

    while (i < len) {
        if (i in this) {
            base = callback.apply(undefined, [base, this[i], i]);
        }
        i++;
    }
    return base;
}
