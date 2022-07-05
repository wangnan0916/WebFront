/**
 * @function
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method
 * @param {String} url
 * @param {Object} xhrParams
 * @return {Promise}
 *
 * */
function ajax(method, url, xhrParams) {
    const defer = {};
    defer.promise = new Promise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 300
                || this.status === 304)
                defer.resolve(this.response);
        }
    }
    xhr.onerror = defer.reject;
    xhr.ontimeout = defer.reject;

    //参数准备
    let body = method === "GET" ? new URLSearchParams : new FormData;
    for (let key in xhrParams) {
        body.append(key, xhrParams[key]);
    }
    //get通过URL传参
    if (method === "GET" && Object.keys(xhrParams) > 0) url += `?${body.toString()}`;

    xhr.open(method, url);
    xhr.responseType = "text";
    xhr.timeout = 5000;

    xhr.send(method === "GET" ? null : body);

    return defer.promise;
}

/**
 * @memberOf ajax
 * @function
 * @param {String} url
 * @param {Object} [params={}]
 * @return {Promise}
 * */
ajax.get = function (url, params = {}) {
    return ajax("GET", url, params);
}
/**
 * @memberOf ajax
 * @function
 * @param {String} url
 * @param {Object} [params={}]
 * @return {Promise}
 * */
ajax.post = function (url, params = {}) {
    return ajax("POST", url, params);
}

/**
 * @memberOf ajax
 * @function
 * @param {Array<String>} urls
 * @param {Number} [maximum=2]
 * @return {Promise}
 * */
ajax.multiRequest = function (urls, maximum = 2) {
    const defer = {};
    defer.promise = new Promise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    const len = urls.length;
    const ret = new Array(len).fill(undefined);
    let index = 0, fulfilled = 0;
    while (index < Math.min(len, maximum)) {
        next(index++);
    }

    function next(at) {
        ajax.get(urls[at]).then(res => {
            ret[at] = res;
            fulfilled++;
            if (fulfilled === len) defer.resolve(ret);
            if (index < len) next(index++);
        }).catch(defer.reject);
    }

    return defer.promise;
}
//get请求测试
ajax.get("http://jsonplaceholder.typicode.com/comments", {
    postId: 1
}).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
//post请求测试
ajax.post("http://jsonplaceholder.typicode.com/posts", {
    postId: 1
}).then(res => {
    console.log(res);
}).catch(err => {
    console.log("error", err);
});
//并发请求测试
let tasks = [
    "http://jsonplaceholder.typicode.com/posts",
    "http://jsonplaceholder.typicode.com/comments",
    "http://jsonplaceholder.typicode.com/albums",
    "http://jsonplaceholder.typicode.com/photos",
    "http://jsonplaceholder.typicode.com/todos",
    "http://jsonplaceholder.typicode.com/users"
];
for (let i = 0; i < 15; i++) {
    tasks.push(`http://jsonplaceholder.typicode.com/comments?postId=${1}`);
}
ajax.multiRequest(tasks, 10).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
