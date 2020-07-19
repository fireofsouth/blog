# 常用函数的一些手写

## new操作符

1. new是从构造函数创造一个实例对象，然后构造函数的this指向刚创造的实例函数，并且能够使用到构造函数原型和方法

2. 通过apply或者call去改变this的指向

3. 继承构造函数的原型属性和方法

具体代码如下：

``` 
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

```

### call、apply、bind

1.   call

``` 

Function.prototype.newCall = (context, ...arg) => {
    if (!context) {
        // 没有上下文将window复制给context
        context = window;
    }
    let fn = Symbol(); //fn设置唯一值

    context[fn] = this;
    return context[fn](...args);
};

```

2. apply 

``` 
Function.prototype.myApply = (context, arg) => {
    if (!context) {
        // 没有上下文将window复制给context
        context = window;
    }
    let fn = Symbol(); //fn设置唯一值

    context[fn] = this;
    return context[fn](...args);
};

```

3. bind 

``` 
Function.prototype.myBind = function (context, ...args) {
  if (!context || context === null) {
    context = window;
  }
  // 创造唯一的key值  作为我们构造的context内部方法名
  let fn = Symbol();
  context[fn] = this;
  let _this = this
  const result = function (...innerArgs) {
    if (this instanceof _this === true) {
      // 此时this指向指向result的实例  这时候不需要改变this指向
      this[fn] = _this
      this[fn](...[...args, ...innerArgs]) //这里使用es6的方法让bind支持参数合并
      delete this[fn]
    } else {
      // 如果只是作为普通函数调用  那就很简单了 直接改变this指向为传入的context
      context[fn](...[...args, ...innerArgs]);
      delete context[fn]
    }
  };
  // 如果绑定的是构造函数 那么需要继承构造函数原型属性和方法
  // 实现继承的方式一:  构造一个中间函数来实现继承
  // let noFun = function () { }
  // noFun.prototype = this.prototype
  // result.prototype = new noFun()
  // 实现继承的方式二: 使用Object.create
  result.prototype = Object.create(this.prototype)
  return result
}

```

### 防抖节流

> 防抖和节流的区别

  防抖是N秒内函数只会被执行一次，如果N秒内再次被触发，则重新计算延迟时间。
  节流是规定一个单位时间，在这个单位时间内最多只能触发一次函数执行

1. 防抖通过setTimeout保证
2. 节流通过flag保证

``` 
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function () {
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

```

``` 

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

```

### 订阅发布模式

1. 发布-订阅模式:是一种对象间一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到状态改变的通知。
2. 实现一对多肯定有一个事件调度中心用来调度事件 订阅者可以注册事件（on）到事件中心 发布者可以发布事件（emit）到调度中心 订阅者也可以取消订阅（off）或者只订阅一次（once） 

``` 
class EventEmitter {
    constructor() {
        this.events = {};
    }

    //订阅事件
    on(type, callback) {
        if (!this.events[type]) this.events[type] = [];
        this.events[type].push(callback);
    }

    //删除订阅
    off(type, callback) {
        this.events[type] &&
            this.events[type].filter(item => item !== callback);
    }
    once(type, callback) {
        const fn = () => {
            callback();
            this.off(type, fn);
        };
        this.on(type, fn);
    }
    //触发事件
    emit(type, ...rest) {
        if (!this.events[type]) return;
        this.events[type].forEach(fn => fn.apply(this, rest));
    }
}

```
