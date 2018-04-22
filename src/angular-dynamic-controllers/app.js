registerModule('theApp', function (module) {
    var tabs = importModule('tabs');
    var corelib = importModule('corelib');

    var doLoadTab = function (tabName, asIframe) {
        corelib.runAsync(() => {
            tabs.loadTab(tabName, asIframe);
        });
    };

    var sub1 = corelib.messageHub().subscribe('tab-start', function (payload) {
        corelib.loadTabApp(payload);
    });

    module.start = function () {

        var ngApp = angular.module('rootApp', [])
            .factory('tabLauncher', function () {
                return {
                    loadTab: function (tabName, asIframe) {
                        doLoadTab(tabName, asIframe);
                    },
                    closeAll: function () {
                        corelib.messageHub().broadcast('tab-close', {});
                    },
                };
            })
            .controller('menuController', function (tabLauncher, $scope) {

                $scope.title = 'This is supposed to be the main menu';
                $scope.menuItems = [];
                $scope.loadTab = function (tabName, asIframe) {
                    tabLauncher.loadTab(tabName, asIframe);
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
        tabs.initTabContainer(ngApp);
        var rootApp = $('#app');
        angular.bootstrap(rootApp[0], ['rootApp']);
        corelib.log('app', 'started');
    };
    module.dispose = function () {
        corelib.messageHub().unsubscribe(sub1);
    };
});