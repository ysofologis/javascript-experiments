!function (global, undefined) {

    var createRef = function(instance) {
        var _instance = instance;
        var _refCount = 0;
        return {
            instance: function() {
                _refCount = _refCount + 1;
                return _instance;
            },
            release: function() {
                if (_refCount) {
                    _refCount = _refCount - 1;
                    if (!_refCount) {
                        _instance = null;
                    }
                }
            }
        };
    };
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
    var cleanupNode = function(node) {
        if (node) {
            node.removeData();
            node.html('');
            node.remove();
        }
    };
var makeModule = function (parentModule, name) {
        parentModule['__meta__'] = {
            name: name,
        };
        parentModule.getModule = function (moduleName) {
            var m = getModuleRegistry(this).create(moduleName);
            return m;
        };
        parentModule.apps = {};
        parentModule.runApp = function (appId) {
            var app = this.apps[appId];
            if (!app) {
                parentModule.registerApp(appId, {}, parentModule.appFactory);
                app = this.apps[appId];
            }
            app.ready();
        };
        parentModule.registerModule = function (moduleName, initClosure) {
            var module = getModuleRegistry(this).create(moduleName);
            if (!module['__meta__']) {
                makeModule(module, moduleName);
                module.cleanup = function (appId, appNode) {
                    if (this.apps[appId]) {
                        var app = this.apps[appId];
                        app.angularTabCleanup(appNode);
                    }
                    if (Object.keys(this.apps).length == 0) {
                        this.destruct();
                    }
                };
                module.destruct = function () {
                    if (this.dispose) {
                        this.dispose();
                    }
                    var appIds = Object.keys(this.apps);
                    for(var ix = 0; ix < appIds.length; ix ++) {
                        var appId = appIds[ix];
                        this.apps[appId].dispose();
                    }
                    delete parentModule[moduleName];
                    getModuleRegistry(parentModule).destroy(moduleName);
                };
                        
                this[moduleName] = module;
                initClosure(module);
            }
            return module;
        };
        parentModule.registerApp = function (appName, appParams, initClosure) {
            if (!this.apps[appName]) {
                var app = this.apps[appName] = {};
                app.name = appName;
                app.params = appParams;
                app.cleanup = function (tabNode) {
                    if (this.angularScope) {
                        this.angularScope.$destroy();
                        this.angularScope = null
                        // this.angularElem.remove();
                        this.angularElem = null
                    }
                    if (this.dispose) {
                        this.dispose();
                    }
                    cleanupNode(tabNode);
                    delete parentModule.apps[appName];
                    app = null;
                };

                initClosure(app);
            }
            return this;
        };
    };

    makeModule(global,'global');

    registerModule('corelib', function (module) {
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
                setTimeout(function () {
                    callback(payload)
                }, 0);
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
                    })
                    return _hub
                }
            }
            return _hub
        };
        var _messageHub = createMessageHub().start()
        module.messageHub = function () {
            return _messageHub
        };
    });
}(this);
