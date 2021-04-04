function Func(timer) {
  return new Promise(function (res, rej) {
    setTimeout(() => {
      res(timer);
    }, timer);
  });
}
const arr = [1, 2, 3, 4, 5];
