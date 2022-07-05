function Foo(a, b) {
    this.a = a;
    this.b = b;
}

Foo.prototype.show = function () {
    console.log('Hello World');
}

function Bar(a, b, c, d) {
    Foo.call(this, a, b);
    this.c = c;
    this.d = d;
}


Object.setPrototypeOf(Bar.prototype, Foo.prototype);

Object.setPrototypeOf(Bar, Foo);
