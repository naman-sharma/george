(function () { /*

 Copyright 2015 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
    var componentHandler = {
        upgradeDom: function (optJsClass, optCssClass) {
        }, upgradeElement: function (element, optJsClass) {
        }, upgradeElements: function (elements) {
        }, upgradeAllRegistered: function () {
        }, registerUpgradedCallback: function (jsClass, callback) {
        }, register: function (config) {
        }, downgradeElements: function (nodes) {
        }
    };
    componentHandler = function () {
        var registeredComponents_ = [];
        var createdComponents_ = [];
        var componentConfigProperty_ = "mdlComponentConfigInternal_";

        function findRegisteredClass_(name, optReplace) {
            for (var i = 0; i < registeredComponents_.length; i++)if (registeredComponents_[i].className === name) {
                if (typeof optReplace !== "undefined") registeredComponents_[i] = optReplace;
                return registeredComponents_[i]
            }
            return false
        }

        function getUpgradedListOfElement_(element) {
            var dataUpgraded = element.getAttribute("data-upgraded");
            return dataUpgraded ===
            null ? [""] : dataUpgraded.split(",")
        }

        function isElementUpgraded_(element, jsClass) {
            var upgradedList = getUpgradedListOfElement_(element);
            return upgradedList.indexOf(jsClass) !== -1
        }

        function createEvent_(eventType, bubbles, cancelable) {
            if ("CustomEvent" in window && typeof window.CustomEvent === "function")return new CustomEvent(eventType, {
                bubbles: bubbles,
                cancelable: cancelable
            }); else {
                var ev = document.createEvent("Events");
                ev.initEvent(eventType, bubbles, cancelable);
                return ev
            }
        }

        function upgradeDomInternal(optJsClass,
                                    optCssClass) {
            if (typeof optJsClass === "undefined" && typeof optCssClass === "undefined")for (var i = 0; i < registeredComponents_.length; i++)upgradeDomInternal(registeredComponents_[i].className, registeredComponents_[i].cssClass); else {
                var jsClass = (optJsClass);
                if (typeof optCssClass === "undefined") {
                    var registeredClass = findRegisteredClass_(jsClass);
                    if (registeredClass) optCssClass = registeredClass.cssClass
                }
                var elements = document.querySelectorAll("." + optCssClass);
                for (var n = 0; n < elements.length; n++)upgradeElementInternal(elements[n],
                    jsClass)
            }
        }

        function upgradeElementInternal(element, optJsClass) {
            if (!(typeof element === "object" && element instanceof Element))throw new Error("Invalid argument provided to upgrade MDL element.");
            var upgradingEv = createEvent_("mdl-componentupgrading", true, true);
            element.dispatchEvent(upgradingEv);
            if (upgradingEv.defaultPrevented)return;
            var upgradedList = getUpgradedListOfElement_(element);
            var classesToUpgrade = [];
            if (!optJsClass) {
                var classList = element.classList;
                registeredComponents_.forEach(function (component) {
                    if (classList.contains(component.cssClass) &&
                        classesToUpgrade.indexOf(component) === -1 && !isElementUpgraded_(element, component.className)) classesToUpgrade.push(component)
                })
            } else if (!isElementUpgraded_(element, optJsClass)) classesToUpgrade.push(findRegisteredClass_(optJsClass));
            for (var i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
                registeredClass = classesToUpgrade[i];
                if (registeredClass) {
                    upgradedList.push(registeredClass.className);
                    element.setAttribute("data-upgraded", upgradedList.join(","));
                    var instance = new registeredClass.classConstructor(element);
                    instance[componentConfigProperty_] = registeredClass;
                    createdComponents_.push(instance);
                    for (var j = 0, m = registeredClass.callbacks.length; j < m; j++)registeredClass.callbacks[j](element);
                    if (registeredClass.widget) element[registeredClass.className] = instance
                } else throw new Error("Unable to find a registered component for the given class.");
                var upgradedEv = createEvent_("mdl-componentupgraded", true, false);
                element.dispatchEvent(upgradedEv)
            }
        }

        function upgradeElementsInternal(elements) {
            if (!Array.isArray(elements))if (elements instanceof Element) elements = [elements]; else elements = Array.prototype.slice.call(elements);
            for (var i = 0, n = elements.length, element; i < n; i++) {
                element = elements[i];
                if (element instanceof HTMLElement) {
                    upgradeElementInternal(element);
                    if (element.children.length > 0) upgradeElementsInternal(element.children)
                }
            }
        }

        function registerInternal(config) {
            var widgetMissing = typeof config.widget === "undefined" && typeof config["widget"] === "undefined";
            var widget = true;
            if (!widgetMissing) widget = config.widget || config["widget"];
            var newConfig = ({
                classConstructor: config.constructor ||
                config["constructor"],
                className: config.classAsString || config["classAsString"],
                cssClass: config.cssClass || config["cssClass"],
                widget: widget,
                callbacks: []
            });
            registeredComponents_.forEach(function (item) {
                if (item.cssClass === newConfig.cssClass)throw new Error("The provided cssClass has already been registered: " + item.cssClass);
                if (item.className === newConfig.className)throw new Error("The provided className has already been registered");
            });
            if (config.constructor.prototype.hasOwnProperty(componentConfigProperty_))throw new Error("MDL component classes must not have " +
                componentConfigProperty_ + " defined as a property.");
            var found = findRegisteredClass_(config.classAsString, newConfig);
            if (!found) registeredComponents_.push(newConfig)
        }

        function registerUpgradedCallbackInternal(jsClass, callback) {
            var regClass = findRegisteredClass_(jsClass);
            if (regClass) regClass.callbacks.push(callback)
        }

        function upgradeAllRegisteredInternal() {
            for (var n = 0; n < registeredComponents_.length; n++)upgradeDomInternal(registeredComponents_[n].className)
        }

        function deconstructComponentInternal(component) {
            if (component) {
                var componentIndex =
                    createdComponents_.indexOf(component);
                createdComponents_.splice(componentIndex, 1);
                var upgrades = component.element_.getAttribute("data-upgraded").split(",");
                var componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
                upgrades.splice(componentPlace, 1);
                component.element_.setAttribute("data-upgraded", upgrades.join(","));
                var ev = createEvent_("mdl-componentdowngraded", true, false);
                component.element_.dispatchEvent(ev)
            }
        }

        function downgradeNodesInternal(nodes) {
            var downgradeNode = function (node) {
                createdComponents_.filter(function (item) {
                    return item.element_ ===
                        node
                }).forEach(deconstructComponentInternal)
            };
            if (nodes instanceof Array || nodes instanceof NodeList)for (var n = 0; n < nodes.length; n++)downgradeNode(nodes[n]); else if (nodes instanceof Node) downgradeNode(nodes); else throw new Error("Invalid argument provided to downgrade MDL nodes.");
        }

        return {
            upgradeDom: upgradeDomInternal,
            upgradeElement: upgradeElementInternal,
            upgradeElements: upgradeElementsInternal,
            upgradeAllRegistered: upgradeAllRegisteredInternal,
            registerUpgradedCallback: registerUpgradedCallbackInternal,
            register: registerInternal,
            downgradeElements: downgradeNodesInternal
        }
    }();
    componentHandler.ComponentConfigPublic;
    componentHandler.ComponentConfig;
    componentHandler.Component;
    componentHandler["upgradeDom"] = componentHandler.upgradeDom;
    componentHandler["upgradeElement"] = componentHandler.upgradeElement;
    componentHandler["upgradeElements"] = componentHandler.upgradeElements;
    componentHandler["upgradeAllRegistered"] = componentHandler.upgradeAllRegistered;
    componentHandler["registerUpgradedCallback"] = componentHandler.registerUpgradedCallback;
    componentHandler["register"] = componentHandler.register;
    componentHandler["downgradeElements"] = componentHandler.downgradeElements;
    window.componentHandler = componentHandler;
    window["componentHandler"] = componentHandler;
    window.addEventListener("load", function () {
        if ("classList" in document.createElement("div") && "querySelector" in document && "addEventListener" in window && Array.prototype.forEach) {
            document.documentElement.classList.add("mdl-js");
            componentHandler.upgradeAllRegistered()
        } else {
            componentHandler.upgradeElement = function () {
            };
            componentHandler.register = function () {
            }
        }
    });
    (function () {
        var MaterialButton = function MaterialButton(element) {
            this.element_ = element;
            this.init()
        };
        window["MaterialButton"] = MaterialButton;
        MaterialButton.prototype.Constant_ = {};
        MaterialButton.prototype.CssClasses_ = {
            RIPPLE_EFFECT: "mdl-js-ripple-effect",
            RIPPLE_CONTAINER: "mdl-button__ripple-container",
            RIPPLE: "mdl-ripple"
        };
        MaterialButton.prototype.blurHandler_ = function (event) {
            if (event) this.element_.blur()
        };
        MaterialButton.prototype.disable = function () {
            this.element_.disabled = true
        };
        MaterialButton.prototype["disable"] =
            MaterialButton.prototype.disable;
        MaterialButton.prototype.enable = function () {
            this.element_.disabled = false
        };
        MaterialButton.prototype["enable"] = MaterialButton.prototype.enable;
        MaterialButton.prototype.init = function () {
            if (this.element_) {
                if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
                    var rippleContainer = document.createElement("span");
                    rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
                    this.rippleElement_ = document.createElement("span");
                    this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
                    rippleContainer.appendChild(this.rippleElement_);
                    this.boundRippleBlurHandler = this.blurHandler_.bind(this);
                    this.rippleElement_.addEventListener("mouseup", this.boundRippleBlurHandler);
                    this.element_.appendChild(rippleContainer)
                }
                this.boundButtonBlurHandler = this.blurHandler_.bind(this);
                this.element_.addEventListener("mouseup", this.boundButtonBlurHandler);
                this.element_.addEventListener("mouseleave", this.boundButtonBlurHandler)
            }
        };
        componentHandler.register({
            constructor: MaterialButton, classAsString: "MaterialButton",
            cssClass: "mdl-js-button", widget: true
        })
    })();
    (function () {
        var MaterialProgress = function MaterialProgress(element) {
            this.element_ = element;
            this.init()
        };
        window["MaterialProgress"] = MaterialProgress;
        MaterialProgress.prototype.Constant_ = {};
        MaterialProgress.prototype.CssClasses_ = {INDETERMINATE_CLASS: "mdl-progress__indeterminate"};
        MaterialProgress.prototype.setProgress = function (p) {
            if (this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS))return;
            this.progressbar_.style.width = p + "%"
        };
        MaterialProgress.prototype["setProgress"] = MaterialProgress.prototype.setProgress;
        MaterialProgress.prototype.setBuffer = function (p) {
            this.bufferbar_.style.width = p + "%";
            this.auxbar_.style.width = 100 - p + "%"
        };
        MaterialProgress.prototype["setBuffer"] = MaterialProgress.prototype.setBuffer;
        MaterialProgress.prototype.init = function () {
            if (this.element_) {
                var el = document.createElement("div");
                el.className = "progressbar bar bar1";
                this.element_.appendChild(el);
                this.progressbar_ = el;
                el = document.createElement("div");
                el.className = "bufferbar bar bar2";
                this.element_.appendChild(el);
                this.bufferbar_ = el;
                el = document.createElement("div");
                el.className = "auxbar bar bar3";
                this.element_.appendChild(el);
                this.auxbar_ = el;
                this.progressbar_.style.width = "0%";
                this.bufferbar_.style.width = "100%";
                this.auxbar_.style.width = "0%";
                this.element_.classList.add("is-upgraded")
            }
        };
        componentHandler.register({
            constructor: MaterialProgress,
            classAsString: "MaterialProgress",
            cssClass: "mdl-js-progress",
            widget: true
        })
    })();
    (function () {
        var MaterialTextfield = function MaterialTextfield(element) {
            this.element_ = element;
            this.maxRows = this.Constant_.NO_MAX_ROWS;
            this.init()
        };
        window["MaterialTextfield"] = MaterialTextfield;
        MaterialTextfield.prototype.Constant_ = {NO_MAX_ROWS: -1, MAX_ROWS_ATTRIBUTE: "maxrows"};
        MaterialTextfield.prototype.CssClasses_ = {
            LABEL: "mdl-textfield__label",
            INPUT: "mdl-textfield__input",
            IS_DIRTY: "is-dirty",
            IS_FOCUSED: "is-focused",
            IS_DISABLED: "is-disabled",
            IS_INVALID: "is-invalid",
            IS_UPGRADED: "is-upgraded",
            HAS_PLACEHOLDER: "has-placeholder"
        };
        MaterialTextfield.prototype.onKeyDown_ = function (event) {
            var currentRowCount = event.target.value.split("\n").length;
            if (event.keyCode === 13)if (currentRowCount >= this.maxRows) event.preventDefault()
        };
        MaterialTextfield.prototype.onFocus_ = function (event) {
            this.element_.classList.add(this.CssClasses_.IS_FOCUSED)
        };
        MaterialTextfield.prototype.onBlur_ = function (event) {
            this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)
        };
        MaterialTextfield.prototype.onReset_ = function (event) {
            this.updateClasses_()
        };
        MaterialTextfield.prototype.updateClasses_ =
            function () {
                this.checkDisabled();
                this.checkValidity();
                this.checkDirty();
                this.checkFocus()
            };
        MaterialTextfield.prototype.checkDisabled = function () {
            if (this.input_.disabled) this.element_.classList.add(this.CssClasses_.IS_DISABLED); else this.element_.classList.remove(this.CssClasses_.IS_DISABLED)
        };
        MaterialTextfield.prototype["checkDisabled"] = MaterialTextfield.prototype.checkDisabled;
        MaterialTextfield.prototype.checkFocus = function () {
            if (Boolean(this.element_.querySelector(":focus"))) this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
            else this.element_.classList.remove(this.CssClasses_.IS_FOCUSED)
        };
        MaterialTextfield.prototype["checkFocus"] = MaterialTextfield.prototype.checkFocus;
        MaterialTextfield.prototype.checkValidity = function () {
            if (this.input_.validity)if (this.input_.validity.valid) this.element_.classList.remove(this.CssClasses_.IS_INVALID); else this.element_.classList.add(this.CssClasses_.IS_INVALID)
        };
        MaterialTextfield.prototype["checkValidity"] = MaterialTextfield.prototype.checkValidity;
        MaterialTextfield.prototype.checkDirty =
            function () {
                if (this.input_.value && this.input_.value.length > 0) this.element_.classList.add(this.CssClasses_.IS_DIRTY); else this.element_.classList.remove(this.CssClasses_.IS_DIRTY)
            };
        MaterialTextfield.prototype["checkDirty"] = MaterialTextfield.prototype.checkDirty;
        MaterialTextfield.prototype.disable = function () {
            this.input_.disabled = true;
            this.updateClasses_()
        };
        MaterialTextfield.prototype["disable"] = MaterialTextfield.prototype.disable;
        MaterialTextfield.prototype.enable = function () {
            this.input_.disabled = false;
            this.updateClasses_()
        };
        MaterialTextfield.prototype["enable"] = MaterialTextfield.prototype.enable;
        MaterialTextfield.prototype.change = function (value) {
            this.input_.value = value || "";
            this.updateClasses_()
        };
        MaterialTextfield.prototype["change"] = MaterialTextfield.prototype.change;
        MaterialTextfield.prototype.init = function () {
            if (this.element_) {
                this.label_ = this.element_.querySelector("." + this.CssClasses_.LABEL);
                this.input_ = this.element_.querySelector("." + this.CssClasses_.INPUT);
                if (this.input_) {
                    if (this.input_.hasAttribute((this.Constant_.MAX_ROWS_ATTRIBUTE))) {
                        this.maxRows =
                            parseInt(this.input_.getAttribute((this.Constant_.MAX_ROWS_ATTRIBUTE)), 10);
                        if (isNaN(this.maxRows)) this.maxRows = this.Constant_.NO_MAX_ROWS
                    }
                    if (this.input_.hasAttribute("placeholder")) this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER);
                    this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
                    this.boundFocusHandler = this.onFocus_.bind(this);
                    this.boundBlurHandler = this.onBlur_.bind(this);
                    this.boundResetHandler = this.onReset_.bind(this);
                    this.input_.addEventListener("input", this.boundUpdateClassesHandler);
                    this.input_.addEventListener("focus", this.boundFocusHandler);
                    this.input_.addEventListener("blur", this.boundBlurHandler);
                    this.input_.addEventListener("reset", this.boundResetHandler);
                    if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
                        this.boundKeyDownHandler = this.onKeyDown_.bind(this);
                        this.input_.addEventListener("keydown", this.boundKeyDownHandler)
                    }
                    var invalid = this.element_.classList.contains(this.CssClasses_.IS_INVALID);
                    this.updateClasses_();
                    this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
                    if (invalid) this.element_.classList.add(this.CssClasses_.IS_INVALID);
                    if (this.input_.hasAttribute("autofocus")) {
                        this.element_.focus();
                        this.checkFocus()
                    }
                }
            }
        };
        componentHandler.register({
            constructor: MaterialTextfield,
            classAsString: "MaterialTextfield",
            cssClass: "mdl-js-textfield",
            widget: true
        })
    })();
    (function () {
        var h, l = this;

        function m(a) {
            return void 0 !== a
        }

        function aa() {
        }

        function ba(a) {
            var b = typeof a;
            if ("object" == b)if (a) {
                if (a instanceof Array)return "array";
                if (a instanceof Object)return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c)return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice"))return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call"))return "function"
            } else return "null"; else if ("function" == b && "undefined" == typeof a.call)return "object";
            return b
        }

        function ca(a) {
            return null != a
        }

        function da(a) {
            return "array" == ba(a)
        }

        function ea(a) {
            var b = ba(a);
            return "array" == b || "object" == b && "number" == typeof a.length
        }

        function n(a) {
            return "string" == typeof a
        }

        function p(a) {
            return "function" == ba(a)
        }

        function fa(a) {
            var b = typeof a;
            return "object" == b && null != a || "function" == b
        }

        var ga = "closure_uid_" + (1E9 * Math.random() >>>
            0), ha = 0;

        function ia(a, b, c) {
            return a.call.apply(a.bind, arguments)
        }

        function ja(a, b, c) {
            if (!a)throw Error();
            if (2 < arguments.length) {
                var d = Array.prototype.slice.call(arguments, 2);
                return function () {
                    var c = Array.prototype.slice.call(arguments);
                    Array.prototype.unshift.apply(c, d);
                    return a.apply(b, c)
                }
            }
            return function () {
                return a.apply(b, arguments)
            }
        }

        function q(a, b, c) {
            q = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ia : ja;
            return q.apply(null, arguments)
        }

        function ka(a, b) {
            var c =
                Array.prototype.slice.call(arguments, 1);
            return function () {
                var b = c.slice();
                b.push.apply(b, arguments);
                return a.apply(this, b)
            }
        }

        function r(a, b) {
            for (var c in b)a[c] = b[c]
        }

        var la = Date.now || function () {
                return +new Date
            };

        function ma(a, b) {
            var c = a.split("."), d = l;
            c[0] in d || !d.execScript || d.execScript("var " + c[0]);
            for (var e; c.length && (e = c.shift());)!c.length && m(b) ? d[e] = b : d = d[e] ? d[e] : d[e] = {}
        }

        function t(a, b) {
            function c() {
            }

            c.prototype = b.prototype;
            a.c = b.prototype;
            a.prototype = new c;
            a.prototype.constructor = a;
            a.Md = function (a,
                             c, f) {
                for (var g = Array(arguments.length - 2), k = 2; k < arguments.length; k++)g[k - 2] = arguments[k];
                return b.prototype[c].apply(a, g)
            }
        }

        function v(a) {
            if (Error.captureStackTrace) Error.captureStackTrace(this, v); else {
                var b = Error().stack;
                b && (this.stack = b)
            }
            a && (this.message = String(a))
        }

        t(v, Error);
        v.prototype.name = "CustomError";
        var oa;

        function pa(a, b) {
            for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1); e.length && 1 < c.length;)d += c.shift() + e.shift();
            return d + c.join("%s")
        }

        var qa = String.prototype.trim ? function (a) {
                return a.trim()
            } :
            function (a) {
                return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
            };

        function ra(a) {
            if (!sa.test(a))return a;
            -1 != a.indexOf("&") && (a = a.replace(ta, "&amp;"));
            -1 != a.indexOf("<") && (a = a.replace(ua, "&lt;"));
            -1 != a.indexOf(">") && (a = a.replace(va, "&gt;"));
            -1 != a.indexOf('"') && (a = a.replace(wa, "&quot;"));
            -1 != a.indexOf("'") && (a = a.replace(xa, "&#39;"));
            -1 != a.indexOf("\x00") && (a = a.replace(ya, "&#0;"));
            return a
        }

        var ta = /&/g, ua = /</g, va = />/g, wa = /"/g, xa = /'/g, ya = /\x00/g, sa = /[\x00&<>"']/;

        function za(a, b) {
            return a < b ? -1 : a > b ? 1 : 0
        }

        function Aa(a,
                    b) {
            b.unshift(a);
            v.call(this, pa.apply(null, b));
            b.shift()
        }

        t(Aa, v);
        Aa.prototype.name = "AssertionError";
        function Ba(a, b) {
            throw new Aa("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1));
        }

        var Ca = Array.prototype.indexOf ? function (a, b, c) {
                return Array.prototype.indexOf.call(a, b, c)
            } : function (a, b, c) {
                c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
                if (n(a))return n(b) && 1 == b.length ? a.indexOf(b, c) : -1;
                for (; c < a.length; c++)if (c in a && a[c] === b)return c;
                return -1
            }, Da = Array.prototype.forEach ? function (a, b, c) {
                Array.prototype.forEach.call(a,
                    b, c)
            } : function (a, b, c) {
                for (var d = a.length, e = n(a) ? a.split("") : a, f = 0; f < d; f++)f in e && b.call(c, e[f], f, a)
            };

        function Ea(a, b) {
            for (var c = n(a) ? a.split("") : a, d = a.length - 1; 0 <= d; --d)d in c && b.call(void 0, c[d], d, a)
        }

        var Fa = Array.prototype.filter ? function (a, b, c) {
                return Array.prototype.filter.call(a, b, c)
            } : function (a, b, c) {
                for (var d = a.length, e = [], f = 0, g = n(a) ? a.split("") : a, k = 0; k < d; k++)if (k in g) {
                    var u = g[k];
                    b.call(c, u, k, a) && (e[f++] = u)
                }
                return e
            }, Ga = Array.prototype.map ? function (a, b, c) {
                return Array.prototype.map.call(a,
                    b, c)
            } : function (a, b, c) {
                for (var d = a.length, e = Array(d), f = n(a) ? a.split("") : a, g = 0; g < d; g++)g in f && (e[g] = b.call(c, f[g], g, a));
                return e
            }, Ha = Array.prototype.some ? function (a, b, c) {
                return Array.prototype.some.call(a, b, c)
            } : function (a, b, c) {
                for (var d = a.length, e = n(a) ? a.split("") : a, f = 0; f < d; f++)if (f in e && b.call(c, e[f], f, a))return !0;
                return !1
            };

        function Ia(a, b, c) {
            for (var d = a.length, e = n(a) ? a.split("") : a, f = 0; f < d; f++)if (f in e && b.call(c, e[f], f, a))return f;
            return -1
        }

        function Ja(a, b) {
            return 0 <= Ca(a, b)
        }

        function Ka(a, b) {
            var c =
                Ca(a, b), d;
            (d = 0 <= c) && La(a, c);
            return d
        }

        function La(a, b) {
            return 1 == Array.prototype.splice.call(a, b, 1).length
        }

        function Ma(a, b) {
            var c = Ia(a, b, void 0);
            0 <= c && La(a, c)
        }

        function Na(a, b) {
            var c = 0;
            Ea(a, function (d, e) {
                b.call(void 0, d, e, a) && La(a, e) && c++
            })
        }

        function Oa(a) {
            return Array.prototype.concat.apply(Array.prototype, arguments)
        }

        function Pa(a) {
            var b = a.length;
            if (0 < b) {
                for (var c = Array(b), d = 0; d < b; d++)c[d] = a[d];
                return c
            }
            return []
        }

        var Qa;
        a:{
            var Ra = l.navigator;
            if (Ra) {
                var Sa = Ra.userAgent;
                if (Sa) {
                    Qa = Sa;
                    break a
                }
            }
            Qa = ""
        }
        function w(a) {
            return -1 !=
                Qa.indexOf(a)
        }

        function Ta(a, b, c) {
            for (var d in a)b.call(c, a[d], d, a)
        }

        function Ua(a, b) {
            for (var c in a)if (b.call(void 0, a[c], c, a))return !0;
            return !1
        }

        function Va(a) {
            var b = [], c = 0, d;
            for (d in a)b[c++] = a[d];
            return b
        }

        function Wa(a) {
            var b = [], c = 0, d;
            for (d in a)b[c++] = d;
            return b
        }

        var Xa = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");

        function Ya(a, b) {
            for (var c, d, e = 1; e < arguments.length; e++) {
                d = arguments[e];
                for (c in d)a[c] = d[c];
                for (var f = 0; f < Xa.length; f++)c =
                    Xa[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
            }
        }

        var Za = w("Opera"), x = w("Trident") || w("MSIE"), $a = w("Edge"), ab = $a || x, bb = w("Gecko") && !(-1 != Qa.toLowerCase().indexOf("webkit") && !w("Edge")) && !(w("Trident") || w("MSIE")) && !w("Edge"), y = -1 != Qa.toLowerCase().indexOf("webkit") && !w("Edge"), cb = y && w("Mobile"), db = w("Macintosh");

        function eb() {
            var a = l.document;
            return a ? a.documentMode : void 0
        }

        var fb;
        a:{
            var gb = "", hb = function () {
                var a = Qa;
                if (bb)return /rv\:([^\);]+)(\)|;)/.exec(a);
                if ($a)return /Edge\/([\d\.]+)/.exec(a);
                if (x)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
                if (y)return /WebKit\/(\S+)/.exec(a);
                if (Za)return /(?:Version)[ \/]?(\S+)/.exec(a)
            }();
            hb && (gb = hb ? hb[1] : "");
            if (x) {
                var ib = eb();
                if (null != ib && ib > parseFloat(gb)) {
                    fb = String(ib);
                    break a
                }
            }
            fb = gb
        }
        var jb = {};

        function z(a) {
            var b;
            if (!(b = jb[a])) {
                b = 0;
                for (var c = qa(String(fb)).split("."), d = qa(String(a)).split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
                    var g = c[f] || "", k = d[f] || "", u = RegExp("(\\d*)(\\D*)", "g"), B = RegExp("(\\d*)(\\D*)", "g");
                    do {
                        var na = u.exec(g) ||
                            ["", "", ""], W = B.exec(k) || ["", "", ""];
                        if (0 == na[0].length && 0 == W[0].length)break;
                        b = za(0 == na[1].length ? 0 : parseInt(na[1], 10), 0 == W[1].length ? 0 : parseInt(W[1], 10)) || za(0 == na[2].length, 0 == W[2].length) || za(na[2], W[2])
                    } while (0 == b)
                }
                b = jb[a] = 0 <= b
            }
            return b
        }

        var kb = l.document, lb = kb && x ? eb() || ("CSS1Compat" == kb.compatMode ? parseInt(fb, 10) : 5) : void 0;
        var mb = !x || 9 <= Number(lb), nb = !bb && !x || x && 9 <= Number(lb) || bb && z("1.9.1");
        x && z("9");
        function ob() {
            this.pa = "";
            this.Lc = pb
        }

        ob.prototype.oc = !0;
        ob.prototype.mc = function () {
            return 1
        };
        ob.prototype.toString =
            function () {
                return "SafeUrl{" + this.pa + "}"
            };
        function qb(a) {
            if (a instanceof ob && a.constructor === ob && a.Lc === pb)return a.pa;
            Ba("expected object of type SafeUrl, got '" + a + "' of type " + ba(a));
            return "type_error:SafeUrl"
        }

        var rb = /^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i;

        function sb(a) {
            if (a instanceof ob)return a;
            a = a.oc ? a.pa : String(a);
            rb.test(a) || (a = "about:invalid#zClosurez");
            return tb(a)
        }

        var pb = {};

        function tb(a) {
            var b = new ob;
            b.pa = a;
            return b
        }

        tb("about:blank");
        function ub() {
            this.pa = "";
            this.Kc = vb;
            this.hc =
                null
        }

        ub.prototype.mc = function () {
            return this.hc
        };
        ub.prototype.oc = !0;
        ub.prototype.toString = function () {
            return "SafeHtml{" + this.pa + "}"
        };
        function wb(a) {
            if (a instanceof ub && a.constructor === ub && a.Kc === vb)return a.pa;
            Ba("expected object of type SafeHtml, got '" + a + "' of type " + ba(a));
            return "type_error:SafeHtml"
        }

        var vb = {};
        ub.prototype.fd = function (a) {
            this.pa = a;
            this.hc = null;
            return this
        };
        function xb(a) {
            return a ? new yb(zb(a)) : oa || (oa = new yb)
        }

        function Ab(a, b) {
            var c = b || document;
            return c.querySelectorAll && c.querySelector ?
                c.querySelectorAll("." + a) : Bb(a, b)
        }

        function Bb(a, b) {
            var c, d, e, f;
            c = document;
            c = b || c;
            if (c.querySelectorAll && c.querySelector && a)return c.querySelectorAll("" + (a ? "." + a : ""));
            if (a && c.getElementsByClassName) {
                var g = c.getElementsByClassName(a);
                return g
            }
            g = c.getElementsByTagName("*");
            if (a) {
                f = {};
                for (d = e = 0; c = g[d]; d++) {
                    var k = c.className;
                    "function" == typeof k.split && Ja(k.split(/\s+/), a) && (f[e++] = c)
                }
                f.length = e;
                return f
            }
            return g
        }

        function Cb(a, b) {
            Ta(b, function (b, d) {
                "style" == d ? a.style.cssText = b : "class" == d ? a.className = b :
                        "for" == d ? a.htmlFor = b : Db.hasOwnProperty(d) ? a.setAttribute(Db[d], b) : 0 == d.lastIndexOf("aria-", 0) || 0 == d.lastIndexOf("data-", 0) ? a.setAttribute(d, b) : a[d] = b
            })
        }

        var Db = {
            cellpadding: "cellPadding",
            cellspacing: "cellSpacing",
            colspan: "colSpan",
            frameborder: "frameBorder",
            height: "height",
            maxlength: "maxLength",
            nonce: "nonce",
            role: "role",
            rowspan: "rowSpan",
            type: "type",
            usemap: "useMap",
            valign: "vAlign",
            width: "width"
        };

        function Eb(a, b, c, d) {
            function e(c) {
                c && b.appendChild(n(c) ? a.createTextNode(c) : c)
            }

            for (; d < c.length; d++) {
                var f =
                    c[d];
                !ea(f) || fa(f) && 0 < f.nodeType ? e(f) : Da(Fb(f) ? Pa(f) : f, e)
            }
        }

        function Gb(a) {
            return a && a.parentNode ? a.parentNode.removeChild(a) : null
        }

        function zb(a) {
            return 9 == a.nodeType ? a : a.ownerDocument || a.document
        }

        function Fb(a) {
            if (a && "number" == typeof a.length) {
                if (fa(a))return "function" == typeof a.item || "string" == typeof a.item;
                if (p(a))return "function" == typeof a.item
            }
            return !1
        }

        function Hb(a) {
            return Ib(a, function (a) {
                return n(a.className) && Ja(a.className.split(/\s+/), "firebaseui-textfield")
            })
        }

        function Ib(a, b) {
            for (var c =
                0; a;) {
                if (b(a))return a;
                a = a.parentNode;
                c++
            }
            return null
        }

        function yb(a) {
            this.ua = a || l.document || document
        }

        h = yb.prototype;
        h.ib = xb;
        h.L = function (a) {
            return n(a) ? this.ua.getElementById(a) : a
        };
        h.Mb = function (a, b) {
            return Ab(a, b || this.ua)
        };
        h.C = function (a, b) {
            var c = b || this.ua, d = c || document;
            return (d.getElementsByClassName ? d.getElementsByClassName(a)[0] : d.querySelectorAll && d.querySelector ? d.querySelector("." + a) : Bb(a, c)[0]) || null
        };
        h.Ib = function (a, b, c) {
            var d = this.ua, e = arguments, f = String(e[0]), g = e[1];
            if (!mb && g && (g.name ||
                g.type)) {
                f = ["<", f];
                g.name && f.push(' name="', ra(g.name), '"');
                if (g.type) {
                    f.push(' type="', ra(g.type), '"');
                    var k = {};
                    Ya(k, g);
                    delete k.type;
                    g = k
                }
                f.push(">");
                f = f.join("")
            }
            f = d.createElement(f);
            g && (n(g) ? f.className = g : da(g) ? f.className = g.join(" ") : Cb(f, g));
            2 < e.length && Eb(d, f, e, 2);
            return f
        };
        h.createElement = function (a) {
            return this.ua.createElement(String(a))
        };
        h.createTextNode = function (a) {
            return this.ua.createTextNode(String(a))
        };
        h.appendChild = function (a, b) {
            a.appendChild(b)
        };
        h.append = function (a, b) {
            Eb(zb(a), a,
                arguments, 1)
        };
        h.canHaveChildren = function (a) {
            if (1 != a.nodeType)return !1;
            switch (a.tagName) {
                case "APPLET":
                case "AREA":
                case "BASE":
                case "BR":
                case "COL":
                case "COMMAND":
                case "EMBED":
                case "FRAME":
                case "HR":
                case "IMG":
                case "INPUT":
                case "IFRAME":
                case "ISINDEX":
                case "KEYGEN":
                case "LINK":
                case "NOFRAMES":
                case "NOSCRIPT":
                case "META":
                case "OBJECT":
                case "PARAM":
                case "SCRIPT":
                case "SOURCE":
                case "STYLE":
                case "TRACK":
                case "WBR":
                    return !1
            }
            return !0
        };
        h.removeNode = Gb;
        h.lc = function (a) {
            return nb && void 0 != a.children ? a.children :
                Fa(a.childNodes, function (a) {
                    return 1 == a.nodeType
                })
        };
        h.contains = function (a, b) {
            if (!a || !b)return !1;
            if (a.contains && 1 == b.nodeType)return a == b || a.contains(b);
            if ("undefined" != typeof a.compareDocumentPosition)return a == b || !!(a.compareDocumentPosition(b) & 16);
            for (; b && a != b;)b = b.parentNode;
            return b == a
        };
        x && z(8);
        var Jb = {$d: !0}, Kb = {be: !0}, Lb = {ae: !0};

        function A() {
            throw Error("Do not instantiate directly");
        }

        A.prototype.ha = null;
        A.prototype.toString = function () {
            return this.content
        };
        function Mb(a, b, c, d) {
            a:if (a = a(b || Nb,
                    void 0, c), d = (d || xb()).createElement("DIV"), a = Ob(a), a.match(Pb), d.innerHTML = a, 1 == d.childNodes.length && (a = d.firstChild, 1 == a.nodeType)) {
                d = a;
                break a
            }
            return d
        }

        function Ob(a) {
            if (!fa(a))return String(a);
            if (a instanceof A) {
                if (a.U === Jb)return a.content;
                if (a.U === Lb)return ra(a.content)
            }
            Ba("Soy template output is unsafe for use as HTML: " + a);
            return "zSoyz"
        }

        var Pb = /^<(body|caption|col|colgroup|head|html|tr|td|th|tbody|thead|tfoot)>/i, Nb = {};

        function Qb(a) {
            if (null != a)switch (a.ha) {
                case 1:
                    return 1;
                case -1:
                    return -1;
                case 0:
                    return 0
            }
            return null
        }

        function Rb() {
            A.call(this)
        }

        t(Rb, A);
        Rb.prototype.U = Jb;
        function C(a) {
            return null != a && a.U === Jb ? a : a instanceof ub ? D(wb(a), a.mc()) : D(ra(String(String(a))), Qb(a))
        }

        function Sb() {
            A.call(this)
        }

        t(Sb, A);
        Sb.prototype.U = {Zd: !0};
        Sb.prototype.ha = 1;
        function Tb() {
            A.call(this)
        }

        t(Tb, A);
        Tb.prototype.U = Kb;
        Tb.prototype.ha = 1;
        function Ub() {
            A.call(this)
        }

        t(Ub, A);
        Ub.prototype.U = {Yd: !0};
        Ub.prototype.ha = 1;
        function Vb() {
            A.call(this)
        }

        t(Vb, A);
        Vb.prototype.U = {Xd: !0};
        Vb.prototype.ha = 1;
        function Wb(a, b) {
            this.content =
                String(a);
            this.ha = null != b ? b : null
        }

        t(Wb, A);
        Wb.prototype.U = Lb;
        function Xb(a) {
            function b(a) {
                this.content = a
            }

            b.prototype = a.prototype;
            return function (a) {
                return new b(String(a))
            }
        }

        function E(a) {
            return new Wb(a, void 0)
        }

        var D = function (a) {
            function b(a) {
                this.content = a
            }

            b.prototype = a.prototype;
            return function (a, d) {
                var e = new b(String(a));
                void 0 !== d && (e.ha = d);
                return e
            }
        }(Rb);
        Xb(Sb);
        var Yb = Xb(Tb);
        Xb(Ub);
        Xb(Vb);
        function Zb(a) {
            var b = {label: $b("New password")};

            function c() {
            }

            c.prototype = a;
            a = new c;
            for (var d in b)a[d] = b[d];
            return a
        }

        function $b(a) {
            return (a = String(a)) ? new Wb(a, void 0) : ""
        }

        (function (a) {
            function b(a) {
                this.content = a
            }

            b.prototype = a.prototype;
            return function (a, d) {
                var e = String(a);
                if (!e)return "";
                e = new b(e);
                void 0 !== d && (e.ha = d);
                return e
            }
        })(Rb);
        function ac(a) {
            return null != a && a.U === Jb ? String(String(a.content).replace(bc, "").replace(cc, "&lt;")).replace(dc, ec) : ra(String(a))
        }

        function fc(a) {
            null != a && a.U === Kb ? a = String(a).replace(gc, hc) : a instanceof ob ? a = String(qb(a)).replace(gc, hc) : (a = String(a), ic.test(a) ? a = a.replace(gc,
                            hc) : (Ba("Bad value `%s` for |filterNormalizeUri", [a]), a = "#zSoyz"));
            return a
        }

        var jc = {
            "\x00": "&#0;",
            "\t": "&#9;",
            "\n": "&#10;",
            "\x0B": "&#11;",
            "\f": "&#12;",
            "\r": "&#13;",
            " ": "&#32;",
            '"': "&quot;",
            "&": "&amp;",
            "'": "&#39;",
            "-": "&#45;",
            "/": "&#47;",
            "<": "&lt;",
            "=": "&#61;",
            ">": "&gt;",
            "`": "&#96;",
            "\u0085": "&#133;",
            "\u00a0": "&#160;",
            "\u2028": "&#8232;",
            "\u2029": "&#8233;"
        };

        function ec(a) {
            return jc[a]
        }

        var kc = {
            "\x00": "%00",
            "\u0001": "%01",
            "\u0002": "%02",
            "\u0003": "%03",
            "\u0004": "%04",
            "\u0005": "%05",
            "\u0006": "%06",
            "\u0007": "%07",
            "\b": "%08",
            "\t": "%09",
            "\n": "%0A",
            "\x0B": "%0B",
            "\f": "%0C",
            "\r": "%0D",
            "\u000e": "%0E",
            "\u000f": "%0F",
            "\u0010": "%10",
            "\u0011": "%11",
            "\u0012": "%12",
            "\u0013": "%13",
            "\u0014": "%14",
            "\u0015": "%15",
            "\u0016": "%16",
            "\u0017": "%17",
            "\u0018": "%18",
            "\u0019": "%19",
            "\u001a": "%1A",
            "\u001b": "%1B",
            "\u001c": "%1C",
            "\u001d": "%1D",
            "\u001e": "%1E",
            "\u001f": "%1F",
            " ": "%20",
            '"': "%22",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "<": "%3C",
            ">": "%3E",
            "\\": "%5C",
            "{": "%7B",
            "}": "%7D",
            "\u007f": "%7F",
            "\u0085": "%C2%85",
            "\u00a0": "%C2%A0",
            "\u2028": "%E2%80%A8",
            "\u2029": "%E2%80%A9",
            "\uff01": "%EF%BC%81",
            "\uff03": "%EF%BC%83",
            "\uff04": "%EF%BC%84",
            "\uff06": "%EF%BC%86",
            "\uff07": "%EF%BC%87",
            "\uff08": "%EF%BC%88",
            "\uff09": "%EF%BC%89",
            "\uff0a": "%EF%BC%8A",
            "\uff0b": "%EF%BC%8B",
            "\uff0c": "%EF%BC%8C",
            "\uff0f": "%EF%BC%8F",
            "\uff1a": "%EF%BC%9A",
            "\uff1b": "%EF%BC%9B",
            "\uff1d": "%EF%BC%9D",
            "\uff1f": "%EF%BC%9F",
            "\uff20": "%EF%BC%A0",
            "\uff3b": "%EF%BC%BB",
            "\uff3d": "%EF%BC%BD"
        };

        function hc(a) {
            return kc[a]
        }

        var dc = /[\x00\x22\x27\x3c\x3e]/g, gc = /[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g,
            ic = /^(?![^#?]*\/(?:\.|%2E){2}(?:[\/?#]|$))(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i, bc = /<(?:!|\/?([a-zA-Z][a-zA-Z0-9:\-]*))(?:[^>'"]|"[^"]*"|'[^']*')*>/g, cc = /</g;

        function lc(a) {
            a.prototype.then = a.prototype.then;
            a.prototype.$goog_Thenable = !0
        }

        function mc(a) {
            if (!a)return !1;
            try {
                return !!a.$goog_Thenable
            } catch (b) {
                return !1
            }
        }

        function nc(a, b, c) {
            this.hd = c;
            this.Rc = a;
            this.sd = b;
            this.sb = 0;
            this.nb = null
        }

        nc.prototype.get = function () {
            var a;
            0 < this.sb ? (this.sb--, a = this.nb, this.nb = a.next, a.next = null) : a = this.Rc();
            return a
        };
        nc.prototype.put = function (a) {
            this.sd(a);
            this.sb < this.hd && (this.sb++, a.next = this.nb, this.nb = a)
        };
        function oc() {
            this.Bb = this.La = null
        }

        var qc = new nc(function () {
            return new pc
        }, function (a) {
            a.reset()
        }, 100);
        oc.prototype.add = function (a, b) {
            var c = qc.get();
            c.set(a, b);
            this.Bb ? this.Bb.next = c : this.La = c;
            this.Bb = c
        };
        oc.prototype.remove = function () {
            var a = null;
            this.La && (a = this.La, this.La = this.La.next, this.La || (this.Bb = null), a.next = null);
            return a
        };
        function pc() {
            this.next = this.scope = this.Lb = null
        }

        pc.prototype.set =
            function (a, b) {
                this.Lb = a;
                this.scope = b;
                this.next = null
            };
        pc.prototype.reset = function () {
            this.next = this.scope = this.Lb = null
        };
        function rc(a) {
            l.setTimeout(function () {
                throw a;
            }, 0)
        }

        var sc;

        function tc() {
            var a = l.MessageChannel;
            "undefined" === typeof a && "undefined" !== typeof window && window.postMessage && window.addEventListener && !w("Presto") && (a = function () {
                var a = document.createElement("IFRAME");
                a.style.display = "none";
                a.src = "";
                document.documentElement.appendChild(a);
                var b = a.contentWindow, a = b.document;
                a.open();
                a.write("");
                a.close();
                var c = "callImmediate" + Math.random(), d = "file:" == b.location.protocol ? "*" : b.location.protocol + "//" + b.location.host, a = q(function (a) {
                    if (("*" == d || a.origin == d) && a.data == c) this.port1.onmessage()
                }, this);
                b.addEventListener("message", a, !1);
                this.port1 = {};
                this.port2 = {
                    postMessage: function () {
                        b.postMessage(c, d)
                    }
                }
            });
            if ("undefined" !== typeof a && !w("Trident") && !w("MSIE")) {
                var b = new a, c = {}, d = c;
                b.port1.onmessage = function () {
                    if (m(c.next)) {
                        c = c.next;
                        var a = c.ec;
                        c.ec = null;
                        a()
                    }
                };
                return function (a) {
                    d.next = {ec: a};
                    d = d.next;
                    b.port2.postMessage(0)
                }
            }
            return "undefined" !== typeof document && "onreadystatechange" in document.createElement("SCRIPT") ? function (a) {
                    var b = document.createElement("SCRIPT");
                    b.onreadystatechange = function () {
                        b.onreadystatechange = null;
                        b.parentNode.removeChild(b);
                        b = null;
                        a();
                        a = null
                    };
                    document.documentElement.appendChild(b)
                } : function (a) {
                    l.setTimeout(a, 0)
                }
        }

        function uc(a, b) {
            vc || wc();
            xc || (vc(), xc = !0);
            yc.add(a, b)
        }

        var vc;

        function wc() {
            if (l.Promise && l.Promise.resolve) {
                var a = l.Promise.resolve(void 0);
                vc = function () {
                    a.then(zc)
                }
            } else vc =
                function () {
                    var a = zc;
                    !p(l.setImmediate) || l.Window && l.Window.prototype && !w("Edge") && l.Window.prototype.setImmediate == l.setImmediate ? (sc || (sc = tc()), sc(a)) : l.setImmediate(a)
                }
        }

        var xc = !1, yc = new oc;

        function zc() {
            for (var a; a = yc.remove();) {
                try {
                    a.Lb.call(a.scope)
                } catch (b) {
                    rc(b)
                }
                qc.put(a)
            }
            xc = !1
        }

        function F(a, b) {
            this.T = Ac;
            this.da = void 0;
            this.Ca = this.ea = this.j = null;
            this.kb = this.Kb = !1;
            if (a != aa)try {
                var c = this;
                a.call(b, function (a) {
                    Bc(c, Cc, a)
                }, function (a) {
                    if (!(a instanceof Dc))try {
                        if (a instanceof Error)throw a;
                        throw Error("Promise rejected.");
                    } catch (b$0) {
                    }
                    Bc(c, Ec, a)
                })
            } catch (d) {
                Bc(this, Ec, d)
            }
        }

        var Ac = 0, Cc = 2, Ec = 3;

        function Fc() {
            this.next = this.context = this.Ga = this.Ya = this.sa = null;
            this.cb = !1
        }

        Fc.prototype.reset = function () {
            this.context = this.Ga = this.Ya = this.sa = null;
            this.cb = !1
        };
        var Gc = new nc(function () {
            return new Fc
        }, function (a) {
            a.reset()
        }, 100);

        function Hc(a, b, c) {
            var d = Gc.get();
            d.Ya = a;
            d.Ga = b;
            d.context = c;
            return d
        }

        function Ic(a) {
            if (a instanceof F)return a;
            var b = new F(aa);
            Bc(b, Cc, a);
            return b
        }

        function Jc(a) {
            return new F(function (b, c) {
                c(a)
            })
        }

        F.prototype.then =
            function (a, b, c) {
                return Kc(this, p(a) ? a : null, p(b) ? b : null, c)
            };
        lc(F);
        function Lc(a) {
            var b = Ic(Mc());
            return Kc(b, null, a, void 0)
        }

        F.prototype.cancel = function (a) {
            this.T == Ac && uc(function () {
                var b = new Dc(a);
                Nc(this, b)
            }, this)
        };
        function Nc(a, b) {
            if (a.T == Ac)if (a.j) {
                var c = a.j;
                if (c.ea) {
                    for (var d = 0, e = null, f = null, g = c.ea; g && (g.cb || (d++, g.sa == a && (e = g), !(e && 1 < d))); g = g.next)e || (f = g);
                    e && (c.T == Ac && 1 == d ? Nc(c, b) : (f ? (d = f, d.next == c.Ca && (c.Ca = d), d.next = d.next.next) : Oc(c), Pc(c, e, Ec, b)))
                }
                a.j = null
            } else Bc(a, Ec, b)
        }

        function Qc(a, b) {
            a.ea ||
            a.T != Cc && a.T != Ec || Rc(a);
            a.Ca ? a.Ca.next = b : a.ea = b;
            a.Ca = b
        }

        function Kc(a, b, c, d) {
            var e = Hc(null, null, null);
            e.sa = new F(function (a, g) {
                e.Ya = b ? function (c) {
                        try {
                            var e = b.call(d, c);
                            a(e)
                        } catch (B) {
                            g(B)
                        }
                    } : a;
                e.Ga = c ? function (b) {
                        try {
                            var e = c.call(d, b);
                            !m(e) && b instanceof Dc ? g(b) : a(e)
                        } catch (B) {
                            g(B)
                        }
                    } : g
            });
            e.sa.j = a;
            Qc(a, e);
            return e.sa
        }

        F.prototype.Ad = function (a) {
            this.T = Ac;
            Bc(this, Cc, a)
        };
        F.prototype.Bd = function (a) {
            this.T = Ac;
            Bc(this, Ec, a)
        };
        function Bc(a, b, c) {
            if (a.T == Ac) {
                a === c && (b = Ec, c = new TypeError("Promise cannot resolve to itself"));
                a.T = 1;
                var d;
                a:{
                    var e = c, f = a.Ad, g = a.Bd;
                    if (e instanceof F) Qc(e, Hc(f || aa, g || null, a)), d = !0; else if (mc(e)) e.then(f, g, a), d = !0; else {
                        if (fa(e))try {
                            var k = e.then;
                            if (p(k)) {
                                Sc(e, k, f, g, a);
                                d = !0;
                                break a
                            }
                        } catch (u) {
                            g.call(a, u);
                            d = !0;
                            break a
                        }
                        d = !1
                    }
                }
                d || (a.da = c, a.T = b, a.j = null, Rc(a), b != Ec || c instanceof Dc || Tc(a, c))
            }
        }

        function Sc(a, b, c, d, e) {
            function f(a) {
                k || (k = !0, d.call(e, a))
            }

            function g(a) {
                k || (k = !0, c.call(e, a))
            }

            var k = !1;
            try {
                b.call(a, g, f)
            } catch (u) {
                f(u)
            }
        }

        function Rc(a) {
            a.Kb || (a.Kb = !0, uc(a.Vc, a))
        }

        function Oc(a) {
            var b = null;
            a.ea &&
            (b = a.ea, a.ea = b.next, b.next = null);
            a.ea || (a.Ca = null);
            return b
        }

        F.prototype.Vc = function () {
            for (var a; a = Oc(this);)Pc(this, a, this.T, this.da);
            this.Kb = !1
        };
        function Pc(a, b, c, d) {
            if (c == Ec && b.Ga && !b.cb)for (; a && a.kb; a = a.j)a.kb = !1;
            if (b.sa) b.sa.j = null, Uc(b, c, d); else try {
                b.cb ? b.Ya.call(b.context) : Uc(b, c, d)
            } catch (e) {
                Vc.call(null, e)
            }
            Gc.put(b)
        }

        function Uc(a, b, c) {
            b == Cc ? a.Ya.call(a.context, c) : a.Ga && a.Ga.call(a.context, c)
        }

        function Tc(a, b) {
            a.kb = !0;
            uc(function () {
                a.kb && Vc.call(null, b)
            })
        }

        var Vc = rc;

        function Dc(a) {
            v.call(this,
                a)
        }

        t(Dc, v);
        Dc.prototype.name = "cancel";
        function Wc() {
            0 != Xc && (Yc[this[ga] || (this[ga] = ++ha)] = this);
            this.Da = this.Da;
            this.za = this.za
        }

        var Xc = 0, Yc = {};
        Wc.prototype.Da = !1;
        Wc.prototype.i = function () {
            if (!this.Da && (this.Da = !0, this.b(), 0 != Xc)) {
                var a = this[ga] || (this[ga] = ++ha);
                delete Yc[a]
            }
        };
        function Zc(a, b) {
            a.Da ? m(void 0) ? b.call(void 0) : b() : (a.za || (a.za = []), a.za.push(m(void 0) ? q(b, void 0) : b))
        }

        Wc.prototype.b = function () {
            if (this.za)for (; this.za.length;)this.za.shift()()
        };
        function $c(a) {
            a && "function" == typeof a.i && a.i()
        }

        var ad = !x || 9 <= Number(lb), bd = x && !z("9");
        !y || z("528");
        bb && z("1.9b") || x && z("8") || Za && z("9.5") || y && z("528");
        bb && !z("8") || x && z("9");
        function cd(a, b) {
            this.type = a;
            this.currentTarget = this.target = b;
            this.defaultPrevented = this.Aa = !1;
            this.Ac = !0
        }

        cd.prototype.stopPropagation = function () {
            this.Aa = !0
        };
        cd.prototype.preventDefault = function () {
            this.defaultPrevented = !0;
            this.Ac = !1
        };
        function dd(a) {
            dd[" "](a);
            return a
        }

        dd[" "] = aa;
        function G(a, b) {
            cd.call(this, a ? a.type : "");
            this.relatedTarget = this.currentTarget = this.target = null;
            this.charCode = this.keyCode = this.button = this.screenY = this.screenX = this.clientY = this.clientX = this.offsetY = this.offsetX = 0;
            this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
            this.W = this.state = null;
            a && this.init(a, b)
        }

        t(G, cd);
        G.prototype.init = function (a, b) {
            var c = this.type = a.type, d = a.changedTouches ? a.changedTouches[0] : null;
            this.target = a.target || a.srcElement;
            this.currentTarget = b;
            var e = a.relatedTarget;
            if (e) {
                if (bb) {
                    var f;
                    a:{
                        try {
                            dd(e.nodeName);
                            f = !0;
                            break a
                        } catch (g) {
                        }
                        f = !1
                    }
                    f || (e = null)
                }
            } else"mouseover" == c ? e =
                    a.fromElement : "mouseout" == c && (e = a.toElement);
            this.relatedTarget = e;
            null === d ? (this.offsetX = y || void 0 !== a.offsetX ? a.offsetX : a.layerX, this.offsetY = y || void 0 !== a.offsetY ? a.offsetY : a.layerY, this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX, this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0) : (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX, this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0);
            this.button =
                a.button;
            this.keyCode = a.keyCode || 0;
            this.charCode = a.charCode || ("keypress" == c ? a.keyCode : 0);
            this.ctrlKey = a.ctrlKey;
            this.altKey = a.altKey;
            this.shiftKey = a.shiftKey;
            this.metaKey = a.metaKey;
            this.state = a.state;
            this.W = a;
            a.defaultPrevented && this.preventDefault()
        };
        G.prototype.stopPropagation = function () {
            G.c.stopPropagation.call(this);
            this.W.stopPropagation ? this.W.stopPropagation() : this.W.cancelBubble = !0
        };
        G.prototype.preventDefault = function () {
            G.c.preventDefault.call(this);
            var a = this.W;
            if (a.preventDefault) a.preventDefault();
            else if (a.returnValue = !1, bd)try {
                if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) a.keyCode = -1
            } catch (b) {
            }
        };
        var ed = "closure_listenable_" + (1E6 * Math.random() | 0);

        function fd(a) {
            return !(!a || !a[ed])
        }

        var gd = 0;

        function hd(a, b, c, d, e) {
            this.listener = a;
            this.vb = null;
            this.src = b;
            this.type = c;
            this.Ma = !!d;
            this.mb = e;
            this.key = ++gd;
            this.Ja = this.eb = !1
        }

        function id(a) {
            a.Ja = !0;
            a.listener = null;
            a.vb = null;
            a.src = null;
            a.mb = null
        }

        function jd(a) {
            this.src = a;
            this.F = {};
            this.bb = 0
        }

        h = jd.prototype;
        h.add = function (a, b, c, d, e) {
            var f = a.toString();
            a = this.F[f];
            a || (a = this.F[f] = [], this.bb++);
            var g = kd(a, b, d, e);
            -1 < g ? (b = a[g], c || (b.eb = !1)) : (b = new hd(b, this.src, f, !!d, e), b.eb = c, a.push(b));
            return b
        };
        h.remove = function (a, b, c, d) {
            a = a.toString();
            if (!(a in this.F))return !1;
            var e = this.F[a];
            b = kd(e, b, c, d);
            return -1 < b ? (id(e[b]), La(e, b), 0 == e.length && (delete this.F[a], this.bb--), !0) : !1
        };
        function ld(a, b) {
            var c = b.type;
            c in a.F && Ka(a.F[c], b) && (id(b), 0 == a.F[c].length && (delete a.F[c], a.bb--))
        }

        h.wb = function (a) {
            a = a && a.toString();
            var b = 0, c;
            for (c in this.F)if (!a || c == a) {
                for (var d =
                    this.F[c], e = 0; e < d.length; e++)++b, id(d[e]);
                delete this.F[c];
                this.bb--
            }
            return b
        };
        h.Ta = function (a, b, c, d) {
            a = this.F[a.toString()];
            var e = -1;
            a && (e = kd(a, b, c, d));
            return -1 < e ? a[e] : null
        };
        h.hasListener = function (a, b) {
            var c = m(a), d = c ? a.toString() : "", e = m(b);
            return Ua(this.F, function (a) {
                for (var g = 0; g < a.length; ++g)if (!(c && a[g].type != d || e && a[g].Ma != b))return !0;
                return !1
            })
        };
        function kd(a, b, c, d) {
            for (var e = 0; e < a.length; ++e) {
                var f = a[e];
                if (!f.Ja && f.listener == b && f.Ma == !!c && f.mb == d)return e
            }
            return -1
        }

        var md = "closure_lm_" + (1E6 *
            Math.random() | 0), nd = {}, od = 0;

        function pd(a, b, c, d, e) {
            if (da(b)) {
                for (var f = 0; f < b.length; f++)pd(a, b[f], c, d, e);
                return null
            }
            c = qd(c);
            return fd(a) ? a.ma(b, c, d, e) : rd(a, b, c, !1, d, e)
        }

        function rd(a, b, c, d, e, f) {
            if (!b)throw Error("Invalid event type");
            var g = !!e, k = sd(a);
            k || (a[md] = k = new jd(a));
            c = k.add(b, c, d, e, f);
            if (c.vb)return c;
            d = td();
            c.vb = d;
            d.src = a;
            d.listener = c;
            if (a.addEventListener) a.addEventListener(b.toString(), d, g); else if (a.attachEvent) a.attachEvent(ud(b.toString()), d); else throw Error("addEventListener and attachEvent are unavailable.");
            od++;
            return c
        }

        function td() {
            var a = vd, b = ad ? function (c) {
                    return a.call(b.src, b.listener, c)
                } : function (c) {
                    c = a.call(b.src, b.listener, c);
                    if (!c)return c
                };
            return b
        }

        function wd(a, b, c, d, e) {
            if (da(b)) {
                for (var f = 0; f < b.length; f++)wd(a, b[f], c, d, e);
                return null
            }
            c = qd(c);
            return fd(a) ? a.qc(b, c, d, e) : rd(a, b, c, !0, d, e)
        }

        function xd(a, b, c, d, e) {
            if (da(b))for (var f = 0; f < b.length; f++)xd(a, b[f], c, d, e); else c = qd(c), fd(a) ? a.ac(b, c, d, e) : a && (a = sd(a)) && (b = a.Ta(b, c, !!d, e)) && yd(b)
        }

        function yd(a) {
            if ("number" == typeof a || !a || a.Ja)return;
            var b =
                a.src;
            if (fd(b)) {
                ld(b.V, a);
                return
            }
            var c = a.type, d = a.vb;
            b.removeEventListener ? b.removeEventListener(c, d, a.Ma) : b.detachEvent && b.detachEvent(ud(c), d);
            od--;
            (c = sd(b)) ? (ld(c, a), 0 == c.bb && (c.src = null, b[md] = null)) : id(a)
        }

        function ud(a) {
            return a in nd ? nd[a] : nd[a] = "on" + a
        }

        function zd(a, b, c, d) {
            var e = !0;
            if (a = sd(a))if (b = a.F[b.toString()])for (b = b.concat(), a = 0; a < b.length; a++) {
                var f = b[a];
                f && f.Ma == c && !f.Ja && (f = Ad(f, d), e = e && !1 !== f)
            }
            return e
        }

        function Ad(a, b) {
            var c = a.listener, d = a.mb || a.src;
            a.eb && yd(a);
            return c.call(d, b)
        }

        function vd(a, b) {
            if (a.Ja)return !0;
            if (!ad) {
                var c;
                if (!(c = b))a:{
                    c = ["window", "event"];
                    for (var d = l, e; e = c.shift();)if (null != d[e]) d = d[e]; else {
                        c = null;
                        break a
                    }
                    c = d
                }
                e = c;
                c = new G(e, this);
                d = !0;
                if (!(0 > e.keyCode || void 0 != e.returnValue)) {
                    a:{
                        var f = !1;
                        if (0 == e.keyCode)try {
                            e.keyCode = -1;
                            break a
                        } catch (u) {
                            f = !0
                        }
                        if (f || void 0 == e.returnValue) e.returnValue = !0
                    }
                    e = [];
                    for (f = c.currentTarget; f; f = f.parentNode)e.push(f);
                    for (var f = a.type, g = e.length - 1; !c.Aa && 0 <= g; g--) {
                        c.currentTarget = e[g];
                        var k = zd(e[g], f, !0, c), d = d && k
                    }
                    for (g = 0; !c.Aa && g <
                    e.length; g++)c.currentTarget = e[g], k = zd(e[g], f, !1, c), d = d && k
                }
                return d
            }
            return Ad(a, new G(b, this))
        }

        function sd(a) {
            a = a[md];
            return a instanceof jd ? a : null
        }

        var Bd = "__closure_events_fn_" + (1E9 * Math.random() >>> 0);

        function qd(a) {
            if (p(a))return a;
            a[Bd] || (a[Bd] = function (b) {
                return a.handleEvent(b)
            });
            return a[Bd]
        }

        function H() {
            Wc.call(this);
            this.V = new jd(this);
            this.Mc = this;
            this.ub = null
        }

        t(H, Wc);
        H.prototype[ed] = !0;
        h = H.prototype;
        h.Yb = function (a) {
            this.ub = a
        };
        h.addEventListener = function (a, b, c, d) {
            pd(this, a, b, c, d)
        };
        h.removeEventListener =
            function (a, b, c, d) {
                xd(this, a, b, c, d)
            };
        h.dispatchEvent = function (a) {
            var b, c = this.ub;
            if (c)for (b = []; c; c = c.ub)b.push(c);
            var c = this.Mc, d = a.type || a;
            if (n(a)) a = new cd(a, c); else if (a instanceof cd) a.target = a.target || c; else {
                var e = a;
                a = new cd(d, c);
                Ya(a, e)
            }
            var e = !0, f;
            if (b)for (var g = b.length - 1; !a.Aa && 0 <= g; g--)f = a.currentTarget = b[g], e = Cd(f, d, !0, a) && e;
            a.Aa || (f = a.currentTarget = c, e = Cd(f, d, !0, a) && e, a.Aa || (e = Cd(f, d, !1, a) && e));
            if (b)for (g = 0; !a.Aa && g < b.length; g++)f = a.currentTarget = b[g], e = Cd(f, d, !1, a) && e;
            return e
        };
        h.b = function () {
            H.c.b.call(this);
            this.V && this.V.wb(void 0);
            this.ub = null
        };
        h.ma = function (a, b, c, d) {
            return this.V.add(String(a), b, !1, c, d)
        };
        h.qc = function (a, b, c, d) {
            return this.V.add(String(a), b, !0, c, d)
        };
        h.ac = function (a, b, c, d) {
            return this.V.remove(String(a), b, c, d)
        };
        function Cd(a, b, c, d) {
            b = a.V.F[String(b)];
            if (!b)return !0;
            b = b.concat();
            for (var e = !0, f = 0; f < b.length; ++f) {
                var g = b[f];
                if (g && !g.Ja && g.Ma == c) {
                    var k = g.listener, u = g.mb || g.src;
                    g.eb && ld(a.V, g);
                    e = !1 !== k.call(u, d) && e
                }
            }
            return e && 0 != d.Ac
        }

        h.Ta = function (a, b, c, d) {
            return this.V.Ta(String(a), b, c,
                d)
        };
        h.hasListener = function (a, b) {
            return this.V.hasListener(m(a) ? String(a) : void 0, b)
        };
        function Dd(a, b) {
            if (p(a)) b && (a = q(a, b)); else if (a && "function" == typeof a.handleEvent) a = q(a.handleEvent, a); else throw Error("Invalid listener argument");
            return 2147483647 < Number(0) ? -1 : l.setTimeout(a, 0)
        }

        function Ed(a) {
            if (a.P && "function" == typeof a.P)return a.P();
            if (n(a))return a.split("");
            if (ea(a)) {
                for (var b = [], c = a.length, d = 0; d < c; d++)b.push(a[d]);
                return b
            }
            return Va(a)
        }

        function Fd(a, b, c) {
            if (a.forEach && "function" == typeof a.forEach) a.forEach(b,
                c); else if (ea(a) || n(a)) Da(a, b, c); else {
                var d;
                if (a.ia && "function" == typeof a.ia) d = a.ia(); else if (a.P && "function" == typeof a.P) d = void 0; else if (ea(a) || n(a)) {
                    d = [];
                    for (var e = a.length, f = 0; f < e; f++)d.push(f)
                } else d = Wa(a);
                for (var e = Ed(a), f = e.length, g = 0; g < f; g++)b.call(c, e[g], d && d[g], a)
            }
        }

        var Gd = "StopIteration" in l ? l.StopIteration : {message: "StopIteration", stack: ""};

        function Hd() {
        }

        Hd.prototype.next = function () {
            throw Gd;
        };
        Hd.prototype.ra = function () {
            return this
        };
        function Id(a) {
            if (a instanceof Hd)return a;
            if ("function" == typeof a.ra)return a.ra(!1);
            if (ea(a)) {
                var b = 0, c = new Hd;
                c.next = function () {
                    for (; ;) {
                        if (b >= a.length)throw Gd;
                        if (b in a)return a[b++];
                        b++
                    }
                };
                return c
            }
            throw Error("Not implemented");
        }

        function Jd(a, b) {
            if (ea(a))try {
                Da(a, b, void 0)
            } catch (c) {
                if (c !== Gd)throw c;
            } else {
                a = Id(a);
                try {
                    for (; ;)b.call(void 0, a.next(), void 0, a)
                } catch (c$1) {
                    if (c$1 !== Gd)throw c$1;
                }
            }
        }

        function Kd(a) {
            if (ea(a))return Pa(a);
            a = Id(a);
            var b = [];
            Jd(a, function (a) {
                b.push(a)
            });
            return b
        }

        function Ld(a, b) {
            this.R = {};
            this.m = [];
            this.Ka = this.w = 0;
            var c = arguments.length;
            if (1 < c) {
                if (c % 2)throw Error("Uneven number of arguments");
                for (var d = 0; d < c; d += 2)this.set(arguments[d], arguments[d + 1])
            } else a && this.addAll(a)
        }

        h = Ld.prototype;
        h.P = function () {
            Md(this);
            for (var a = [], b = 0; b < this.m.length; b++)a.push(this.R[this.m[b]]);
            return a
        };
        h.ia = function () {
            Md(this);
            return this.m.concat()
        };
        h.Oa = function (a) {
            return Nd(this.R, a)
        };
        h.clear = function () {
            this.R = {};
            this.Ka = this.w = this.m.length = 0
        };
        h.remove = function (a) {
            return Nd(this.R, a) ? (delete this.R[a], this.w--, this.Ka++, this.m.length > 2 * this.w &&
                Md(this), !0) : !1
        };
        function Md(a) {
            if (a.w != a.m.length) {
                for (var b = 0, c = 0; b < a.m.length;) {
                    var d = a.m[b];
                    Nd(a.R, d) && (a.m[c++] = d);
                    b++
                }
                a.m.length = c
            }
            if (a.w != a.m.length) {
                for (var e = {}, c = b = 0; b < a.m.length;)d = a.m[b], Nd(e, d) || (a.m[c++] = d, e[d] = 1), b++;
                a.m.length = c
            }
        }

        h.get = function (a, b) {
            return Nd(this.R, a) ? this.R[a] : b
        };
        h.set = function (a, b) {
            Nd(this.R, a) || (this.w++, this.m.push(a), this.Ka++);
            this.R[a] = b
        };
        h.addAll = function (a) {
            var b;
            a instanceof Ld ? (b = a.ia(), a = a.P()) : (b = Wa(a), a = Va(a));
            for (var c = 0; c < b.length; c++)this.set(b[c],
                a[c])
        };
        h.forEach = function (a, b) {
            for (var c = this.ia(), d = 0; d < c.length; d++) {
                var e = c[d], f = this.get(e);
                a.call(b, f, e, this)
            }
        };
        h.clone = function () {
            return new Ld(this)
        };
        h.ra = function (a) {
            Md(this);
            var b = 0, c = this.Ka, d = this, e = new Hd;
            e.next = function () {
                if (c != d.Ka)throw Error("The map has changed since the iterator was created");
                if (b >= d.m.length)throw Gd;
                var e = d.m[b++];
                return a ? e : d.R[e]
            };
            return e
        };
        function Nd(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b)
        }

        function Od(a, b, c, d, e) {
            this.reset(a, b, c, d, e)
        }

        Od.prototype.Jb =
            null;
        var Pd = 0;
        Od.prototype.reset = function (a, b, c, d, e) {
            "number" == typeof e || Pd++;
            this.Hc = d || la();
            this.ya = a;
            this.tc = b;
            this.sc = c;
            delete this.Jb
        };
        Od.prototype.Cc = function (a) {
            this.ya = a
        };
        function Qd(a) {
            this.uc = a;
            this.Wa = this.ga = this.ya = this.j = null
        }

        function Rd(a, b) {
            this.name = a;
            this.value = b
        }

        Rd.prototype.toString = function () {
            return this.name
        };
        var Sd = new Rd("SHOUT", 1200), Td = new Rd("SEVERE", 1E3), Ud = new Rd("WARNING", 900), Vd = new Rd("INFO", 800), Wd = new Rd("CONFIG", 700);
        h = Qd.prototype;
        h.getName = function () {
            return this.uc
        };
        h.getParent = function () {
            return this.j
        };
        h.lc = function () {
            this.ga || (this.ga = {});
            return this.ga
        };
        h.Cc = function (a) {
            this.ya = a
        };
        function Xd(a) {
            if (a.ya)return a.ya;
            if (a.j)return Xd(a.j);
            Ba("Root logger has no level set.");
            return null
        }

        h.log = function (a, b, c) {
            if (a.value >= Xd(this).value)for (p(b) && (b = b()), a = new Od(a, String(b), this.uc), c && (a.Jb = c), c = "log:" + a.tc, l.console && (l.console.timeStamp ? l.console.timeStamp(c) : l.console.markTimeline && l.console.markTimeline(c)), l.msWriteProfilerMark && l.msWriteProfilerMark(c),
                                                   c = this; c;) {
                b = c;
                var d = a;
                if (b.Wa)for (var e = 0, f; f = b.Wa[e]; e++)f(d);
                c = c.getParent()
            }
        };
        h.info = function (a, b) {
            this.log(Vd, a, b)
        };
        var Yd = {}, Zd = null;

        function $d() {
            Zd || (Zd = new Qd(""), Yd[""] = Zd, Zd.Cc(Wd))
        }

        function ae(a) {
            $d();
            var b;
            if (!(b = Yd[a])) {
                b = new Qd(a);
                var c = a.lastIndexOf("."), d = a.substr(c + 1), c = ae(a.substr(0, c));
                c.lc()[d] = b;
                b.j = c;
                Yd[a] = b
            }
            return b
        }

        function be() {
            this.zc = la()
        }

        var ce = new be;
        be.prototype.set = function (a) {
            this.zc = a
        };
        be.prototype.reset = function () {
            this.set(la())
        };
        be.prototype.get = function () {
            return this.zc
        };
        function de(a) {
            this.oa = a || "";
            this.xd = ce
        }

        h = de.prototype;
        h.dc = !0;
        h.Dc = !0;
        h.ud = !0;
        h.td = !0;
        h.Ec = !1;
        h.vd = !1;
        function ee(a) {
            return 10 > a ? "0" + a : String(a)
        }

        function fe(a, b) {
            var c = (a.Hc - b) / 1E3, d = c.toFixed(3), e = 0;
            if (1 > c) e = 2; else for (; 100 > c;)e++, c *= 10;
            for (; 0 < e--;)d = " " + d;
            return d
        }

        function ge(a) {
            de.call(this, a)
        }

        t(ge, de);
        function he() {
            this.qd = q(this.Nc, this);
            this.hb = new ge;
            this.hb.Dc = !1;
            this.hb.Ec = !1;
            this.pc = this.hb.dc = !1;
            this.rc = "";
            this.Xc = {}
        }

        he.prototype.Nc = function (a) {
            if (!this.Xc[a.sc]) {
                var b;
                b = this.hb;
                var c =
                    [];
                c.push(b.oa, " ");
                if (b.Dc) {
                    var d = new Date(a.Hc);
                    c.push("[", ee(d.getFullYear() - 2E3) + ee(d.getMonth() + 1) + ee(d.getDate()) + " " + ee(d.getHours()) + ":" + ee(d.getMinutes()) + ":" + ee(d.getSeconds()) + "." + ee(Math.floor(d.getMilliseconds() / 10)), "] ")
                }
                b.ud && c.push("[", fe(a, b.xd.get()), "s] ");
                b.td && c.push("[", a.sc, "] ");
                b.vd && c.push("[", a.ya.name, "] ");
                c.push(a.tc);
                b.Ec && (d = a.Jb) && c.push("\n", d instanceof Error ? d.message : d.toString());
                b.dc && c.push("\n");
                b = c.join("");
                if (c = ie)switch (a.ya) {
                    case Sd:
                        je(c, "info", b);
                        break;
                    case Td:
                        je(c, "error", b);
                        break;
                    case Ud:
                        je(c, "warn", b);
                        break;
                    default:
                        je(c, "debug", b)
                } else this.rc += b
            }
        };
        var ie = l.console;

        function je(a, b, c) {
            if (a[b]) a[b](c); else a.log(c)
        }

        function ke(a) {
            if (a.altKey && !a.ctrlKey || a.metaKey || 112 <= a.keyCode && 123 >= a.keyCode)return !1;
            switch (a.keyCode) {
                case 18:
                case 20:
                case 93:
                case 17:
                case 40:
                case 35:
                case 27:
                case 36:
                case 45:
                case 37:
                case 224:
                case 91:
                case 144:
                case 12:
                case 34:
                case 33:
                case 19:
                case 255:
                case 44:
                case 39:
                case 145:
                case 16:
                case 38:
                case 252:
                case 224:
                case 92:
                    return !1;
                case 0:
                    return !bb;
                default:
                    return 166 > a.keyCode || 183 < a.keyCode
            }
        }

        function le(a, b, c, d, e) {
            if (!(x || $a || y && z("525")))return !0;
            if (db && e)return me(a);
            if (e && !d)return !1;
            "number" == typeof b && (b = ne(b));
            if (!c && (17 == b || 18 == b || db && 91 == b))return !1;
            if ((y || $a) && d && c)switch (a) {
                case 220:
                case 219:
                case 221:
                case 192:
                case 186:
                case 189:
                case 187:
                case 188:
                case 190:
                case 191:
                case 192:
                case 222:
                    return !1
            }
            if (x && d && b == a)return !1;
            switch (a) {
                case 13:
                    return !0;
                case 27:
                    return !(y || $a)
            }
            return me(a)
        }

        function me(a) {
            if (48 <= a && 57 >= a || 96 <= a && 106 >= a || 65 <= a && 90 >=
                a || (y || $a) && 0 == a)return !0;
            switch (a) {
                case 32:
                case 43:
                case 63:
                case 64:
                case 107:
                case 109:
                case 110:
                case 111:
                case 186:
                case 59:
                case 189:
                case 187:
                case 61:
                case 188:
                case 190:
                case 191:
                case 192:
                case 222:
                case 219:
                case 220:
                case 221:
                    return !0;
                default:
                    return !1
            }
        }

        function ne(a) {
            if (bb) a = oe(a); else if (db && y)a:switch (a) {
                case 93:
                    a = 91;
                    break a
            }
            return a
        }

        function oe(a) {
            switch (a) {
                case 61:
                    return 187;
                case 59:
                    return 186;
                case 173:
                    return 189;
                case 224:
                    return 91;
                case 0:
                    return 224;
                default:
                    return a
            }
        }

        function pe(a, b) {
            this.yb = [];
            this.vc =
                a;
            this.gc = b || null;
            this.Va = this.Ea = !1;
            this.da = void 0;
            this.$b = this.Pc = this.Eb = !1;
            this.Ab = 0;
            this.j = null;
            this.Fb = 0
        }

        pe.prototype.cancel = function (a) {
            if (this.Ea) this.da instanceof pe && this.da.cancel(); else {
                if (this.j) {
                    var b = this.j;
                    delete this.j;
                    a ? b.cancel(a) : (b.Fb--, 0 >= b.Fb && b.cancel())
                }
                this.vc ? this.vc.call(this.gc, this) : this.$b = !0;
                this.Ea || (a = new qe, re(this), se(this, !1, a))
            }
        };
        pe.prototype.fc = function (a, b) {
            this.Eb = !1;
            se(this, a, b)
        };
        function se(a, b, c) {
            a.Ea = !0;
            a.da = c;
            a.Va = !b;
            te(a)
        }

        function re(a) {
            if (a.Ea) {
                if (!a.$b)throw new ue;
                a.$b = !1
            }
        }

        function ve(a, b, c) {
            a.yb.push([b, c, void 0]);
            a.Ea && te(a)
        }

        pe.prototype.then = function (a, b, c) {
            var d, e, f = new F(function (a, b) {
                d = a;
                e = b
            });
            ve(this, d, function (a) {
                a instanceof qe ? f.cancel() : e(a)
            });
            return f.then(a, b, c)
        };
        lc(pe);
        function we(a) {
            return Ha(a.yb, function (a) {
                return p(a[1])
            })
        }

        function te(a) {
            if (a.Ab && a.Ea && we(a)) {
                var b = a.Ab, c = xe[b];
                c && (l.clearTimeout(c.va), delete xe[b]);
                a.Ab = 0
            }
            a.j && (a.j.Fb--, delete a.j);
            for (var b = a.da, d = c = !1; a.yb.length && !a.Eb;) {
                var e = a.yb.shift(), f = e[0], g = e[1], e = e[2];
                if (f = a.Va ?
                        g : f)try {
                    var k = f.call(e || a.gc, b);
                    m(k) && (a.Va = a.Va && (k == b || k instanceof Error), a.da = b = k);
                    if (mc(b) || "function" === typeof l.Promise && b instanceof l.Promise) d = !0, a.Eb = !0
                } catch (u) {
                    b = u, a.Va = !0, we(a) || (c = !0)
                }
            }
            a.da = b;
            d && (k = q(a.fc, a, !0), d = q(a.fc, a, !1), b instanceof pe ? (ve(b, k, d), b.Pc = !0) : b.then(k, d));
            c && (b = new ye(b), xe[b.va] = b, a.Ab = b.va)
        }

        function ue() {
            v.call(this)
        }

        t(ue, v);
        ue.prototype.message = "Deferred has already fired";
        ue.prototype.name = "AlreadyCalledError";
        function qe() {
            v.call(this)
        }

        t(qe, v);
        qe.prototype.message =
            "Deferred was canceled";
        qe.prototype.name = "CanceledError";
        function ye(a) {
            this.va = l.setTimeout(q(this.yd, this), 0);
            this.Uc = a
        }

        ye.prototype.yd = function () {
            delete xe[this.va];
            throw this.Uc;
        };
        var xe = {};
        var ze = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;

        function Ae(a, b) {
            if (a)for (var c = a.split("&"), d = 0; d < c.length; d++) {
                var e = c[d].indexOf("="), f, g = null;
                0 <= e ? (f = c[d].substring(0, e), g = c[d].substring(e + 1)) : f = c[d];
                b(f, g ? decodeURIComponent(g.replace(/\+/g,
                        " ")) : "")
            }
        }

        function Be(a, b, c, d) {
            for (var e = c.length; 0 <= (b = a.indexOf(c, b)) && b < d;) {
                var f = a.charCodeAt(b - 1);
                if (38 == f || 63 == f)if (f = a.charCodeAt(b + e), !f || 61 == f || 38 == f || 35 == f)return b;
                b += e + 1
            }
            return -1
        }

        var Ce = /#|$/;

        function De(a, b) {
            var c = a.search(Ce), d = Be(a, 0, b, c);
            if (0 > d)return null;
            var e = a.indexOf("&", d);
            if (0 > e || e > c) e = c;
            d += b.length + 1;
            return decodeURIComponent(a.substr(d, e - d).replace(/\+/g, " "))
        }

        var Ee = /[?&]($|#)/;

        function Fe(a, b) {
            this.$ = this.Ba = this.qa = "";
            this.Ia = null;
            this.Sa = this.Y = "";
            this.M = this.gd = !1;
            var c;
            if (a instanceof Fe) this.M = m(b) ? b : a.M, Ge(this, a.qa), c = a.Ba, I(this), this.Ba = c, c = a.$, I(this), this.$ = c, He(this, a.Ia), c = a.Y, I(this), this.Y = c, Ie(this, a.ca.clone()), Je(this, a.Sa); else if (a && (c = String(a).match(ze))) {
                this.M = !!b;
                Ge(this, c[1] || "", !0);
                var d = c[2] || "";
                I(this);
                this.Ba = Ke(d);
                d = c[3] || "";
                I(this);
                this.$ = Ke(d, !0);
                He(this, c[4]);
                d = c[5] || "";
                I(this);
                this.Y = Ke(d, !0);
                Ie(this, c[6] || "", !0);
                Je(this, c[7] || "", !0)
            } else this.M = !!b, this.ca = new Le(null, 0, this.M)
        }

        Fe.prototype.toString = function () {
            var a = [], b = this.qa;
            b && a.push(Me(b, Ne, !0), ":");
            var c = this.$;
            if (c || "file" == b) a.push("//"), (b = this.Ba) && a.push(Me(b, Ne, !0), "@"), a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.Ia, null != c && a.push(":", String(c));
            if (c = this.Y) this.$ && "/" != c.charAt(0) && a.push("/"), a.push(Me(c, "/" == c.charAt(0) ? Oe : Pe, !0));
            (c = this.ca.toString()) && a.push("?", c);
            (c = this.Sa) && a.push("#", Me(c, Qe));
            return a.join("")
        };
        Fe.prototype.resolve = function (a) {
            var b = this.clone(), c = !!a.qa;
            c ? Ge(b, a.qa) : c = !!a.Ba;
            if (c) {
                var d = a.Ba;
                I(b);
                b.Ba = d
            } else c = !!a.$;
            c ? (d = a.$, I(b), b.$ = d) : c = null != a.Ia;
            d = a.Y;
            if (c) He(b, a.Ia); else if (c = !!a.Y) {
                if ("/" != d.charAt(0))if (this.$ && !this.Y) d = "/" + d; else {
                    var e = b.Y.lastIndexOf("/");
                    -1 != e && (d = b.Y.substr(0, e + 1) + d)
                }
                e = d;
                if (".." == e || "." == e) d = ""; else if (-1 != e.indexOf("./") || -1 != e.indexOf("/.")) {
                    for (var d = 0 == e.lastIndexOf("/", 0), e = e.split("/"), f = [], g = 0; g < e.length;) {
                        var k = e[g++];
                        "." == k ? d && g == e.length && f.push("") : ".." == k ? ((1 < f.length || 1 == f.length && "" != f[0]) && f.pop(), d && g == e.length && f.push("")) : (f.push(k), d = !0)
                    }
                    d =
                        f.join("/")
                } else d = e
            }
            c ? (I(b), b.Y = d) : c = "" !== a.ca.toString();
            c ? Ie(b, Ke(a.ca.toString())) : c = !!a.Sa;
            c && Je(b, a.Sa);
            return b
        };
        Fe.prototype.clone = function () {
            return new Fe(this)
        };
        function Ge(a, b, c) {
            I(a);
            a.qa = c ? Ke(b, !0) : b;
            a.qa && (a.qa = a.qa.replace(/:$/, ""))
        }

        function He(a, b) {
            I(a);
            if (b) {
                b = Number(b);
                if (isNaN(b) || 0 > b)throw Error("Bad port number " + b);
                a.Ia = b
            } else a.Ia = null
        }

        function Ie(a, b, c) {
            I(a);
            b instanceof Le ? (a.ca = b, a.ca.Xb(a.M)) : (c || (b = Me(b, Re)), a.ca = new Le(b, 0, a.M));
            return a
        }

        function Je(a, b, c) {
            I(a);
            a.Sa = c ?
                Ke(b) : b;
            return a
        }

        function I(a) {
            if (a.gd)throw Error("Tried to modify a read-only Uri");
        }

        Fe.prototype.Xb = function (a) {
            this.M = a;
            this.ca && this.ca.Xb(a);
            return this
        };
        function Se(a) {
            return a instanceof Fe ? a.clone() : new Fe(a, void 0)
        }

        function Te(a) {
            var b = window.location.href;
            b instanceof Fe || (b = Se(b));
            a instanceof Fe || (a = Se(a));
            return b.resolve(a)
        }

        function Ke(a, b) {
            return a ? b ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : ""
        }

        function Me(a, b, c) {
            return n(a) ? (a = encodeURI(a).replace(b, Ue), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g,
                    "%$1")), a) : null
        }

        function Ue(a) {
            a = a.charCodeAt(0);
            return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16)
        }

        var Ne = /[#\/\?@]/g, Pe = /[\#\?:]/g, Oe = /[\#\?]/g, Re = /[\#\?@]/g, Qe = /#/g;

        function Le(a, b, c) {
            this.w = this.v = null;
            this.I = a || null;
            this.M = !!c
        }

        function Ve(a) {
            a.v || (a.v = new Ld, a.w = 0, a.I && Ae(a.I, function (b, c) {
                a.add(decodeURIComponent(b.replace(/\+/g, " ")), c)
            }))
        }

        h = Le.prototype;
        h.add = function (a, b) {
            Ve(this);
            this.I = null;
            a = We(this, a);
            var c = this.v.get(a);
            c || this.v.set(a, c = []);
            c.push(b);
            this.w += 1;
            return this
        };
        h.remove =
            function (a) {
                Ve(this);
                a = We(this, a);
                return this.v.Oa(a) ? (this.I = null, this.w -= this.v.get(a).length, this.v.remove(a)) : !1
            };
        h.clear = function () {
            this.v = this.I = null;
            this.w = 0
        };
        h.Oa = function (a) {
            Ve(this);
            a = We(this, a);
            return this.v.Oa(a)
        };
        h.ia = function () {
            Ve(this);
            for (var a = this.v.P(), b = this.v.ia(), c = [], d = 0; d < b.length; d++)for (var e = a[d], f = 0; f < e.length; f++)c.push(b[d]);
            return c
        };
        h.P = function (a) {
            Ve(this);
            var b = [];
            if (n(a)) this.Oa(a) && (b = Oa(b, this.v.get(We(this, a)))); else {
                a = this.v.P();
                for (var c = 0; c < a.length; c++)b =
                    Oa(b, a[c])
            }
            return b
        };
        h.set = function (a, b) {
            Ve(this);
            this.I = null;
            a = We(this, a);
            this.Oa(a) && (this.w -= this.v.get(a).length);
            this.v.set(a, [b]);
            this.w += 1;
            return this
        };
        h.get = function (a, b) {
            var c = a ? this.P(a) : [];
            return 0 < c.length ? String(c[0]) : b
        };
        h.toString = function () {
            if (this.I)return this.I;
            if (!this.v)return "";
            for (var a = [], b = this.v.ia(), c = 0; c < b.length; c++)for (var d = b[c], e = encodeURIComponent(String(d)), d = this.P(d), f = 0; f < d.length; f++) {
                var g = e;
                "" !== d[f] && (g += "=" + encodeURIComponent(String(d[f])));
                a.push(g)
            }
            return this.I =
                a.join("&")
        };
        h.clone = function () {
            var a = new Le;
            a.I = this.I;
            this.v && (a.v = this.v.clone(), a.w = this.w);
            return a
        };
        function We(a, b) {
            var c = String(b);
            a.M && (c = c.toLowerCase());
            return c
        }

        h.Xb = function (a) {
            a && !this.M && (Ve(this), this.I = null, this.v.forEach(function (a, c) {
                var d = c.toLowerCase();
                c != d && (this.remove(c), this.remove(d), 0 < a.length && (this.I = null, this.v.set(We(this, d), Pa(a)), this.w += a.length))
            }, this));
            this.M = a
        };
        h.extend = function (a) {
            for (var b = 0; b < arguments.length; b++)Fd(arguments[b], function (a, b) {
                    this.add(b, a)
                },
                this)
        };
        function Xe(a) {
            a = String(a);
            if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, "")))try {
                return eval("(" + a + ")")
            } catch (b) {
            }
            throw Error("Invalid JSON string: " + a);
        }

        function Ye(a) {
            var b = [];
            Ze(new $e, a, b);
            return b.join("")
        }

        function $e() {
            this.xb = void 0
        }

        function Ze(a, b, c) {
            if (null ==
                b) c.push("null"); else {
                if ("object" == typeof b) {
                    if (da(b)) {
                        var d = b;
                        b = d.length;
                        c.push("[");
                        for (var e = "", f = 0; f < b; f++)c.push(e), e = d[f], Ze(a, a.xb ? a.xb.call(d, String(f), e) : e, c), e = ",";
                        c.push("]");
                        return
                    }
                    if (b instanceof String || b instanceof Number || b instanceof Boolean) b = b.valueOf(); else {
                        c.push("{");
                        f = "";
                        for (d in b)Object.prototype.hasOwnProperty.call(b, d) && (e = b[d], "function" != typeof e && (c.push(f), af(d, c), c.push(":"), Ze(a, a.xb ? a.xb.call(b, d, e) : e, c), f = ","));
                        c.push("}");
                        return
                    }
                }
                switch (typeof b) {
                    case "string":
                        af(b,
                            c);
                        break;
                    case "number":
                        c.push(isFinite(b) && !isNaN(b) ? String(b) : "null");
                        break;
                    case "boolean":
                        c.push(String(b));
                        break;
                    case "function":
                        c.push("null");
                        break;
                    default:
                        throw Error("Unknown type: " + typeof b);
                }
            }
        }

        var bf = {
            '"': '\\"',
            "\\": "\\\\",
            "/": "\\/",
            "\b": "\\b",
            "\f": "\\f",
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t",
            "\x0B": "\\u000b"
        }, cf = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;

        function af(a, b) {
            b.push('"', a.replace(cf, function (a) {
                var b = bf[a];
                b || (b = "\\u" + (a.charCodeAt(0) | 65536).toString(16).substr(1),
                    bf[a] = b);
                return b
            }), '"')
        }

        function df(a) {
            Wc.call(this);
            this.Pb = a;
            this.m = {}
        }

        t(df, Wc);
        var ef = [];
        h = df.prototype;
        h.ma = function (a, b, c, d) {
            da(b) || (b && (ef[0] = b.toString()), b = ef);
            for (var e = 0; e < b.length; e++) {
                var f = pd(a, b[e], c || this.handleEvent, d || !1, this.Pb || this);
                if (!f)break;
                this.m[f.key] = f
            }
            return this
        };
        h.qc = function (a, b, c, d) {
            return ff(this, a, b, c, d)
        };
        function ff(a, b, c, d, e, f) {
            if (da(c))for (var g = 0; g < c.length; g++)ff(a, b, c[g], d, e, f); else {
                b = wd(b, c, d || a.handleEvent, e, f || a.Pb || a);
                if (!b)return a;
                a.m[b.key] = b
            }
            return a
        }

        h.ac = function (a, b, c, d, e) {
            if (da(b))for (var f = 0; f < b.length; f++)this.ac(a, b[f], c, d, e); else c = c || this.handleEvent, e = e || this.Pb || this, c = qd(c), d = !!d, b = fd(a) ? a.Ta(b, c, d, e) : a ? (a = sd(a)) ? a.Ta(b, c, d, e) : null : null, b && (yd(b), delete this.m[b.key]);
            return this
        };
        h.wb = function () {
            Ta(this.m, function (a, b) {
                this.m.hasOwnProperty(b) && yd(a)
            }, this);
            this.m = {}
        };
        h.b = function () {
            df.c.b.call(this);
            this.wb()
        };
        h.handleEvent = function () {
            throw Error("EventHandler.handleEvent not implemented");
        };
        function gf() {
        }

        gf.Yc = function () {
            return gf.aa ?
                gf.aa : gf.aa = new gf
        };
        gf.prototype.ld = 0;
        function hf(a) {
            H.call(this);
            this.Pa = a || xb();
            this.va = null;
            this.wa = !1;
            this.f = null;
            this.ka = void 0;
            this.fb = this.ga = this.j = null;
            this.Dd = !1
        }

        t(hf, H);
        h = hf.prototype;
        h.cd = gf.Yc();
        h.L = function () {
            return this.f
        };
        h.Mb = function (a) {
            return this.f ? this.Pa.Mb(a, this.f) : []
        };
        h.C = function (a) {
            return this.f ? this.Pa.C(a, this.f) : null
        };
        function jf(a) {
            a.ka || (a.ka = new df(a));
            return a.ka
        }

        h.getParent = function () {
            return this.j
        };
        h.Yb = function (a) {
            if (this.j && this.j != a)throw Error("Method not supported");
            hf.c.Yb.call(this, a)
        };
        h.ib = function () {
            return this.Pa
        };
        h.Ib = function () {
            this.f = this.Pa.createElement("DIV")
        };
        function J(a, b) {
            if (a.wa)throw Error("Component already rendered");
            a.f || a.Ib();
            b ? b.insertBefore(a.f, null) : a.Pa.ua.body.appendChild(a.f);
            a.j && !a.j.wa || a.l()
        }

        h.l = function () {
            this.wa = !0;
            kf(this, function (a) {
                !a.wa && a.L() && a.l()
            })
        };
        h.Ra = function () {
            kf(this, function (a) {
                a.wa && a.Ra()
            });
            this.ka && this.ka.wb();
            this.wa = !1
        };
        h.b = function () {
            this.wa && this.Ra();
            this.ka && (this.ka.i(), delete this.ka);
            kf(this, function (a) {
                a.i()
            });
            !this.Dd && this.f && Gb(this.f);
            this.j = this.f = this.fb = this.ga = null;
            hf.c.b.call(this)
        };
        function kf(a, b) {
            a.ga && Da(a.ga, b, void 0)
        }

        h.removeChild = function (a, b) {
            if (a) {
                var c = n(a) ? a : a.va || (a.va = ":" + (a.cd.ld++).toString(36)), d;
                this.fb && c ? (d = this.fb, d = (null !== d && c in d ? d[c] : void 0) || null) : d = null;
                a = d;
                if (c && a) {
                    d = this.fb;
                    c in d && delete d[c];
                    Ka(this.ga, a);
                    b && (a.Ra(), a.f && Gb(a.f));
                    c = a;
                    if (null == c)throw Error("Unable to set parent component");
                    c.j = null;
                    hf.c.Yb.call(c, null)
                }
            }
            if (!a)throw Error("Child is not in parent component");
            return a
        };
        function lf(a) {
            if (a.classList)return a.classList;
            a = a.className;
            return n(a) && a.match(/\S+/g) || []
        }

        function mf(a, b) {
            return a.classList ? a.classList.contains(b) : Ja(lf(a), b)
        }

        function nf(a, b) {
            a.classList ? a.classList.add(b) : mf(a, b) || (a.className += 0 < a.className.length ? " " + b : b)
        }

        function of(a, b) {
            a.classList ? a.classList.remove(b) : mf(a, b) && (a.className = Fa(lf(a), function (a) {
                    return a != b
                }).join(" "))
        }

        function pf(a, b) {
            H.call(this);
            a && (this.qb && this.detach(), this.f = a, this.pb = pd(this.f, "keypress", this, b),
                this.Tb = pd(this.f, "keydown", this.lb, b, this), this.qb = pd(this.f, "keyup", this.bd, b, this))
        }

        t(pf, H);
        h = pf.prototype;
        h.f = null;
        h.pb = null;
        h.Tb = null;
        h.qb = null;
        h.K = -1;
        h.la = -1;
        h.Db = !1;
        var qf = {
            3: 13,
            12: 144,
            63232: 38,
            63233: 40,
            63234: 37,
            63235: 39,
            63236: 112,
            63237: 113,
            63238: 114,
            63239: 115,
            63240: 116,
            63241: 117,
            63242: 118,
            63243: 119,
            63244: 120,
            63245: 121,
            63246: 122,
            63247: 123,
            63248: 44,
            63272: 46,
            63273: 36,
            63275: 35,
            63276: 33,
            63277: 34,
            63289: 144,
            63302: 45
        }, rf = {
            Up: 38,
            Down: 40,
            Left: 37,
            Right: 39,
            Enter: 13,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            "U+007F": 46,
            Home: 36,
            End: 35,
            PageUp: 33,
            PageDown: 34,
            Insert: 45
        }, sf = x || $a || y && z("525"), tf = db && bb;
        h = pf.prototype;
        h.lb = function (a) {
            if (y || $a)if (17 == this.K && !a.ctrlKey || 18 == this.K && !a.altKey || db && 91 == this.K && !a.metaKey) this.la = this.K = -1;
            -1 == this.K && (a.ctrlKey && 17 != a.keyCode ? this.K = 17 : a.altKey && 18 != a.keyCode ? this.K = 18 : a.metaKey && 91 != a.keyCode && (this.K = 91));
            sf && !le(a.keyCode, this.K, a.shiftKey, a.ctrlKey, a.altKey) ? this.handleEvent(a) : (this.la = ne(a.keyCode), tf &&
                (this.Db = a.altKey))
        };
        h.bd = function (a) {
            this.la = this.K = -1;
            this.Db = a.altKey
        };
        h.handleEvent = function (a) {
            var b = a.W, c, d, e = b.altKey;
            x && "keypress" == a.type ? (c = this.la, d = 13 != c && 27 != c ? b.keyCode : 0) : (y || $a) && "keypress" == a.type ? (c = this.la, d = 0 <= b.charCode && 63232 > b.charCode && me(c) ? b.charCode : 0) : Za && !y ? (c = this.la, d = me(c) ? b.keyCode : 0) : (c = b.keyCode || this.la, d = b.charCode || 0, tf && (e = this.Db), db && 63 == d && 224 == c && (c = 191));
            var f = c = ne(c), g = b.keyIdentifier;
            c ? 63232 <= c && c in qf ? f = qf[c] : 25 == c && a.shiftKey && (f = 9) : g && g in rf && (f =
                    rf[g]);
            a = f == this.K;
            this.K = f;
            b = new uf(f, d, a, b);
            b.altKey = e;
            this.dispatchEvent(b)
        };
        h.L = function () {
            return this.f
        };
        h.detach = function () {
            this.pb && (yd(this.pb), yd(this.Tb), yd(this.qb), this.qb = this.Tb = this.pb = null);
            this.f = null;
            this.la = this.K = -1
        };
        h.b = function () {
            pf.c.b.call(this);
            this.detach()
        };
        function uf(a, b, c, d) {
            G.call(this, d);
            this.type = "key";
            this.keyCode = a;
            this.charCode = b;
            this.repeat = c
        }

        t(uf, G);
        var vf = !x;

        function K(a) {
            var b = a.type;
            if (!m(b))return null;
            switch (b.toLowerCase()) {
                case "checkbox":
                case "radio":
                    return a.checked ?
                        a.value : null;
                case "select-one":
                    return b = a.selectedIndex, 0 <= b ? a.options[b].value : null;
                case "select-multiple":
                    for (var b = [], c, d = 0; c = a.options[d]; d++)c.selected && b.push(c.value);
                    return b.length ? b : null;
                default:
                    return m(a.value) ? a.value : null
            }
        }

        function wf(a) {
            H.call(this);
            this.f = a;
            pd(a, xf, this.lb, !1, this);
            pd(a, "click", this.nc, !1, this)
        }

        t(wf, H);
        var xf = bb ? "keypress" : "keydown";
        wf.prototype.lb = function (a) {
            (13 == a.keyCode || y && 3 == a.keyCode) && yf(this, a)
        };
        wf.prototype.nc = function (a) {
            yf(this, a)
        };
        function yf(a, b) {
            var c =
                new zf(b);
            if (a.dispatchEvent(c)) {
                c = new Af(b);
                try {
                    a.dispatchEvent(c)
                } finally {
                    b.stopPropagation()
                }
            }
        }

        wf.prototype.b = function () {
            wf.c.b.call(this);
            xd(this.f, xf, this.lb, !1, this);
            xd(this.f, "click", this.nc, !1, this);
            delete this.f
        };
        function Af(a) {
            G.call(this, a.W);
            this.type = "action"
        }

        t(Af, G);
        function zf(a) {
            G.call(this, a.W);
            this.type = "beforeaction"
        }

        t(zf, G);
        function Bf(a) {
            H.call(this);
            this.f = a;
            a = x ? "focusout" : "blur";
            this.jd = pd(this.f, x ? "focusin" : "focus", this, !x);
            this.kd = pd(this.f, a, this, !x)
        }

        t(Bf, H);
        Bf.prototype.handleEvent =
            function (a) {
                var b = new G(a.W);
                b.type = "focusin" == a.type || "focus" == a.type ? "focusin" : "focusout";
                this.dispatchEvent(b)
            };
        Bf.prototype.b = function () {
            Bf.c.b.call(this);
            yd(this.jd);
            yd(this.kd);
            delete this.f
        };
        function Cf(a) {
            H.call(this);
            this.$a = null;
            this.f = a;
            a = x || $a || y && !z("531") && "TEXTAREA" == a.tagName;
            this.kc = new df(this);
            this.kc.ma(this.f, a ? ["keydown", "paste", "cut", "drop", "input"] : "input", this)
        }

        t(Cf, H);
        Cf.prototype.handleEvent = function (a) {
            if ("input" == a.type) x && z(10) && 0 == a.keyCode && 0 == a.charCode || (Df(this),
                this.dispatchEvent(Ef(a))); else if ("keydown" != a.type || ke(a)) {
                var b = "keydown" == a.type ? this.f.value : null;
                x && 229 == a.keyCode && (b = null);
                var c = Ef(a);
                Df(this);
                this.$a = Dd(function () {
                    this.$a = null;
                    this.f.value != b && this.dispatchEvent(c)
                }, this)
            }
        };
        function Df(a) {
            null != a.$a && (l.clearTimeout(a.$a), a.$a = null)
        }

        function Ef(a) {
            a = new G(a.W);
            a.type = "input";
            return a
        }

        Cf.prototype.b = function () {
            Cf.c.b.call(this);
            this.kc.i();
            Df(this);
            delete this.f
        };
        var Ff = /^[+a-zA-Z0-9_.!#$%&'*\/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/;

        function Mc() {
            var a = {}, b = a.document || document, c = document.createElement("SCRIPT"), d = {
                Bc: c,
                Ic: void 0
            }, e = new pe(Gf, d), f = null, g = null != a.timeout ? a.timeout : 5E3;
            0 < g && (f = window.setTimeout(function () {
                Hf(c, !0);
                var a = new If(Jf, "Timeout reached for loading script //www.gstatic.com/accountchooser/client.js");
                re(e);
                se(e, !1, a)
            }, g), d.Ic = f);
            c.onload = c.onreadystatechange = function () {
                c.readyState && "loaded" != c.readyState && "complete" != c.readyState || (Hf(c, a.Pd || !1, f), re(e), se(e, !0, null))
            };
            c.onerror = function () {
                Hf(c, !0, f);
                var a = new If(Kf, "Error while loading script //www.gstatic.com/accountchooser/client.js");
                re(e);
                se(e, !1, a)
            };
            d = a.attributes || {};
            Ya(d, {type: "text/javascript", charset: "UTF-8", src: "//www.gstatic.com/accountchooser/client.js"});
            Cb(c, d);
            Lf(b).appendChild(c);
            return e
        }

        function Lf(a) {
            var b = a.getElementsByTagName("HEAD");
            return b && 0 != b.length ? b[0] : a.documentElement
        }

        function Gf() {
            if (this && this.Bc) {
                var a = this.Bc;
                a && "SCRIPT" == a.tagName && Hf(a, !0, this.Ic)
            }
        }

        function Hf(a, b, c) {
            null != c && l.clearTimeout(c);
            a.onload = aa;
            a.onerror = aa;
            a.onreadystatechange = aa;
            b && window.setTimeout(function () {
                Gb(a)
            }, 0)
        }

        var Kf = 0, Jf = 1;

        function If(a, b) {
            var c = "Jsloader error (code #" + a + ")";
            b && (c += ": " + b);
            v.call(this, c);
            this.code = a
        }

        t(If, v);
        function Mf(a) {
            this.rb = a
        }

        Mf.prototype.set = function (a, b) {
            m(b) ? this.rb.set(a, Ye(b)) : this.rb.remove(a)
        };
        Mf.prototype.get = function (a) {
            var b;
            try {
                b = this.rb.get(a)
            } catch (c) {
                return
            }
            if (null !== b)try {
                return Xe(b)
            } catch (c$2) {
                throw"Storage: Invalid value was encountered";
            }
        };
        Mf.prototype.remove = function (a) {
            this.rb.remove(a)
        };
        function Nf() {
        }

        function Of() {
        }

        t(Of, Nf);
        Of.prototype.clear = function () {
            var a = Kd(this.ra(!0)), b = this;
            Da(a, function (a) {
                b.remove(a)
            })
        };
        function Pf(a) {
            this.N = a
        }

        t(Pf, Of);
        function Qf(a) {
            if (!a.N)return !1;
            try {
                return a.N.setItem("__sak", "1"), a.N.removeItem("__sak"), !0
            } catch (b) {
                return !1
            }
        }

        h = Pf.prototype;
        h.set = function (a, b) {
            try {
                this.N.setItem(a, b)
            } catch (c) {
                if (0 == this.N.length)throw"Storage mechanism: Storage disabled";
                throw"Storage mechanism: Quota exceeded";
            }
        };
        h.get = function (a) {
            a = this.N.getItem(a);
            if (!n(a) && null !==
                a)throw"Storage mechanism: Invalid value was encountered";
            return a
        };
        h.remove = function (a) {
            this.N.removeItem(a)
        };
        h.ra = function (a) {
            var b = 0, c = this.N, d = new Hd;
            d.next = function () {
                if (b >= c.length)throw Gd;
                var d = c.key(b++);
                if (a)return d;
                d = c.getItem(d);
                if (!n(d))throw"Storage mechanism: Invalid value was encountered";
                return d
            };
            return d
        };
        h.clear = function () {
            this.N.clear()
        };
        h.key = function (a) {
            return this.N.key(a)
        };
        function Rf() {
            var a = null;
            try {
                a = window.localStorage || null
            } catch (b) {
            }
            this.N = a
        }

        t(Rf, Pf);
        function Sf() {
            var a =
                null;
            try {
                a = window.sessionStorage || null
            } catch (b) {
            }
            this.N = a
        }

        t(Sf, Pf);
        function Tf(a, b) {
            this.Xa = a;
            this.oa = b + "::"
        }

        t(Tf, Of);
        Tf.prototype.set = function (a, b) {
            this.Xa.set(this.oa + a, b)
        };
        Tf.prototype.get = function (a) {
            return this.Xa.get(this.oa + a)
        };
        Tf.prototype.remove = function (a) {
            this.Xa.remove(this.oa + a)
        };
        Tf.prototype.ra = function (a) {
            var b = this.Xa.ra(!0), c = this, d = new Hd;
            d.next = function () {
                for (var d = b.next(); d.substr(0, c.oa.length) != c.oa;)d = b.next();
                return a ? d.substr(c.oa.length) : c.Xa.get(d)
            };
            return d
        };
        function Uf(a) {
            a =
                a || {};
            var b = a.email, c = a.disabled;
            return D('<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="email">' + (a.Nd ? "Enter new email address" : "Email") + '</label><input type="email" name="email" autocomplete="username" class="mdl-textfield__input firebaseui-input firebaseui-id-email" value="' + ac(null != b ? b : "") + '"' + (c ? "disabled" : "") + '></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-hidden firebaseui-id-email-error"></p></div>')
        }

        function L(a) {
            a = a || {};
            a = a.label;
            return D('<button type="submit" class="firebaseui-id-submit firebaseui-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored">' + (a ? C(a) : "Next") + "</button>")
        }

        function Vf(a) {
            a = a || {};
            a = a.label;
            return D('<div class="firebaseui-new-password-component"><div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="newPassword">' + (a ? C(a) : "Choose password") + '</label><input type="password" name="newPassword" autocomplete="new-password" class="mdl-textfield__input firebaseui-input firebaseui-id-new-password"></div><a href="javascript:void(0)" class="firebaseui-input-floating-button firebaseui-id-password-toggle firebaseui-input-toggle-on firebaseui-input-toggle-blur"></a><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-hidden firebaseui-id-new-password-error"></p></div></div>')
        }

        function country(a) {
            a = a || {};
            a = a.label;
            return D("<select name='country'> <option value='' selected='selected'>Choose Country</option><option value='United States' >United States</option><option value='United Kingdom' >United Kingdom</option><option value='Afghanistan' >Afghanistan</option><option value='Albania' >Albania</option><option value='Algeria' >Algeria</option><option value='American Samoa' >American Samoa</option><option value='Andorra' >Andorra</option><option value='Angola' >Angola</option><option value='Anguilla' >Anguilla</option><option value='Antarctica' >Antarctica</option><option value='Antigua and Barbuda' >Antigua and Barbuda</option><option value='Argentina' >Argentina</option><option value='Armenia' >Armenia</option><option value='Aruba' >Aruba</option><option value='Australia' >Australia</option><option value='Austria' >Austria</option><option value='Azerbaijan' >Azerbaijan</option><option value='Bahamas' >Bahamas</option><option value='Bahrain' >Bahrain</option><option value='Bangladesh' >Bangladesh</option><option value='Barbados' >Barbados</option><option value='Belarus' >Belarus</option><option value='Belgium' >Belgium</option><option value='Belize' >Belize</option><option value='Benin' >Benin</option><option value='Bermuda' >Bermuda</option><option value='Bhutan' >Bhutan</option><option value='Bolivia' >Bolivia</option><option value='Bosnia and Herzegowina' >Bosnia and Herzegowina</option><option value='Botswana' >Botswana</option><option value='Bouvet Island' >Bouvet Island</option><option value='Brazil' >Brazil</option><option value='British Indian Ocean Territory' >British Indian Ocean Territory</option><option value='Brunei Darussalam' >Brunei Darussalam</option><option value='Bulgaria' >Bulgaria</option><option value='Burkina Faso' >Burkina Faso</option><option value='Burundi' >Burundi</option><option value='Cambodia' >Cambodia</option><option value='Cameroon' >Cameroon</option><option value='Canada' >Canada</option><option value='Cape Verde' >Cape Verde</option><option value='Cayman Islands' >Cayman Islands</option><option value='Central African Republic' >Central African Republic</option><option value='Chad' >Chad</option><option value='Chile' >Chile</option><option value='China' >China</option><option value='Christmas Island' >Christmas Island</option><option value='Cocos (Keeling) Islands' >Cocos (Keeling) Islands</option><option value='Colombia' >Colombia</option><option value='Comoros' >Comoros</option><option value='Congo' >Congo</option><option value='Congo- the Democratic Republic' >Congo- the Democratic Republic</option><option value='Cook Islands' >Cook Islands</option><option value='Costa Rica' >Costa Rica</option><option value='Cote d&#039;Ivoire' >Cote d&#039;Ivoire</option><option value='Croatia (local name: Hrvatska)' >Croatia (local name: Hrvatska)</option><option value='Cuba' >Cuba</option><option value='Cyprus' >Cyprus</option><option value='Czech Republic' >Czech Republic</option><option value='Denmark' >Denmark</option><option value='Djibouti' >Djibouti</option><option value='Dominica' >Dominica</option><option value='Dominican Republic' >Dominican Republic</option><option value='East Timor' >East Timor</option><option value='Ecuador' >Ecuador</option><option value='Egypt' >Egypt</option><option value='El Salvador' >El Salvador</option><option value='Falkland Islands (Malvinas)' >Falkland Islands (Malvinas)</option><option value='Faroe Islands' >Faroe Islands</option><option value='Fiji' >Fiji</option><option value='Finland' >Finland</option><option value='France' >France</option><option value='France- Metropolitan' >France- Metropolitan</option><option value='French Guiana' >French Guiana</option><option value='French Polynesia' >French Polynesia</option><option value='French Southern Territories' >French Southern Territories</option><option value='Gabon' >Gabon</option><option value='Gambia' >Gambia</option><option value='Georgia' >Georgia</option><option value='Germany' >Germany</option><option value='Ghana' >Ghana</option><option value='Gibraltar' >Gibraltar</option><option value='Greece' >Greece</option><option value='Greenland' >Greenland</option><option value='Grenada' >Grenada</option><option value='Guadeloupe' >Guadeloupe</option><option value='Guam' >Guam</option><option value='Guatemala' >Guatemala</option><option value='Guinea' >Guinea</option><option value='Guinea-Bissau' >Guinea-Bissau</option><option value='Guyana' >Guyana</option><option value='Haiti' >Haiti</option><option value='Heard and Mc Donald Islands' >Heard and Mc Donald Islands</option><option value='Holy see (Vatican City State)' >Holy see (Vatican City State)</option><option value='Honduras' >Honduras</option><option value='Hong Kong' >Hong Kong</option><option value='Hungary' >Hungary</option><option value='Iceland' >Iceland</option><option value='India' >India</option><option value='Indonesia' >Indonesia</option><option value='Iran (Islamic Republic of)' >Iran (Islamic Republic of)</option><option value='Iraq' >Iraq</option><option value='Ireland' >Ireland</option><option value='Israel' >Israel</option><option value='Italy' >Italy</option><option value='Jamaica' >Jamaica</option><option value='Japan' >Japan</option><option value='Jordan' >Jordan</option><option value='Kazakhstan' >Kazakhstan</option><option value='Kenya' >Kenya</option><option value='Kiribati' >Kiribati</option><option value='Korea- Democratic People&#039;s Rep' >Korea- Democratic People&#039;s Rep</option><option value='Korea- Republic of' >Korea- Republic of</option><option value='Kuwait' >Kuwait</option><option value='Kyrgyzstan' >Kyrgyzstan</option><option value='Lao People&#039;s Democratic Republ' >Lao People&#039;s Democratic Republ</option><option value='Latvia' >Latvia</option><option value='Lebanon' >Lebanon</option><option value='Lesotho' >Lesotho</option><option value='Liberia' >Liberia</option><option value='Libyan Arab Jamahiriya' >Libyan Arab Jamahiriya</option><option value='Liechtenstein' >Liechtenstein</option><option value='Lithuania' >Lithuania</option><option value='Luxembourg' >Luxembourg</option><option value='Macau' >Macau</option><option value='Macedonia- the former Yugoslav' >Macedonia- the former Yugoslav</option><option value='Madagascar' >Madagascar</option><option value='Malawi' >Malawi</option><option value='Malaysia' >Malaysia</option><option value='Maldives' >Maldives</option><option value='Mali' >Mali</option><option value='Malta' >Malta</option><option value='Marshall Islands' >Marshall Islands</option><option value='Martinique' >Martinique</option><option value='Mauritania' >Mauritania</option><option value='Mauritius' >Mauritius</option><option value='Mayotte' >Mayotte</option><option value='Mexico' >Mexico</option><option value='Micronesia- Federated States o' >Micronesia- Federated States o</option><option value='Moldova- Republic of' >Moldova- Republic of</option><option value='Monaco' >Monaco</option><option value='Mongolia' >Mongolia</option><option value='Montserrat' >Montserrat</option><option value='Morocco' >Morocco</option><option value='Mozambique' >Mozambique</option><option value='Myanmar' >Myanmar</option><option value='Namibia' >Namibia</option><option value='Nauru' >Nauru</option><option value='Nepal' >Nepal</option><option value='Netherlands' >Netherlands</option><option value='Netherlands Antilles' >Netherlands Antilles</option><option value='New Caledonia' >New Caledonia</option><option value='New Zealand' >New Zealand</option><option value='Nicaragua' >Nicaragua</option><option value='Niger' >Niger</option><option value='Nigeria' >Nigeria</option><option value='Niue' >Niue</option><option value='Norfolk Island' >Norfolk Island</option><option value='Northern Mariana Islands' >Northern Mariana Islands</option><option value='Norway' >Norway</option><option value='Oman' >Oman</option><option value='Pakistan' >Pakistan</option><option value='Palau' >Palau</option><option value='Palestinian Territory- occupie' >Palestinian Territory- occupie</option><option value='Panama' >Panama</option><option value='Papua New Guinea' >Papua New Guinea</option><option value='Paraguay' >Paraguay</option><option value='Peru' >Peru</option><option value='Philippines' >Philippines</option><option value='Pitcairn' >Pitcairn</option><option value='Poland' >Poland</option><option value='Portugal' >Portugal</option><option value='Puerto Rico' >Puerto Rico</option><option value='Qatar' >Qatar</option><option value='Reunion' >Reunion</option><option value='Romania' >Romania</option><option value='Russian Federation' >Russian Federation</option><option value='Rwanda' >Rwanda</option><option value='Saint Kitts and Nevis' >Saint Kitts and Nevis</option><option value='Saint Lucia' >Saint Lucia</option><option value='Saint Vincent and the Grenadin' >Saint Vincent and the Grenadin</option><option value='Samoa' >Samoa</option><option value='San Marino' >San Marino</option><option value='Sao Tome and Principe' >Sao Tome and Principe</option><option value='Saudi Arabia' >Saudi Arabia</option><option value='Senegal' >Senegal</option><option value='Seychelles' >Seychelles</option><option value='Sierra Leone' >Sierra Leone</option><option value='Singapore' >Singapore</option><option value='Slovakia (Slovak Republic)' >Slovakia (Slovak Republic)</option><option value='Slovenia' >Slovenia</option><option value='Solomon Islands' >Solomon Islands</option><option value='Somalia' >Somalia</option><option value='South Africa' >South Africa</option><option value='South Georgia and the South Sa' >South Georgia and the South Sa</option><option value='Spain' >Spain</option><option value='Sri Lanka' >Sri Lanka</option><option value='St. Helena' >St. Helena</option><option value='St. Pierre and Miquelon' >St. Pierre and Miquelon</option><option value='Sudan' >Sudan</option><option value='Suriname' >Suriname</option><option value='Svalbard and Jan Mayen Islands' >Svalbard and Jan Mayen Islands</option><option value='Swaziland' >Swaziland</option><option value='Sweden' >Sweden</option><option value='Switzerland' >Switzerland</option><option value='Syrian Arab Republic' >Syrian Arab Republic</option><option value='Taiwan- Province of China' >Taiwan- Province of China</option><option value='Tajikistan' >Tajikistan</option><option value='Tanzania- United Republic of' >Tanzania- United Republic of</option><option value='Thailand' >Thailand</option><option value='Togo' >Togo</option><option value='Tokelau' >Tokelau</option><option value='Tonga' >Tonga</option><option value='Trinidad and Tobago' >Trinidad and Tobago</option><option value='Tunisia' >Tunisia</option><option value='Turkey' >Turkey</option><option value='Turkmenistan' >Turkmenistan</option><option value='Turks and Caicos Islands' >Turks and Caicos Islands</option><option value='Tuvalu' >Tuvalu</option><option value='Uganda' >Uganda</option><option value='Ukraine' >Ukraine</option><option value='United Arab Emirates' >United Arab Emirates</option><option value='United Kingdom' >United Kingdom</option><option value='United States' >United States</option><option value='United States minor outlying i' >United States minor outlying i</option><option value='Uruguay' >Uruguay</option><option value='Uzbekistan' >Uzbekistan</option><option value='Vanuatu' >Vanuatu</option><option value='Venezuela' >Venezuela</option><option value='Viet Nam' >Viet Nam</option><option value='Virgin Islands (British)' >Virgin Islands (British)</option><option value='Virgin Islands (U.S.)' >Virgin Islands (U.S.)</option><option value='Wallis and Futuna Islands' >Wallis and Futuna Islands</option><option value='Western Sahara' >Western Sahara</option><option value='Yemen' >Yemen</option><option value='Yugoslavia' >Yugoslavia</option><option value='Zambia' >Zambia</option><option value='Zimbabwe' >Zimbabwe</option> </select>")
        }

        function Wf() {
            var a;
            a = {};
            return D('<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="password">' + (a.current ? "Current password" : "Password") + '</label><input type="password" name="password" autocomplete="current-password" class="mdl-textfield__input firebaseui-input firebaseui-id-password"></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-hidden firebaseui-id-password-error"></p></div>')
        }

        function Xf() {
            return D('<a class="firebaseui-link firebaseui-id-secondary-link" href="javascript:void(0)">Trouble signing in?</a>')
        }

        function Yf() {
            return D('<button class="firebaseui-id-secondary-link firebaseui-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Cancel</button>')
        }

        function Zf(a) {
            return D('<div class="firebaseui-info-bar firebaseui-id-info-bar"><p class="firebaseui-info-bar-message">' + C(a.message) + '&nbsp;&nbsp;<a href="javascript:void(0)" class="firebaseui-link firebaseui-id-dismiss-info-bar">Dismiss</a></p></div>')
        }

        Zf.B = "firebaseui.auth.soy2.element.infoBar";
        function $f() {
            return D('<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate firebaseui-busy-indicator firebaseui-id-busy-indicator"></div>')
        }

        $f.B = "firebaseui.auth.soy2.element.busyIndicator";
        function ag(a) {
            a = a || {};
            var b = "";
            switch (a.providerId) {
                case "google.com":
                    b += "Google";
                    break;
                case "github.com":
                    b += "Github";
                    break;
                case "facebook.com":
                    b += "Facebook";
                    break;
                case "twitter.com":
                    b += "Twitter";
                    break;
                default:
                    b += "Password"
            }
            return E(b)
        }

        function bg(a) {
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-sign-in"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">ENTER EMAIL TO <br> SIGN IN/REGISTER</h1></div><div class="firebaseui-card-content"><div class="firebaseui-relative-wrapper">' +
                Uf(a) + '</div></div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' + Yf() + L(null) + "</div></div></form></div>")
        }

        bg.B = "firebaseui.auth.soy2.page.signIn";
        function cg(a) {
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-sign-in"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content">' + Uf(a) + Wf() + '</div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' +
                D(L({label: $b("Sign In")})) + "</div>" + Xf() + "</div></form></div>")
        }

        cg.B = "firebaseui.auth.soy2.page.passwordSignIn";
        function dg(a) {
            a = a || {};
            var b = a.rd, c = a.Jc, d = a.Cb, e = D, f = '<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-sign-up"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Create account</h1></div><div class="firebaseui-card-content">' + Uf(a);
            b ? (b = a || {}, b = b.name, b = D('<div class="firebaseui-textfield mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><label class="mdl-textfield__label firebaseui-label" for="name">First &amp; last name</label><input type="text" name="name" autocomplete="name" class="mdl-textfield__input firebaseui-input firebaseui-id-name" value="' +
                    ac(null != b ? b : "") + '"></div><div class="firebaseui-error-wrapper"><p class="firebaseui-error firebaseui-hidden firebaseui-id-name-error"></p></div>')) : b = "";
            f = f + b + Vf({Od: !0}) + country(a);
            c ? (a = a || {}, a = D('<p class="firebaseui-tos">')) : a = "";
            return e(f + a + '</div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' + (d ? Yf() : "") + D(L({label: $b("Save")})) +
                "</div></div></form></div>")
        }

        dg.B = "firebaseui.auth.soy2.page.passwordSignUp";
        function eg(a) {
            a = a || {};
            var b = a.Cb;
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-recovery"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Recover password</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Get instructions sent to this email that explain how to reset your password</p>' + Uf(a) + '</div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' +
                (b ? Yf() : "") + L({label: $b("Send")}) + "</div></div></form></div>")
        }

        eg.B = "firebaseui.auth.soy2.page.passwordRecovery";
        function fg(a) {
            var b = a.H;
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-recovery-email-sent"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Check your email</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Follow the instructions sent to <strong>' + C(a.email) + '</strong> to recover your password</p></div><div class="firebaseui-card-footer">' +
                (b ? '<div class="firebaseui-form-actions">' + L({label: $b("Done")}) + "</div>" : "") + "</div></div>")
        }

        fg.B = "firebaseui.auth.soy2.page.passwordRecoveryEmailSent";
        function gg() {
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-callback"><div class="firebaseui-callback-indicator-container">' + $f() + "</div></div>")
        }

        gg.B = "firebaseui.auth.soy2.page.callback";
        function hg(a) {
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-linking"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">You already have an account</h2><p class="firebaseui-text">You\u2019ve already used <strong>' +
                C(a.email) + "</strong> to sign in. Enter your password for that account.</p>" + Wf() + '</div><div class="firebaseui-card-footer">' + Xf() + '<div class="firebaseui-form-actions">' + D(L({label: $b("Sign In")})) + "</div></div></form></div>")
        }

        hg.B = "firebaseui.auth.soy2.page.passwordLinking";
        function ig(a) {
            var b = a.email;
            a = "" + ag(a);
            a = $b(a);
            b = "" + ('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-federated-linking"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">You already have an account</h2><p class="firebaseui-text">You\u2019ve already used <strong>' +
                C(b) + "</strong>. Sign in with " + C(a) + ' to continue.</p></div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' + L({label: $b("Sign in with " + a)}) + "</div></div></form></div>");
            return D(b)
        }

        ig.B = "firebaseui.auth.soy2.page.federatedLinking";
        function jg(a) {
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-reset"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Reset your password</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">for <strong>' +
                C(a.email) + "</strong></p>" + Vf(Zb(a)) + '</div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' + D(L({label: $b("Save")})) + "</div></div></form></div>")
        }

        jg.B = "firebaseui.auth.soy2.page.passwordReset";
        function kg(a) {
            a = a || {};
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-reset-success"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Password changed</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">You can now sign in with your new password</p></div><div class="firebaseui-card-footer">' +
                (a.H ? '<div class="firebaseui-form-actions">' + L(null) + "</div>" : "") + "</div></div>")
        }

        kg.B = "firebaseui.auth.soy2.page.passwordResetSuccess";
        function lg(a) {
            a = a || {};
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-reset-failure"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Try resetting your password again</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Your request to reset your password has expired or the link has already been used</p></div><div class="firebaseui-card-footer">' +
                (a.H ? '<div class="firebaseui-form-actions">' + L(null) + "</div>" : "") + "</div></div>")
        }

        lg.B = "firebaseui.auth.soy2.page.passwordResetFailure";
        function mg(a) {
            var b = a.H;
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-change-revoke-success"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Updated email address</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Your sign-in email address has been changed back to <strong>' +
                C(a.email) + '</strong>.</p><p class="firebaseui-text">If you didn\u2019t ask to change your sign-in email, it\u2019s possible someone is trying to access your account and you should <a class="firebaseui-link firebaseui-id-reset-password-link" href="javascript:void(0)">change your password right away</a>.</p></div><div class="firebaseui-card-footer">' + (b ? '<div class="firebaseui-form-actions">' + L(null) + "</div>" : "") + "</div></form></div>")
        }

        mg.B = "firebaseui.auth.soy2.page.emailChangeRevokeSuccess";
        function ng(a) {
            a =
                a || {};
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-change-revoke-failure"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Unable to update your email address</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">There was a problem changing your sign-in email back.</p><p class="firebaseui-text">If you try again and still can\u2019t reset your email, try asking your administrator for help.</p></div><div class="firebaseui-card-footer">' +
                (a.H ? '<div class="firebaseui-form-actions">' + L(null) + "</div>" : "") + "</div></div>")
        }

        ng.B = "firebaseui.auth.soy2.page.emailChangeRevokeFailure";
        function og(a) {
            a = a || {};
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-verification-success"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Your email has been verified</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">You can now sign in with your new account</p></div><div class="firebaseui-card-footer">' +
                (a.H ? '<div class="firebaseui-form-actions">' + L(null) + "</div>" : "") + "</div></div>")
        }

        og.B = "firebaseui.auth.soy2.page.emailVerificationSuccess";
        function pg(a) {
            a = a || {};
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-verification-failure"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Try verifying your email again</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">Your request to verify your email has expired or the link has already been used</p></div><div class="firebaseui-card-footer">' +
                (a.H ? '<div class="firebaseui-form-actions">' + L(null) + "</div>" : "") + "</div></div>")
        }

        pg.B = "firebaseui.auth.soy2.page.emailVerificationFailure";
        function qg(a) {
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-unrecoverable-error"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Error encountered</h1></div><div class="firebaseui-card-content"><p class="firebaseui-text">' + C(a.Tc) + "</p></div></div>")
        }

        qg.B = "firebaseui.auth.soy2.page.unrecoverableError";
        function rg(a) {
            var b = a.nd;
            return D('<div class="mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-email-mismatch"><form onsubmit="return false;"><div class="firebaseui-card-header"><h1 class="firebaseui-title">Sign in</h1></div><div class="firebaseui-card-content"><h2 class="firebaseui-subtitle">Continue with ' + C(a.Cd) + '?</h2><p class="firebaseui-text">You originally wanted to sign in with ' + C(b) + '</p></div><div class="firebaseui-card-footer"><div class="firebaseui-form-actions">' +
                Yf() + L({label: $b("Continue")}) + "</div></div></form></div>")
        }

        rg.B = "firebaseui.auth.soy2.page.emailMismatch";
        function sg(a, b, c) {
            var d = '<div class="firebaseui-container firebaseui-page-provider-sign-in firebaseui-id-page-provider-sign-in"><div class="firebaseui-card-content"><form onsubmit="return false;"><ul class="firebaseui-idp-list">';
            a = a.pd;
            b = a.length;
            for (var e = 0; e < b; e++) {
                var f;
                f = {providerId: a[e]};
                var g = c, k = f.providerId, u = f, u = u || {}, B = "";
                switch (u.providerId) {
                    case "google.com":
                        B += "firebaseui-idp-google";
                        break;
                    case "github.com":
                        B += "firebaseui-idp-github";
                        break;
                    case "facebook.com":
                        B += "firebaseui-idp-facebook";
                        break;
                    case "twitter.com":
                        B += "firebaseui-idp-twitter";
                        break;
                    default:
                        B += "firebaseui-idp-password"
                }
                var u = D, B = '<button class="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised ' + ac(E(B)) + ' firebaseui-id-idp-button " data-provider-id="' + ac(k) + '"><img class="firebaseui-idp-icon" src="', na = f, na = na || {}, W = "";
                switch (na.providerId) {
                    case "google.com":
                        W += fc(g.ad);
                        break;
                    case "github.com":
                        W +=
                            fc(g.$c);
                        break;
                    case "facebook.com":
                        W += fc(g.Wc);
                        break;
                    case "twitter.com":
                        W += fc(g.zd);
                        break;
                    default:
                        W += fc(g.md)
                }
                g = Yb(W);
                f = u(B + ac(fc(g)) + '">' + ("password" == k ? '<span class="firebaseui-idp-text firebaseui-idp-text-long">ENTER EMAIL TO <br> SIGN IN/REGISTER</span><span class="firebaseui-idp-text firebaseui-idp-text-short">Email</span>' : '<span class="firebaseui-idp-text firebaseui-idp-text-long">Sign in with ' + C(ag(f)) + '</span><span class="firebaseui-idp-text firebaseui-idp-text-short">' + C(ag(f)) + "</span>") + "</button>");
                d +=
                    '<li class="firebaseui-list-item">' + f + "</li>"
            }
            return D(d + "</ul></form></div></div>")
        }

        sg.B = "firebaseui.auth.soy2.page.providerSignIn";
        function tg() {
            return E("This email already exists without any means of sign-in. Please reset the password to recover.")
        }

        function ug() {
            return E("Please login again to perform this operation")
        }

        function vg(a, b, c, d) {
            this.Qa = a;
            this.jc = b || null;
            this.od = c || null;
            this.Vb = d || null
        }

        vg.prototype.D = function () {
            return this.Qa
        };
        vg.prototype.ab = function () {
            return {
                email: this.Qa, displayName: this.jc,
                photoUrl: this.od, providerId: this.Vb
            }
        };
        function wg(a) {
            return a.email ? new vg(a.email, a.displayName, a.photoUrl, a.providerId) : null
        }

        var xg = null;

        function yg(a) {
            return !(!a || -32E3 != a.code || "Service unavailable" != a.message)
        }

        function zg(a, b, c, d) {
            xg || (a = {
                callbacks: {
                    empty: a, select: function (a, d) {
                        a && a.account && b ? b(wg(a.account)) : c && c(!yg(d))
                    }, store: a, update: a
                }, language: "en", providers: void 0, ui: d
            }, "undefined" != typeof accountchooser && accountchooser.Api && accountchooser.Api.init ? xg = accountchooser.Api.init(a) : (xg = new Ag(a),
                    Bg()))
        }

        function Cg(a, b, c) {
            function d() {
                var a = Te(c).toString();
                xg.select(Ga(b || [], function (a) {
                    return a.ab()
                }), {clientCallbackUrl: a})
            }

            b && b.length ? d() : xg.checkEmpty(function (b, c) {
                    b || c ? a(!yg(c)) : d()
                })
        }

        function Ag(a) {
            this.a = a;
            this.a.callbacks = this.a.callbacks || {}
        }

        function Bg() {
            var a = xg;
            p(a.a.callbacks.empty) && a.a.callbacks.empty()
        }

        var Dg = {code: -32E3, message: "Service unavailable", data: "Service is unavailable."};
        h = Ag.prototype;
        h.store = function () {
            p(this.a.callbacks.store) && this.a.callbacks.store(void 0, Dg)
        };
        h.select = function () {
            p(this.a.callbacks.select) && this.a.callbacks.select(void 0, Dg)
        };
        h.update = function () {
            p(this.a.callbacks.update) && this.a.callbacks.update(void 0, Dg)
        };
        h.checkDisabled = function (a) {
            a(!0)
        };
        h.checkEmpty = function (a) {
            a(void 0, Dg)
        };
        h.checkAccountExist = function (a, b) {
            b(void 0, Dg)
        };
        h.checkShouldUpdate = function (a, b) {
            b(void 0, Dg)
        };
        function Eg(a) {
            a = fa(a) && 1 == a.nodeType ? a : document.querySelector(String(a));
            if (null == a)throw Error("Could not find the FirebaseUI widget element on the page.");
            return a
        }

        function Fg() {
            this.aa = {}
        }

        function M(a, b, c) {
            if (b.toLowerCase() in a.aa)throw Error("Configuration " + b + " has already been defined.");
            a.aa[b.toLowerCase()] = c
        }

        Fg.prototype.update = function (a, b) {
            if (!(a.toLowerCase() in this.aa))throw Error("Configuration " + a + " is not defined.");
            this.aa[a.toLowerCase()] = b
        };
        Fg.prototype.get = function (a) {
            if (!(a.toLowerCase() in this.aa))throw Error("Configuration " + a + " is not defined.");
            return this.aa[a.toLowerCase()]
        };
        function Gg(a, b) {
            var c = a.get(b);
            if (!c)throw Error("Configuration " +
                b + " is required.");
            return c
        }

        var N = {}, Hg = 0;

        function Ig(a, b) {
            if (!a)throw Error("Event target element must be provided!");
            var c = Jg(a);
            if (N[c] && N[c].length)for (var d = 0; d < N[c].length; d++)N[c][d].dispatchEvent(b)
        }

        function Kg(a) {
            var b = Jg(a.L());
            N[b] && N[b].length && (Ma(N[b], function (b) {
                return b == a
            }), N[b].length || delete N[b])
        }

        function Jg(a) {
            "undefined" === typeof a.ic && (a.ic = Hg, Hg++);
            return a.ic
        }

        function Lg(a) {
            if (!a)throw Error("Event target element must be provided!");
            this.Sc = a;
            H.call(this)
        }

        t(Lg, H);
        Lg.prototype.L =
            function () {
                return this.Sc
            };
        Lg.prototype.register = function () {
            var a = Jg(this.L());
            N[a] ? Ja(N[a], this) || N[a].push(this) : N[a] = [this]
        };
        Lg.prototype.unregister = function () {
            Kg(this)
        };
        var Mg = {
            "facebook.com": "FacebookAuthProvider",
            "github.com": "GithubAuthProvider",
            "google.com": "GoogleAuthProvider",
            password: "EmailAuthProvider",
            "twitter.com": "TwitterAuthProvider"
        };
        var Ng;
        Ng = ae("firebaseui");
        var Og = new he;
        if (1 != Og.pc) {
            $d();
            var Pg = Zd, Qg = Og.qd;
            Pg.Wa || (Pg.Wa = []);
            Pg.Wa.push(Qg);
            Og.pc = !0
        }
        function Rg(a) {
            Ng && Ng.log(Td,
                a, void 0)
        }

        function Sg(a, b) {
            this.Qa = a;
            this.ta = b || null
        }

        Sg.prototype.D = function () {
            return this.Qa
        };
        Sg.prototype.ab = function () {
            var a;
            if (a = this.ta) {
                a = this.ta;
                var b = {}, c;
                for (c in a)b[c] = a[c];
                a = b
            }
            return {email: this.Qa, credential: a}
        };
        function Tg(a) {
            if (a && a.email) {
                var b;
                if (b = a.credential) {
                    var c = (b = a.credential) && b.provider;
                    b = Mg[c] && firebase.auth[Mg[c]] ? b.secret && b.accessToken ? firebase.auth[Mg[c]].credential(b.accessToken, b.secret) : c == firebase.auth.GoogleAuthProvider.PROVIDER_ID ? firebase.auth[Mg[c]].credential(b.idToken,
                                    b.accessToken) : firebase.auth[Mg[c]].credential(b.accessToken) : null
                }
                return new Sg(a.email, b)
            }
            return null
        }

        var Ug = /MSIE ([\d.]+).*Windows NT ([\d.]+)/, Vg = /Firefox\/([\d.]+)/, Wg = /Opera[ \/]([\d.]+)(.*Version\/([\d.]+))?/, Xg = /Chrome\/([\d.]+)/, Yg = /((Windows NT ([\d.]+))|(Mac OS X ([\d_]+))).*Version\/([\d.]+).*Safari/, Zg = /Mac OS X;.*(?!(Version)).*Safari/, $g = /Android ([\d.]+).*Safari/, ah = /OS ([\d_]+) like Mac OS X.*Mobile.*Safari/, bh = /Konqueror\/([\d.]+)/, ch = /MSIE ([\d.]+).*Windows Phone OS ([\d.]+)/;

        function O(a, b) {
            this.Ka = a;
            var c = a.split(b || ".");
            this.Na = [];
            for (var d = 0; d < c.length; d++)this.Na.push(parseInt(c[d], 10))
        }

        O.prototype.compare = function (a) {
            a instanceof O || (a = new O(String(a)));
            for (var b = Math.max(this.Na.length, a.Na.length), c = 0; c < b; c++) {
                var d = this.Na[c], e = a.Na[c];
                if (void 0 !== d && void 0 !== e && d !== e)return d - e;
                if (void 0 === d)return -1;
                if (void 0 === e)return 1
            }
            return 0
        };
        function P(a, b) {
            return 0 <= a.compare(b)
        }

        function dh() {
            var a = window.navigator && window.navigator.userAgent;
            if (a) {
                var b;
                if (b = a.match(Wg)) {
                    var c =
                        new O(b[3] || b[1]);
                    return 0 <= a.indexOf("Opera Mini") ? !1 : 0 <= a.indexOf("Opera Mobi") ? 0 <= a.indexOf("Android") && P(c, "10.1") : P(c, "8.0")
                }
                if (b = a.match(Vg))return P(new O(b[1]), "2.0");
                if (b = a.match(Xg))return P(new O(b[1]), "6.0");
                if (b = a.match(Yg))return c = new O(b[6]), a = b[3] && new O(b[3]), b = b[5] && new O(b[5], "_"), (!(!a || !P(a, "6.0")) || !(!b || !P(b, "10.5.6"))) && P(c, "3.0");
                if (b = a.match($g))return P(new O(b[1]), "3.0");
                if (b = a.match(ah))return P(new O(b[1], "_"), "4.0");
                if (b = a.match(bh))return P(new O(b[1]), "4.7");
                if (b =
                        a.match(ch))return c = new O(b[1]), a = new O(b[2]), P(c, "7.0") && P(a, "7.0");
                if (b = a.match(Ug))return c = new O(b[1]), a = new O(b[2]), P(c, "7.0") && P(a, "6.0");
                if (a.match(Zg))return !1
            }
            return !0
        }

        var eh, fh = new Rf;
        eh = Qf(fh) ? new Tf(fh, "firebaseui") : null;
        var gh = new Mf(eh), hh, ih = new Sf;
        hh = Qf(ih) ? new Tf(ih, "firebaseui") : null;
        var jh = new Mf(hh), kh = {name: "pendingEmailCredential", Ha: !1}, lh = {
            name: "redirectUrl",
            Ha: !1
        }, mh = {name: "rememberAccount", Ha: !1}, nh = {name: "rememberedAccounts", Ha: !0};

        function oh(a, b) {
            return (a.Ha ? gh : jh).get(b ?
                a.name + ":" + b : a.name)
        }

        function ph(a, b) {
            (a.Ha ? gh : jh).remove(b ? a.name + ":" + b : a.name)
        }

        function qh(a, b, c) {
            (a.Ha ? gh : jh).set(c ? a.name + ":" + c : a.name, b)
        }

        function rh(a) {
            a = oh(nh, a) || [];
            a = Ga(a, function (a) {
                return wg(a)
            });
            return Fa(a, ca)
        }

        function sh(a, b) {
            var c = rh(b), d = Ia(c, function (b) {
                return b.D() == a.D() && (b.Vb || null) == (a.Vb || null)
            });
            -1 < d && La(c, d);
            c.unshift(a);
            qh(nh, Ga(c, function (a) {
                return a.ab()
            }), b)
        }

        function th(a) {
            a = oh(kh, a) || null;
            return Tg(a)
        }

        function uh() {
            this.a = new Fg;
            M(this.a, "acUiConfig");
            M(this.a, "callbacks");
            M(this.a, "credentialHelper", vh);
            M(this.a, "popupMode", !1);
            M(this.a, "queryParameterForSignInSuccessUrl", "signInSuccessUrl");
            M(this.a, "queryParameterForWidgetMode", "mode");
            M(this.a, "signInFlow");
            M(this.a, "signInOptions");
            M(this.a, "signInSuccessUrl");
            M(this.a, "siteName");
            M(this.a, "tosUrl");
            M(this.a, "widgetUrl")
        }

        var vh = "accountchooser.com", wh = {Ed: vh, NONE: "none"}, xh = {Gd: "popup", Id: "redirect"};

        function yh(a) {
            return a.a.get("acUiConfig") || null
        }

        var zh = {
            Fd: "callback", Hd: "recoverEmail", Jd: "resetPassword", Kd: "select",
            Ld: "verifyEmail"
        };

        function Ah(a) {
            var b = a.a.get("widgetUrl");
            b || (b = Je(Se(window.location.href), ""), b = Ie(b, "", void 0).toString());
            return Bh(a, b)
        }

        function Bh(a, b) {
            for (var c = Ch(a), d = b.search(Ce), e = 0, f, g = []; 0 <= (f = Be(b, e, c, d));)g.push(b.substring(e, f)), e = Math.min(b.indexOf("&", f) + 1 || d, d);
            g.push(b.substr(e));
            c = [g.join("").replace(Ee, "$1"), "&", c];
            c.push("=", encodeURIComponent("select"));
            c[1] && (d = c[0], e = d.indexOf("#"), 0 <= e && (c.push(d.substr(e)), c[0] = d = d.substr(0, e)), e = d.indexOf("?"), 0 > e ? c[1] = "?" : e == d.length -
                1 && (c[1] = void 0));
            return c.join("")
        }

        function Dh(a) {
            a = a.a.get("signInOptions") || [];
            for (var b = [], c = 0; c < a.length; c++) {
                var d = a[c], d = fa(d) ? d : {provider: d};
                Mg[d.provider] && b.push(d)
            }
            return b
        }

        function Eh(a) {
            return Ga(Dh(a), function (a) {
                return a.provider
            })
        }

        function Fh(a, b) {
            for (var c = Dh(a), d = 0; d < c.length; d++)if (c[d].provider === b)return c = c[d].scopes, da(c) ? c : [];
            return []
        }

        function Ch(a) {
            return Gg(a.a, "queryParameterForWidgetMode")
        }

        function Gh(a) {
            a = Dh(a);
            for (var b = 0; b < a.length; b++)if (a[b].provider == firebase.auth.EmailAuthProvider.PROVIDER_ID &&
                "undefined" !== typeof a[b].requireDisplayName)return !!a[b].requireDisplayName;
            return !0
        }

        function Hh(a) {
            a = a.a.get("signInFlow");
            for (var b in xh)if (xh[b] == a)return xh[b];
            return "redirect"
        }

        function Ih(a) {
            return a.a.get("callbacks") || {}
        }

        function Jh(a) {
            a = a.a.get("credentialHelper");
            for (var b in wh)if (wh[b] == a)return wh[b];
            return vh
        }

        uh.prototype.zb = function (a) {
            for (var b in a)try {
                this.a.update(b, a[b])
            } catch (c) {
                Rg('Invalid config: "' + b + '"')
            }
            cb && this.a.update("popupMode", !1)
        };
        uh.prototype.update = function (a, b) {
            this.a.update(a,
                b)
        };
        var Q = {};

        function R(a, b, c, d) {
            Q[a].apply(null, Array.prototype.slice.call(arguments, 1))
        }

        function S(a, b) {
            var c;
            c = Hb(a);
            b ? (of(a, "firebaseui-input-invalid"), nf(a, "firebaseui-input"), c && of(c, "firebaseui-textfield-invalid")) : (of(a, "firebaseui-input"), nf(a, "firebaseui-input-invalid"), c && nf(c, "firebaseui-textfield-invalid"))
        }

        function Kh(a, b, c) {
            b = new Cf(b);
            Zc(a, ka($c, b));
            jf(a).ma(b, "input", c)
        }

        function Lh(a, b, c) {
            b = new pf(b);
            Zc(a, ka($c, b));
            jf(a).ma(b, "key", function (a) {
                13 == a.keyCode && (a.stopPropagation(),
                    a.preventDefault(), c(a))
            })
        }

        function Mh(a, b, c) {
            b = new Bf(b);
            Zc(a, ka($c, b));
            jf(a).ma(b, "focusin", c)
        }

        function Nh(a, b, c) {
            b = new Bf(b);
            Zc(a, ka($c, b));
            jf(a).ma(b, "focusout", c)
        }

        function Oh(a, b, c) {
            b = new wf(b);
            Zc(a, ka($c, b));
            jf(a).ma(b, "action", function (a) {
                a.stopPropagation();
                a.preventDefault();
                c(a)
            })
        }

        function Ph(a) {
            nf(a, "firebaseui-hidden")
        }

        function T(a, b) {
            if (b)if ("textContent" in a) a.textContent = b; else if (3 == a.nodeType) a.data = b; else if (a.firstChild && 3 == a.firstChild.nodeType) {
                for (; a.lastChild != a.firstChild;)a.removeChild(a.lastChild);
                a.firstChild.data = b
            } else {
                for (var c; c = a.firstChild;)a.removeChild(c);
                a.appendChild(zb(a).createTextNode(String(b)))
            }
            of(a, "firebaseui-hidden")
        }

        function Qh(a) {
            return !mf(a, "firebaseui-hidden") && "none" != a.style.display
        }

        function Rh() {
            Gb(Sh.call(this))
        }

        function Sh() {
            return this.C("firebaseui-id-info-bar")
        }

        function Th() {
            return this.C("firebaseui-id-dismiss-info-bar")
        }

        var Uh = {
            Qd: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/profile-picture-small.png",
            ad: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/google.svg",
            $c: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/github.svg",
            Wc: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/facebook.svg",
            zd: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/twitter.svg",
            md: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/mail.svg",
            Vd: "https://www.gstatic.com/firebasejs/ui/0.5.0/images/auth/"
        };

        function Vh(a, b, c) {
            cd.call(this, a, b);
            for (var d in c)this[d] = c[d]
        }

        t(Vh, cd);
        function U(a, b, c, d) {
            hf.call(this, c);
            this.Gc = a;
            this.Fc = b;
            this.ob = !1;
            this.yc =
                d || null;
            this.Z = this.Za = null
        }

        t(U, hf);
        U.prototype.Ib = function () {
            var a = Mb(this.Gc, this.Fc, Uh, this.ib());
            Wh(a, "upgradeElement");
            this.f = a
        };
        var Xh = ["mdl-js-textfield", "mdl-js-progress", "mdl-js-button"];

        function Wh(a, b) {
            a && window.componentHandler && window.componentHandler[b] && Da(Xh, function (c) {
                if (mf(a, c)) window.componentHandler[b](a);
                c = Ab(c, a);
                Da(c, function (a) {
                    window.componentHandler[b](a)
                })
            })
        }

        U.prototype.l = function () {
            U.c.l.call(this);
            Ig(V(this), new Vh("pageEnter", V(this), {pageId: this.yc}))
        };
        U.prototype.Ra =
            function () {
                Ig(V(this), new Vh("pageExit", V(this), {pageId: this.yc}));
                U.c.Ra.call(this)
            };
        U.prototype.b = function () {
            window.clearTimeout(this.Za);
            this.Fc = this.Gc = this.Za = null;
            this.ob = !1;
            this.Z = null;
            Wh(this.L(), "downgradeElements");
            U.c.b.call(this)
        };
        function Yh(a) {
            a.ob = !0;
            a.Za = window.setTimeout(function () {
                a.L() && null === a.Z && (a.Z = Mb($f, null, null, a.ib()), a.L().appendChild(a.Z), Wh(a.Z, "upgradeElement"))
            }, 500)
        }

        function Zh(a, b, c, d, e) {
            function f() {
                if (a.Da)return null;
                a.ob = !1;
                window.clearTimeout(a.Za);
                a.Za = null;
                a.Z && (Wh(a.Z, "downgradeElements"), Gb(a.Z), a.Z = null)
            }

            if (a.ob)return null;
            Yh(a);
            return b.apply(null, c).then(d, e).then(f, f)
        }

        function V(a) {
            return a.L().parentElement || a.L().parentNode
        }

        function $h(a, b, c) {
            Lh(a, b, function () {
                c.focus()
            })
        }

        function ai(a, b, c) {
            Lh(a, b, function () {
                c()
            })
        }

        r(U.prototype, {
            G: function (a) {
                Rh.call(this);
                var b = Mb(Zf, {message: a}, null, this.ib());
                this.L().appendChild(b);
                Oh(this, Th.call(this), function () {
                    Gb(b)
                })
            }, Rd: Rh, Td: Sh, Sd: Th
        });
        function bi() {
            return this.C("firebaseui-id-submit")
        }

        function ci() {
            return this.C("firebaseui-id-secondary-link")
        }

        function di(a, b) {
            var c = bi.call(this);
            Oh(this, c, function () {
                a()
            });
            (c = ci.call(this)) && b && Oh(this, c, function () {
                b()
            })
        }

        function ei() {
            return this.C("firebaseui-id-password")
        }

        function fi() {
            return this.C("firebaseui-id-password-error")
        }

        function gi() {
            var a = ei.call(this), b = fi.call(this);
            Kh(this, a, function () {
                Qh(b) && (S(a, !0), Ph(b))
            })
        }

        function hi() {
            var a = ei.call(this), b;
            b = fi.call(this);
            K(a) ? (S(a, !0), Ph(b), b = !0) : (S(a, !1), T(b, E("Enter your password").toString()), b = !1);
            return b ? K(a) : null
        }

        function ii(a, b, c, d) {
            U.call(this,
                hg, {email: a}, d, "passwordLinking");
            this.o = b;
            this.tb = c
        }

        t(ii, U);
        ii.prototype.l = function () {
            this.Rb();
            this.A(this.o, this.tb);
            ai(this, this.X(), this.o);
            this.X().focus();
            ii.c.l.call(this)
        };
        ii.prototype.b = function () {
            this.o = null;
            ii.c.b.call(this)
        };
        ii.prototype.fa = function () {
            return K(this.C("firebaseui-id-email"))
        };
        r(ii.prototype, {X: ei, Ob: fi, Rb: gi, Hb: hi, J: bi, ja: ci, A: di});
        function ji() {
            return this.C("firebaseui-id-email")
        }

        function ki() {
            return this.C("firebaseui-id-email-error")
        }

        function li(a) {
            var b = ji.call(this),
                c = ki.call(this);
            Kh(this, b, function () {
                Qh(c) && (S(b, !0), Ph(c))
            });
            a && Lh(this, b, function () {
                a()
            })
        }

        function mi() {
            return qa(K(ji.call(this)) || "")
        }

        function ni() {
            var a = ji.call(this), b;
            b = ki.call(this);
            var c = K(a) || "";
            c ? Ff.test(c) ? (S(a, !0), Ph(b), b = !0) : (S(a, !1), T(b, E("That email address isn't correct").toString()), b = !1) : (S(a, !1), T(b, E("Enter your email address to continue").toString()), b = !1);
            return b ? qa(K(a)) : null
        }

        function oi(a, b, c, d) {
            U.call(this, cg, {email: c}, d, "passwordSignIn");
            this.o = a;
            this.tb = b
        }

        t(oi, U);
        oi.prototype.l =
            function () {
                this.xa();
                this.Rb();
                this.A(this.o, this.tb);
                $h(this, this.u(), this.X());
                ai(this, this.X(), this.o);
                K(this.u()) ? this.X().focus() : this.u().focus();
                oi.c.l.call(this)
            };
        oi.prototype.b = function () {
            this.tb = this.o = null;
            oi.c.b.call(this)
        };
        r(oi.prototype, {u: ji, Fa: ki, xa: li, D: mi, fa: ni, X: ei, Ob: fi, Rb: gi, Hb: hi, J: bi, ja: ci, A: di});
        function X(a, b, c, d, e) {
            U.call(this, a, b, d, e || "notice");
            this.ba = c || null
        }

        t(X, U);
        X.prototype.l = function () {
            this.ba && (this.A(this.ba), this.J().focus());
            X.c.l.call(this)
        };
        X.prototype.b = function () {
            this.ba =
                null;
            X.c.b.call(this)
        };
        r(X.prototype, {J: bi, ja: ci, A: di});
        function pi(a, b, c) {
            X.call(this, fg, {email: a, H: !!b}, b, c, "passwordRecoveryEmailSent")
        }

        t(pi, X);
        function qi(a, b) {
            X.call(this, og, {H: !!a}, a, b, "emailVerificationSuccess")
        }

        t(qi, X);
        function ri(a, b) {
            X.call(this, pg, {H: !!a}, a, b, "emailVerificationFailure")
        }

        t(ri, X);
        function si(a, b) {
            X.call(this, kg, {H: !!a}, a, b, "passwordResetSuccess")
        }

        t(si, X);
        function ti(a, b) {
            X.call(this, lg, {H: !!a}, a, b, "passwordResetFailure")
        }

        t(ti, X);
        function ui(a, b) {
            X.call(this, ng, {H: !!a}, a,
                b, "emailChangeRevokeFailure")
        }

        t(ui, X);
        function vi(a, b) {
            X.call(this, qg, {Tc: a}, void 0, b, "unrecoverableError")
        }

        t(vi, X);
        var wi = !1, xi = null;

        function yi(a, b) {
            wi = !!b;
            xi || (xi = "undefined" == typeof accountchooser && dh() ? Lc(function () {
                }) : Ic());
            xi.then(a, a)
        }

        function zi(a, b) {
            var c = Ih(a.a).accountChooserInvoked || null;
            c ? c(b) : b()
        }

        function Ai(a, b, c) {
            (a = Ih(a.a).accountChooserResult || null) ? a(b, c) : c()
        }

        function Bi(a, b, c, d, e) {
            d ? (R("callback", a, b), wi && c()) : zi(a, function () {
                    Cg(function (d) {
                        Ai(a, d ? "empty" : "unavailable", function () {
                            R("signIn",
                                a, b);
                            (d || wi) && c()
                        })
                    }, rh(a.h), e)
                })
        }

        function Ci(a, b, c, d) {
            function e(a) {
                a = Y(a);
                Di(b, c, void 0, a);
                d()
            }

            Ai(b, "accountSelected", function () {
                qh(mh, !1, b.h);
                Z(b, b.g.fetchProvidersForEmail(a.D()).then(function (e) {
                    Ei(b, c, e, a.D(), a.jc || null || void 0);
                    d()
                }, e))
            })
        }

        function Fi(a, b, c, d) {
            Ai(b, a ? "addAccount" : "unavailable", function () {
                R("signIn", b, c);
                (a || wi) && d()
            })
        }

        function Gi(a, b, c, d) {
            function e() {
                var b = a();
                b && (b = Ih(b.a).uiShown || null) && b()
            }

            zg(function () {
                    var f = a();
                    f && Bi(f, b, e, c, d)
                }, function (c) {
                    var d = a();
                    d && Ci(c, d, b, e)
                },
                function (c) {
                    var d = a();
                    d && Fi(c, d, b, e)
                }, a() && yh(a().a))
        }

        function Hi(a, b, c, d) {
            function e(c) {
                if (!c.name || "cancel" != c.name) {
                    var d;
                    a:{
                        var e = c.message;
                        try {
                            var f = ((JSON.parse(e).error || {}).message || "").toLowerCase().match(/invalid.+(access|id)_token/);
                            if (f && f.length) {
                                d = !0;
                                break a
                            }
                        } catch (g$3) {
                        }
                        d = !1
                    }
                    d ? (c = V(b), b.i(), Di(a, c, void 0, E("Your sign-in session has expired. Please try again.").toString())) : (d = c && c.message || "", c.code && (d = Y(c)), b.G(d))
                }
            }

            var f = c;
            c.provider && "password" == c.provider && (f = null);
            var g = a.g.currentUser ||
                d;
            if (!g)throw Error("User not logged in.");
            Z(a, a.g.signOut().then(function () {
                var b = new vg(g.email, g.displayName, g.photoURL, f && f.provider);
                null != oh(mh, a.h) && !oh(mh, a.h) || sh(b, a.h);
                ph(mh, a.h);
                Z(a, a.Oc.signInWithCredential(c).then(function (b) {
                    var c = Ih(a.a).signInSuccess || null, d = oh(lh, a.h) || null || void 0;
                    ph(lh, a.h);
                    var e = !1;
                    if (window.opener && window.opener.location && window.opener.location.assign) {
                        if (!c || c(b, f, d)) e = !0, window.opener.location.assign(Ii(a, d));
                        c || window.close()
                    } else if (!c || c(b, f, d)) e = !0, window.location.assign(Ii(a,
                        d));
                    e || a.reset()
                }, e).then(function () {
                }, e))
            }, e))
        }

        function Ii(a, b) {
            var c = b || a.a.a.get("signInSuccessUrl");
            if (!c)throw Error("No redirect URL has been found. You must either specify a signInSuccessUrl in the configuration, pass in a redirect URL to the widget URL, or return false from the callback.");
            return c
        }

        function Y(a) {
            var b = "";
            switch (a.code) {
                case "auth/email-already-in-use":
                    b += "The email address is already used by another account";
                    break;
                case "auth/requires-recent-login":
                    b += ug();
                    break;
                case "auth/too-many-requests":
                    b +=
                        "You have entered an incorrect password too many times. Please try again in a few minutes.";
                    break;
                case "auth/user-cancelled":
                    b += "Please authorize the required permissions to sign in to the application";
                    break;
                case "auth/user-not-found":
                    b += "That email address doesn't match an existing account";
                    break;
                case "auth/user-token-expired":
                    b += ug();
                    break;
                case "auth/weak-password":
                    b += "Strong passwords have at least 6 characters and a mix of letters and numbers";
                    break;
                case "auth/wrong-password":
                    b += "The email and password you entered don't match";
                    break;
                case "auth/network-request-failed":
                    b += "A network error has occurred."
            }
            if (b = E(b).toString())return b;
            try {
                return JSON.parse(a.message), Rg("Internal error: " + a.message), E("An internal error has occurred.").toString()
            } catch (c) {
                return a.message
            }
        }

        function Ji(a, b, c, d) {
            function e() {
                Z(a, Zh(b, q(a.g.signInWithRedirect, a.g), [k], function () {
                }, f))
            }

            function f(a) {
                a.name && "cancel" == a.name || (Rg("signInWithRedirect: " + a.code), a = Y(a), b.G(a))
            }

            var g = V(b), k = Mg[c] && firebase.auth[Mg[c]] ? new firebase.auth[Mg[c]] : null;
            if (!k)throw Error("Invalid Firebase Auth provider!");
            var u = Fh(a.a, c);
            if (k && k.addScope)for (var B = 0; B < u.length; B++)k.addScope(u[B]);
            k && k.setCustomParameters && c == firebase.auth.GoogleAuthProvider.PROVIDER_ID && d && k.setCustomParameters({login_hint: d});
            "redirect" == Hh(a.a) ? e() : Z(a, a.g.signInWithPopup(k).then(function (c) {
                    b.i();
                    R("callback", a, g, Ic(c))
                }, function (c) {
                    if (!c.name || "cancel" != c.name)switch (c.code) {
                        case "auth/popup-blocked":
                            e();
                            break;
                        case "auth/popup-closed-by-user":
                        case "auth/cancelled-popup-request":
                            break;
                        case "auth/network-request-failed":
                        case "auth/too-many-requests":
                        case "auth/user-cancelled":
                            b.G(Y(c));
                            break;
                        default:
                            b.i(), R("callback", a, g, Jc(c))
                    }
                }))
        }

        function Ki(a, b) {
            var c = b.fa(), d = b.Hb();
            if (c)if (d) {
                var e = firebase.auth.EmailAuthProvider.credential(c, d);
                Z(a, Zh(b, q(a.g.signInWithEmailAndPassword, a.g), [c, d], function () {
                    Hi(a, b, e)
                }, function (a) {
                    if (!a.name || "cancel" != a.name)switch (a.code) {
                        case "auth/email-exists":
                            S(b.u(), !1);
                            T(b.Fa(), Y(a));
                            break;
                        case "auth/too-many-requests":
                        case "auth/wrong-password":
                            S(b.X(),
                                !1);
                            T(b.Ob(), Y(a));
                            break;
                        default:
                            Rg("verifyPassword: " + a.message), b.G(Y(a))
                    }
                }))
            } else b.X().focus(); else b.u().focus()
        }

        function Li(a) {
            a = Eh(a.a);
            return 1 == a.length && a[0] == firebase.auth.EmailAuthProvider.PROVIDER_ID
        }

        function Di(a, b, c, d) {
            Li(a) ? d ? R("signIn", a, b, c, d) : Mi(a, b, c) : R("providerSignIn", a, b, d)
        }

        function Ni(a, b, c, d) {
            var e = V(b);
            Z(a, Zh(b, q(a.g.fetchProvidersForEmail, a.g), [c], function (f) {
                var g = Jh(a.a) == vh;
                qh(mh, g, a.h);
                b.i();
                Ei(a, e, f, c, void 0, d)
            }, function (a) {
                a = Y(a);
                b.G(a)
            }))
        }

        function Ei(a, b, c, d, e, f) {
            c.length ?
                Ja(c, firebase.auth.EmailAuthProvider.PROVIDER_ID) ? R("passwordSignIn", a, b, d) : (qh(kh, (new Sg(d)).ab(), a.h), R("federatedSignIn", a, b, d, c[0], f)) : R("passwordSignUp", a, b, d, e)
        }

        function Mi(a, b, c) {
            Jh(a.a) == vh ? yi(function () {
                    xg ? zi(a, function () {
                            Cg(function (d) {
                                Ai(a, d ? "empty" : "unavailable", function () {
                                    R("signIn", a, b, c)
                                })
                            }, rh(a.h), Ah(a.a))
                        }) : Gi(Oi, b, !1, Ah(a.a))
                }, !1) : (wi = !1, zi(a, function () {
                    Ai(a, "unavailable", function () {
                        R("signIn", a, b, c)
                    })
                }))
        }

        function Pi(a) {
            var b = window.location.href;
            a = Ch(a.a);
            var b = De(b, a) || "", c;
            for (c in zh)if (zh[c].toLowerCase() ==
                b.toLowerCase())return zh[c];
            return "callback"
        }

        function Qi(a) {
            var b = window.location.href;
            a = Gg(a.a.a, "queryParameterForSignInSuccessUrl");
            return De(b, a)
        }

        function Ri() {
            return De(window.location.href, "oobCode")
        }

        function Si(a, b) {
            if (Qf(new Rf) && Qf(new Sf)) Ti(a, b); else {
                var c = Eg(b), d = new vi(E("The browser you are using does not support Web Storage. Please try again in a different browser.").toString());
                J(d, c);
                a.s = d
            }
        }

        function Ti(a, b) {
            var c = Eg(b);
            switch (Pi(a)) {
                case "callback":
                    var d = Qi(a);
                    d && qh(lh, d, a.h);
                    R("callback",
                        a, c);
                    break;
                case "resetPassword":
                    R("passwordReset", a, c, Ri());
                    break;
                case "recoverEmail":
                    R("emailChangeRevocation", a, c, Ri());
                    break;
                case "verifyEmail":
                    R("emailVerification", a, c, Ri());
                    break;
                case "select":
                    if ((d = Qi(a)) && qh(lh, d, a.h), xg) {
                        Di(a, c);
                        break
                    } else {
                        yi(function () {
                            Gi(Oi, c, !0)
                        }, !0);
                        return
                    }
                default:
                    throw Error("Unhandled widget operation.");
            }
            (d = Ih(a.a).uiShown || null) && d()
        }

        function Ui(a) {
            U.call(this, gg, void 0, a, "callback")
        }

        t(Ui, U);
        function Vi(a, b, c) {
            if (c.user) {
                var d = th(a.h), e = d && d.D();
                if (e && !Wi(c.user,
                        e)) Xi(a, b, c.user, c.credential); else {
                    var f = d && d.ta;
                    f ? Z(a, c.user.link(f).then(function () {
                            Yi(a, b, f)
                        }, function (c) {
                            Zi(a, b, c)
                        })) : Yi(a, b, c.credential)
                }
            } else c = V(b), b.i(), ph(kh, a.h), Di(a, c)
        }

        function Yi(a, b, c) {
            ph(kh, a.h);
            Hi(a, b, c)
        }

        function Zi(a, b, c) {
            var d = V(b);
            ph(kh, a.h);
            c = Y(c);
            b.i();
            Di(a, d, void 0, c)
        }

        function $i(a, b, c, d) {
            var e = V(b);
            Z(a, a.g.fetchProvidersForEmail(c).then(function (f) {
                b.i();
                f.length ? "password" == f[0] ? R("passwordLinking", a, e, c) : R("federatedLinking", a, e, c, f[0], d) : (ph(kh, a.h), R("passwordRecovery",
                        a, e, c, !1, tg().toString()))
            }, function (c) {
                Zi(a, b, c)
            }))
        }

        function Xi(a, b, c, d) {
            var e = V(b);
            Z(a, a.g.signOut().then(function () {
                b.i();
                R("emailMismatch", a, e, c, d)
            }, function (a) {
                a.name && "cancel" == a.name || (a = Y(a.code), b.G(a))
            }))
        }

        function Wi(a, b) {
            if (b == a.email)return !0;
            if (a.providerData)for (var c = 0; c < a.providerData.length; c++)if (b == a.providerData[c].email)return !0;
            return !1
        }

        Q.callback = function (a, b, c) {
            var d = new Ui;
            J(d, b);
            a.s = d;
            b = c || a.getRedirectResult();
            Z(a, b.then(function (b) {
                Vi(a, d, b)
            }, function (b) {
                if (b && "auth/account-exists-with-different-credential" ==
                    b.code && b.email && b.credential) {
                    var c = Tg(b);
                    qh(kh, c.ab(), a.h);
                    $i(a, d, b.email)
                } else if (b && "auth/user-cancelled" == b.code) {
                    var c = th(a.h), g = Y(b);
                    c && c.ta ? $i(a, d, c.D(), g) : c ? Ni(a, d, c.D(), g) : Zi(a, d, b)
                } else b && "auth/operation-not-supported-in-this-environment" == b.code && Li(a) ? Vi(a, d, {user: null}) : Zi(a, d, b)
            }))
        };
        function aj(a, b, c, d) {
            U.call(this, mg, {email: a, H: !!c}, d, "emailChangeRevoke");
            this.xc = b;
            this.ba = c || null
        }

        t(aj, U);
        aj.prototype.l = function () {
            var a = this;
            Oh(this, this.C("firebaseui-id-reset-password-link"), function () {
                a.xc()
            });
            this.ba && (this.A(this.ba), this.J().focus());
            aj.c.l.call(this)
        };
        aj.prototype.b = function () {
            this.xc = this.ba = null;
            aj.c.b.call(this)
        };
        r(aj.prototype, {J: bi, ja: ci, A: di});
        function bj() {
            return this.C("firebaseui-id-new-password")
        }

        function cj() {
            return this.C("firebaseui-id-password-toggle")
        }

        function dj() {
            this.Sb = !this.Sb;
            var a = cj.call(this), b = bj.call(this);
            this.Sb ? (b.type = "text", nf(a, "firebaseui-input-toggle-off"), of(a, "firebaseui-input-toggle-on")) : (b.type = "password", nf(a, "firebaseui-input-toggle-on"), of(a,
                    "firebaseui-input-toggle-off"));
            b.focus()
        }

        function ej() {
            return this.C("firebaseui-id-new-password-error")
        }

        function fj() {
            this.Sb = !1;
            var a = bj.call(this);
            a.type = "password";
            var b = ej.call(this);
            Kh(this, a, function () {
                Qh(b) && (S(a, !0), Ph(b))
            });
            var c = cj.call(this);
            nf(c, "firebaseui-input-toggle-on");
            of(c, "firebaseui-input-toggle-off");
            Mh(this, a, function () {
                nf(c, "firebaseui-input-toggle-focus");
                of(c, "firebaseui-input-toggle-blur")
            });
            Nh(this, a, function () {
                nf(c, "firebaseui-input-toggle-blur");
                of(c, "firebaseui-input-toggle-focus")
            });
            Oh(this, c, q(dj, this))
        }

        function gj() {
            var a = bj.call(this), b;
            b = ej.call(this);
            K(a) ? (S(a, !0), Ph(b), b = !0) : (S(a, !1), T(b, E("Enter your password").toString()), b = !1);
            return b ? K(a) : null
        }

        function hj(a, b, c) {
            U.call(this, jg, {email: a}, c, "passwordReset");
            this.o = b
        }

        t(hj, U);
        hj.prototype.l = function () {
            this.Qb();
            this.A(this.o);
            ai(this, this.O(), this.o);
            this.O().focus();
            hj.c.l.call(this)
        };
        hj.prototype.b = function () {
            this.o = null;
            hj.c.b.call(this)
        };
        r(hj.prototype, {O: bj, Nb: ej, Zc: cj, Qb: fj, Gb: gj, J: bi, ja: ci, A: di});
        function ij(a,
                    b, c, d) {
            var e = c.Gb();
            e && Z(a, Zh(c, q(a.g.confirmPasswordReset, a.g), [d, e], function () {
                c.i();
                var d = new si;
                J(d, b);
                a.s = d
            }, function (d) {
                jj(a, b, c, d)
            }))
        }

        function jj(a, b, c, d) {
            "auth/weak-password" == (d && d.code) ? (a = Y(d), S(c.O(), !1), T(c.Nb(), a), c.O().focus()) : (c && c.i(), c = new ti, J(c, b), a.s = c)
        }

        function kj(a, b, c) {
            var d = new aj(c, function () {
                Z(a, Zh(d, q(a.g.sendPasswordResetEmail, a.g), [c], function () {
                    d.i();
                    d = new pi(c);
                    J(d, b);
                    a.s = d
                }, function () {
                    d.G(E("Unable to send password reset code to specified email.").toString())
                }))
            });
            J(d, b);
            a.s = d
        }

        Q.passwordReset = function (a, b, c) {
            Z(a, a.g.verifyPasswordResetCode(c).then(function (d) {
                var e = new hj(d, function () {
                    ij(a, b, e, c)
                });
                J(e, b);
                a.s = e
            }, function () {
                jj(a, b)
            }))
        };
        Q.emailChangeRevocation = function (a, b, c) {
            var d = null;
            Z(a, a.g.checkActionCode(c).then(function (b) {
                d = b.data.email;
                return a.g.applyActionCode(c)
            }).then(function () {
                kj(a, b, d)
            }, function () {
                var c = new ui;
                J(c, b);
                a.s = c
            }))
        };
        Q.emailVerification = function (a, b, c) {
            Z(a, a.g.applyActionCode(c).then(function () {
                var c = new qi;
                J(c, b);
                a.s = c
            }, function () {
                var c =
                    new ri;
                J(c, b);
                a.s = c
            }))
        };
        function lj(a, b, c, d, e) {
            U.call(this, rg, {Cd: a, nd: b}, e, "emailMismatch");
            this.ba = c;
            this.S = d
        }

        t(lj, U);
        lj.prototype.l = function () {
            this.A(this.ba, this.S);
            this.J().focus();
            lj.c.l.call(this)
        };
        lj.prototype.b = function () {
            this.S = this.o = null;
            lj.c.b.call(this)
        };
        r(lj.prototype, {J: bi, ja: ci, A: di});
        Q.emailMismatch = function (a, b, c, d) {
            var e = th(a.h);
            if (e) {
                var f = new lj(c.email, e.D(), function () {
                    var b = f;
                    ph(kh, a.h);
                    Hi(a, b, d, c)
                }, function () {
                    var b = d.provider, c = V(f);
                    f.i();
                    e.ta ? R("federatedLinking", a, c, e.D(),
                            b) : R("federatedSignIn", a, c, e.D(), b)
                });
                J(f, b);
                a.s = f
            } else Di(a, b)
        };
        function mj(a, b, c, d) {
            U.call(this, ig, {email: a, providerId: b}, d, "federatedLinking");
            this.o = c
        }

        t(mj, U);
        mj.prototype.l = function () {
            this.A(this.o);
            this.J().focus();
            mj.c.l.call(this)
        };
        mj.prototype.b = function () {
            this.o = null;
            mj.c.b.call(this)
        };
        r(mj.prototype, {J: bi, A: di});
        Q.federatedLinking = function (a, b, c, d, e) {
            var f = th(a.h);
            if (f && f.ta) {
                var g = new mj(c, d, function () {
                    Ji(a, g, d, c)
                });
                J(g, b);
                a.s = g;
                e && g.G(e)
            } else Di(a, b)
        };
        Q.federatedSignIn = function (a, b, c,
                                      d, e) {
            var f = new mj(c, d, function () {
                Ji(a, f, d, c)
            });
            J(f, b);
            a.s = f;
            e && f.G(e)
        };
        function nj(a, b, c, d) {
            var e = b.Hb();
            e ? Z(a, Zh(b, q(a.g.signInWithEmailAndPassword, a.g), [c, e], function (c) {
                    return Z(a, c.link(d).then(function () {
                        Hi(a, b, d)
                    }))
                }, function (a) {
                    if (!a.name || "cancel" != a.name)switch (a.code) {
                        case "auth/wrong-password":
                            S(b.X(), !1);
                            T(b.Ob(), Y(a));
                            break;
                        case "auth/too-many-requests":
                            b.G(Y(a));
                            break;
                        default:
                            Rg("signInWithEmailAndPassword: " + a.message), b.G(Y(a))
                    }
                })) : b.X().focus()
        }

        Q.passwordLinking = function (a, b, c) {
            var d =
                th(a.h);
            ph(kh, a.h);
            var e = d && d.ta;
            if (e) {
                var f = new ii(c, function () {
                    nj(a, f, c, e)
                }, function () {
                    f.i();
                    R("passwordRecovery", a, b, c)
                });
                J(f, b);
                a.s = f
            } else Di(a, b)
        };
        function oj(a, b, c, d) {
            U.call(this, eg, {email: c, Cb: !!b}, d, "passwordRecovery");
            this.o = a;
            this.S = b
        }

        t(oj, U);
        oj.prototype.l = function () {
            this.xa();
            this.A(this.o, this.S);
            K(this.u()) || this.u().focus();
            ai(this, this.u(), this.o);
            oj.c.l.call(this)
        };
        oj.prototype.b = function () {
            this.S = this.o = null;
            oj.c.b.call(this)
        };
        r(oj.prototype, {
            u: ji, Fa: ki, xa: li, D: mi, fa: ni, J: bi, ja: ci,
            A: di
        });
        function pj(a, b) {
            var c = b.fa();
            if (c) {
                var d = V(b);
                Z(a, Zh(b, q(a.g.sendPasswordResetEmail, a.g), [c], function () {
                    b.i();
                    var e = new pi(c, function () {
                        e.i();
                        Di(a, d)
                    });
                    J(e, d);
                    a.s = e
                }, function (a) {
                    S(b.u(), !1);
                    T(b.Fa(), Y(a))
                }))
            } else b.u().focus()
        }

        Q.passwordRecovery = function (a, b, c, d, e) {
            var f = new oj(function () {
                pj(a, f)
            }, d ? void 0 : function () {
                    f.i();
                    Di(a, b)
                }, c);
            J(f, b);
            a.s = f;
            e && f.G(e)
        };
        Q.passwordSignIn = function (a, b, c) {
            var d = new oi(function () {
                Ki(a, d)
            }, function () {
                var c = d.D();
                d.i();
                R("passwordRecovery", a, b, c)
            }, c);
            J(d, b);
            a.s = d
        };
        function qj() {
            return this.C("firebaseui-id-name")
        }

        function rj() {
            return this.C("firebaseui-id-name-error")
        }

        function sj(a, b, c, d, e, f, g) {
            U.call(this, dg, {email: e, rd: b, name: f, Jc: a, Cb: !!d}, g, "passwordSignUp");
            this.o = c;
            this.S = d;
            this.Wb = b
        }

        t(sj, U);
        sj.prototype.l = function () {
            this.xa();
            this.Wb && this.ed();
            this.Qb();
            this.A(this.o, this.S);
            this.Zb();
            sj.c.l.call(this)
        };
        sj.prototype.b = function () {
            this.S = this.o = null;
            sj.c.b.call(this)
        };
        sj.prototype.Zb = function () {
            this.Wb ? ($h(this, this.u(), this.Ua()), $h(this, this.Ua(),
                    this.O())) : $h(this, this.u(), this.O());
            this.o && ai(this, this.O(), this.o);
            K(this.u()) ? this.Wb && !K(this.Ua()) ? this.Ua().focus() : this.O().focus() : this.u().focus()
        };
        r(sj.prototype, {
            u: ji, Fa: ki, xa: li, D: mi, fa: ni, Ua: qj, Ud: rj, ed: function () {
                var a = qj.call(this), b = rj.call(this);
                Kh(this, a, function () {
                    Qh(b) && (S(a, !0), Ph(b))
                })
            }, Qc: function () {
                var a = qj.call(this), b;
                b = rj.call(this);
                var c = K(a), c = !/^[\s\xa0]*$/.test(null == c ? "" : String(c));
                S(a, c);
                c ? (Ph(b), b = !0) : (T(b, E("Enter your account name").toString()), b = !1);
                return b ?
                    qa(K(a)) : null
            }, O: bj, Nb: ej, Zc: cj, Qb: fj, Gb: gj, J: bi, ja: ci, A: di
        });
        function tj(a, b) {
            var c = Gh(a.a), d = b.fa(), e = null;
            c && (e = b.Qc());
            var f = b.Gb();
            if (d)if (c && !e) b.Ua().focus(); else if (f) {
                var g = firebase.auth.EmailAuthProvider.credential(d, f);
                Z(a, Zh(b, q(a.g.createUserWithEmailAndPassword, a.g), [d, f], function (d) {
                    return c ? Z(a, d.updateProfile({displayName: e}).then(function () {
                            Hi(a, b, g)
                        })) : Hi(a, b, g)
                }, function (c) {
                    if (!c.name || "cancel" != c.name) {
                        var e = Y(c);
                        switch (c.code) {
                            case "auth/email-already-in-use":
                                return uj(a, b, d,
                                    c);
                            case "auth/too-many-requests":
                                e = E("Too many account requests are coming from your IP address. Try again in a few minutes.").toString();
                            case "auth/operation-not-allowed":
                            case "auth/weak-password":
                                S(b.O(), !1);
                                T(b.Nb(), e);
                                break;
                            default:
                                Rg("setAccountInfo: " + Ye(c)), b.G(e)
                        }
                    }
                }))
            } else b.O().focus(); else b.u().focus()
        }

        function uj(a, b, c, d) {
            function e() {
                var a = Y(d);
                S(b.u(), !1);
                T(b.Fa(), a);
                b.u().focus()
            }

            var f = a.g.fetchProvidersForEmail(c).then(function (d) {
                d.length ? e() : (d = V(b), b.i(), R("passwordRecovery", a,
                        d, c, !1, tg().toString()))
            }, function () {
                e()
            });
            Z(a, f);
            return f
        }

        Q.passwordSignUp = function (a, b, c, d, e) {
            function f() {
                g.i();
                Di(a, b)
            }

            var g = new sj(a.a.a.get("tosUrl") || null, Gh(a.a), function () {
                tj(a, g)
            }, e ? void 0 : f, c, d);
            J(g, b);
            a.s = g
        };
        function vj(a, b, c) {
            U.call(this, sg, {pd: b}, c, "providerSignIn");
            this.wc = a
        }

        t(vj, U);
        vj.prototype.l = function () {
            this.dd(this.wc);
            vj.c.l.call(this)
        };
        vj.prototype.b = function () {
            this.wc = null;
            vj.c.b.call(this)
        };
        r(vj.prototype, {
            dd: function (a) {
                function b(b) {
                    a(b)
                }

                for (var c = this.Mb("firebaseui-id-idp-button"),
                         d = 0; d < c.length; d++) {
                    var e = c[d], f = vf && e.dataset ? "providerId" in e.dataset ? e.dataset.providerId : null : e.getAttribute("data-" + "providerId".replace(/([A-Z])/g, "-$1").toLowerCase());
                    Oh(this, e, ka(b, f))
                }
            }
        });
        Q.providerSignIn = function (a, b, c) {
            var d = new vj(function (c) {
                c == firebase.auth.EmailAuthProvider.PROVIDER_ID ? (d.i(), Mi(a, b)) : Ji(a, d, c)
            }, Eh(a.a));
            J(d, b);
            a.s = d;
            c && d.G(c)
        };
        function wj(a, b, c, d) {
            U.call(this, bg, {email: c}, d, "signIn");
            this.Ub = a;
            this.S = b
        }

        t(wj, U);
        wj.prototype.l = function () {
            this.xa(this.Ub);
            this.A(this.Ub,
                this.S);
            this.Zb();
            wj.c.l.call(this)
        };
        wj.prototype.b = function () {
            this.S = this.Ub = null;
            wj.c.b.call(this)
        };
        wj.prototype.Zb = function () {
            this.u().focus();
            var a = this.u(), b = (this.u().value || "").length, c;
            try {
                c = "number" == typeof a.selectionStart
            } catch (d) {
                c = !1
            }
            c ? (a.selectionStart = b, a.selectionEnd = b) : x && ("textarea" == a.type && (b = a.value.substring(0, b).replace(/(\r\n|\r|\n)/g, "\n").length), a = a.createTextRange(), a.collapse(!0), a.move("character", b), a.select())
        };
        r(wj.prototype, {
            u: ji, Fa: ki, xa: li, D: mi, fa: ni, J: bi, ja: ci,
            A: di
        });
        Q.signIn = function (a, b, c, d) {
            var e = new wj(function () {
                var b = e, c = b.fa() || "";
                c && Ni(a, b, c)
            }, function () {
                e.i();
                Di(a, b, c)
            }, c);
            J(e, b);
            a.s = e;
            d && e.G(d)
        };
        function xj(a, b) {
            this.Oc = a;
            this.g = firebase.initializeApp({
                apiKey: a.app.options.apiKey,
                authDomain: a.app.options.authDomain
            }, a.app.name + "-firebaseui-temp").auth();
            this.h = b;
            this.a = new uh;
            this.s = this.bc = this.jb = this.cc = null;
            this.na = []
        }

        xj.prototype.getRedirectResult = function () {
            this.jb || (this.jb = Ic(this.g.getRedirectResult()));
            return this.jb
        };
        var yj = null;

        function Oi() {
            return yj
        }

        xj.prototype.start = function (a, b) {
            function c() {
                yj && (th(yj.h) && Ng && Ng.log(Ud, "UI Widget is already rendered on the page and is pending some user interaction. Only one widget instance can be rendered per page. The previous instance has been automatically reset.", void 0), yj.reset());
                yj = d
            }

            var d = this;
            this.zb(b);
            if ("complete" == l.document.readyState) {
                var e = Eg(a);
                c();
                d.bc = e;
                zj(d, e);
                Si(d, a)
            } else wd(window, "load", function () {
                var b = Eg(a);
                c();
                d.bc = b;
                zj(d, b);
                Si(d, a)
            })
        };
        function Z(a, b) {
            if (b) {
                a.na.push(b);
                var c = function () {
                    Na(a.na,
                        function (a) {
                            return a == b
                        })
                };
                "function" != typeof b && b.then(c, c)
            }
        }

        xj.prototype.reset = function () {
            this.jb = Ic({user: null, credential: null});
            yj == this && (yj = null);
            this.bc = null;
            for (var a = 0; a < this.na.length; a++)if ("function" == typeof this.na[a]) this.na[a](); else this.na[a].cancel && this.na[a].cancel();
            this.na = [];
            ph(kh, this.h);
            this.s && (this.s.i(), this.s = null);
            this.gb = null
        };
        function zj(a, b) {
            a.gb = null;
            a.cc = new Lg(b);
            a.cc.register();
            pd(a.cc, "pageEnter", function (b) {
                b = b && b.Wd;
                if (a.gb != b) {
                    var d = Ih(a.a).uiChanged || null;
                    d && d(a.gb, b);
                    a.gb = b
                }
            })
        }

        xj.prototype.zb = function (a) {
            this.a.zb(a)
        };
        xj.prototype.wd = function () {
            var a, b = this.a, c = Gg(b.a, "widgetUrl");
            a = Bh(b, c);
            if (this.a.a.get("popupMode")) {
                var b = (window.screen.availHeight - 600) / 2, c = (window.screen.availWidth - 500) / 2, d = a || "about:blank", b = {
                    width: 500,
                    height: 600,
                    top: 0 < b ? b : 0,
                    left: 0 < c ? c : 0,
                    location: !0,
                    resizable: !0,
                    statusbar: !0,
                    toolbar: !1
                };
                b.target = b.target || d.target || "google_popup";
                b.width = b.width || 690;
                b.height = b.height || 500;
                var e;
                (c = b) || (c = {});
                b = window;
                a = d instanceof ob ? d : sb("undefined" != typeof d.href ? d.href : String(d));
                var d = c.target || d.target, f = [];
                for (e in c)switch (e) {
                    case "width":
                    case "height":
                    case "top":
                    case "left":
                        f.push(e + "=" + c[e]);
                        break;
                    case "target":
                    case "noreferrer":
                        break;
                    default:
                        f.push(e + "=" + (c[e] ? 1 : 0))
                }
                e = f.join(",");
                (w("iPhone") && !w("iPod") && !w("iPad") || w("iPad") || w("iPod")) && b.navigator && b.navigator.standalone && d && "_self" != d ? (e = b.document.createElement("A"), a = a instanceof ob ? a : sb(a), e.href = qb(a), e.setAttribute("target", d), c.noreferrer && e.setAttribute("rel", "noreferrer"),
                        c = document.createEvent("MouseEvent"), c.initMouseEvent("click", !0, !0, b, 1), e.dispatchEvent(c), e = {}) : c.noreferrer ? (e = b.open("", d, e), b = qb(a), e && (ab && -1 != b.indexOf(";") && (b = "'" + b.replace(/'/g, "%27") + "'"), e.opener = null, b = '<META HTTP-EQUIV="refresh" content="0; url=' + ra(b) + '">', e.document.write(wb((new ub).fd(b))), e.document.close())) : e = b.open(qb(a), d, e);
                e && e.focus()
            } else window.location.assign(a)
        };
        ma("firebaseui.auth.AuthUI", xj);
        ma("firebaseui.auth.AuthUI.prototype.start", xj.prototype.start);
        ma("firebaseui.auth.AuthUI.prototype.setConfig",
            xj.prototype.zb);
        ma("firebaseui.auth.AuthUI.prototype.signIn", xj.prototype.wd);
        ma("firebaseui.auth.AuthUI.prototype.reset", xj.prototype.reset);
        ma("firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM", vh);
        ma("firebaseui.auth.CredentialHelper.NONE", "none")
    })();
})();
