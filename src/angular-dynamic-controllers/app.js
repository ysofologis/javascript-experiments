
registerModule('theApp', function (module) {
    var tabs = importModule('tabs');
    var corelib = importModule('corelib');

    var doLoadTab = function(tabName) {
        corelib.runAsync(function () {
            tabs.loadTab(tabName);
        });
    };

    var sub1 = corelib.messageHub().subscribe('tab-start', function handleTabStart(payload) {
        corelib.loadTabApp(payload.tabModule, payload.tabScripts, payload.tabId, payload.tabNode);
    });

     module.start = function () {

        angular.module('rootApp', []).controller('menuController', function ($scope) {
            $scope.title = 'This is supposed to be the main menu';
            $scope.menuItems = [];
            $scope.loadTab = function (tabName) {
                doLoadTab(tabName);
            };
            $scope.loadTabs = function (tabName, howMany) {
                var asyncChain = new corelib.AsyncChain();
                for(var ix = 0; ix < howMany; ix ++) {
                    //asyncChain.addAsyncAction(function () {
                        doLoadTab(tabName);
                    //}, 50)
                }
                asyncChain.execute();
            };
            $scope.closeAllTabs = function() {
                corelib.messageHub().broadcast('tab-close', {});
            };
            
        }).controller('rootTabController', function ($scope) {
            $scope.isMock = true;
        }).controller('logController', function($scope) {
            $scope.clearLog = function() {
                corelib.clearLog();
            };
        });
        var rootApp = $('#app');
        angular.bootstrap(rootApp[0], ['rootApp']);
        corelib.log('app', 'started');
        tabs.initTabs();
        rootApp = null;
        doLoadTab('tab1');
     };
     module.dispose = function () {
        corelib.messageHub().unsubscribe(sub1);
     };
});