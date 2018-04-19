registerModule('tabs', function (module) {
    var corelib = importModule('corelib');
    var nextTabId = 0;
    var _tabTemplates = {};
    var _tabContents = {};
    var _ngTemplates = {};

    var tabBuilder = function (app, tabNode, scopeBuilder) {
        var tabHtml = tabNode.html();
        var appName = 'ng-' + app.moduleName + '-' + app.name;
        var ctrlName = appName + '-rootCtrl';
        var appContent = $(tabHtml);
        angular.module(appName, [])
            .controller(ctrlName, ['$injector', '$scope',
                function ($injector, $scope) {
                    scopeBuilder($injector, $scope);
                    scopeBuilder = null;
                }]);
        appContent.first().attr({'ng-controller': ctrlName });
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

                            var tabTemplate = _ngTemplates[app.moduleName];
                            if (!tabTemplate) {
                                var angularTemplate = tabNode.html();
                                tabTemplate = $compile(angularTemplate);
                                _ngTemplates[app.moduleName] = tabTemplate;

                                app.angularElem = tabTemplate(newScope);
                                tabNode.find(".tab-controller").replaceWith(app.angularElem);
                                newScope.$apply();
                                newScope = null;
                            } else {
                                tabTemplate(newScope, function (clone, scope) {
                                    app.angularElem = clone;
                                    tabNode.find(".tab-controller").replaceWith(app.angularElem);
                                    scope.$apply();
                                    scope = null;
                                });
                            }
                        },
                        buildTabApp: function (app, tabNode, scopeBuilder) {
                            tabBuilder(app, tabNode, scopeBuilder);
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
        var templateFn = _tabTemplates[tabName] || _.template(content);
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
        // corelib.messageHub().broadcast('tab-start', context);

        _tabTemplates[tabName] = _tabTemplates[tabName] || templateFn;
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
                    setTimeout(() => {
                        doLoadTab(tabName, tabId, content);
                        if (loadCallback) {
                            loadCallback();
                        }
                    }, 0);
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