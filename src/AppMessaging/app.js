
!function(global, $, undefined) {
    var rootWindow = window.parent ? window.parent : window.top;
    if (window.opener) {
        rootWindow = window.opener;
    }
    var App = function () {
        var that = this;
        var _stateObserver = global.createStateObserver('app');
        that.getStateObserver = function () {
            return _stateObserver;
        };
    };

    rootWindow['app'] = rootWindow['app'] || new App();
    global.app = global.app || rootWindow['app'];

}(this, jQuery);