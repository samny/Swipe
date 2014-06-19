// Polyfill bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}


// IE7 support for querySelectorAll. Supports multiple / grouped selectors and the attribute selector with a "for" attribute. http://www.codecouch.com/

if (!document.querySelectorAll) {
    var d = document, s = d.createStyleSheet();
    d.querySelectorAll = function (r, c, i, j, a) {
        a = d.all, c = [], r = r.replace(/\[for\b/gi, '[htmlFor').split(',');
        for (i = r.length; i--;) {
            s.addRule(r[i], 'k:v');
            for (j = a.length; j--;) a[j].currentStyle.k && c.push(a[j]);
            s.removeRule(0);
        }
        return c;
    }
}


// EventListener | MIT/GPL2 | github.com/jonathantneal/EventListener

this.Element && Element.prototype.attachEvent && !Element.prototype.addEventListener && (function () {
    function addToPrototype(name, method) {
        Window.prototype[name] = HTMLDocument.prototype[name] = Element.prototype[name] = method;
    }

    // add
    addToPrototype("addEventListener", function (type, listener) {
        var
            target = this,
            listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        // if no events exist, attach the listener
        if (!typeListeners.length) {
            target.attachEvent("on" + type, typeListeners.event = function (event) {
                var documentElement = target.document && target.document.documentElement || target.documentElement || { scrollLeft: 0, scrollTop: 0 };

                // polyfill w3c properties and methods
                event.currentTarget = target;
                event.pageX = event.clientX + documentElement.scrollLeft;
                event.pageY = event.clientY + documentElement.scrollTop;
                event.preventDefault = function () { event.returnValue = false };
                event.relatedTarget = event.fromElement || null;
                event.stopImmediatePropagation = function () { immediatePropagation = false; event.cancelBubble = true };
                event.stopPropagation = function () { event.cancelBubble = true };
                event.target = event.srcElement || target;
                event.timeStamp = +new Date;

                // create an cached list of the master events list (to protect this loop from breaking when an event is removed)
                for (var i = 0, typeListenersCache = [].concat(typeListeners), typeListenerCache, immediatePropagation = true; immediatePropagation && (typeListenerCache = typeListenersCache[i]); ++i) {
                    // check to see if the cached event still exists in the master events list
                    for (var ii = 0, typeListener; typeListener = typeListeners[ii]; ++ii) {
                        if (typeListener == typeListenerCache) {
                            typeListener.call(target, event);

                            break;
                        }
                    }
                }
            });
        }

        // add the event to the master event list
        typeListeners.push(listener);
    });

    // remove
    addToPrototype("removeEventListener", function (type, listener) {
        var
            target = this,
            listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        // remove the newest matching event from the master event list
        for (var i = typeListeners.length - 1, typeListener; typeListener = typeListeners[i]; --i) {
            if (typeListener == listener) {
                typeListeners.splice(i, 1);

                break;
            }
        }

        // if no events exist, detach the listener
        if (!typeListeners.length && typeListeners.event) {
            target.detachEvent("on" + type, typeListeners.event);
        }
    });

    // dispatch
    addToPrototype("dispatchEvent", function (eventObject) {
        var
            target = this,
            type = eventObject.type,
            listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        try {
            return target.fireEvent("on" + type, eventObject);
        } catch (error) {
            if (typeListeners.event) {
                typeListeners.event(eventObject);
            }

            return;
        }
    });

    // CustomEvent
    Object.defineProperty(Window.prototype, "CustomEvent", {
        get: function () {
            var self = this;

            return function CustomEvent(type, eventInitDict) {
                var event = self.document.createEventObject(), key;

                event.type = type;
                for (key in eventInitDict) {
                    if (key == 'cancelable'){
                        event.returnValue = !eventInitDict.cancelable;
                    } else if (key == 'bubbles'){
                        event.cancelBubble = !eventInitDict.bubbles;
                    } else if (key == 'detail'){
                        event.detail = eventInitDict.detail;
                    }
                }
                return event;
            };
        }
    });

    // ready
    function ready(event) {
        if (ready.interval && document.body) {
            ready.interval = clearInterval(ready.interval);

            document.dispatchEvent(new CustomEvent("DOMContentLoaded"));
        }
    }

    ready.interval = setInterval(ready, 1);

    window.addEventListener("load", ready);
})();

!this.CustomEvent && (function() {
    // CustomEvent for browsers which don't natively support the Constructor method
    window.CustomEvent = function CustomEvent(type, eventInitDict) {
        var event;
        eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: undefined};

        try {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
        } catch (error) {
            // for browsers which don't support CustomEvent at all, we use a regular event instead
            event = document.createEvent('Event');
            event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
            event.detail = eventInitDict.detail;
        }

        return event;
    };
})();