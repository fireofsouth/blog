# KOA2框架源码解析和实现

## 什么是koa框架？

----
koa基于Node实现的一个新的web框架，其特点是：优雅、简洁、表达力强、自由度高。相比于express，更加轻量，主要原因是因为他所有的功能都是通过插件实现，这种插拔式的架构设计模式，很符合unix哲学。
本次主要记录koa的第二个版本Koa2

## koa源码结构

---

1. application.js
2. context.js
3. request.js
4. response.js

以上四个js文件是koa2的核心文件。

### application. js

该文件是koa的入口文件, 向外导出Koa实例，继承events模块, 这样整个框架就具有事件监听和事件触发的能力。同时还会暴露一些常用的api例如listen, use等。

其中： 

1. listen主要是对http.createServer进行一个封装，其中会对Listen传入回调，这个回调主要工作就是对中间件进行合并，上下文处理，以及对res进行处理。
2. use 专门负责收集中间件，然后放在队列队列中，然后记性递归执行。

### context. js 

该文件处理koa应用上下文ctx, 主要通过代理delegate, 将response和request代理和挂在在ctx上，对于开发者来说也是一种方便，我们在访问ctx. resoponse. codes时，可以通过ctx. code进行访问

### response. js request. js

这两个文件主要是对原生request和response进行操作。比如对body进行设置或者取request中的headers。

## 实现koa2

通过上面描述了koa2主要的架构，接下来我们来实现koa2，实现之前，先分析出koa2框架主要需要实现的四大模块：

* 封装node中的http server, 创建Koa类 对外提供实例
* 构造request、response、context对象
* 中间件机制和洋葱模型实现
* 收尾。（对res返回和错误处理）

### 封装node中的http server, 创建Koa类

首先看看外部怎么调用koa2

``` 
  const http = require('http');
  const Koa = require('koa');
  const app = new Koa();
  app.use(callback);
  app.listen(3000,()=>{console.log('listening on 3000')});

```

上面说到application是专门用来创建入口，向外面提供实例，所以application的类如下：

``` 
const http = require('http');
class Application {    
    constructor() {        
    }
    listen(port) {        
        const server = http.createServer(this.callback());
        server.listen(port);
    }
    use(fn) {
        this.callbackFunc = fn;
    }
    callback() {
        return (req, res) => {
          this.callbackFunc(req,res)
        };
    }
}
module.exports = Application;

```

然后我们index. js文件，进行验证。

``` 
  
const Koa = require('./application');
const app = new Koa();
app.use((req, res) => {
    res.writeHead(200);
    res.end('hello world');
});
app.listen(3000, () => {
    console.log('listening on 3000');
});

```

在本地打开浏览器，访问3000端口，就可以看到浏览器返回了hello，world的字样。这样我们就完成了一个生成koa实例的koa，同时具有listen方法用来启动node服务器，use方法注册中间件方法。

### 构造request、response、context对象

首先context，顾名思义上下文，也就是在koa2中经常用到的ctx, 类似我们理解的this。它主要作用连接了request、response。并且通过参数的方式存在在Koa实例以及中间件的回调函数中。使得我们在使用koa过程中都能用到统一上下文。
request、response两个功能模块分别对node的原生request、response进行了一个功能的封装，使用了getter和setter属性，基于node的对象req/res对象封装koa的request/response对象。我们基于这个原理简单实现一下request. js、response. js，首先以一个简单的例子来看request. js

``` 
module.exports = {
    get header() {
        return this.req.header;
    },
    set header(val) {
        this.req.header = val
    }
};
```

在Koa实例中, 我们用ctx. header实际上就返回了真实req. header

对于response同理。

### 中间件机制和剥洋葱模型的实现

之前我们已经实现了上下文context对象、请求request、和响应response对象模块，最后还剩一个最重要的模块，那就是koa的中间模块。koa的中间件机制是一个剥洋葱模型的模型，多个中间件通过use方法放进一个数组队列然后逐一执行。遇到Next后进入下一个中间，所有中间执行完之后开始执行未执行的代码。即为洋葱模型。

``` 

compose() {
        return async ctx => {
            function createNext(middleware, oldNext) {
                return async () => {
                    await middleware(ctx, oldNext);
                }
            }
            let len = this.middlewares.length;
            let next = async () => {
                return Promise.resolve();
            };
            for (let i = len - 1; i >= 0; i--) {
                let currentMiddleware = this.middlewares[i];
                next = createNext(currentMiddleware, next);
            }
            await next();
        };
    }

```

通过上面代码我们可以看到 createNext就是需要将上一个中间件的next当做参数传给下一个中间，当中间件执行完的时候，Next执行的其实就是下一个中间件。

``` 
for (let i = len - 1; i >= 0; i--) {
        let currentMiddleware = this.middlewares[i];
        next = createNext(currentMiddleware, next);
 }

```

上面这段代码使用了一个链式反向递归模型，i从最大值开始计算，中间件从后面开始封装，每一个封装好的中间件都是上一个中间件的Next。直到封装到第一个后，执行next，就可以通过链式的递归去调用所有中间件。这个机制就是Koa剥洋葱的核心代码机制。
