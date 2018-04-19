registerModule('theApp', function (module) {
    var tabs = importModule('tabs');
    var corelib = importModule('corelib');

    var doLoadTab = function (tabName) {
        setTimeout(() => {
            tabs.loadTab(tabName);
        },0);
    };

    var sub1 = corelib.messageHub().subscribe('tab-start', function handleTabStart(payload) {
        corelib.loadTabApp(payload.tabModule, payload.tabScripts, payload.tabId, payload.tabNode);
    });

    module.start = function () {

        var ngApp = angular.module('rootApp', [])
            .controller('menuController', function ($scope) {
            $scope.title = 'This is supposed to be the main menu';
            $scope.menuItems = [];
            $scope.loadTab = function (tabName) {
                doLoadTab(tabName);
            };
            $scope.loadTabs = function (tabName, howMany) {
                for (var ix = 0; ix < howMany; ix++) {
                    //asyncChain.addAsyncAction(function () {
                    doLoadTab(tabName);
                    //}, 50)
                }
            };
            $scope.closeAllTabs = function () {
                corelib.messageHub().broadcast('tab-close', {});
            };

        }).controller('rootTabController', function ($scope) {
            $scope.isMock = true;
        }).controller('logController', function ($scope) {
            $scope.clearLog = function () {
                corelib.clearLog();
            };
        });
        tabs.initTabs(ngApp);
        var rootApp = $('#app');
        angular.bootstrap(rootApp[0], ['rootApp']);
        corelib.log('app', 'started');
        doLoadTab('tab1');
    };
    module.dispose = function () {
        corelib.messageHub().unsubscribe(sub1);
    };
});