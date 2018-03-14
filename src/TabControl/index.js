
!function(globlal, $, undefined) {
    var _tabControl1 = null;
    var _app =  {
        start: function () {
            _tabControl1 = globlal.createTabControl('#tabControl1');
            setTimeout(function () {
                _tabControl1.addItem({
                    title: 'Tab 01',
                    content: '<p><b>Whats up doc ??</b></p>',
                }, false);
                _tabControl1.addItem({
                    title: 'Tab 02',
                    content: '<p><b>I\' m fine thank you</b></p>',
                }, true);
            }, 0);
        },
        get tabControl1() {
            return _tabControl1;
        },
    };

    globlal.app = _app;
}(this, jQuery);