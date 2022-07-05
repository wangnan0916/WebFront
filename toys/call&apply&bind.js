Function.prototype.mycall = function (thisArg) {
    var fn = this;
    if (typeof fn !== "function") throw new TypeError("the caller is not a function");
    var arglist = [];
    for (var i = 1; i < arguments.length; i++) {
        arglist.push("arguments[" + i + "]");
    }
    if (thisArg === undefined || thisArg === null) {
        return eval("fn(" + arglist.join(',') + ")");
    }
    var obj = Object(thisArg);
    obj.__fn__ = fn;
    var res = eval("obj.__fn__(" + arglist.join(',') + ")");
    delete obj.__fn__;
    return res;
}

Function.prototype.myapply = function (thisArg, args) {
    var fn = this;
    if (typeof fn !== "function") throw new TypeError("the caller is not a function");
    var arglist = [];
    for (var i = 0; i < args.length; i++) {
        arglist.push("args[" + i + "]");
    }
    return eval("fn.mycall(thisArg," + arglist.join(',') + ")");
}

Function.prototype.mybind = function (thisArg) {
    var fn = this;
    if (typeof fn !== "function") throw new TypeError("the caller is not a function");
    var arglist = [];
    var args = arguments;
    for (var i = 1; i < args.length; i++) {
        arglist.push("args[" + i + "]");
    }

    function F() {
        for (var i = 0; i < arguments.length; i++) {
            arglist.push("arguments[" + i + "]");
        }
        if (this.__proto__ == F.prototype) {
            return eval("fn.mycall(this," + arglist.join(',') + ")");
        }
        return eval("fn.mycall(thisArg," + arglist.join(',') + ")");
    }

    F.prototype = fn.prototype;
    return F;
}
