(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["swipe", "jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("swipe"), require("jquery"));
    } else {
        root.SwipeTabPanel = factory(root.Swipe, root.jQuery);
    }
}(this, function (Swipe, $) {

    var SwipeTabPanel = function (sel_container, options) {
        this.init(sel_container);
    };

    SwipeTabPanel.prototype = {
        init: function (sel_container) {
            var _this = this;

            this.sel_container = sel_container;
            this.el_container = $(this.sel_container);
            this.el_viewport = this.el_container.find('.swipe-viewport');
            this.panels = this.el_container.find('.swipe-panels > *');

            var panel, baseId, panelId, tabId, navHtml = '<div><a href="#" class="prev" aria-hidden="true" tabindex="-1">Prev</a><a href="#" class="next" aria-hidden="true" tabindex="-1">Next</a>';

            navHtml += '<ul class="paging" role="tablist">';

            this.panels.each(function (i, el) {
                panel = $(el), baseId = _this.el_container.attr('id'), tabId = baseId + '_tab_' + i, panelId = baseId + '_panel_' + i;
                panel.attr('id', panelId);
                panel.attr('aria-labeledby', tabId);
                panel.attr('role', 'tabpanel');

                navHtml += '<li role="presentation"><a id="' + tabId + '" href="#' + panelId + '" role="tab" aria-controls="' + panelId + '">' + i + '</a></li>';
            });
            navHtml += '</ul></div>';

            this.el_navContainer = $(navHtml);
            this.el_container.append(this.el_navContainer);
            this.el_container.prepend(this.el_navContainer);

            this.tabs = $(sel_container + ' .paging a');

            if (Swipe) {
                this.swipe = Swipe(this.el_viewport.get(0), {
                    startSlide: 0,
                    auto: 0,
                    continuous: false,
                    disableScroll: true,
                    stopPropagation: true,
                    callback: function (index, element) {
                        _this.currentPos = index;
                        _this.refresh(true);
                    }
                });
            } else {
                this.el_viewport.addClass('no-transition');
            }

            this.el_navContainer.find('.prev').on('click', function (e) {
                _this.prev();
                e.preventDefault();
            });
            this.el_navContainer.find('.next').on('click', function (e) {
                _this.next();
                e.preventDefault();
            });

            this.bindHandlers();

            this.currentPos = 0;
            this.numPanels = this.panels.length;

            this.refresh(false);
        },

        getPanel: function (tab) {
            return $('#' + $(tab).attr('aria-controls'));
        },
        getTab: function (panel) {
            return $('#' + $(panel).attr('aria-labeledby'));
        },

        prev: function () {
            if (this.swipe) {
                this.swipe.prev();
            } else {
                this.currentPos = (--this.currentPos > 0) ? this.currentPos : 0;
                this.refresh(true);
            }
        },
        next: function () {
            if (this.swipe) {
                this.swipe.next();
            } else {
                this.currentPos = (++this.currentPos < this.numPanels) ? this.currentPos : this.numPanels - 1;
                this.refresh(true);
            }
        },
        showPanel: function (index) {
            if (this.swipe) {
                this.swipe.slide(index);
            } else {
                this.currentPos = index;
                this.refresh(true);
            }
        },

        bindHandlers: function () {
            var _this = this;

            this.tabs.on('click', _this.handleTabClick.bind(_this));
            this.tabs.on('keydown', $.proxy(_this.handleTabKeyDown, _this));
            this.tabs.on('keypress', $.proxy(_this.handleTabKeyPress, _this));
            this.tabs.on('focus', $.proxy(_this.handleTabFocus, _this));
            this.tabs.on('blur', $.proxy(_this.handleTabBlur, _this));
            this.panels.on('keydown', $.proxy(_this.handlePanelKeyDown, _this));
            this.panels.on('keypress', $.proxy(_this.handlePanelKeyPress, _this));
        },

        handleTabKeyDown: function (e) {

            if (e.altKey) {
                // do nothing
                return true;
            }

            switch (e.keyCode) {
                case KEYS.enter:
                case KEYS.space:
                {
                    return true;
                }
                case KEYS.left:
                case KEYS.up:
                {
                    if (e.ctrlKey) {
                        // Ctrl+arrow moves focus from panel content to the open
                        // tab/accordian header.
                    }
                    else {
                        this.prev();
                    }

                    e.stopPropagation();
                    return false;
                }
                case KEYS.right:
                case KEYS.down:
                {
                    this.next();
                    e.stopPropagation();
                    return false;
                }
                case KEYS.home:
                {
                    // switch to the first tab
                    this.showPanel(0);

                    e.stopPropagation();
                    return false;
                }
                case KEYS.end:
                {

                    // switch to the last tab
                    this.showPanel(this.numPanels - 1);

                    e.stopPropagation();
                    return false;
                }
            }
        },
        handleTabKeyPress: function (e) {
            if (e.altKey) {
                // do nothing
                return true;
            }

            switch (e.keyCode) {
                case KEYS.enter:
                case KEYS.space:
                case KEYS.left:
                case KEYS.up:
                case KEYS.right:
                case KEYS.down:
                case KEYS.home:
                case KEYS.end:
                {
                    e.stopPropagation();
                    return false;
                }
                case KEYS.pageup:
                case KEYS.pagedown:
                {
                    if (!e.ctrlKey) {
                        return true;
                    }

                    e.stopPropagation();
                    return false;
                }
            }

            return true;
        },
        handleTabClick: function (e) {

            e.preventDefault();
            var tab = e.target, panel = this.getPanel(tab);
            this.showPanel(panel.index());
        },
        handleTabFocus: function (e) {
            $(e.target).addClass('focus');
        },
        handleTabBlur: function (e) {
            $(e.target).removeClass('focus');
        },
        handlePanelKeyDown: function (e) {
            if (e.altKey) {
                // do nothing
                return true;
            }

            switch (e.keyCode) {
                case KEYS.esc:
                {
                    e.stopPropagation();
                    return false;
                }
                case KEYS.left:
                case KEYS.up:
                {
                    if (!e.ctrlKey) {
                        // do not process
                        return true;
                    }

                    var tab = this.getTab(e.target);
                    if (tab) {
                        tab.focus();
                    }

                    e.stopPropagation();
                    return false;
                }
                case KEYS.pageup:
                {

                    this.prev();

                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
                case KEYS.pagedown:
                {

                    this.next();

                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }

            return true;
        },
        handlePanelKeyPress: function (e) {
            if (e.altKey) {
                // do nothing
                return true;
            }

            if (e.ctrlKey && (e.keyCode == KEYS.pageup || e.keyCode == KEYS.pagedown)) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }

            switch (e.keyCode) {
                case KEYS.esc:
                {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }

            return true;
        },


        refresh: function (doFocusTab) {
            var _this = this, current = this.currentPos;

            this.panels.each(function (i, el) {
                var panel = $(el), tab = _this.getTab(panel);

                if (current === i) {
                    if (!_this.swipe) {
                        panel.css('display', 'block');
                    }

                    panel.attr('aria-hidden', 'false');
                    panel.removeAttr('tabindex');
                    panel.addClass('selected');

                    tab.removeAttr('tabindex');
                    tab.attr('aria-selected', 'true');

                    var panelLinks = panel.find('a, input, button, select, textarea, iframe');
                    panelLinks.removeAttr('tabindex');

                    if (doFocusTab) {
                        tab.focus();
                    }

                } else {
                    if (!_this.swipe) {
                        panel.css('display', 'none');
                    }

                    panel.attr('aria-hidden', 'true');
                    panel.attr('tabindex', '-1');
                    panel.removeClass('selected');

                    tab.attr('tabindex', '-1');
                    tab.removeAttr('aria-selected');

                    var panelLinks = panel.find('a, input, button, select, textarea, iframe');
                    panelLinks.attr('tabindex', '-1');
                }
            });
        }
    };


    var KEYS = {
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    };

    return SwipeTabPanel;

}));

