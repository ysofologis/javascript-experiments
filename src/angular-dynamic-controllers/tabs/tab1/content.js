registerModule('tab1_module', function (module) {

    var corelib = importModule('corelib');

    module.appBuilder = function (app) {

        var appId = app.name;
        var tabNodeId = app.params.nodeId;

        var scopeBuilder = function(injector, scope) {

            var vm = scope;
            vm.message = 'Hello from ' + appId + ' !!';
            vm.prop01 = "prop01";
            vm.prop02 = "prop02";
            vm.prop03 = "prop03";
            vm.prop04 = "prop04";
            vm.prop05 = "prop05";
            vm.prop06 = "prop06";
            vm.prop07 = "prop07";
            vm.prop08 = "prop08";
            vm.prop09 = "prop09";
            vm.prop10 = "prop10";

            vm.unloadApp = function () {
                vm = null;
                setTimeout(() => {
                    app.cleanup();
                    app = null;
                });
            };
        };

        app.ready = function () {
            app.startAngular(tabNodeId, scopeBuilder);
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
