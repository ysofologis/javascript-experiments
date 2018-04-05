
getModule('tabs').registerTab1Content = function(tabId, tabModule, tabNode) {
    registerModule(tabModule, function (module) {
        module.ready = function (appId) {
            module.registerApp(appId, {},
                function (app) {
                    app.templateName = 'tab1-template';
                    app.ready = function () {
                        // debugger;
                        var tabId = appId;
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
                    };
                    corelib.log('tabs', 'tab ' + appId + ' loaded');
                    app.dispose = function () {
                    };
                    return app;
                });
            module.runApp(appId);
        };
        var sub1 = corelib.messageHub().subscribe('tab-close', function (msg) {
            var appId = tabId;
            var appNode = $('#' + tabNode);
            module.cleanup(appId, appNode);
            corelib.log('tabs', 'tab ' + appId + ' clean');
            module = null;
            appNode = null;
        });
        module.dispose = function () {
            corelib.messageHub().unsubscribe(sub1);
            corelib.log('tabs', 'module' + tabModule + ' unloaded');
        };
    }).ready(tabId);
};