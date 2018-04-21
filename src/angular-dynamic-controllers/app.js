registerModule('theApp', function (module) {
    var tabs = importModule('tabs');
    var corelib = importModule('corelib');

    var doLoadTab = function (tabName) {
        corelib.runAsync(() => {
            tabs.loadTab(tabName);
        });
    };

    var sub1 = corelib.messageHub().subscribe('tab-start', function (payload) {
        corelib.loadTabApp(payload.tabModule, payload.tabScripts, payload.tabId, payload.tabNode);
    });

    module.start = function () {

        var ngApp = angular.module('rootApp', [])
            .factory('tabLauncher', function () {
                return {
                    loadTab: function (tabName) {
                        doLoadTab(tabName);
                    },
                    closeAll: function () {
                        corelib.messageHub().broadcast('tab-close', {});
                    },
                };
            })
            .controller('menuController', function (tabLauncher, $scope) {

                $scope.title = 'This is supposed to be the main menu';
                $scope.menuItems = [];
                $scope.loadTab = function (tabName) {
                    tabLauncher.loadTab(tabName);
                };
                $scope.loadTabs = function (tabName, howMany) {
                    for (var ix = 0; ix < howMany; ix++) {
                        tabLauncher.loadTab(tabName);
                    }
                };
                $scope.closeAllTabs = function () {
                    tabLauncher.closeAll();
                };

            }).controller('rootTabController', function ($scope) {

            }).controller('logController', function ($scope) {
                $scope.clearLog = function () {
                    corelib.clearLog();
                };
            });
        tabs.initTabs(ngApp);
        var rootApp = $('#app');
        angular.bootstrap(rootApp[0], ['rootApp']);
        corelib.log('app', 'started');
        // doLoadTab('anglr01');
    };
    module.dispose = function () {
        corelib.messageHub().unsubscribe(sub1);
    };
});