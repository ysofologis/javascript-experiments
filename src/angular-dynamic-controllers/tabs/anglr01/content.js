registerModule('anglr01_module', function (module) {
    var corelib = importModule('corelib');

    module.appBuilder = function (appRef) {
        var app = appRef.ref;
        app.scopeBuilder = {
            build: function (injector, scope) {
                scope.message = 'Hello from ' + app.name + ' !!';
                scope.prop01 = "prop01";
                scope.prop02 = "prop02";
                scope.prop03 = "prop03";
                scope.prop04 = "prop04";
                scope.prop05 = "prop05";
                scope.prop06 = "prop06";
                scope.prop07 = "prop07";
                scope.prop08 = "prop08";
                scope.prop09 = "prop09";
                scope.prop10 = "prop10";

                scope.unloadApp = function () {
                    corelib.runAsync(app.cleanup.bind(app));
                };
            }
        };

        app.ready = function () {
            app.startAngular();
            corelib.log('tabs', 'tab ' + app.name + ' started');
        };

        app.dispose = function () {
            corelib.log('tabs', 'tab ' + app.name + ' disposed');
            app = null;
        };
    };
});
