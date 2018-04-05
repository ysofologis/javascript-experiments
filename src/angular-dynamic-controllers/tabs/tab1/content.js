registerModule('tab1_module', function (module) {
    module.appFactory = function (app) {
        var appId = app.name;
        var appNodeId = app.params.tabNodeId;

        app.templateName = 'tab1-template';
        app.ready = function () {
            // debugger;
            // var tabId = appId;
            // var tabNode = $('#<%=tabNode%>');
            // var $injector = angular.injector(['ng', 'tabsApp']);
            // var tabViewModelBuilder = $injector.get('tabViewModelBuilder');
            // tabViewModelBuilder.buildDynamicScope(app, tabNode,
            //     function (injector, scope) {
            //         // debugger;
            //         scope.message = 'Hello there !!!';
            //         scope.unloadModule = function () {
            //             setTimeout(function () {
            //                 // debugger;
            //                 module.dispose(tabId);
            //             }, 0);
            //         };
            //     });
            corelib.log('tabs', 'tab ' + appId + ' loaded');
        };
        var sub1 = corelib.messageHub().subscribe('tab-close', function (msg) {
            var appNode = $('#' + appNodeId);
            app.cleanup(appNode);
            corelib.log('tabs', 'tab ' + appId + ' clean');
            appNode = null;
        });

        app.dispose = function () {
            corelib.messageHub().unsubscribe(sub1);
            corelib.log('tabs', 'app [' + appId + '] unloaded');
        };
    };
});
