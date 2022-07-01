Function.prototype.myCall = function (thisArg) {
    var fn = this, arglist = [];
    if (typeof fn != "function") throw new TypeError("the caller is not a function");

    for (var i = 1; i < arguments.length; i++)
        arglist.push("arguments[" + i + "]");

    if (thisArg == null || thisArg == undefined)
        return eval("fn(" + arglist.join(',') + ")");

    var obj = Object(thisArg);
    obj.fn = fn;
    var res = eval("obj.fn(" + arglist.join(',') + ")");
    delete obj.fn;
    return res;
}
Function.prototype.myApply = function (thisArg, args) {
    var fn = this;
    if (typeof fn != "function") throw new TypeError("the caller is not a function");
    if (Object.prototype.toString.myCall(args).indexOf("Array") === -1) args = [];
    var arglist = [];
    args.forEach(function (v, i) {
        arglist.push("args[" + i + "]");
    });
    return eval("fn.myCall(thisArg," + arglist.join(',') + ")");
}
Function.prototype.myBind = function (thisArg, args) {
    var fn = this;
    if (typeof fn !== "function") throw new TypeError("the caller is not a function");
    if (Object.prototype.toString.myCall(args).indexOf("Array") === -1) args = [];

    function BoundFunction() {
        for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);

        if (this.__proto__ == BoundFunction.prototype)
            return eval("fn.myApply(this,args)");

        return eval("fn.myApply(thisArg,args)");
    }

    BoundFunction.prototype = fn.prototype;
    return BoundFunction;
}
