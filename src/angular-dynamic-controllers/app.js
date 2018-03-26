
registerModule('theApp', function (module) {
     module.start = function () {
        $.ajaxSetup ({
            cache: false
        });

        angular.module('rootApp', []).controller('menuController', function ($scope) {
            $scope.title = 'This is supposed to be the main menu';
            $scope.menuItems = [];
            $scope.loadTab = function (tabName) {
                tabs.loadTab(tabName);
            };
        }).controller('rootTabController', function ($scope) {
            $scope.isMock = true;
        });
        var rootNode = $('#app')[0];
        angular.bootstrap(rootNode, ['rootApp']);
        corelib.log('app', 'started');
        tabs.initTabs();
     };
});