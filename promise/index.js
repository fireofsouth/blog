/**
 * 处理promise递归的函数
 *
 * promise2 {Promise} 默认返回的promise
 * x {*} 我们自己 return 的对象
 * resolve
 * reject
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 循环引用报错
  if (x === promise2) {
    // reject 报错抛出
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  // 锁，防止多次调用
  let called;

  // x 不是 null 且 x 是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+ 规定，声明then = x的then方法
      let then = x.then;

      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') {
        // then 执行 第一个参数是 this 后面是成功的回调 和 失败的回调
        then.call(
          x,
          (y) => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;

            // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
            // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
            // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
            resolvePromise(promise2, y, resolve, reject);
          },
          (err) => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;
            reject(err); // 失败了就失败了
          }
        );
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) {
      // 走到 catch 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e);
    }
  } else {
    resolve(x);
  }
}

class Promise {
  constructor(executor) {
    this.status = 'pending'; //初始状态
    this.value = null; // 成功态时的值
    this.error = null; // 失败态时的值
    this.resolveQue = []; //成功回调的数组
    this.rejectQue = []; //失败成功的回调
    //内部定义两个回调
    // 定义 resolve
    let resolve = (res) => {
      if (this.status === 'pending') {
        this.value = res;
        this.status = 'fulfilled';

        this.resolveQue.forEach((fn) => fn());
      }
    };
    // 定义 reject
    let reject = (err) => {
      if (this.status === 'pending') {
        this.error = err;
        this.status = 'rejected';
        this.rejectQue.forEach((fn) => fn());
      }
    };
    executor(resolve, reject);
  }
  then(onFullfilled, onRejected) {
    let promise2;
    if (this.status === 'fulfilled') {
      promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          let x = onFullfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        }, 0);
      });
    }
    if (this.status === 'rejected') {
      promise2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          let x = onRejected(this.error);
          resolvePromise(promise2, x, resolve, reject);
        }, 0);
      });
    }
    if (this.status === 'pending') {
      // 保留两个回调函数的执行
      promise2 = new Promise((resolve, reject) => {
        this.resolveQue.push(() => {
          setTimeout(() => {
            let x = onFullfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          }, 0);
        });
        this.rejectQue.push(() => {
          setTimeout(() => {
            let x = onRejected(this.error);
            resolvePromise(promise2, x, resolve, reject);
          }, 0);
        });
      });
    }

    return promise2;
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
Promise.all = function (promises) {
  let count = 0;
  let res = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((res) => {
        res.push(res);
        count++;
        if (count === promises.length) resolve(res);
      });
    }
  }).catch((err) => {
    reject(err);
  });
};
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
};
Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    resolve(value);
  });
};
Promise.reject = function (value) {
  return new Promise((resolve, reject) => {
    reject(value);
  });
};
