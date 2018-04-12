!function (global, undefined) {

    var moduleRegistryBuilder = function () {
        return {
            modules: {},
            create: function (moduleName) {
                if (!this.modules[moduleName]) {
                    this.modules[moduleName] = {};
                }
                return this.modules[moduleName];
            },
            get: function(moduleName) {
                return this.modules[moduleName];
            },
            update: function (moduleName, module) {
                this.modules[moduleName] = module;
            },
            destroy: function (moduleName) {
                if (this.modules[moduleName]) {
                    delete this.modules[moduleName];
                }
            },
        };
    };
    var cleanupNode = function(n) {
        if (n) {
            var node = n;
            setTimeout(function () {
                $.event.remove(node);
                node.removeData();
                //node.html('');
                //node[0].parentNode.removeChild(node[0]);
                // node.html('');
                node.empty();
                node.remove();
                node = null;
            }, 0);
        }
    };

    var ModuleSkeleton = function (name) {
        var  parentModule = this;
        var  moduleRegistry = moduleRegistryBuilder();

        parentModule['__meta__'] = {
            name: name,
        };
        parentModule['__modules__'] = moduleRegistry;

        parentModule.importModule = function (moduleName) {
            var m = moduleRegistry.get(moduleName);
            return m;
        };
        parentModule.registerModule = function (moduleName, moduleInitFn) {
            var moduleInit = moduleInitFn;
            var module = moduleRegistry.get(moduleName);
            if (!module) {
                module = new ModuleSkeleton(moduleName);
                module.destruct = function () {
                    if (this.dispose) {
                        this.dispose();
                    }
                    moduleRegistry.destroy(moduleName);
                    // delete parentModule[moduleName];
                    module = null;
                };
                module.cleanup = function (appId, appNode) {
                    if (this.apps[appId]) {
                        var app = this.apps[appId];
                        app.cleanup(appNode);
                    }
                    if (Object.keys(this.apps).length == 0) {
                        this.destruct();
                        cleanupNode(appNode);
                    }
                };
                // this[moduleName] = module;
                moduleInit(module);
                moduleInit = null;
                moduleRegistry.update(moduleName, module);
            }
            return module;
        };
        parentModule.apps = {};

        var AppSkeleton = function (ownerModule, appName, appParams) {
            var app = this;
            var appModule = ownerModule;
            var appNode = null;
            app.name = appName;
            app.params = appParams ? Object.create(appParams) : {};
            app.startAngular = function (appNodeId, appController) {
                appNode = $('#' + appNodeId);
                var $injector = angular.injector(['ng', 'tabsApp']);
                var tabViewModelBuilder = $injector.get('tabViewModelBuilder');
                tabViewModelBuilder.buildDynamicScope(app, appNode, appController);
                tabViewModelBuilder = null;
                $injector = null;
            };
            app.cleanup = function () {
                if (app.angularScope) {
                    app.angularScope.$destroy();
                    // cleanupNode(this.angularElem);
                    app.angularScope = null;
                    app.angularElem = null;
                    cleanupNode(appNode);
                    appNode = null;
                    app.dispose();
                } else {
                    cleanupNode(appNode);
                    appNode = null;
                    app.dispose();
                }
                delete appModule.apps[appName];
                delete app;
                app = null;
                appModule = null;
            };
            return app;
        };
        parentModule.runApp = function (appName, appParams) {
            if (!parentModule.apps[appName]) {
                var app = new AppSkeleton(parentModule, appName, appParams);
                parentModule.apps[appName] = app;
                parentModule.appFactory(app);
                app.ready();
            }
        };
    };

    var globalModule = new ModuleSkeleton('global');
    _.extend(global, globalModule);


    global.registerModule('corelib', function (module) {

        module.runAsync = function (callback, delay) {
            !function (fn, d) {
                setTimeout(function () {
                    fn();
                    fn = null;
                }, d || 0)
            }(callback, delay);
        };

        var _logRow = 0
        var _logTemplate = _.template('<%=row%>::<%=module%> >> <%=text%>');
        module.log = function (module, text, isError) {
            var logRow = _.padStart((++_logRow).toString(10), 3, '0')
            var moduleText = _.padEnd(module, 8, '.')
            var content = _logTemplate({row: logRow, module: moduleText, text: text})
            var rowDiv = document.createElement('div')
            rowDiv.className = 'row'
            if (isError) {
                rowDiv.className = 'row error';
            }
            rowDiv.innerHTML = content;
            $('#app .log .rows').append(rowDiv);
        }
        module.clearLog = function () {
            $('#app .log .rows .row').remove();
            _logRow = 0;
        }
        var createMessageHub = function () {
            var _subscriptions = [];

            var runCallback = function (callback, payload) {
                !function(cb, p) {
                    setTimeout(function () {
                        cb(p)
                    }, 0);
                }(callback, payload);
            };
            var handleMessage = function (evt) {
                if (evt.data && typeof evt.data == 'string') {
                    var msg = JSON.parse(evt.data)
                    for (var ix = 0; ix < _subscriptions.length; ix++) {
                        if (_subscriptions[ix].messageType == msg.messageType) {
                            runCallback(_subscriptions[ix].callback, msg.payload)
                        }
                    }
                }
            };
            var _hub = {
                subscribe: function (messageType, callback) {
                    var sub = {
                        messageType: messageType,
                        callback: callback
                    }
                    _subscriptions.push(sub)
                    return sub
                },
                unsubscribe: function (sub) {
                    var ix = _subscriptions.indexOf(sub)
                    if (ix >= 0) {
                        _subscriptions[ix].callback = null;
                        _subscriptions.splice(ix, 1)
                    }
                },
                broadcast: function (messageType, message) {
                    window.postMessage(JSON.stringify({
                        messageType: messageType,
                        payload: message
                    }), window.location.origin)
                },
                start: function () {
                    window.addEventListener('message', function (evt) {
                        handleMessage(evt)
                    });
                    return _hub
                }
            }
            return _hub
        };
        var _messageHub = createMessageHub().start()
        module.messageHub = function () {
            return _messageHub
        };
        var createJSLoader = function () {
            var _loader = {
                bundles: {},
            };
            _loader.loadBundle = function (bundleName, bundlerUrls, loadedCallback) {
                var cb = loadedCallback;
                if (!_loader.bundles[bundleName]) {
                    loadjs(bundlerUrls, bundleName);
                    loadjs.ready(bundleName, function jsReady() {
                        _loader.bundles[bundleName] = {
                            loaded: true,
                        };
                        cb();
                        cb = null;
                    });
                } else {
                    cb();
                    cb = null;
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
        module.AsyncChain = function () {
            var that = this;
            var _callbacks = [];

            var asyncExecute = function (callback, callbackIterator, onComplete) {
                !function(cb, cbIter, completed) {
                    setTimeout(function () {
                        cb.callback();
                        var nextCallback = cbIter.next();
                        if (nextCallback) {
                            asyncExecute(nextCallback, cbIter, completed);
                        } else {
                            completed();
                        }
                    }, cb.delay);
                }(callback, callbackIterator, onComplete);
            };
            that.addAsyncAction = function (actionCallback, actionDelay) {
                _callbacks.push({
                    callback: actionCallback,
                    delay: actionDelay,
                });
            };
            that.execute = function () {
                if (_callbacks.length > 0) {
                    var callbackIterator = {
                        callbacks: _callbacks,
                        maxIndex: _callbacks.length,
                        index: 0,
                        next: function () {
                            this.index ++;
                            if (this.index < this.maxIndex) {
                                return this.callbacks[this.index];
                            } else {
                                return null;
                            }
                        },
                        dispose: function () {
                            this.callbacks = [];
                        },
                    };
                    asyncExecute(_callbacks[0], callbackIterator, function () {
                        _callbacks.forEach(function (c) {
                            c.callback = null;
                        });
                        _callbacks = [];
                        callbackIterator.dispose();
                        callbackIterator = null;
                    });
                }
            };
        };
        module.loadTabApp = function (tabModule, tabScripts, tabId, tabNodeId) {
            var moduleName = tabModule;
            var bundleName = moduleName + '_js';

            if (!_jsLoader.isLoaded(bundleName)) {
                _jsLoader.loadBundle(bundleName, tabScripts, function handleTabLoad() {
                    importModule(moduleName).runApp(tabId, {nodeId: tabNodeId});
                });
            } else {
                importModule(moduleName).runApp(tabId, {nodeId: tabNodeId});
            }
        };
    });
}(this);
