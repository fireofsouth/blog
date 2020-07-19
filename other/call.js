Function.prototype.newCall = (context, ...arg) => {
    if (!context) {
        // 没有上下文将window复制给context
        context = window;
    }
    let fn = Symbol(); //fn设置唯一值

    context[fn] = this;
    return context[fn](...args);
};
