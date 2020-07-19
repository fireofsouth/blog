# http 缓存

这是总结的一篇 web 缓存，其中包括如何减少向服务器减少请求，如何服务器判断是否需要重新发送数据。以及 firefox 和 chrome 浏览器在优化太多 304 的问题上分别采用的策略。

## Web 缓存的工作原理

所有的缓存基本都有一套规则来帮助他们决定什么时候使用缓存中的副本提供服务，在浏览器中通过 http 消息豹头的字段来判断是否使用缓存副本，是否需要与服务器进行验证，常见的与缓存有关的消息报头如下：

![图一](https://fireofsouth.github.io/images/http.png)

                                 

## 浏览器的缓存机制

浏览器会分别从三个方面定义缓存：一、是否需要缓存副本（缓存存储策略）；二、缓存副本是否过期（缓存过期策略）；三、与服务器验证缓存副本是否可用（缓存对比策略）如下图:

![图一](https://fireofsouth.github.io/images/strategy.png)

## 存储策略

由上图可以看出:no-store, no-cache, max-age这三个消息头的字段由服务器返回给浏览器，其中no-cache, max-age表示需要缓存副本，no-store则表示不必缓存到副本之中。可能有人会问为什么no—cache还会缓存，这里通过实验加上自己的理解为：服务器返回no-cache浏览器缓存之后第二次请求会带上no-cache字段表示不使用缓存，必须与服务器进行验证，如果验证命中（对比策略中会提到）还是会返回304状态码使用缓存副本的。一定要与no-store分清楚啊。

## 过期策略

缓存过期策略主要跟两字消息的字段由关Expires(http 1. 0)、max-age(http 1. 1)。其中Expires为缓存过期绝对时间，通过抓包或者浏览器开发者模式可以看到。(科普一个小知识这个时间是格林威治时间是零时区，中国使用的是第八时区所以每次看的时候加上八个小时就好)，当然这里提到是绝对时间而且是服务器返回的时间，就会出问题，因为第二次请求时会根据本机的时间去验证时间会出现本机与服务器的时间有误差，随着而来的max-age（单位为s）就能解决这个问题，当时间为相对时间而且相对的是服务器返回的时间所以不会出现有误差，并且max-age和Expires同时存在的时候max-age权值更大，Expires将失效。其中还有一个启发式过期策略：当Expires和max-age这两个字段都不存在的时候，会根据服务器返回时间Date
和文件最后修改时间last-modified差值的百分之十作为过期时间。

## 对比策略

当缓存在设定的时间过期之后，会发送请求给服务器，但是这不代表缓存就真的“过期”，如果请求的文件到现在 还能用服务器会直接返回304状态码，告诉浏览器继续使用缓存副本从而节省了发送消息题的带宽。
对于对比策略主要与两对字段有关分别为last-Modified, if-Modified-since和Etag, if-None-Match。服务器返回last-Modified, 和Etag字段给浏览器，当浏览器需要与服务器进行验证时用if-Modified-since和if-None-Match两个字段带上上次返回的last-Modified, Etag字段进行比对。比对成功返回304，不成功则重新返回请求文件状态码为200。与存储策略一样两个字段有优先级，当有Etag时则只需要比对Etag。
Etag主要解决几个Last-Modified比较难解决的问题:

1. Last-Modified标注的最后修改只能精确到秒级，如果某些文件在1秒钟以内，被修改多次的话，它将不能准确标注文件的新鲜度
2. 如果某些文件会被定期生成，当有时内容并没有任何变化，但Last-Modified却改变了，导致文件没法使用缓存
3. 有可能存在服务器没有准确获取文件修改时间，或者与代理服务器时间不一致等情形

## 用户操作行为与缓存

说清了过期策略结合下图说明用户使用浏览器的时候，对缓存的操作的影响。

![图一](https://fireofsouth.github.io/images/operate.png)

> 关于F5和Ctrl+F5强制刷新的说明

1. F5主要是在请求头里加上一个max-age:0,由于max-age权限最高，设置为0则表示过期策略失效必须与服务器进行验证如果验证成功则会返回304继续使用缓存。
2. Ctrl+F5强制刷新则会在请求头里添加Cache-control:no-cache和Param:no-cache表示无论如何都不会使用缓存副本，必须重新返回最新文件并覆盖原先缓存副本。

## 太多的304

由于F5刷新所有请求都会重新发送一遍，尽管我们知道太多的文件修改的可能性很低。为了解决这个问题，firefox和chorme有各自的优化，比如firefox会在Cache-control:max-age后面添加immutable字段，表示f5刷新永远不会设置max-age:0 这样会继续使用副本。而chorme则在max-age值较大的情况下都不会去设置max-age为0减少一些不必要的请求。