const throttle = () => {
    let timer = null;
    return function() {
        const args = arguments;
        if (timer) {
            return;
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};
