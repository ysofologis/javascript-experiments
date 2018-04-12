registerModule('tab1_module', function (module) {

    var corelib = importModule('corelib');

    module.appFactory = function (appInstance) {

        var app = appInstance;
        var appId = app.name;
        var tabNodeId = app.params.nodeId;

        app.ready = function () {
            app.startAngular(tabNodeId, function (injector, scope) {
                scope.message = 'Hello from ' + appId + ' !!';
                scope.unloadApp = function () {
                    corelib.runAsync(function () {
                        app.cleanup();
                        app = null;
                    });
                };
            });
            corelib.log('tabs', 'tab ' + appId + ' loaded');
        };
        var sub1 = corelib.messageHub().subscribe('tab-close', function handleTabClosed(msg) {
            app.cleanup();
            app = null;
        });

        app.dispose = function () {
            corelib.messageHub().unsubscribe(sub1);
            corelib.log('tabs', 'app [' + appId + '] unloaded');
        };
    };
});
