registerModule('tab1_module', function (module) {
    module.appFactory = function (app) {
        var appId = app.name;
        var appNodeId = app.params.tabNodeId;

        var appCleanup = function() {
            var appNode = $('#' + appNodeId);
            app.cleanup(appNode);
            corelib.log('tabs', 'tab ' + appId + ' clean');
            appNode = null;
        };

        app.templateName = 'tab1-template';
        app.ready = function () {
            // debugger;
            // var tabId = appId;
            var tabNode = $('#' + appNodeId);
            var $injector = angular.injector(['ng', 'tabsApp']);
            var tabViewModelBuilder = $injector.get('tabViewModelBuilder');
            tabViewModelBuilder.buildDynamicScope(app, tabNode,
                function (injector, scope) {
                    scope.message = 'Hello from ' + appId + ' !!';
                    scope.unloadApp = function () {
                        appCleanup();
                    };
                });
            tabNode = null;
            corelib.log('tabs', 'tab ' + appId + ' loaded');
        };
        var sub1 = corelib.messageHub().subscribe('tab-close', function (msg) {
            appCleanup();
        });

        app.dispose = function () {
            corelib.messageHub().unsubscribe(sub1);
            corelib.log('tabs', 'app [' + appId + '] unloaded');
        };
    };
});
