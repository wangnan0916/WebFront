if (!Object.create) {
    Object.create = function (prototype) {
        function F() {

        }

        F.prototype = prototype;
        return new F;
    }
}
