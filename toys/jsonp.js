function jsonp(url, callback, parameters = {}) {
    let arg = new URLSearchParams(parameters);
    if (arg.toString()) {
        url = url + '?' + arg.toString();
    }
    let script = document.createElement("script");
    script.src = url;
    document.body.append(script);
}
