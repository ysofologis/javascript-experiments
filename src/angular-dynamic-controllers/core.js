!function (global, undefined) {

    var makeModule = function (parentModule, name) {
        var moduleRegistryBuilder = function() {
            return {
                modules: {},
                create: function (moduleName) {
                    if (!this.modules[moduleName]) {
                        this.modules[moduleName] = {};
                    }
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
        function getModuleRegistry(module) {
            if (!module['__modules__']) {
                module['__modules__'] = moduleRegistryBuilder();
            }
            return module['__modules__'];
        }
        function cleanupNode(node) {
            if (node) {
                //setTimeout(function () {
                $.event.remove(node);
                node.removeData();
                // node.html('');
                // node[0].parentNode.removeChild(node[0]);

                node.html('');
                node.empty();
                node.remove();

                //}, 0);
            }
        }
        parentModule['__meta__'] = {
            name: name,
        };
        parentModule.getModule = function (moduleName) {
            var m = getModuleRegistry(parentModule).create(moduleName);
            return m;
        };
        parentModule.registerModule = function (moduleName, moduleInit) {
            var module = getModuleRegistry(parentModule).create(moduleName);
            if (!module['__meta__']) {
                makeModule(module, moduleName);
                module.destruct = function () {
                    if (this.dispose) {
                        this.dispose();
                    }
                    getModuleRegistry(parentModule).destroy(moduleName);
                    delete parentModule[moduleName];
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
                parentModule[moduleName] = module;
                moduleInit(module);
            }
            return module;
        };
        parentModule.apps = {};
        parentModule.runApp = function (appName, appParams) {
            if (!parentModule.apps[appName]) {
                var app = parentModule.apps[appName] = {};
                app.name = appName
                app.params = appParams || {};
                app.startAngular = function(appNodeId, appController) {
                    var tabNode = $('#' + appNodeId);
                    var $injector = angular.injector(['ng', 'tabsApp']);
                    var tabViewModelBuilder = $injector.get('tabViewModelBuilder');
                    tabViewModelBuilder.buildDynamicScope(app, tabNode, appController);
                    tabNode = null;
                };
                app.cleanup = function (appNode) {
                    if (this.angularScope) {
                        this.angularScope.$destroy();
                        this.angularScope = null
                        // cleanupNode(this.angularElem);
                        this.angularElem = null
                    }
                    app.dispose();
                    delete parentModule.apps[appName]
                    cleanupNode(appNode);

                    app.startAngular = null;
                    app.dispose = null;
                    app.ready = null;
                    app.cleanup = null;
                    app = null;
                };
                parentModule.appFactory(app);
                app.ready();
            }
        };
    };

    makeModule(global,'global');

    global.registerModule('corelib', function (module) {

        module.runAsync = function (callback, delay) {
            setTimeout(function () {
                callback();
            }, delay || 0)
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
            rowDiv.innerHTML = content
            $('#app .log .rows').append(rowDiv)
        }
        module.clearLog = function () {
            $('#app .log .rows .row').remove();
            _logRow = 0;
        }
        var createMessageHub = function () {
            var _subscriptions = []

            var runCallback = function (callback, payload) {
                module.runAsync(function () {
                    callback(payload)
                });
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
            var _loadedBundles = {};
            var _loader = {};
            _loader.loadBundle = function (bundlerUrls, bundleName, loadedCallback) {
                if (!_loadedBundles[bundleName]) {
                    loadjs(bundlerUrls, bundleName);
                    loadjs.ready(bundleName, function () {
                        _loadedBundles[bundleName] = {
                            loaded: true,
                        };
                        loadedCallback();
                    });
                } else {
                    loadedCallback();
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

            var asyncExecute = function(callback, callbackIterator, onComplete) {
                setTimeout(function () {
                    callback.callback();
                    var nextCallback = callbackIterator.next();
                    if (nextCallback) {
                        asyncExecute(nextCallback, callbackIterator, onComplete);
                    } else {
                        onComplete();
                    }
                }, callback.delay);
            };
            that.addAsyncAction = function (actionCallback, actionDelay) {
                _callbacks.push({
                    callback: actionCallback,
                    delay: actionDelay,
                });
            };
            that.execute = function () {
                if (_callbacks.length > 0) {
                    var callbackIndex = 0;
                    var callbackIterator = {
                        next: function () {
                            callbackIndex ++;
                            if (callbackIndex < _callbacks.length) {
                                return _callbacks[callbackIndex];
                            } else {
                                return null;
                            }
                        },
                    };
                    asyncExecute(_callbacks[0], callbackIterator, function () {
                        _callbacks.forEach( function (c) {
                            c.callback =  null;
                        });
                        _callbacks = [];
                    });
                }
            };
        };
    });
}(this);
