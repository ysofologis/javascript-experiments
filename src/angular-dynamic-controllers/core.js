
!function(global, undefined) {
    var createModuleApp = function (module, appName, appInit, appParams) {
        if (!module.apps[appName]) {
            var app = module.apps[appName] = {};
            app.name = appName;
            app.params = appParams;
            app.angularTabCleanup = function(tabNode) {
                if (app.angularScope) {
                    app.angularScope.$destroy();
                    app.angularScope = null;
                    app.angularElem.remove();
                    app.angularElem  = null;
                }
                app.dispose();
                delete module.apps[app.name];
                if (Object.keys(module.apps).length == 0) {
                    module.destruct();
                    tabNode.empty();
                    tabNode.remove();
                }
                app = null;
            };
            appInit(app);
        }
        return module.apps[appName];
    };
    var createModule = function (parent, moduleName, moduleInit) {
        if (!parent[moduleName]) {
            var module = parent[moduleName] = {};
            module['__meta__'] = {
                name: moduleName,
            };
            module.registerModule = function (childName, childInit) {
                return createModule(module,childName,childInit);
            };
            module.apps = {};
            module.registerApp = function (appName, appParams, appInit) {
                return createModuleApp(module, appName, appInit, appParams);
            };
            module.destruct = function() {
                delete parent[moduleName];
                module = null;
            };
            moduleInit(module);
        }
        return parent[moduleName];
    };
    global.registerModule = function (moduleName, moduleInit) {
        return createModule(parent,moduleName,moduleInit);
    };
    global.getModule = function (moduleName) {
        return global[moduleName];
    };
    global.registerModule('corelib', function (module) {
        var _logRow = 0;
        var _logTemplate = _.template('<%=row%>::<%=module%> >> <%=text%>');
        module.log = function (module, text, isError) {
            var logRow = _.padStart((++ _logRow).toString(10), 3, '0');
            var moduleText = _.padEnd(module, 8, '.');
            var content = _logTemplate({ row: logRow, module: moduleText, text: text });
            var rowDiv = document.createElement('div');
            rowDiv.className = 'row';
            if (isError) {
                rowDiv.className = 'row error';
            }
            rowDiv.innerHTML = content;
            $('#app .log').append(rowDiv);
        };
    });
}(this);