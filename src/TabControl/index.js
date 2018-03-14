
!function(globlal, $, undefined) {
    var _tabControl1 = null;
    var _newTabIndex = 5;
    var _app =  {
        start: function () {
            _tabControl1 = globlal.createTabControl('#tabControl1');
            setTimeout(function () {
                _tabControl1.addItem({
                    title: 'Tab 01',
                    content: '<p>Tab 01: <b>Whats up doc ??</b></p>',
                }, false);
                _tabControl1.addItem({
                    title: 'Tab 02',
                    content: '<p>Tab 02: <b>I\' m fine thank you</b></p>',
                }, true);
            }, 10);

            $('#m-add-tab').click(function () {
                _tabControl1.addItem({
                    title: 'Tab {0}'.format( (_newTabIndex ++).toString(10) ),
                    content: '<div>Tab {0}: So funny to add items :)</div>'.format( (_newTabIndex - 1).toString(10) ),
                }, true);
            });
            $('#m-remove-tab').click(function () {
                _tabControl1.removeActiveItem();
            });
        },
        get tabControl1() {
            return _tabControl1;
        },
    };

    globlal.app = _app;
}(this, jQuery);