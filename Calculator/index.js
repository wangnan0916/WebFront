/**
 * @module Calculator
 * @description JavaScript 大数计算机，包含加、减、乘和除，支持负数，目前不支持小数运算。
 * */
var Calculator = Object.create(null);

Calculator.utils = {
    isValidNumber,
    checkOperands,
    getSign,
    getCarry,
    getResultSign,
    clearLeadingZero,
    numberToArray,
    compare,
    Result
}

Calculator.add = add;
Calculator.sub = sub;
Calculator.mul = mul;
Calculator.div = div;

/**
 * @class Result
 * @description 该类用于当作计算操作的返回值类型。
 * @constructor
 *
 * @property {Array<Number>|NaN} raw 操作原始格式数据
 * @property {String} _text 格式化后的结果缓存
 * */
function Result(raw) {
    this.raw = raw;
    this._text = null;
    Object.defineProperty(this, 'text', {
        get() {
            if (this._text === null) this._text = this.formatter();
            return this._text;
        }
    })
}

/**
 * @method formatter
 * @description 对操作结果进行格式化并返回。
 * @for Result
 * @return {String} 返回格式化后的字符串
 * */
Result.prototype.formatter = function () {
    if (this.raw.toString() === "NaN")
        return "NaN";

    if (this.raw.length === 2) {
        //除法
        let res = this.raw.map(item => {
            clearLeadingZero(item);
            return `${getSign(item) === 1 ? '' : '-'}${item.join('').replaceAll('-', '')}`;
        });
        return `(${res[0]},${res[1]})`;
    } else {
        //普通
        clearLeadingZero(this.raw);
        let sign = getSign(this.raw) === 1 ? '' : '-';
        return sign + this.raw.join('').replaceAll('-', '');
    }
}

/**
 * @function isValidNumber
 * @description 检测是参数所给的数字是否全部合法
 *
 * @param {Array<*>} nums 多个数字的集合
 * @return {Boolean} 参数是否全部合法
 * */
function isValidNumber(nums) {
    for (let i = 0; i < nums.length; i++) {
        if (!/^(\-)?\d*$/.test(nums[i])) {
            console.log(`ERROR:${nums[i]} is not a valid number!`);
            return false;
        }
    }
    return true;
}

/**
 * @function checkOperands
 * @description 检查运算的操作数个数以及格式是否合法
 *
 * @param {Array<*>} operands 操作数集合
 * @return {Boolean} 是否合法
 * */
function checkOperands(operands) {
    if (operands.length !== 2) {
        console.log(`ERROR: The number of operands should be 2!`);
        return false;
    }
    return isValidNumber(operands);
}

/**
 * @function getSign
 * @description 获取数的符号
 *
 * @param {Array<Number>|String} num
 * @return {Number} 1 or -1
 * */
function getSign(num) {
    if (num.length === 0) return 1;
    if (num[0] === '-' || num[0] < 0) return -1;
    return 1;
}

/**
 * @function getCarry
 * @description 获取数位的进位信息，由于计算器操作的是十进制，所以用数位除以10并向下取整
 *
 * @param {Number} num 数位
 * @return Number 返回进位
 * */
function getCarry(num) {
    if (num >= 0) return Math.floor(num / 10);
    return Math.ceil(num / 10);
}

/**
 * @function getResultSign
 * @description 获取运算的结果的最终符号，该方法主要应用于add
 *
 * @param {Array<Number>} a
 * @param {Array<Number>} b
 *
 * @return {Number}
 * */
function getResultSign(a, b) {
    let a_sign = getSign(a), b_sign = getSign(b);
    if (a_sign === b_sign) return a_sign;
    if (compare(numberToArray(a, true), numberToArray(b, true))) {
        return a_sign;
    }
    return b_sign;
}

/**
 * @function clearLeadingZero
 * @description 清除前导零
 *
 * @param {Array<Number>} num 数字的数组表示
 * @return {void}
 * */
function clearLeadingZero(num) {
    while (num.length > 1 && num[0] === 0) num.shift();
}

/**
 * @function numberToArray
 * @description 将字符串转换为数字数组，并且去除符号和无效的前导0
 *
 * @param {String} num
 * @param {Boolean} [ignoreSign=false] ignoreSign  忽略数字的符号
 * @return {Array<Number>} 格式化后的数字
 * */
function numberToArray(num, ignoreSign = false) {
    let res = num.split('');
    let sign = getSign(num);

    if (sign === -1) res.shift();

    res = res.map(v => Number(v) * (ignoreSign ? 1 : sign));
    clearLeadingZero(res);
    return res;
}

/**
 * @function compare
 * @description 比较a与b的大小
 *
 * @param {String|Array<Number>} a
 * @param {String|Array<Number>} b
 * @return {Boolean} true:a>=b false:a<b
 * */
function compare(a, b) {
    if (a.length != b.length) return a.length > b.length;
    for (let i = 0; i < a.length; i++) {
        let x = Number(a[i]), y = Number(b[i]);
        if (x === y) continue;
        if (x > y) return true;
        if (x < y) return false;
    }
    return true;
}

/**
 * @function add
 * @description a+b
 *
 * @param {...} operands
 * @return {Result} res
 * */
function add(...operands) {
    operands = operands.map(String);

    if (!checkOperands(operands)) return new Result(NaN);

    let a = operands[0], b = operands[1];
    let res_sign = getResultSign(a, b);

    a = numberToArray(a), b = numberToArray(b);

    if (a.length === 0) return b;
    if (b.length === 0) return a;

    let m = a.length, n = b.length;
    let max = Math.max(m, n) + 1;
    let res = new Array(max).fill(0);

    let carry = 0;
    for (let k = max - 1, i = m - 1, j = n - 1; k >= 0; k--, i--, j--) {
        let sum = carry;
        if (i >= 0) sum += a[i];
        if (j >= 0) sum += b[j];
        carry = getCarry(sum);
        res[k] = sum % 10;
    }

    clearLeadingZero(res);

    //正数与负数相加，最终结果为正数时，去除结果中的负数
    carry = 0;
    for (let i = res.length - 1; i >= 0; i--) {
        res[i] += carry;
        if (res_sign === 1 && res[i] < 0 || res_sign === -1 && res[i] > 0) {
            res[i] += 10 * res_sign;
            carry = res_sign * -1;
        } else carry = 0;
    }

    clearLeadingZero(res);
    return new Result(res);
}

/**
 * @function sub
 * @description a-b
 * @summary a-b=a+(-b)
 *
 * @param {...} operands
 * @return {Result} res
 * */
function sub(...operands) {
    operands = operands.map(String);
    if (!checkOperands(operands)) return new Result(NaN);

    let a = operands[0], b = operands[1];

    let b_sign = getSign(b);
    if (b_sign === -1)
        return add(a, b.slice(1));
    return add(a, "-" + b);
}

/**
 * @function mul
 * @description a*b
 *
 * @param {...} operands
 * @return Result
 * */
function mul(...operands) {

    operands = operands.map(String);
    if (!checkOperands(operands)) return new Result(NaN);

    let a = numberToArray(operands[0]), b = numberToArray(operands[1]);

    let m = a.length, n = b.length;
    let max = m + n;
    let res = new Array(max).fill(0);

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            res[i + j + 1] += a[i] * b[j];
        }
    }
    //处理进位
    let carry = 0;
    for (let i = max - 1; i >= 0; i--) {
        res[i] += carry;
        carry = getCarry(res[i]);
        res[i] %= 10;
    }

    clearLeadingZero(res);

    return new Result(res);
}

/**
 * @function div
 * @description a/b
 *
 * @param {...} operands
 * @return Result
 * */
function div(...operands) {
    operands = operands.map(String);
    if (!checkOperands(operands)) return new Result(NaN);
    let a = numberToArray(operands[0], true).reverse();
    let b = numberToArray(operands[1], true).reverse();
    //符号信息
    let a_sign = getSign(operands[0]), b_sign = getSign(operands[1]);
    let res_sign = a_sign * b_sign;
    // XXX/1
    if (b === "1" || b === "-1") return new Result([numberToArray(operands[0]), [0]]);

    // a/b && a<b
    if (!compare(a, b)) return new Result([[0], numberToArray(operands[0])]);
    //商和余数
    let quotient = new Array(a.length).fill(0), remainder = [];
    let cur = [];

    b.reverse();

    while (a.length) {
        cur.push(a.pop());

        let cnt = 0;

        while (cur.length && compare(cur, b)) {
            cnt++;
            cur = Calculator.sub(cur.join(''), b.join('')).raw;
        }

        if (cnt) {
            quotient[a.length] += cnt;
            if (cur.length && !compare([0], cur)) {
                a.push(...cur.reverse());
            }
            cur = [];
        }
    }


    quotient = quotient.reverse().map(v => v * res_sign);
    remainder = cur.length ? cur.map(v => v * a_sign) : [0];

    clearLeadingZero(quotient), clearLeadingZero(remainder);

    return new Result([quotient, remainder]);
}

Object.freeze(Calculator);

module.exports = Calculator;
