
registerModule('noframewrk_module', function (module) {
    var corelib = importModule('corelib');

    module.appBuilder = function (app) {
        var btnSelector = $( '#' + app.params.nodeId + ' .btn-close');
        var appId = app.name;

        app.scope = {
            'message': 'hello from [noframewrk_module] ' + appId,
            'prop01': 'nof 01',
            'prop02': 'nof 02',
            'prop03': 'nof 03',
            'prop04': 'nof 04',
            'prop05': 'nof 05',
            'prop06': 'nof 06',
            'prop07': 'nof 07',
            'prop08': 'nof 08',
            'prop09': 'nof 09',
            'prop10': 'nof 10',
        };
        app.ready = function () {
            var propKeys = Object.keys(app.scope);
            for(var ix = 0; ix < propKeys.length; ix ++) {
                var propName = propKeys[ix];
                $('#' + app.params.nodeId + ' .' + propName).text( app.scope[propName] );
            }
            btnSelector.click(function () {
                app.cleanup();
            });
            app.start();
            corelib.log('tabs', 'tab ' + appId + ' started');
        };
        app.dispose = function () {
            btnSelector.off('click');
            btnSelector = null;

            corelib.log('tabs', 'tab ' + appId + ' disposed');
            app = null;
        };
    };
});