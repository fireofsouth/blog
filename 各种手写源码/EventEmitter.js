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
