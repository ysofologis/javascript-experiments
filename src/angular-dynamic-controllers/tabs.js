registerModule('tabs', function (module) {
    var nextTabId = 0;
    var tabApp = null;
    var _tabTemplates = {};
    var _tabContents = {};

    var loadTabApp = function () {
        if (!tabApp) {
            var app = angular.module('tabsApp', []).config(function ($controllerProvider) {
            })
                .service('tabViewModelBuilder', ['$injector', '$compile', '$rootScope', '$controller',
                    function ($injector, $compile, $rootScope, $controller) {
                        return {
                            buildDynamicScope: function (app, tabNode, scopeBuilder) {
                                var newScope = $rootScope.$new(true);
                                scopeBuilder($injector, newScope);
                                $controller('tabViewModelController', {$scope: newScope});
                                app.angularScope = newScope;
                                app.angularElem = $compile(tabNode[0])(newScope);
                                newScope.$apply();
                            },
                        };
                    }])
                .controller('rootTabController', ['$scope', '$compile', 'tabViewModelBuilder',
                    function ($scope, $compile, tabViewModelBuilder) {
                        $scope.isMock = false;
                    }])
                .controller('tabViewModelController', ['$scope',
                    function ($scope) {
                        // tabViewModelBuilder.buildScope($scope);
                        console.log('Hello from tabViewModelController');
                    }]);
            var angularAppNode = $('#app .tab-container .angular-tab-app');
            var dynamicTabContainer = $('#dynamic-load-container');
            var tabContainer = $('#app .tab-container');

            angularAppNode.appendTo(dynamicTabContainer);
            angular.bootstrap(angularAppNode[0], ['tabsApp']);
            tabApp = app;
            angularAppNode.appendTo(tabContainer);
            corelib.log('tabs', 'initialized');
            angularAppNode = null;
            dynamicTabContainer = null;
            tabContainer = null;
        }
    };
    var doLoadTab = function (tabName, tabId, content) {
        var templateFn = _tabTemplates[tabName] || _.template(content);
        var context = {
            tabId: tabId,
            tabName: tabName,
            tabNode: tabName + '_' + tabId + '_node',
            tabController: tabName + '_' + tabId + '_controller',
            tabModule: tabName + '_module',
        };
        var tabContent = templateFn(context);
        var tabContainer = $('#app .tab-container .tab-items');
        tabContainer.append(tabContent);
        _tabTemplates[tabName] = _tabTemplates[tabName] || templateFn;
        tabContainer = null;
        tabContent = null;
        context = null;
    };
    module.initTabs = function () {
        loadTabApp();
    };
    module.loadTab = function (tabName, loadCallback) {
        var tabId = ++nextTabId;
        if (!_tabContents[tabName]) {
            var tabUrl = 'tabs/' + tabName + '/content.html';
            $.ajax({
                url: tabUrl,
                type: 'GET',
                async: true,
                cache: false,
                success: function (content) {
                    _tabContents[tabName] = {
                        content: content,
                    };
                    doLoadTab(tabName, tabId, content);
                    if (loadCallback) {
                        loadCallback();
                    }
                },
                error: function (err) {
                    corelib.log('tabs', JSON.stringify(err), true);
                },
            });
        } else {
            var content = _tabContents[tabName].content;
            doLoadTab(tabName, tabId, content);
            if (loadCallback) {
                loadCallback();
            }
        }
    };
});