class Vue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;

    this.$el = options.el;

    this.observer(this.$data);
    new Compile(options.el, this);
    if (options.created) {
      options.created.call(this);
    }
  }
  // 双向数据绑定
  observer(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    Object.keys(data).forEach((key) => {
      this.observerSet(key, data, data[key]); // 监听对象
      this.proxyData(key); // 进行本地代理
    });
  }

  observerSet(key, obj, value) {
    this.observer(key);
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        dep.depend();
        return value;
      },
      set(newVal) {
        if (newVal === value) {
          return;
        }
        value = newVal;
        dep.notify();
      }
    });
  }
  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      }
    });
  }
}

// 依赖收集
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target);
    }
  }
  notify() {
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}

class Compile {
  constructor(el, vm) {
    this.$el = document.querySelector(el);
    this.$vm = vm;
    if (this.$el) {
      this.$fragment = this.getNodeChildren(this.$el);

      this.compile(this.$fragment);
      this.$el.appendChild(this.$fragment);
    }
  }
  getNodeChildren(el) {
    const frag = document.createDocumentFragment();
    let child;
    while ((child = el.firstChild)) {
      frag.appendChild(child);
    }
    return frag;
  }
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      if (node.nodeType === 1) {
        // 元素节点
        const nodeArrs = node.attributes;
        Array.from(nodeArrs).forEach((attr) => {
          const attrName = attr.name; // 属性名称
          const attrVal = attr.value; // 属性值
          let tagName;
          if (attrName.slice(0, 2) === 'h-') {
            tagName = attrName.substring(2);

            switch (tagName) {
              case 'model':
                this.dirModel(node, attrVal);
                break;

              case 'html':
                this.dirHtml(node, attrVal);
                break;
            }
          }
          if (attrName.slice(0, 1) === '@') {
            const event = attrName.substring(1);
            this.dirClick(node, event, attrVal);
          }
        });
      } else if (node.nodeType == 2) {
        //2为属性节点
      } else if (node.nodeType == 3) {
        //3为文本节点
        this.compileText(node);
      }
      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  compileText(node) {
    if (typeof node.textContent !== 'string') return;
    const reg = /({{(.*)}})/;
    const reg2 = /[^/{/}]+/;
    const key = String(node.textContent.match(reg)).match(reg2)[0]; //获取监听的key
    if (key !== 'null') this.updateAll('text', node, key);
  }
  dirModel(node, value) {
    const vm = this.$vm;
    this.updateAll('model', node, value);
    node.addEventListener('input', (e) => {
      vm[value] = e.target.value;
    });
  }
  dirHtml(node, value) {
    this.updaterHtml(node, this.$vm[value]);
  }
  dirClick(node, event, attrVal) {
    const fn = this.$vm.$options.methods[attrVal];
    node.addEventListener(event, fn.bind(this.$vm));
  }
  updateAll(type, node, key) {
    switch (type) {
      case 'model':
        const updater = this.updateModel;
        updater(node, this.$vm[key]);
        new Watcher(this.$vm, key, null, function (value) {
          updater(node, value);
        });
        break;

      case 'text':
        if (key) {
          console.log(key);
          const updater = this.updateText;
          const initVal = node.textContent;
          updater(node, this.$vm[key], initVal);
          new Watcher(this.$vm, key, initVal, function (value, initVal) {
            updater(node, value, initVal);
          });
        }
        break;
    }
  }
  updateModel(node, value) {
    node.value = value;
  }
  updateText(node, value, initVal) {
    var reg = /{{(.*)}}/gi;
    var replaceStr = String(initVal.match(reg));
    var result = initVal.replace(replaceStr, value);
    node.textContent = result;
  }

  updaterHtml(node, value) {
    node.innerHTML = value;
  }
}
class Watcher {
  constructor(vm, key, initVal, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    this.initVal = initVal; //旧值
    Dep.target = this;
    this.vm[this.key];
    Dep.target = null;
  }
  update() {
    this.cb.call(this.vm, this.vm[this.key], this.initVal);
  }
}
