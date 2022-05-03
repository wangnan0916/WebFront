class Vue {
    constructor(instance) {
        this.$data = instance.data;
        this.$deps = {};
        Observer(this.$data, this, []);
        Compile(instance.el, this);
    }
}

function isObject(o) {
    return typeof o === "object" && o !== null;
}

/**
 * 通过key获取对象中的指定属性
 * */
Object.prototype.get = function (key) {
    return key.toKeyArray().reduce((obj, key) => obj[key], this);
}
/**
 * 通过key为对象中的指定属性赋值
 * */
Object.prototype.set = function (key, value) {
    let keyArr = key.toKeyArray();
    keyArr.reduce((obj, key, index) => {
        if (index == keyArr.length - 1) {
            obj[key] = value;
        }
        return obj[key];
    }, this);
}
/**
 * 将字符转的key转换为array
 * eg:
 * 1.user --> ['user']
 * 2.user.name,user['name'] --> ['user','name']
 * 3.user.nickname[0],user['nickname']['0'] --> ['user','nickname','0']
 * */
String.prototype.toKeyArray = function () {
    let keyArr = [], key = "";
    for (let i = 0; i < this.length; i++) {
        let ch = this[i];
        if (ch == '\'' || ch == '\"') continue;
        if (ch == '.' || ch == '[' || ch == ']') {
            if (key.length) {
                keyArr.push(key)
                key = "";
            }
        } else key += ch;
    }
    if (key.length) keyArr.push(key);
    //console.log(`toKeyArray(${this})-->${keyArr}`);
    return keyArr;
}
/**
 * 将keyArray转换为string
 * eg:
 * 1.['user'] --> "user"
 * 2.['user','name'] --> user['name']
 * 3.['user','nickname','0'] --> user['nickname']['0']
 * */
Array.prototype.toKeyString = function () {
    let res = this[0];
    for (let i = 1; i < this.length; i++) {
        res += `['${this[i]}']`;
    }
    return res;
}
/**
 * 将字符串格式化为统一格式
 * 1.统一模板上用户使用data中数据的不同风格
 * */
String.prototype.formatterKey = function () {
    return this.toKeyArray().toKeyString();
}

/**
 * Observer
 * 自定义data数据中的getter和setter
 * */
function Observer(data, vm, fullkey) {
    if (!isObject(data)) return;
    Object.keys(data).map((key) => {
        /**
         * 借助闭包保存data[key]
         * 1.需要在data中添加与key同名的setter和getter
         * 2.如果利用对象中的同名属性来保存值，会进入死循环。
         * */
        let value = data[key];
        //递归进行添加setter和getter
        if (isObject(value)) return Observer(value, vm, [...fullkey, key]);

        //生成keyString用于通知依赖
        let keyString = [...fullkey, key].toKeyString();

        //console.log(`fullkey --> ${fullkey},keyString in setter --> ${keyString}`);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            set(newValue) {
                //console.log(`set[${key}],old:${value},new:${newValue}`);
                value = newValue;
                if (isObject(newValue))
                    Observer(newValue, vm, [...fullkey, key]);
                if (vm.$deps[keyString]) {
                    //console.log(`notify ${keyString} dependency`);
                    vm.$deps[keyString].notify(newValue);
                }
            },
            get() {
                //console.log(`get[${key}],return ${value}`);
                return value;
            }
        })
    });
}

/**
 * Compile
 * 解析dom节点中的模板表达式
 * */
function Compile(element, vm) {
    let el = vm.$el = document.querySelector(element);
    /**
     * fragment 文档片段
     * 1.没有父对象的最小文档对象，它被作为一个轻量版的Dom使用。
     * 2.在功能上，与标准Dom相同。最大的区别是，DomFrag不是真实Dom树的一部分。
     * 3.它的变化不会触发Dom树的重新渲染，并且不会导致性能问题。
     * 4.最常用的方法，将真实Dom存入fragment中，对其进行批量修改，然后统一添加至Dom树中，这样所有修改的元素只需要一次重新渲染的操作，否则需要多次。
     * */
    let fragment = document.createDocumentFragment();
    let child;
    while (child = el.firstChild) {
        fragment.appendChild(child);
    }

    Fragment_Compile(fragment);
    el.appendChild(fragment);

    /**
     * 对dom结构中使用模板语法的文本节点和绑定v-module的节点进行处理
     * */
    function Fragment_Compile(node) {
        if (node.nodeType == 3) {
            //文本节点
            let nv = node.nodeValue;
            //匹配模板表达式
            const pattern = /\{\{\s*(\S+)\s*\}\}/;
            let template = pattern.exec(nv);
            if (!template) return;
            let bindKey = template[1].formatterKey()
            // console.log(`render ${bindKey}:${vm.$data.get(bindKey)} to dom`)
            // console.log(`toKeyString:${bindKey.toKeyArray().toKeyString()}`)
            node.nodeValue = nv.replace(pattern, vm.$data.get(bindKey));

            new Watcher(vm, bindKey, (change) => {
                node.nodeValue = nv.replace(pattern, change);
            });
        }
        if (node.nodeName === "INPUT") {
            //input输入框
            let bindKey = node.getAttribute("v-module");
            if (!bindKey) return;
            bindKey = bindKey.formatterKey();
            //初始化input的value
            node.value = vm.$data.get(bindKey);

            new Watcher(vm, bindKey, (change) => {
                node.value = change;
            });
            //通过input事件，将值更新到实例
            node.addEventListener("input", (e) => {
                vm.$data.set(bindKey, e.target.value);
            });
            return;
        }
        node.childNodes.forEach(Fragment_Compile);
    }
}

/**
 * 依赖&观察者
 * */
class Dependency {
    constructor() {
        this.subscriber = [];
    }

    subscribe(sub) {
        this.subscriber.push(sub);
    }

    notify(change) {
        this.subscriber.map(sub => sub.update(change));
    }
}

class Watcher {
    constructor(vm, key, callback) {
        this.callback = callback;
        //console.log(`add key ${key} to dep`)
        if (vm.$deps[key] === undefined) vm.$deps[key] = new Dependency();
        vm.$deps[key].subscribe(this);
    }

    update(change) {
        this.callback(change);
    }
}


