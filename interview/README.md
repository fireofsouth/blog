# 经典面试题

###  ['1', '2', '3']. map(parseInt) what & why ?

答案：[1, NaN, NaN]

解析:
var new_array = arr. map(function callback(currentValue[, index[, array]]) { // Return element for new_array }[, thisArg])
这个callback一共可以接收三个参数，其中第一个参数代表当前被处理的元素，而第二个参数代表该元素的索引
parseInt('1', 0) //radix为0时，且string参数不以“0x”和“0”开头时，按照10为基数处理。这个时候返回1
parseInt('2', 1) //基数为1（1进制）表示的数中，最大值小于2，所以无法解析，返回NaN
parseInt('3', 2) //基数为2（2进制）表示的数中，最大值小于3，所以无法解析，返回NaN

###  介绍下 Set、Map、WeakSet 和 WeakMap 的区别？

解析： 
Set

1. 成员不能重复
2. 只有健值，没有健名，有点类似数组。
3. 可以遍历，方法有add, delete,has

weakSet

1. 成员都是对象
2. 成员都是弱引用，随时可以消失。 可以用来保存DOM节点，不容易造成内存泄漏

不能遍历，方法有add, delete, has
Map

1. 本质上是健值对的集合，类似集合
2. 可以遍历，方法很多，可以干跟各种数据格式转换

weakMap

1. 直接受对象作为健名（null除外），不接受其他类型的值作为健名
2. 健名所指向的对象，不计入垃圾回收机制不能遍历，方法同get,set,has,delete

### 介绍下深度优先遍历和广度优先遍历，如何实现？
