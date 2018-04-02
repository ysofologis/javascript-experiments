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
                    // $.event.remove(node);
                    // node.removeData();
                    // node.html('');
                    // node[0].parentNode.removeChild(node[0]);
                    node.html('');
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
        parentModule.apps = {};
        parentModule.runApp = function (appId) {
            var app = parentModule.apps[appId];
            app.ready();
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
        parentModule.registerApp = function (appName, appParams, appInit) {
            if (!parentModule.apps[appName]) {
                var app = parentModule.apps[appName] = {};
                app.name = appName
                app.params = appParams
                app.cleanup = function (tabNode) {
                    if (this.angularScope) {
                        this.angularScope.$destroy();
                        this.angularScope = null
                        cleanupNode(p.angularElem);
                        this.angularElem.remove();
                        this.angularElem = null
                    }
                    this.dispose();
                    delete parentModule.apps[appName]
                    this.ready = null;
                    this.dispose = null;
                };
                appInit(app);
            }
            return this.apps[appName];
        };
    };

    makeModule(global,'global');

    global.registerModule('corelib', function (module) {
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
            $('#app .log').append(rowDiv)
        }
        module.clearLog = function () {
            $('#app .log .row').remove();
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
    });
}(this);
