"use strict";
exports.__esModule = true;
var MutableList = /** @class */ (function () {
    function MutableList() {
        this.list = null;
        this.len = 0;
    }
    MutableList.prototype.prepend = function (value) {
        this.list = { value: value, next: this.list };
        this.len += 1;
    };
    MutableList.prototype.remove = function (item) {
        if (!this.list)
            return;
        if (this.list.value === item) {
            this.list = this.list.next;
            this.len -= 1;
            return;
        }
        var current = this.list;
        while (current.next && current.next.value !== item)
            current = current.next;
        if (!current.next)
            return;
        current.next = current.next.next;
        this.len -= 1;
    };
    MutableList.prototype.length = function () {
        return this.len;
    };
    MutableList.prototype.iterate = function (callback) {
        var current = this.list;
        while (current) {
            callback(current.value);
            current = current.next;
        }
    };
    MutableList.prototype.toArray = function () {
        var res = [];
        this.iterate(function (d) {
            res.push(d);
        });
        return res;
    };
    return MutableList;
}());
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.listenersDict = {};
        this.listenedEvents = new MutableList();
    }
    EventEmitter.prototype.on = function (event, listener) {
        var _this = this;
        if (this.listenersDict[event]) {
            this.listenersDict[event].prepend(listener);
            if (this.listenersDict[event].length() === 1) {
                this.listenedEvents.prepend(event);
            }
            return function () {
                _this.off(event, listener);
            };
        }
        var listenersList = new MutableList();
        listenersList.prepend(listener);
        this.listenersDict[event] = listenersList;
        this.listenedEvents.prepend(event);
        return function () {
            _this.off(event, listener);
        };
    };
    EventEmitter.prototype.off = function (event, listener) {
        var listeners = this.listenersDict[event];
        if (listeners) {
            listeners.remove(listener);
            if (listeners.length() === 0) {
                this.listenedEvents.remove(event);
                delete this.listenersDict[event];
            }
            return this;
        }
    };
    EventEmitter.prototype.emit = function (event, data) {
        var listeners = this.listenersDict[event];
        if (listeners) {
            listeners.iterate(function (callback) { return callback(data); });
        }
        return this;
    };
    EventEmitter.prototype.offAll = function () {
        this.listenersDict = {};
        this.listenedEvents = new MutableList();
        return this;
    };
    EventEmitter.prototype.listenersNumber = function (event) {
        var listenersList = this.listenersDict[event];
        return listenersList ? listenersList.length() : 0;
    };
    EventEmitter.prototype.getListenedEvents = function () {
        return this.listenedEvents.toArray();
    };
    EventEmitter.prototype.getListeners = function (event) {
        var listeners = this.listenersDict[event];
        return listeners ? listeners.toArray() : [];
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;
