!function (global, $, _, angular, undefined) {

    var buildModule = function (name) {
        var module = {
            '__meta__': {
                name: name,
            },
            modules: {},
            importModule: function (moduleName) {
                var m = this.modules[moduleName];
                return m;
            },
            registerModule: function (moduleName, moduleInit) {
                var childModule = this.modules[moduleName];
                if (!childModule) {
                    childModule = buildModule(moduleName);
                    moduleInit(childModule);
                    this.modules[moduleName] = childModule;
                }
            },
            extendModule: function(moduleName, moduleExtend) {
                var childModule = this.modules[moduleName];
                moduleExtend(childModule);
            },
            apps: {},
            runApp: function (appName, appParams) {
                if (!this.apps[appName]) {
                    this.apps[appName] = buildApp({ ref: this }, appName, appParams);
                    this.appBuilder({ ref: this.apps[appName] });
                    // _.extend(app, this._appTemplate);
                    this.apps[appName].ready();
                }
            },
        };

        function buildApp(moduleRef, appName, appParams) {
            var app = {
                name: appName,
                params: (appParams != undefined) ? appParams : {},
                module: moduleRef.ref,
                node: null,
                _sub1: null,
                start: function() {
                    this.node = $('#' + this.params.nodeId);
                    this._sub1 = global.importModule('corelib')
                        .messageHub()
                        .subscribe('tab-close', this.tabClosed.bind(this));
                },
                startAngular: function () {
                    if (this.params.isFrame) {
                        this.node = $('#' + this.params.nodeId);
                        global.importModule('tabs').renderTab(this);
                    } else {
                        this.node = $('#' + this.params.nodeId);
                        var injector = angular.injector(['ng', 'rootApp']);
                        var tabAppBuilder = injector.get('tabAppBuilder');
                        tabAppBuilder.buildTabApp(app);
                        // tabAppBuilder.buildAppScope(app, this.node, appController);
                    }

                    this._sub1 = global.importModule('corelib')
                        .messageHub()
                        .subscribe('tab-close', this.tabClosed.bind(this));

                },
                cleanup: function() {
                    if (this.angularScope) {

                        this.dispose();

                        // cleanupNode(app.angularElem);
                        cleanupNode(this.node);
                        this.node = null;

                        this.angularScope.$destroy();
                        this.angularElem = null;

                    } else if (this.angularApp) {
                        this.dispose();

                        cleanupNode(this.node);
                        this.node = null;

                        var rootScope = this.angularApp.get('$rootScope');
                        rootScope.$destroy();
                        rootScope = null;

                    } else {
                        this.dispose();
                        cleanupNode(this.node);
                    }
                    // keep it before 'cleanup' vanish them
                    var appName = this.name;
                    var module = this.module;

                    global.importModule('corelib')
                        .messageHub()
                        .unsubscribe(this._sub1);

                    // prevent module from cleanup
                    delete this.module;

                    cleanupObject(this);
                    delete module.apps[appName];
                },
                tabClosed: function (msg) {
                    this.cleanup();
                },
            };
            return app;
        };

        function cleanupNode(node) {
            if (node) {
                // setTimeout(function () {
                $.event.remove(node);
                node.removeData();
                // node.html('');
                // node[0].parentNode.removeChild(node[0]);
                // node.html('');
                // node.empty();

                node.html('');
                node.remove();
                // }, 0);
            }
        }
        function cleanupObject(obj) {
            if (obj) {
                var keys = Object.keys(obj);
                for (var ix = 0; ix < keys.length; ix++) {
                    var pname = keys[ix];
                    var p = obj[pname];
                    if (_.isFunction(p)) {
                        // p.bind(undefined);
                    } else {
                        if (_.isObject(p)) {
                            cleanupObject(p);
                        }
                    }
                    delete obj[pname];
                }
            }
        }

        return module;
    };

    var globalModule = buildModule('global');
    _.extend(global, globalModule);


    globalModule.registerModule('corelib', function (module) {

        var AsyncExecutor = function(callback, delay, payload) {
            this.delay = delay || 0;
            this.callback = callback;
            this.payload = payload;
            this.execute = function () {
                setTimeout(this.callback, this.delay, this.payload);
                this.callback = null;
                this.payload =null;
            };
        };

        var runAsync = function (callback, delay, payload) {
            setTimeout(callback, delay, payload);
        };
        module.runAsync = runAsync;

        var _logRow = 0
        var _logTemplate = _.template('<%=row%>::<%=module%> >> <%=text%>');
        module.log = function (module, text, isError) {
            var logRow = _.padStart((++_logRow).toString(10), 3, '0');
            var moduleText = _.padEnd(module, 8, '.');
            var content = _logTemplate({row: logRow, module: moduleText, text: text});
            var rowDiv = document.createElement('div');
            rowDiv.className = 'row';
            if (isError) {
                rowDiv.className = 'row error';
            }
            rowDiv.innerHTML = content;
            $('#app .log .rows').append(rowDiv);
        };
        module.clearLog = function () {
            $('#app .log .rows .row').remove();
            _logRow = 0;
        };

        var getMessageWindow = function () {
            // if (window.opener) {
            //     return window.opener;
            // }
            // if (window.parent) {
            //     return window.parent;
            // }
            return window;
        };
        var createMessageHub = function () {
            var _hub = {
                _subscriptions: [],
                _handleMessage: function(evt) {
                    if (evt.data && typeof evt.data == 'string') {
                        var msg = JSON.parse(evt.data)
                        for (var ix = 0; ix < this._subscriptions.length; ix++) {
                            if (this._subscriptions[ix].messageType == msg.messageType) {
                                runAsync(this._subscriptions[ix].callback, 0, msg.payload);
                            }
                        }
                    }
                },
                subscribe: function (messageType, callback) {
                    var sub = {
                        messageType: messageType,
                        callback: callback
                    }
                    this._subscriptions.push(sub);
                    return sub;
                },
                unsubscribe: function (sub) {
                    var ix = this._subscriptions.indexOf(sub);
                    if (ix >= 0) {
                        delete this._subscriptions[ix].callback;
                        this._subscriptions.splice(ix, 1);
                    }
                },
                broadcast: function (messageType, message) {
                    getMessageWindow().postMessage(JSON.stringify({
                        messageType: messageType,
                        payload: message
                    }), global.location.origin);
                },
                start: function () {
                    getMessageWindow().addEventListener('message', this._handleMessage.bind(this));
                    return this;
                },
            };
            return _hub;
        };
        var _messageHub = createMessageHub().start();
        module.messageHub = function () {
            return _messageHub
        };
        var createJSLoader = function () {
            var _loader = {
                bundles: {},
            };
            _loader.loadBundle = function (bundleName, bundlerUrls, loadedCallback) {
                if (!_loader.bundles[bundleName]) {
                    loadjs(bundlerUrls, bundleName);
                    loadjs.ready(bundleName, () => {
                        _loader.bundles[bundleName] = {
                            loaded: true,
                        };
                        loadedCallback();
                    });
                } else {
                    loadedCallback();
                }
            };
            _loader.isLoaded = function (bundleName) {
                if (_loader.bundles[bundleName]) {
                    return true;
                } else {
                    return false;
                }
            };
            return _loader;
        };
        var _jsLoader = createJSLoader();
        module.jsLoader = function () {
            return _jsLoader;
        };
        module.loadTabApp = function (payload) {
            var moduleName = payload.tabModule;
            var bundleName = moduleName + '_js';
            var appId = payload.tabId;
            var appParams = { nodeId: payload.tabNode, isFrame: payload.tabFrame };

            if (!_jsLoader.isLoaded(bundleName)) {
                _jsLoader.loadBundle(bundleName, payload.tabScripts, () => {
                    globalModule.importModule(moduleName).runApp(appId, appParams);
                });
            } else {
                runAsync(() => {
                    globalModule.importModule(moduleName).runApp(appId, appParams);
                });
            }
        };
    });

}(this, $, _, angular);
