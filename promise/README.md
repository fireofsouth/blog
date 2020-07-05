## Promise

### 前言

---

本文从 promise 最基本的结构开始，逐一深入实现 promise 内部功能。

### Promise 解读

首先我们看看 Promise 的一个基本用法：

``` 
 new Promise((resolve, reject) => {
   resolve('ok'); // or reject('reject')
 })
  .then((res) => {
    console.log(res);
  })
  .then((err) => {
    console.log(err);
  });

```

Promise 具备的功能

1. 通过构造函数传递改变状态的两个回调函数
    - resolve执行成功回调
    - reject 执行失败回调
2. 三种状态
    - pending(待定) 初始状态
    - fulfilled（完成）操作成功
    - rejected(拒绝) 操作失败
3. 对外暴露then方法且提供链式回调
4. 对外提供异步函数执行

   - onFulfilled 提供成功回调
   - onRejected 提供失败回调

5. 提供扩展方法

   - catch
   - all
   - race
   - resolve
   - reject

### 逐步实现功能

基于以上对promise功能的解析，下面一步一步来实现它吧~~~

#### Promise 内部基本结构

首先来看看通过构造函数实现回调

``` 
     class Promise {
      constructor(executor) {
        //内部定义两个回调
        // 定义 resolve
        let resolve = res => {}
        // 定义 reject
        let reject = err => {}

        executor(resolve, reject);
      }
    }
    new Promise((resolve, reject) => {
      console.log('hello world')
    })

   > 'hello world'

```

由上简易代码可以看出: Promise构造函数会执行一遍传入的函数，一遍外部调用正常使用

#### Promise 三种状态的改变

好了，来看看状态的改变吧。
Promise 的初始状态为pending, 改变路径只有2种：
pending => fulfilled / rejected

> 注意： 状态改变是不可逆了，一旦改变就不会改回来了。

看实现

``` 
    class Promise {
      constructor(executor) {

        this.status = 'pending' //初始状态
        this.value = null // 成功态时的值
        this.error = null // 失败态时的值

        //内部定义两个回调
        // 定义 resolve
        let resolve = res => {
          if (this.status === 'pending') {
            this.value = res
            this.status = 'fulfilled'
          }
        }
        // 定义 reject
        let reject = err => {
          if (this.status === 'pending') {
            this.error = err
            this.status = 'rejected'
          }
        }

        executor(resolve, reject);
      }
    }
    const promise = new Promise((resolve, reject) => {
      resolve('hello world')
    })
    console.log(promise)

  >> Promise {status: "fulfilled", value: "hello world", error: null}
```

下面验证改变状态的不可逆性

``` 
  const promise = new Promise((resolve, reject) => {
      resolve('hello world')
      reject('能进来吗')
    })
    console.log(promise)

 >> Promise {status: "fulfilled", value: "hello world", error: null}
```

由上可以看出当调用了resolve改变状态后，再使用reject是不能改变状态的

#### Promise对象的then方法实现

Promise的状态改变有2条路径，即会有成功态和失败态，那么then方法就需要提供对应的两个回调方法进行处理。

``` 
 class Promise {
   constructor(executor) {
       <!--... 省略-->
   }
   then(onFullfilled, onRejected) {
        if (this.status === 'fulfilled') {
          onFullfilled(this.value)
        }
        if (this.status === 'rejected') {
          onRejected(this.error)
        }
      }
  }
  const promise = new Promise((resolve, reject) => {
      resolve('hello world')
    })
    promise.then(data => {
      console.log('成功then: ', data)
    }, err => {
      console.log('成功then: ', err)
    })

  >> 成功then:  hello world
```

但是，以上方法都是基于同步方法实现的，我们的业务代码中会存在异步的情况，以下模拟异步代码

``` 
    const promise = new Promise((resolve, reject) => {
      resolve('hello world')
    })
    promise.then(data => {
      console.log('成功then: ', data)
    }, err => {
      console.log('成功then: ', err)
    })
   console.log(promise)
   >> Promise {status: "pending", value: null, error: null}
```

可以看到当执行then方法的时候，状态还是pending，绕过了回调方法的执行。

> setTimeout创建的异步代码执行会晚于当前的同步代码。

因为异步函数的原因导致执行顺序与我们预期有出入，也就是改变状态的函数处于异步的情况， then方法会先执行，且执行then方法的时候是状态是pending。那就对症下药，在then方法里添加pending的状态，将两个回调放到对应状态的处理队列中，等到改变状态的时候在执行。 这样通过添加两个队列来保证异步的时候不会出时序问题。

``` 
     class Promise {
      constructor(executor) {

        this.status = 'pending' //初始状态
        this.value = null // 成功态时的值
        this.error = null // 失败态时的值
        this.resolveQue = []; //成功回调的数组
        this.rejectQue = []; //失败成功的回调
        //内部定义两个回调
        // 定义 resolve
        let resolve = res => {
          if (this.status === 'pending') {
            this.value = res
            this.status = 'fulfilled'
            this.resolveQue.forEach(fn => fn())
          }
        }
        // 定义 reject
        let reject = err => {
          if (this.status === 'pending') {
            this.error = err
            this.status = 'rejected'
            this.rejectQue.forEach(fn => fn())
          }
        }
        executor(resolve, reject);
      }
      then(onFullfilled, onRejected) {
        if (this.status === 'fulfilled') {
          onFullfilled(this.value)
        }
        if (this.status === 'rejected') {
          onRejected(this.error)
        }
        if (this.status === 'pending') {
          // 保留两个回调函数的执行
          this.resolveQue.push(() => {
            onFullfilled(this.value)
          })
          this.rejectQue.push(() => {
            onRejected(this.error)
          })
        }
      }
    }
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('hello world')
      }, 0);

    })
    promise.then(data => {
      console.log('成功then: ', data)
    }, err => {
      console.log('失败then: ', data)
    })

  >> 成功then:  hello world
```

嗯~我们想要的回来了

> 添加数组，其实主要目的是为了弥补异步导致的执行顺序问题-个人理解。
