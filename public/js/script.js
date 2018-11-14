jQuery(function ($) {

    if (window.Todo === undefined) {
        window.Todo = {};
    }

    window.Todo = $.extend({}, window.Todo, {
        doAjax: function (action, data, type, proxy) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: 'http://localhost:3456/' + action,
                    data: data || {},
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
        }
    });

    window.Todo.$todo = window.Todo.createApp();

});
