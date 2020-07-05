class Promise {
  constructor(executor) {
    this.value = null; //成功返回值
    this.error = null; // 失败返回值
    this.status = 'pending'; // fulfilled--成功, rejected--失败
    this.resolveQue = [];
    this.rejectQue = [];

    let resolve = (res) => {
      if (this.status === 'pending') {
        this.value = res;
        this.status = 'resolved';
        this.resolveQue.forEach((fn) => fn());
      }
    };
    let reject = (err) => {
      if (this.status === 'pending') {
        this.error = err;
        this.status = 'rejected';
        this.rejectQue.forEach((fn) => fn());
      }
    };
    executor(resolve, reject);
  }
  then(fulfilledFuc, rejectedFuc) {
    fulfilledFuc =
      typeof fulfilledFuc === 'function' ? fulfilledFuc : (value) => value;
    rejectedFuc =
      typeof rejectedFuc === 'function'
        ? rejectedFuc
        : (err) => {
            throw err;
          };

    let promise2;
    promise2 = new Promise((resolve, reject) => {
      if (this.status === 'resolved') {
        let x = fulfilledFuc(this.value);
        resolvePromise(promise2, x, resolve, reject);
      }
      if (this.status === 'rejected') {
        let x = rejectedFuc(this.error);
        resolvePromise(promise2, x, resolve, reject);
      }
      if (this.status === 'pending') {
        this.resolveQue.push(() => {
          let x = fulfilledFuc(this.value);
          resolvePromise(promise2, x, resolve, reject);
        });
        this.rejectQue.push(() => {
          let x = fulfilledFuc(this.error);
          resolvePromise(promise2, x, resolve, reject);
        });
      }
    });
    return promise2;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject('Chaining cycle detected for promise');
  }
  let called;
  if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (err) => {
            if (called) return;
            called = true;
            reject(err);
          }
        );
      } else {
        resolve(x);
      }
    } catch (err) {
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
}
