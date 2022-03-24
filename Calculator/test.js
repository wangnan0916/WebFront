const Calculator = require("./index");
const {
    getSign,
    getCarry,
    getResultSign,
    Result,
    isValidNumber,
    checkOperands,
    clearLeadingZero,
    numberToArray,
    compare
} = Calculator.utils;

const {
    add,
    sub,
    mul,
    div
} = Calculator;

const assert = require("assert");

describe(`Calculator.util#isValidNumber`, function () {
    it('isValidNumber(["1","-1","123"]) --> true', function () {
        let nums = ["1", "-1", "123"];
        assert.equal(isValidNumber(nums), true);
    });
    it('isValidNumber(["--1","-1-"]) --> false', function () {
        let nums = ["--1", "-1-"];
        assert.equal(isValidNumber(nums), false);
    });
    it('isValidNumber(["--1","123"]) --> false', function () {
        let nums = ["--1", "-1-"];
        assert.equal(isValidNumber(nums), false);
    });
});

describe(`Calculator.util#Result`, function () {
    it(`new Result(NaN).text --> "NaN"`, function () {
        assert.equal(new Result(NaN).text, "NaN");
    });
    it(`new Result([1,2,3]).text --> "123"`, function () {
        assert.equal(new Result([1, 2, 3]).text, "123");
    });
    it(`new Result([-1,-2,-3]).text --> "-123"`, function () {
        assert.equal(new Result([-1, -2, -3]).text, "-123");
    });
    it(`new Result([0]).text --> "0"`, function () {
        assert.equal(new Result([0]).text, "0");
    });
    it(`new Result([[1,0],[1]]).text --> "(10,1)"`, function () {
        assert.equal(new Result([[1, 0], [1]]).text, "(10,1)");
    });
    it(`new Result([[-1,0],[-1]]).text --> "(-10,-1)"`, function () {
        assert.equal(new Result([[-1, 0], [-1]]).text, "(-10,-1)");
    });
});

describe(`Calculator.util#checkOperands`, function () {
    it(`checkOperands([]) --> false`, function () {
        assert.equal(checkOperands([]), false);
    });
    it(`checkOperands(["1"]) --> false`, function () {
        assert.equal(checkOperands(["1"]), false);
    });
    it(`checkOperands(["1","2","3"]) --> false`, function () {
        assert.equal(checkOperands(["1", "2", "3"]), false);
    });
    it(`checkOperands(["1","2"]) --> true`, function () {
        assert.equal(checkOperands(["1", "2"]), true);
    });
    it(`checkOperands(["--1","-1"]) --> false`, function () {
        assert.equal(checkOperands(["--1", "-1"]), false);
    });
});

describe(`Calculator.util#numberToArray`, function () {
    it(`numberToArray("1") --> [1]`, function () {
        assert.equal(numberToArray("1").toString(), [1].toString());
    });
    it(`numberToArray("1234") --> [1,2,3,4]`, function () {
        assert.equal(numberToArray("1234").toString(), [1, 2, 3, 4].toString());
    });
    it(`numberToArray("-1") --> [-1]`, function () {
        assert.equal(numberToArray("-1").toString(), [-1].toString());
    });
    it(`"numberToArray("-123") --> [-1,-2,-3]`, function () {
        assert.equal(numberToArray("-123").toString(), [-1, -2, -3].toString());
    });
    it(`"numberToArray("-123",true) --> [1,2,3]`, function () {
        assert.equal(numberToArray("-123", true).toString(), [1, 2, 3].toString());
    });
    it(`numberToArray("0") --> [0]`, function () {
        assert.equal(numberToArray("0").toString(), [0].toString());
    });
    it(`numberToArray("-0") --> [0]`, function () {
        assert.equal(numberToArray("-0").toString(), [0].toString());
    });
});

describe(`Calculator.util#clearLeadingZero`, function () {
    it(`clearLeadingZero([0]) --> [0]`, function () {
        let num = [0];
        clearLeadingZero(num);
        assert.equal(num.toString(), [0].toString());
    });
    it(`clearLeadingZero([0,0,1]) --> [1]`, function () {
        let num = [0, 0, 1];
        clearLeadingZero(num);
        assert.equal(num.toString(), [1].toString());
    });
});

describe(`Calculator.util#getSign`, function () {
    it(`getSign(10) --> 1`, function () {
        assert.equal(getSign("10"), 1);
    });
    it(`getSign(-10) --> -1`, function () {
        assert.equal(getSign("-10"), -1);
    });
    it(`getSign([-1,-2]) --> -1`, function () {
        assert.equal(getSign([-1, -2]), -1);
    });
    it(`getSign([1,0]) --> 1`, function () {
        assert.equal(getSign([1, 0]), 1);
    });
    it(`getSign([]) --> 1`, function () {
        assert.equal(getSign([]), 1);
    });
    it(`getSign("") --> 1`, function () {
        assert.equal(getSign(""), 1);
    });
});

describe(`Calculator.util#getCarry`, function () {
    it(`getCarry(-10) --> -1`, function () {
        assert.equal(getCarry(-10), -1);
    });
    it(`getCarry(10) --> 1`, function () {
        assert.equal(getCarry(10), 1);
    });
    it(`getCarry(5) --> 0`, function () {
        assert.equal(getCarry(5), 0);
    });
});

describe(`Calculator.util#getResultSign`, function () {
    it(`getResultSign(1,10) --> 1`, function () {
        assert.equal(getResultSign("1", "1"), 1);
    });
    it(`getResultSign(-1,1) --> 1`, function () {
        assert.equal(getResultSign("-1", "1"), -1);
    });
    it(`getResultSign(1,-100) --> -1`, function () {
        assert.equal(getResultSign("1", "-100"), -1);
    });
});

describe(`Calculator.util#compare`, function () {
    it(`compare("1234","1234") --> true`, function () {
        assert.equal(compare("1234", "1234"), true);
    });
    it(`compare("12345","1234") --> true`, function () {
        assert.equal(compare("12345", "1234"), true);
    });
    it(`compare("2345","1234") --> true`, function () {
        assert.equal(compare("2345", "1234"), true);
    });
    it(`compare([1,2,3],[1,2,3]) --> true`, function () {
        assert.equal(compare([1, 2, 3], [1, 2, 3]), true);
    });
    it(`compare([1,2,3],[1,2]) --> true`, function () {
        assert.equal(compare([1, 2, 3], [1, 2]), true);
    });
    it(`compare([1,2,3],[1,2,3,4]) --> false`, function () {
        assert.equal(compare([1, 2, 3], [1, 2, 3, 4]), false);
    });
    it(`compare("1234","12345") --> false`, function () {
        assert.equal(compare("1234", "12345"), false);
    });
});

function argumentsTesting(fn) {
    it(`${fn.name}("1", "2") instanceof Result --> true`, function () {
        assert.equal(fn("1", "2") instanceof Result, true);
    });
    it(`${fn.name}("--1", "2") instanceof Result --> true`, function () {
        assert.equal(fn("1", "2") instanceof Result, true);
    });
    it(`${fn.name}("1") --> NaN`, function () {
        assert.equal(fn("1").raw.toString(), "NaN");
    });
    it(`${fn.name}() --> NaN`, function () {
        assert.equal(fn().raw.toString(), "NaN");
    });
    it(`${fn.name}("1","2","3") --> NaN`, function () {
        assert.equal(fn("1", "2", "3").raw.toString(), "NaN");
    });
}

describe(`Calculator#add`, function () {
    argumentsTesting(add);
    it(`add(1,2) --> [3]`, function () {
        assert.equal(add(1, 2).raw.toString(), [3].toString());
    });
    it(`add(8,2) --> [1,0]`, function () {
        assert.equal(add(8, 2).raw.toString(), [1, 0].toString());
    });
    it(`add(8,3) --> [1,1]`, function () {
        assert.equal(add(8, 3).raw.toString(), [1, 1].toString());
    });
    it(`add(-8,-2) --> [-1,-0]`, function () {
        assert.equal(add(-8, -2).raw.toString(), [-1, -0].toString());
    });
    it(`add(2,-2) --> [0]`, function () {
        assert.equal(add(2, -2).raw.toString(), [0].toString());
    });
});

describe(`Calculator#sub`, function () {
    argumentsTesting(sub);
    it(`sub("1","1") --> 0`, function () {
        assert.equal(sub("1", "1").raw.toString(), [0].toString());
    });
    it(`sub("0","1234") --> [-1,-2,-3,-4]`, function () {
        assert.equal(sub("0", "1234").raw.toString(), [-1, -2, -3, -4].toString());
    });
    it(`sub("10","1") --> [9]`, function () {
        assert.equal(sub("10", "1").raw.toString(), [9].toString());
    });
    it(`sub("1","10") --> [-9]`, function () {
        assert.equal(sub("1", "10").raw.toString(), [-9].toString());
    });
    it(`sub("456","172") --> [2,8,4]`, function () {
        assert.equal(sub("456", "172").raw.toString(), [2, 8, 4].toString());
    });
    it(`sub("56","172") --> [-1,-1,-6]`, function () {
        assert.equal(sub("56", "172").raw.toString(), [-1, -1, -6].toString());
    });
});

describe(`Calculator#mul`, function () {
    argumentsTesting(mul);
    it(`mul("2","3") --> [6]`, function () {
        assert.equal(mul("2", "3").raw.toString(), [6].toString());
    });
    it(`mul("1","10") --> [1,0]`, function () {
        assert.equal(mul("1", "10").raw.toString(), [1, 0].toString());
    });
    it(`mul("9","99") --> [8,9,1]`, function () {
        assert.equal(mul("9", "99").raw.toString(), [8, 9, 1].toString());
    });
    it(`mul("99","99") --> [9,8,0,1]`, function () {
        assert.equal(mul("99", "99").raw.toString(), [9, 8, 0, 1].toString());
    });
    it(`mul("99","0") --> [0]`, function () {
        assert.equal(mul("99", "0").raw.toString(), [0].toString());
    });
    it(`mul("0","99") --> [0]`, function () {
        assert.equal(mul("0", "99").raw.toString(), [0].toString());
    });
    it(`mul("-2","3") --> [-6]`, function () {
        assert.equal(mul("-2", "3").raw.toString(), [-6].toString());
    });
    it(`mul("-2","-3") --> [6]`, function () {
        assert.equal(mul("-2", "-3").raw.toString(), [6].toString());
    });
    it(`mul("-99","0") --> [0]`, function () {
        assert.equal(mul("-99", "0").raw.toString(), [0].toString());
    });
    it(`mul("0","-99") --> [0]`, function () {
        assert.equal(mul("0", "-99").raw.toString(), [0].toString());
    });
});

describe(`Calculator#div`, function () {
    argumentsTesting(div);
    it(`div("1","2") ---> [[0],[1]]`, function () {
        assert.equal(div("1", "2").raw.toString(), [[0], [1]].toString());
    });
    it(`div("2","2") ---> [[1],[0]]`, function () {
        assert.equal(div("2", "2").raw.toString(), [[1], [0]].toString());
    });
    it(`div("3242","123") ---> [[2,6],[4,4]]`, function () {
        assert.equal(div("3242", "123").raw.toString(), [[2, 6], [4, 4]].toString());
    });
    it(`div("122","2") ---> [[6,1],[0]]`, function () {
        assert.equal(div("122", "2").raw.toString(), [[6, 1], [0]].toString());
    });
    it(`div("122","3") ---> [[4,0],[2]]`, function () {
        assert.equal(div("122", "3").raw.toString(), [[4, 0], [2]].toString());
    });
    it(`div("-1","2") ---> [[0],[-1]]`, function () {
        assert.equal(div("-1", "2").raw.toString(), [[0], [-1]].toString());
    });
    it(`div("-2","2") ---> [[-1],[0]]`, function () {
        assert.equal(div("-2", "2").raw.toString(), [[-1], [0]].toString());
    });
    it(`div("-3242","-123") ---> [[2,6],[-4,-4]]`, function () {
        assert.equal(div("-3242", "-123").raw.toString(), [[2, 6], [-4, -4]].toString());
    });
    it(`div("-122","-2") ---> [[6,1],[0]]`, function () {
        assert.equal(div("-122", "-2").raw.toString(), [[6, 1], [0]].toString());
    });
    it(`div("-122","-3") ---> [[40],[-2]]`, function () {
        assert.equal(div("-122", "-3").raw.toString(), [[4, 0], [-2]].toString());
    });
});
