!function (global, undefined) {
    var currentWindow = window;
    var rootWindow = window.parent ? window.parent : window.top;
    if (window.opener) {
        rootWindow = window.opener;
    }

    function AppMessaging() {
        var that = this;
        var _started = false;
        var _subscriptions = [];

        var callListener = function(listener, payload) {
            currentWindow.setTimeout(function () {
                listener.messageArrived(payload);
            },0);
        }
        var handleMessage = function (evt) {
            var msg = JSON.parse(evt.data);
            for (var ix = 0; ix < _subscriptions.length; ix ++) {
                if (_subscriptions[ix].messageType == msg.messageType)
                callListener(_subscriptions[ix].listener, msg.payload);
            }
        };
        that.broadcastMessage = function (messageType, message) {
            rootWindow.postMessage(JSON.stringify({
                messageType: messageType,
                payload: message,
            }), rootWindow.location.origin);
        };
        that.subscribe = function (messageType, listener) {
            _subscriptions.push({
                messageType: messageType,
                listener: listener,
            });
        };
        that.unsubscribe = function (listener) {
            var ix = -1;
            for(var iw = 0; iw < _subscriptions.length; iw ++) {
                if (_subscriptions[iw].listener == listener) {
                    ix = iw;
                    break;
                }
            }
            if (ix >= 0)  {
                _subscriptions.splice(ix, 1);
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