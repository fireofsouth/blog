/**
 * 织入执行前函数
 * @param {*} fn
 */
Function.prototype.aopBefore = function(fn) {
    console.log(this);
    // 第一步：保存原函数的引用
    const _this = this;
    // 第四步：返回包括原函数和新函数的“代理”函数
    return function() {
        // 第二步：执行新函数，修正this
        fn.apply(this, arguments);
        // 第三步 执行原函数
        return _this.apply(this, arguments);
    };
};
/**
 * 织入执行后函数
 * @param {*} fn
 */
Function.prototype.aopAfter = function(fn) {
    const _this = this;
    return function() {
        let current = _this.apply(this, arguments); // 先保存原函数
        fn.apply(this, arguments); // 先执行新函数
        return current;
    };
};
/**
 * 使用函数
 */
let aopFunc = function() {
    console.log('aop');
};
// 注册切面
aopFunc = aopFunc
    .aopBefore(() => {
        console.log('aop before');
    })
    .aopAfter(() => {
        console.log('aop after');
    });
// 真正调用
aopFunc();
