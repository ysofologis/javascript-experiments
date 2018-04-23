!function (global, $, angular, undefined) {
    var registerModule = global.registerModule;
    var importModule = global.importModule;

    registerModule('tabs', function (module) {

        var corelib = importModule('corelib');
        var nextTabId = 0;
        var _tabContents = {};

        var tabBuilder = function (app) {
            var tabNode = app.node;
            var appName = app.module['__meta__'].name + '_' + app.name;
            var ctrlName = appName + '_rootCtrl';
            var scopeBuilder = app.scopeBuilder;
            angular.module(appName, [])
                .controller(ctrlName, ['$injector', '$scope',
                    function ($injector, $scope) {
                        scopeBuilder.build($injector, $scope);
                        scopeBuilder = null;
                    }]);
            if (app.params.isFrame) {
                app.params.frameId = window.name;
                var rootElem = angular.element(document.body);
                tabNode.find('.tab-controller').attr({'ng-controller': ctrlName});
                app.angularApp = angular.bootstrap(rootElem, [appName]);
                var rootScope = app.angularApp.get('$rootScope');
                rootScope.$apply();

            } else {
                var tabHtml = tabNode.html();
                var appContent = $(tabHtml);

                appContent.first().attr({'ng-controller': ctrlName});
                tabNode.appendTo('#dynamic-load-container');
                tabNode.empty();
                tabNode.append(appContent);
                app.angularApp = angular.bootstrap(tabNode[0], [appName]);
                tabNode.appendTo('.tab-container .tab-items');
                appContent = null;

                var rootScope = app.angularApp.get('$rootScope');
                rootScope.$apply();
            }
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
        var doLoadTabTemplate = function(cb) {
            $.ajax({
                url: "tab-template.html",
                type: 'GET',
                async: true,
                cache: false,
                success: function (content) {
                    cb(content);
                },
                error: function (err) {
                    corelib.log('tabs', JSON.stringify(err), true);
                },
            });
        };
        var doLoadTab = function (tabName, tabId, content, asIframe) {
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

            if(asIframe) {
                doLoadTabTemplate(function (templateContent) {
                    var fn = _.template(templateContent);
                    var frameHtml = fn({ tabContent: tabContent });
                    var ifrm = global.document.createElement("iframe");
                    ifrm.name = 'frm-' + tabName + "-" + tabId;
                    ifrm.id = ifrm.name;
                    ifrm.className = 'tab-frame';
                    ifrm.frameBorder = '0';

                    tabContainer.append(ifrm);
                    var frameDoc = ifrm.contentWindow || ifrm.contentDocument.document || ifrm.contentDocument;
                    frameDoc.document.open();
                    frameDoc.document.write(frameHtml);
                    frameDoc.document.close();

                    tabContainer = null;
                    tabContent = null;
                    context = null;
                    frameDoc = null;
                    ifrm = null;
                });
            } else {
                tabContainer.append(tabContent);
                tabContainer = null;
                tabContent = null;
                context = null;
            }
        };

        module.initTabContainer = function (rootApp) {
            loadTabServices(rootApp);
        };
        module.loadTab = function (tabName, asIframe, loadCallback) {
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
                        doLoadTab(tabName, tabId, content, asIframe);
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
        module.renderTab = tabBuilder;
    });

}(this || window, $, angular);
