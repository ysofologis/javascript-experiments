
registerModule('tabs', function (module) {
    var nextTabId = 0;
    var tabApp = null;
    var tabTemplates = {};
    var loadTabApp = function () {
        if (!tabApp) {
            var app = angular.module('tabsApp', []).config(function ($controllerProvider) {})
            .service('tabViewModelBuilder', ['$injector', '$compile', '$rootScope', '$controller',
            function($injector, $compile, $rootScope, $controller) {
                return {
                    buildDynamicScope: function(app, tabNode, scopeBuilder) {
                        var newScope = $rootScope.$new(true);  
                        scopeBuilder($injector, newScope);
                        $controller('tabViewModelController', { $scope: newScope });                        
                        app.angularScope = newScope;
                        app.angularElem = $compile(tabNode[0])(newScope);
                        newScope.$apply();
                    },
                };
            }])
            .controller('rootTabController', ['$scope','$compile', 'tabViewModelBuilder', 
            function ($scope, $compile, tabViewModelBuilder) {
                $scope.isMock = false;
            }])
            .controller('tabViewModelController', ['$scope', 
                function ($scope) {
                    // tabViewModelBuilder.buildScope($scope);
                    console.log('Hello from tabViewModelController');
            }]);
            var tabsNode = $('#app .tab-container .angular-tab-app');
                tabsNode.appendTo($('#dynamic-load-container'));
                angular.bootstrap(tabsNode[0], ['tabsApp']);
                tabApp = app;
                tabsNode.appendTo($('#app .tab-container'));
                corelib.log('tabs', 'initialized');
        }
    };
    var loadTab = function (tabName, tabId, content) {
        var templateFn = tabTemplates[tabName] || _.template(content);
        var context ={
            tabId: tabId,
            tabNode: 'tabNode_' + tabName + '_' + tabId,
            tabController: 'controller_' + tabName + '_' + tabId,
            tabModule: 'module_' + tabName + '_' + tabId,
        };
        var tabContent = templateFn(context);
        $('#app .tab-container .tab-items').append(tabContent);
        tabTemplates[tabName] = tabTemplates[tabName] || templateFn;
    };
    module.initTabs = function () {
        loadTabApp();
    };
    module.loadTab = function (tabName) {
        var tabUrl = 'tabs/' + tabName + '/content.html';
        $.ajax({
            url: tabUrl,
            type: 'GET',
            success: function (content) {
                var tabId = ++nextTabId;
                loadTab(tabName, tabId, content);
            },
            error: function (err) {
                corelib.log('tabs', JSON.stringify(err), true);
            },
        })
    };
});