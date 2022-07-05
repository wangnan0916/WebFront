function debounce(fn, timeout = 500) {
    let timer = null;
    let pre = 0;
    return function debouncedFunction() {
        let now = Date.now();
        if (now - pre <= timeout) {
            clearTimeout(timer);
        }
        pre = now;
        timer = setTimeout(() => {
            fn.apply(undefined, arguments);
        }, timeout);
    }
}

function throttle(fn, timeout = 500) {
    let pre = null;
    let timer = null;
    return function throttleFunction() {
        const now = Date.now();
        clearTimeout(timer);
        if (now - pre >= timeout) {
            fn.apply(undefined, arguments);
            pre = now;
        } else {
            timer = setTimeout(() => {
                fn.apply(undefined, arguments);
            }, timeout);
        }
    }
}
