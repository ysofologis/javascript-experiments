!function (global, undefined) {
    var currentWindow = window;
    var rootWindow = window.parent ? window.parent : window.top;
    if (window.opener) {
        rootWindow = window.opener;
    }

    function AppMessaging() {
        var that = this;
        var _listeners = [];
        var _started = false;

        var callListener = function(listener, payload) {
            currentWindow.setTimeout(function () {
                listener.messageArrived(payload);
            },0);
        }
        var handleMessage = function (evt) {
            var msg = JSON.parse(evt.data);
            for (var ix = 0; ix < _listeners.length; ix ++) {
                if (_listeners[ix].messageType == msg.messageType)
                // _listeners[ix].listener.messageArrived(msg.payload);
                callListener(_listeners[ix].listener, msg.payload);
            }
        };
        that.broadcastMessage = function (messageType, message) {
            rootWindow.postMessage(JSON.stringify({
                messageType: messageType,
                payload: message,
            }), rootWindow.location.origin);
        };
        that.subscribe = function (messageType, listener) {
            _listeners.push({
                messageType: messageType,
                listener: listener,
            });
        };
        that.unsubscribe = function (listener) {
            var ix = _listeners.find(function (value) {
                return value.listener == listener;
            });
            if (ix >= 0)  {
                _listeners.splice(ix, 1);
            }
        };
        that.start = function () {
            if (!_started) {
                rootWindow.addEventListener('message', function onWindowMessage(ev) {
                    handleMessage(ev);
                }, false);
                _started = true;
            }
        };
    }
    var appMessaging = rootWindow['appMessaging'] || new AppMessaging();
    global.appMessaging = global['appMessaging'] || appMessaging;
    appMessaging.start();

}(this);