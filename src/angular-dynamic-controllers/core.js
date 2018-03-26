!function (global, undefined) {
  var cleanupNode = function (node) {
    if (node) {
      node.removeData()
      node.html('')
      node.remove()
    }
  }
  var createModuleApp = function (module, appName, appInit, appParams) {
    if (!module.apps[appName]) {
      var app = module.apps[appName] = {}
      app.name = appName
      app.params = appParams
      app.angularTabCleanup = function (tabNode) {
        if (app.angularScope) {
          app.angularScope.$destroy();
          app.angularScope = null
          cleanupNode(app.angularElem);
          app.angularElem = null
        }
        app.dispose()
        delete module.apps[app.name]
        if (Object.keys(module.apps).length == 0) {
          module.destruct()
          // tabNode.empty()
          // tabNode.appendTo("#angular-trash-container")
          cleanupNode(tabNode)
        }
        app.ready = null
        app.dispose = null
        app = null
      };
      appInit(app)
    }
    return module.apps[appName]
  }
  var createModule = function (parent, moduleName, moduleInit) {
    if (!parent[moduleName]) {
      var module = parent[moduleName] = {};
      module['__meta__'] = {
        name: moduleName
      }
      module.registerModule = function (childName, childInit) {
        return createModule(module, childName, childInit);
      }
      module.apps = {}
      module.registerApp = function (appName, appParams, appInit) {
        return createModuleApp(module, appName, appInit, appParams)
      }
      module.destruct = function () {
        delete parent[moduleName]
        module.ready = null
        module.dispose = null
        module = null
      }
      moduleInit(module)
    }
    return parent[moduleName]
  }
  global.registerModule = function (moduleName, moduleInit) {
    return createModule(parent, moduleName, moduleInit)
  }
  global.getModule = function (moduleName) {
    return global[moduleName]
  }
  global.registerModule('corelib', function (module) {
    var _logRow = 0
    var _logTemplate = _.template('<%=row%>::<%=module%> >> <%=text%>')
    module.log = function (module, text, isError) {
      var logRow = _.padStart((++_logRow).toString(10), 3, '0')
      var moduleText = _.padEnd(module, 8, '.')
      var content = _logTemplate({ row: logRow, module: moduleText, text: text })
      var rowDiv = document.createElement('div')
      rowDiv.className = 'row'
      if (isError) {
        rowDiv.className = 'row error'
      }
      rowDiv.innerHTML = content
      $('#app .log').append(rowDiv)
    }
    module.clearLog = function () {
      $('#app .log .row').remove()
    }
    var createMessageHub = function () {
      var _subscriptions = []

      var runCallback = function (callback, payload) {
        setTimeout(function () {
          callback(payload)
        }, 0)
      }
      var handleMessage = function (evt) {
        if (evt.data && typeof evt.data == 'string') {
          var msg = JSON.parse(evt.data)
          for (var ix = 0; ix < _subscriptions.length; ix++) {
            if (_subscriptions[ix].messageType == msg.messageType) {
              runCallback(_subscriptions[ix].callback, msg.payload)
            }
          }
        }
      }
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
    }
    var _messageHub = createMessageHub().start()
    module.messageHub = function () {
      return _messageHub
    }
  })
}(this)
