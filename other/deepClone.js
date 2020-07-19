const deepClone = target => {
    let result;
    if (typeof target === 'object') {
        if (Array.isArray(target)) {
            result = [];
            target.forEach(item => {
                result.push(deepClone(item));
            });
        } else if (target === null) {
            result = null;
        } else if (target.constructor === RegExp) {
            result = traget;
        } else {
            result = {};
            for (let key in target) {
                result[key] = deepClone(target[key]);
            }
        }
    } else {
        result = target;
    }
    return result;
};
