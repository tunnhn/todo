(function ($) {

    if (window.Todo === undefined) {
        window.Todo = {};
    }

    window.Todo = $.extend({}, window.Todo, {
        ajaxToken: '',
        doAjax: function (action, data, type, proxy) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: 'http://localhost:3456/' + action,
                    data: $.extend({token: Todo.ajaxToken}, data || {}),
                    type: type || 'get',
                    success: function (res) {
                        resolve.call(proxy, res);
                    },
                    error: function () {
                        reject.call(proxy);
                    }
                })
            });
        },
        listPluck: function (arr, field, c) {
            var r = [];

            for (var i = 0, n = arr.length; i < n; i++) {

                if (c) {
                    var o = false;
                    for (var j in c) {
                        if (c.hasOwnProperty(j)) {
                            if (arr[i][j] != c[j]) {
                                o = true;
                                break;
                            }
                        }
                    }
                    if (o) {
                        continue
                    }
                    r.push(arr[i][field]);
                } else {
                    r.push(arr[i][field]);
                }
            }
            return r;
        },
        /**
         * fire native event of a DOM
         *
         * @param node
         * @param eventName
         */
        fireNativeEvent: function (node, eventName) {
            var doc, event;
            if (node.ownerDocument) {
                doc = node.ownerDocument;
            } else if (node.nodeType == 9) {
                doc = node;
            } else {
                throw new Error("Invalid node passed to fireEvent: " + node.id);
            }

            if (node.dispatchEvent) {
                var eventClass = "";

                switch (eventName) {
                    case "click":
                    case "mousedown":
                    case "mouseup":
                        eventClass = "MouseEvents";
                        break;

                    case "focus":
                    case "change":
                    case "blur":
                    case "select":
                        eventClass = "HTMLEvents";
                        break;

                    default:
                        throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                        break;
                }
                event = doc.createEvent(eventClass);
                event.initEvent(eventName, true, true);
                event.synthetic = true;
                node.dispatchEvent(event, true);
            } else if (node.fireEvent) {
                event = doc.createEventObject();
                event.synthetic = true;
                node.fireEvent("on" + eventName, event);
            }
        },
        validateEmail: function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },
        debounce: function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            if (null == wait) wait = 100;

            function later() {
                var last = Date.now() - timestamp;

                if (last < wait && last >= 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        context = args = null;
                    }
                }
            };

            var debounced = function () {
                context = this;
                args = arguments;
                timestamp = Date.now();
                var callNow = immediate && !timeout;
                if (!timeout) timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }

                return result;
            };

            debounced.clear = function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            };

            debounced.flush = function () {
                if (timeout) {
                    result = func.apply(context, args);
                    context = args = null;

                    clearTimeout(timeout);
                    timeout = null;
                }
            };

            return debounced;
        }
    });


})(jQuery);
