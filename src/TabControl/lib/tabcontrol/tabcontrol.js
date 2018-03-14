
!function(global,$,undefined) {
    const TAB_CONTAINER_CSS = 'tabs';
    const TAB_HEADERS_CSS = 'tab-links';
    const TAB_CONTENT_CSS = 'tab-content';
    const TAB_ITEM_CSS = 'tab-item';

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var content = this;
            var args = arguments;
            return content.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
        };
    }

    /**
     * many thanks to http://inspirationalpixels.com/tutorials/creating-tabs-with-html-css-and-jquery#step-css
     * @param layoutSelector
     * @constructor
     */
    var TabControl = function (layoutSelector) {
        var that = this;
        var _tabItems = {};
        var _activeTab = null;
        var _nextTabId = 0;

        var createElem = function (elemType, elemClass) {
            var elem = document.createElement(elemType);
            if (elemClass) {
                elem.className = elemClass;
            }
            return elem;
        };
        var findPrevItem = function (tabItem) {
            var itemIds =  Object.keys(_tabItems);
            for(var ix = 0; ix < itemIds.length; ix ++) {
                var item = _tabItems[ itemIds[ix] ];
                if (item && item.tabNextId == tabItem.tabId) {
                    return item;
                }
            }
            return null;
        };

        var doAddHeader = function (tabItem) {
            var headerList = layoutSelector.find('.' + TAB_HEADERS_CSS);
            var headerItem = createElem('li', '');
            headerItem.id = 'h-{0}'.format(tabItem.tabId);
            $(headerItem).append($('<div class="header"><div class="close">X</div><a class="text">{0}</a></div>'.format(tabItem.tabTitle)));
            headerList.append(headerItem);
            $(headerItem).find(".text").click(handleHeaderClick);
            $(headerItem).find(".close").click(handleHeaderRemoveClick);

        };
        var doAddItem = function (descriptor) {
            var tabId = 'tab_{0}'.format( (_nextTabId ++).toString(10) );
            var tabItem = {
                tabId: tabId,
                tabTitle: descriptor.title,
                tabHtmlContent: descriptor.content,
                tabContentElem: null,
                tabInit: descriptor.onInit,
                tabDispose: descriptor.onDispose,
                tabActivate: descriptor.onActivate,
                tabNextId: null,
            };
            _tabItems[tabItem.tabId] = tabItem;
            doAddHeader(tabItem);
            if (_activeTab) {
                var nextId = _activeTab.tabNextId;
                _activeTab.tabNextId = tabItem.tabId;
                if (nextId) {
                    tabItem.tabNextId = nextId;
                }
            }
            return tabItem;
        };
        var doRemoveItem = function (tabId) {
            var tabItem = _tabItems[tabId];
            if (tabItem) {
                if (tabItem.tabDispose) {
                    tabItem.tabDispose(tabItem.tabContentElem);
                }
                var prevTab = findPrevItem(tabItem);
                if (prevTab) {
                    prevTab.tabNextId = tabItem.tabNextId;
                }
                var headerId = '#h-{0}'.format(tabId);
                layoutSelector.find(headerId).remove();
                if (prevTab && (_activeTab == tabItem)) {
                    doRenderItem(prevTab);
                    _activeTab = prevTab;
                }
                delete _tabItems[tabId];
            }
        };
        var doRenderItem = function (tabItem) {
            var contentElem = layoutSelector.find('.' + TAB_CONTENT_CSS);
            if (!tabItem.tabContentElem) {
                contentElem.empty();
                contentElem.append($(tabItem.tabHtmlContent));
                tabItem.tabContentElem = contentElem.children()[0];
            } else {
                contentElem.empty();
                contentElem.append(tabItem.tabContentElem);
            }
            if (tabItem.tabActivate) {
                tabItem.tabActivate(tabItem.tabContentElem);
            }
            var headerElem = layoutSelector.find('.' + TAB_HEADERS_CSS);
            var headerId = '#h-{0}'.format(tabItem.tabId);
            layoutSelector.find(headerId).addClass('active');
            if (_activeTab) {
                var lastActiveHeaderId = '#h-{0}'.format(_activeTab.tabId);
                layoutSelector.find(lastActiveHeaderId).removeClass('active');
            }
        };
        function handleHeaderClick(evt) {
            var tabId = evt.currentTarget.parentNode.parentNode.id.split('-')[1];
            var tabItem = _tabItems[tabId];
            doRenderItem(tabItem);
            _activeTab = tabItem;
        }
        function handleHeaderRemoveClick(evt) {
            var tabId = evt.currentTarget.parentNode.parentNode.id.split('-')[1];
            that.removeItem(tabId);
        }
        that.initLayout = function () {
            var tabContainer = createElem('div', TAB_CONTAINER_CSS);
            var tabHeaders = createElem('ul', TAB_HEADERS_CSS);
            var tabContent = createElem('div', TAB_CONTENT_CSS);
            tabContainer.append(tabHeaders);
            tabContainer.append(tabContent);
            layoutSelector.append(tabContainer);
            return that;
        };
        that.addItem = function (tabDescriptor, activate) {
            var newItem = doAddItem(tabDescriptor);
            if (activate) {
                that.activateItem(newItem.tabId);
            }
            return newItem.tabId;
        };
        that.removeItem = function (tabId) {
            doRemoveItem(tabId);
            if (Object.keys(_tabItems).length == 0) {
                _nextTabId = 0;
                layoutSelector.find('.' + TAB_CONTENT_CSS).empty();
            }
        };
        that.removeActiveItem = function () {
            if (_activeTab) {
                that.removeItem(_activeTab.tabId);
            }
        };
        that.activateItem = function (tabId) {
            var tabItem = _tabItems[tabId];
            if (tabItem) {
                doRenderItem(tabItem);
                _activeTab = tabItem;
            }
        };
        that.getActiveTab = function () {
            return _activeTab;
        };
    };
    global.createTabControl = function (selector) {
        return new TabControl($(selector)).initLayout();
    };
}(this, jQuery);