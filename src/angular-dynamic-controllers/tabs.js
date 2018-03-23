
registerModule('tabs', function (module) {
    var nextTabId = 0;
    var tabApp = null;
    var loadTabApp = function () {
        if (!tabApp) {
            var app = angular.module('tabsApp', []).config(function ($controllerProvider) {
                // app._controller = app.controller;
                // app.controller = function (name, constructor) {
                //     $controllerProvider.register(name, constructor);
                //     return (this);
                // }
                app.dynamicController = function (name, constructor) {
                    $controllerProvider.register(name, constructor);
                    return (this);
                }
            }).controller('rootTabController', ['$scope', function ($scope) {
                $scope.isMock = false;
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
        var templateFn = _.template(content);
        var tabContent = templateFn({
            tabId: tabId,
            tabNode: 'tabNode_' + tabName + '_' + tabId,
            tabController: 'controller_' + tabName + '_' + tabId,
            tabModule: 'module_' + tabName + '_' + tabId,
        });
        $('#app .tab-container .tab-items').append($(tabContent));
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
                loadTab(tabName, ++nextTabId, content);
            },
            error: function (err) {
                corelib.log('tabs', JSON.stringify(err), true);
            },
        })
    };
});