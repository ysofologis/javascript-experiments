registerModule('tab1_module', function (module) {

    var appCleanup = function(anApp) {
        var appNode = $('#' + anApp.params.tabNodeId);
        anApp.cleanup(appNode);
        corelib.log('tabs', 'tab ' + anApp.name + ' clean');
        appNode = null;
    };

    module.appFactory = function (app) {
        var appId = app.name;
        var appNodeId = app.params.tabNodeId;

        app.ready = function () {
            app.startAngular(appNodeId, function (injector, scope) {
                scope.message = 'Hello from ' + appId + ' !!';
                scope.unloadApp = function () {
                    corelib.runAsync(function () {
                        appCleanup(app);
                        app = null;
                    });
                };
            });
            corelib.log('tabs', 'tab ' + appId + ' loaded');
        };
        var sub1 = corelib.messageHub().subscribe('tab-close', function (msg) {
            corelib.runAsync(function () {
                appCleanup(app);
                app = null;
            });
        });

        app.dispose = function () {
            corelib.messageHub().unsubscribe(sub1);
            corelib.log('tabs', 'app [' + appId + '] unloaded');
            sub1 = null;
        };
    };
});
