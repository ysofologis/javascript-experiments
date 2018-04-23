registerModule('anglr01_module', function (module) {
    var corelib = importModule('corelib');

    module.appBuilder = function (appRef) {
        var app = appRef.ref;
        app.scopeBuilder = {
            build: function (injector, scope) {
                scope.message = 'Hello from ' + app.name + ' !!';
                scope.prop01 = "a-prop01";
                scope.prop02 = "a-prop02";
                scope.prop03 = "a-prop03";
                scope.prop04 = "a-prop04";
                scope.prop05 = "a-prop05";
                scope.prop06 = "b-prop06";
                scope.prop07 = "b-prop07";
                scope.prop08 = "b-prop08";
                scope.prop09 = "b-prop09";
                scope.prop10 = "b-prop10";

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
