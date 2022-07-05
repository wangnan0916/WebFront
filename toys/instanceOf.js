Object.prototype.isInstanceOf = function (b) {
    let proto = this.__proto__;
    while (proto) {
        if (proto == b.prototype) return true;
        proto = proto.__proto__;
    }
    return false;
}

function Foo() {

}

let f = new Foo();
console.log(f.isInstanceOf(Foo), f.isInstanceOf(Object))
