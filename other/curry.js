let curry = (fn, ...args) =>
    fn.length > args.length
        ? (...args1) => curry(fn, ...args, ...args1)
        : fn(...args);
