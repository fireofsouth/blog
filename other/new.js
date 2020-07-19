const myNew = (fn, ...args) => {
    let obj = {};
    obj.__proto__ = fn.prototype;
    let result = fn.call(obj, ...args);

    if (
        (result && typeof result === 'object') ||
        typeof result === 'function'
    ) {
        return result;
    }
    return obj;
};
