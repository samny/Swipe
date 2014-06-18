(function (Swipe) {


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
            this.el_container.insertBefore(this.el_navContainer, this.el_container.firstChild);

            this.tabs = dom.getElAll(sel_container + ' .paging a');

            this.swipe = Swipe(this.el_viewport, {
                startSlide: 0,
                auto: 0,
                continuous: false,
                disableScroll: true,
                stopPropagation: true,
                callback: function (index, element) {
                    _this.refresh(true);
                },
                transitionEnd: function (index, element) {
                }
            });

            this.el_navContainer.querySelector('.prev').addEventListener('click', function (e) {
                _this.prev();
                e.preventDefault();
            });
            this.el_navContainer.querySelector('.next').addEventListener('click', function (e) {
                _this.next();
                e.preventDefault();
            });

            this.bindHandlers();
            this.refresh(false);
        },

        getPanel: function (tab) {
            return dom.getEl('#' + tab.getAttribute('aria-controls'));
        },
        getTab: function (panel) {
            return dom.getEl('#' + panel.getAttribute('aria-labeledby'));
        },

        prev: function () {
            this.swipe.prev();
        },
        next: function () {
            this.swipe.next();
        },
        showPanel: function (index) {
            this.swipe.slide(index);
        },

        bindHandlers: function () {
            var _this = this;

            for (var i = 0, l = this.tabs.length; i < l; i++) {
                var tab = this.tabs[i], panel = dom.getEl('#' + tab.getAttribute('aria-controls'));

                tab.addEventListener('click', _this.handleTabClick.bind(_this));

                tab.addEventListener('keydown', _this.handleTabKeyDown.bind(_this));
                tab.addEventListener('keypress', _this.handleTabKeyPress.bind(_this));
                tab.addEventListener('focus', _this.handleTabFocus.bind(_this));
                tab.addEventListener('blur', _this.handleTabBlur.bind(_this));
                panel.addEventListener('keydown', _this.handlePanelKeyDown.bind(_this));
                panel.addEventListener('keypress', _this.handlePanelKeyPress.bind(_this));
            }
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
                    this.showPanel(this.swipe.getNumSlides() - 1);

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
            var tab = e.target, panel = this.getPanel(tab), panelIndex;
            this.showPanel(dom.getElIndex(panel));
        },
        handleTabFocus: function (e) {
            dom.addClass(e.target, 'focus');
        },
        handleTabBlur: function (e) {
            dom.removeClass(e.target, 'focus');
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
            var current = this.swipe.getPos();
            for (var i = 0, l = this.panels.length; i < l; i++) {
                var panel = this.panels[i], tab = this.getTab(panel);
                if (current === i) {
                    panel.setAttribute('aria-hidden', 'false');
                    panel.removeAttribute('tabindex');
                    dom.addClass(panel, 'selected');
                    tab.removeAttribute('tabindex');

                    var panelLinks = dom.getElAll('a, input, button, select, textarea, iframe', panel);
                    for (var j = 0, jl = panelLinks.length; j < jl; j++) {
                        panelLinks[j].removeAttribute('tabindex');
                    }

                    if (doFocusTab) {
                        tab.focus();
                    }
                } else {
                    panel.setAttribute('aria-hidden', 'true');
                    panel.setAttribute('tabindex', '-1');
                    dom.removeClass(panel, 'selected');
                    tab.setAttribute('tabindex', '-1');

                    var panelLinks = dom.getElAll('a, input, button, select, textarea, iframe', panel);
                    for (var j = 0, jl = panelLinks.length; j < jl; j++) {
                        panelLinks[j].setAttribute('tabindex', '-1');
                    }
                }

            }
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

    // DOM helpers
    var dom = (function () {

        return {
            createEl: function (tagname) {
                return document.createElement(tagname);
            },
            getEl: function (selector, context) {
                return context ? context.querySelector(selector) : document.querySelector(selector);
            },
            getElAll: function (selector, context) {
                return context ? context.querySelectorAll(selector) : document.querySelectorAll(selector);
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
            },

            addClass: function (elem, className) {
                if (!this.hasClass(elem, className)) {
                    elem.className += ' ' + className;
                }
            },

            removeClass: function (elem, className) {
                var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
                if (this.hasClass(elem, className)) {
                    while (newClass.indexOf(' ' + className + ' ') >= 0) {
                        newClass = newClass.replace(' ' + className + ' ', ' ');
                    }
                    elem.className = newClass.replace(/^\s+|\s+$/g, '');
                }
            },
            toggleClass: function (elem, className) {
                var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
                if (this.hasClass(elem, className)) {
                    while (newClass.indexOf(' ' + className + ' ') >= 0) {
                        newClass = newClass.replace(' ' + className + ' ', ' ');
                    }
                    elem.className = newClass.replace(/^\s+|\s+$/g, '');
                } else {
                    elem.className += ' ' + className;
                }
            }
        };
    })();

    // Polyfill bind
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis
                            ? this
                            : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    return new SwipeTabPanel('#mySwipe');

})(Swipe);

