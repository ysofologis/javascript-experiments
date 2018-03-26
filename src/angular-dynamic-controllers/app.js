
registerModule('theApp', function (module) {
     module.start = function () {
        $.ajaxSetup ({
            cache: false
        });

        angular.module('rootApp', []).controller('menuController', function ($scope) {
            $scope.title = 'This is supposed to be the main menu';
            $scope.menuItems = [];
            var doLoadTab = function(tabName) {
                setTimeout(function(){
                    tabs.loadTab(tabName);
                },0);
            };
            $scope.loadTab = function (tabName) {
                doLoadTab(tabName);
            };
            $scope.loadTabs = function (tabName, howMany) {
                for(var ix = 0; ix < howMany; ix ++) {
                    doLoadTab(tabName);
                }
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
        var rootNode = $('#app')[0];
        angular.bootstrap(rootNode, ['rootApp']);
        corelib.log('app', 'started');
        tabs.initTabs();
     };
});