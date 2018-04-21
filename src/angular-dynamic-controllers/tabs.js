!function (global, $, angular, undefined) {
    var registerModule = global.registerModule;
    var importModule = global.importModule;

    registerModule('tabs', function (module) {

        var corelib = importModule('corelib');
        var nextTabId = 0;
        var _tabContents = {};

        var tabBuilder = function (app) {
            var tabNode = app.node;
            var tabHtml = tabNode.html();
            var appName = app.module['__meta__'].name + '_' + app.name;
            var ctrlName = appName + '_rootCtrl';
            var appContent = $(tabHtml);
            var scopeBuilder = app.scopeBuilder;
            angular.module(appName, [])
                .controller(ctrlName, ['$injector', '$scope',
                    function ($injector, $scope) {
                        scopeBuilder.build($injector, $scope);
                        scopeBuilder = null;
                    }]);
            appContent.first().attr({'ng-controller': ctrlName});
            tabNode.appendTo('#dynamic-load-container');
            tabNode.empty();
            tabNode.append(appContent);
            app.angularApp = angular.bootstrap(tabNode[0], [appName]);
            tabNode.appendTo('.tab-container .tab-items');
            appContent = null;

            var rootScope = app.angularApp.get('$rootScope');
            rootScope.$apply();
        };

        var loadTabServices = function (rootApp) {
            rootApp
                .factory('tabAppBuilder', ['$injector', '$compile', '$rootScope',
                    function ($injector, $compile, $rootScope) {
                        var _builder = {
                            buildAppScope: function (app, tabNode, scopeBuilder) {
                                // $controller('tabViewModelController', {$scope: newScope});

                                var newScope = $rootScope.$new(true);
                                scopeBuilder($injector, newScope);
                                app.angularScope = newScope;
                                var angularTemplate = tabNode.html();
                                var tabTemplate = $compile(angularTemplate);
                                // _ngTemplates[app.moduleName] = tabTemplate;

                                app.angularElem = tabTemplate(newScope);
                                tabNode.find(".tab-controller").replaceWith(app.angularElem);
                                newScope.$apply();
                            },
                            buildTabApp: function (app) {
                                tabBuilder(app);
                            },
                        };
                        return _builder;
                    }])
                .controller('tabControlCtrl', ['$scope', '$compile', 'tabAppBuilder',
                    function ($scope) {
                        $scope.name = 'tabControlCtrl';
                    }]);
        };
        var doLoadTab = function (tabName, tabId, content) {
            var templateFn = _.template(content);
            var context = {
                tabId: tabId,
                tabName: tabName,
                tabNode: tabName + '_' + tabId + '_node',
                tabController: tabName + '_' + tabId + '_controller',
                tabModule: tabName + '_module',
                tabScripts: ['tabs/' + tabName + '/content.js']
            };
            var tabContent = templateFn(context);
            var tabContainer = $('#app .tab-container .tab-items');

            tabContainer.append(tabContent);
            tabContainer = null;
            tabContent = null;
            context = null;
        };

        module.initTabs = function (rootApp) {
            loadTabServices(rootApp);
        };
        module.loadTab = function (tabName, loadCallback) {
            var tabContents = $('#app .tab-container .tab-items .tab-content');
            if (tabContents.length == 0) {
                nextTabId = 0;
            }
            tabContents = null;

            var tabId = ++nextTabId;
            if (!_tabContents[tabName]) {
                var tabUrl = 'tabs/' + tabName + '/content.html';
                $.ajax({
                    url: tabUrl,
                    type: 'GET',
                    async: true,
                    cache: false,
                    success: function (content) {
                        // _tabContents[tabName] = {
                        //     content: content,
                        // };
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

}(this, $, angular);
