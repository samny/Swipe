(function (Swipe) {

    var dom = {
        createEl: function (tagname) {
            return document.createElement(tagname);
        },
        getEl: function (selector) {
            return document.querySelector(selector);
        },
        getElAll: function (selector) {
            return document.querySelectorAll(selector);
        },

        getElIndex: function (el) {
            var list = el.parentNode.children, index = -1;

            for (var i = 0; i < list.length; ++i) {
                var item = list[i];
                if (item === el) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        hasClass: function (el, selector) {
            var className = " " + selector + " ";

            if ((" " + el.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1) {
                return true;
            }
        }
    };

    var SwipeTabPanel = function (sel_container, options) {
        this.init(sel_container);
    };

    SwipeTabPanel.prototype = {
        init: function (sel_container) {
            var _this = this;

            this.sel_container = sel_container;
            this.el_container = dom.getElAll(this.sel_container)[0];
            this.el_viewport = dom.getElAll(sel_container + ' > .swipe-viewport')[0];
            this.panels = dom.getElAll(sel_container + ' .swipe-panels')[0].children;

            var navHtml = '<button class="prev">Prev</button><button class="next">Next</button>';

            navHtml += '<ul class="paging" role="tablist">';
            for (var i = 0; i < this.panels.length; i++) {
                var panel = this.panels[i], baseId = this.el_container.id, tabId = baseId + '_tab_' + i, panelId = baseId + '_panel_' + i;
                panel.setAttribute('id', panelId);
                panel.setAttribute('aria-labeledby', tabId);
                panel.setAttribute('role', 'tabpanel');

                navHtml += '<li role="presentation"><a id="' + tabId + '" href="#' + panelId + '" role="tab" aria-controls="' + panelId + '" aria-selected="true">' + i + '</a></li>';
            }
            navHtml += '</ul>';

            this.el_navContainer = dom.createEl('DIV');
            this.el_navContainer.innerHTML = navHtml;
            this.el_container.appendChild(this.el_navContainer);

            this.tabs = dom.getElAll(sel_container + ' .paging a');

            this.swipe = Swipe(this.el_viewport, {
                startSlide: 1,
                auto: 0,
                continuous: false,
                disableScroll: true,
                stopPropagation: true,
                callback: function (index, element) {
                    _this.refresh(index);
                },
                transitionEnd: function (index, element) {
                }
            });


            this.el_navContainer.addEventListener('click', function (e) {
                e.preventDefault();
                if (e.target.tagName === 'A') {
                    _this.swipe.slide(dom.getElIndex(e.target.parentNode));
                } else if (dom.hasClass(e.target, 'prev')) {
                    _this.swipe.prev();
                } else if (dom.hasClass(e.target, 'next')) {
                    _this.swipe.next();
                }
            });

            this.refresh();
        },
        refresh: function (index) {
            var current = index || this.swipe.getPos();
            for (var i = 0, l = this.panels.length; i < l; i++) {
                var panel = this.panels[i], tab = this.tabs[i];
                if (current === i) {
                    panel.setAttribute('aria-hidden', 'false');
                    tab.setAttribute('tabindex', '0');
                    tab.focus();
                } else {
                    panel.setAttribute('aria-hidden', 'true');
                    tab.setAttribute('tabindex', '-1');
                }

            }
        }
    };

    new SwipeTabPanel('#mySwipe');

})(Swipe);