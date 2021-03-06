/**
  * XPath class.
  *
  * Authors: Karl Fritsche <karl.fritsche@cocomore.com>
  *          Alejandro Leiva <alejandro.leiva@cocomore.com>
  *
  * Version: 1.1.2
  *
  * This file is part of ITS Parser. ITS Parser is free software: you can
  * redistribute it and/or modify it under the terms of the GNU General Public
  * License as published by the Free Software Foundation, version 2.
  *
  * This program is distributed in the hope that it will be useful, but WITHOUT
  * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
  * details.
  *
  * You should have received a copy of the GNU General Public License along with
  * this program; if not, write to the Free Software Foundation, Inc., 51
  * Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
  *
  * Copyright (C) 2013 Cocomore AG
  */
(function($) {
var XPath, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

XPath = function() {
    XPath.cache = true;
    function XPath(element) {
        this.parents = __bind(this.parents, this);
        this.build = __bind(this.build, this);
        this.path = "";
        this.element = null;
        if (element === void 0 || element.length <= 0) {
            return null;
        }
        if (element.jquery != null) {
            this.element = element.get(0);
        } else {
            this.element = element;
        }
    }
    XPath.getInstance = function(elementjQ) {
        var element, instance;
        if (elementjQ.jquery != null) {
            element = elementjQ.get(0);
        } else {
            element = elementjQ;
        }
        if (element.itsXPath != null && XPath.cache) {
            instance = element.itsXPath;
        } else {
            instance = new XPath(element);
            element.itsXPath = instance;
        }
        return instance;
    };
    XPath.prototype.build = function() {
        if (this.path === "") {
            this.path = this.path.concat(this.parents());
            return this.path = this.path.concat(this.index(this.element));
        }
    };
    XPath.prototype.parents = function() {
        var parentPath, parents, _this = this;
        parentPath = "";
        if (this.element instanceof Attr) {
            parents = $(this.element.ownerElement).parents().get().reverse();
        } else {
            parents = $(this.element).parents().get().reverse();
        }
        $.each(parents, function(i, parent) {
            return parentPath = parentPath.concat(_this.index(parent));
        });
        return parentPath;
    };
    XPath.prototype.index = function(element) {
        var $element, attribute, attributeName, nodeName, position, prevSiblings, string;
        if (element instanceof Attr) {
            attribute = element;
            element = element.ownerElement;
        }
        nodeName = element.nodeName.toLowerCase();
        $element = $(element);
        prevSiblings = $element.prevAll(nodeName);
        position = prevSiblings.length + 1;
        if ($element.parents().length === 0) {
            string = "/" + nodeName;
        } else {
            string = "/" + nodeName + "[" + position + "]";
        }
        if (attribute != null) {
            attributeName = attribute.nodeName || attribute.name;
            string += "/@" + attributeName.toLowerCase();
        }
        return string;
    };
    XPath.filter = function(selector) {
        return selector.replace(/h:/g, "");
    };
    XPath.prototype.query = function(selector, resultType) {
        var domElement;
        domElement = this.element;
        return document.evaluate(selector, domElement, null, resultType, null);
    };
    XPath.process = function(selector, domElement) {
        var attribute, docElement, nsResolver, res, result, xpe;
        if (!(domElement != null)) {
            return false;
        }
        selector = this.filter(selector);
        xpe = new XPathEvaluator();
        attribute = false;
        if (domElement instanceof Attr) {
            attribute = domElement;
            domElement = domElement.ownerElement;
        }
        if (domElement.ownerDocument === null) {
            docElement = domElement.documentElement;
        } else {
            docElement = domElement.ownerDocument.documentElement;
        }
        nsResolver = xpe.createNSResolver(docElement);
        result = xpe.evaluate(selector, domElement, nsResolver, XPathResult.ANY_TYPE, null);
        while (res = result.iterateNext()) {
            if (!attribute && res === domElement || res && attribute && attribute === res) {
                return true;
            }
        }
        return false;
    };
    XPath.prototype.resolve = function(selector, pointer) {
        var matchedElement, obj, result, ret, unrolled, value, values, xpath;
        selector = XPath.filter(selector);
        pointer = XPath.filter(pointer);
        result = this.query(selector, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        unrolled = [];
        while (matchedElement = result.iterateNext()) {
            xpath = XPath.getInstance(matchedElement);
            ret = xpath.query(pointer, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
            values = [];
            while (value = ret.iterateNext()) {
                values.push(value);
            }
            xpath.build();
            obj = {
                selector: xpath.path,
                result: values[0],
                results: values
            };
            unrolled.push(obj);
        }
        return unrolled;
    };
    return XPath;
}.call(this);

var Rule, staticData, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty;

staticData = {};

Rule = function() {
    function Rule() {
        this.store = __bind(this.store, this);
        this.standoffMarkup = __bind(this.standoffMarkup, this);
        this.standoffMarkupXML = __bind(this.standoffMarkupXML, this);
        this.apply = __bind(this.apply, this);
        this.parse = __bind(this.parse, this);
        this.rules = [];
        this.standoff = [];
    }
    Rule.prototype.parse = function(rule, content) {
        throw new Error("AbstractClass Rule: method parse not implemented.");
    };
    Rule.prototype.apply = function(node) {
        throw new Error("AbstractClass Rule: method apply not implemented.");
    };
    Rule.prototype.applyRules = function(ret, tag, attributes) {
        var attribute, rule, store, _i, _j, _len, _len1, _ref;
        store = false;
        _ref = this.rules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            if (rule.type = this.NAME) {
                if (XPath.process(rule.selector, tag)) {
                    for (_j = 0, _len1 = attributes.length; _j < _len1; _j++) {
                        attribute = attributes[_j];
                        if (rule[attribute] != null) {
                            ret[attribute] = rule[attribute];
                            store = true;
                        }
                    }
                }
            }
        }
        if (store) {
            return this.store(tag, ret);
        }
    };
    Rule.prototype.applyAttributes = function(ret, tag) {
        var attribute, attributeName, objectName, store, _i, _len, _ref, _ref1;
        if (this.attributes != null && tag.attributes != null) {
            if (!(this.attributesFlipped != null)) {
                this.attributesFlipped = {};
                _ref = this.attributes;
                for (objectName in _ref) {
                    attributeName = _ref[objectName];
                    this.attributesFlipped[attributeName] = objectName;
                }
            }
            store = false;
            _ref1 = tag.attributes;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                attribute = _ref1[_i];
                attributeName = attribute.nodeName;
                if (this.attributesFlipped[attributeName] != null) {
                    ret[this.attributesFlipped[attributeName]] = attribute.nodeValue;
                    store = true;
                }
            }
            if (store) {
                return this.store(tag, ret);
            }
        }
    };
    Rule.prototype.applyInherit = function(ret, tag, withAttributes) {
        var key, val, value, _results;
        if (withAttributes == null) {
            withAttributes = false;
        }
        if (tag instanceof Attr) {
            if (withAttributes) {
                value = this.inherited(tag.ownerElement);
            }
        } else {
            value = this.inherited(tag);
        }
        if (value instanceof Object) {
            _results = [];
            for (key in value) {
                val = value[key];
                _results.push(ret[key] = val);
            }
            return _results;
        }
    };
    Rule.prototype.def = function() {
        throw new Error("AbstractClass Rule: method def not implemented.");
    };
    Rule.prototype.standoffMarkupXML = function(rule, content, file) {
        return false;
    };
    Rule.prototype.standoffMarkup = function(content) {
        return false;
    };
    Rule.prototype.addStandoff = function(object) {
        return this.standoff.push(object);
    };
    Rule.prototype.addSelector = function(object) {
        return this.rules.push(object);
    };
    Rule.prototype.inherited = function(node) {
        while (1) {
            if (node.itsRuleInherit != null && node.itsRuleInherit[this.NAME] != null && XPath.cache) {
                return $.extend(true, {}, node.itsRuleInherit[this.NAME]);
            } else {
                node = node.parentNode;
                if (node === document || node === null) {
                    return;
                }
            }
        }
    };
    Rule.prototype.store = function(node, object) {
        var k;
        if (function() {
            var _results;
            _results = [];
            for (k in object) {
                if (!__hasProp.call(object, k)) continue;
                _results.push(k);
            }
            return _results;
        }().length !== 0) {
            if (node.itsRuleInherit != null && node.itsRuleInherit[this.NAME] != null && XPath.cache) {
                return node.itsRuleInherit = $.extend(true, node.itsRuleInherit, object);
            } else {
                if (!(node.itsRuleInherit != null)) {
                    node.itsRuleInherit = {};
                }
                return node.itsRuleInherit[this.NAME] = object;
            }
        }
    };
    Rule.prototype.normalizeYesNo = function(translateString) {
        if (typeof translateString === "boolean") {
            return translateString;
        }
        translateString = translateString.replace(/^\s+|\s+$/g, "").toLowerCase();
        if (translateString === "yes") {
            return true;
        } else {
            return false;
        }
    };
    Rule.prototype.normalizeString = function(string) {
        if (string != null) {
            string = string.toLowerCase();
        } else {
            string = "";
        }
        return string;
    };
    Rule.prototype.splitQuery = function(query, value, callbacks) {
        var allowed, allowedReg, callback, key, match, ret, test, _i, _len;
        allowed = [];
        for (key in callbacks) {
            callback = callbacks[key];
            allowed.push(key);
        }
        allowedReg = allowed.join("|");
        query = query.split(",");
        ret = query.length > 0 ? true : false;
        for (_i = 0, _len = query.length; _i < _len; _i++) {
            test = query[_i];
            match = test.match(RegExp("(" + allowedReg + "):\\s*(.*?)\\s*$"));
            if (match === null) {
                console.log("Unknown query " + query);
                return false;
            }
            if (callbacks[match[1]] != null && typeof callbacks[match[1]] === "function") {
                ret = ret && callbacks[match[1]](match);
                if (!ret) {
                    return false;
                }
            } else if (value[match[1]] != null) {
                if (value[match[1]] !== match[2]) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return ret;
    };
    Rule.prototype.compareNumber = function(query, value) {
        var match;
        match = query.match(/([<>!=]*)\s*([-\d\.]*)/);
        match[2] = parseFloat(match[2]);
        if (!(value != null)) {
            return false;
        }
        value = parseFloat(value);
        if (!isNaN(match[2]) && !isNaN(value)) {
            switch (match[1]) {
              case "":
              case "=":
              case "==":
                if (value !== match[2]) {
                    return false;
                }
                break;

              case "!=":
                if (value === match[2]) {
                    return false;
                }
                break;

              case ">":
                if (value <= match[2]) {
                    return false;
                }
                break;

              case "<":
                if (value >= match[2]) {
                    return false;
                }
                break;

              default:
                return false;
            }
            return true;
        } else {
            return false;
        }
    };
    return Rule;
}();

var RulesController, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

RulesController = function() {
    function RulesController(supportedRules) {
        this.setContent = __bind(this.setContent, this);
        this.supportedRules = supportedRules;
    }
    RulesController.prototype.setContent = function(content) {
        return this.content = content;
    };
    RulesController.prototype.addLink = function(link) {
        if (link.href) {
            return this.getFile(link.href);
        }
    };
    RulesController.prototype.addXML = function(xml, file) {
        var child, found, rule, _i, _j, _len, _len1, _ref, _ref1, _results;
        if (file == null) {
            file = null;
        }
        if (xml.tagName && xml.tagName.toLowerCase() === "its:rules" && ($(xml).attr("version") === "2.0" || $(xml).attr("its:version") === "2.0")) {
            return this.parseXML(xml);
        } else {
            found = false;
            _ref = this.supportedRules;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                rule = _ref[_i];
                if (xml.nodeType === 1) {
                    found = found || rule.standoffMarkupXML(xml, this.content, file);
                }
            }
            if (!found) {
                if (xml.hasChildNodes) {
                    _ref1 = xml.childNodes;
                    _results = [];
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        child = _ref1[_j];
                        _results.push(this.addXML(child, file));
                    }
                    return _results;
                }
            }
        }
    };
    RulesController.prototype.parseXML = function(xml) {
        var child, rule, _i, _len, _ref, _results;
        if (xml.hasChildNodes) {
            _ref = xml.childNodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(function() {
                    var _j, _len1, _ref1, _results1;
                    _ref1 = this.supportedRules;
                    _results1 = [];
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        rule = _ref1[_j];
                        if (child.nodeType === 1) {
                            _results1.push(rule.parse(child, this.content, xml));
                        } else {
                            _results1.push(void 0);
                        }
                    }
                    return _results1;
                }.call(this));
            }
            return _results;
        }
    };
    RulesController.prototype.getFile = function(file) {
        var request, _this = this;
        request = $.ajax(file, {
            async: false
        });
        request.success(function(data) {
            var element, xml, _i, _len, _ref, _results;
            if (data.childNodes != null) {
                return _this.addXML(data.childNodes[0], file);
            } else {
                _ref = $(data);
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    element = _ref[_i];
                    if (element.nodeType != null && element.nodeType === 1 && element.tagName != null && element.tagName.toLowerCase() === "script") {
                        if ($(element).attr("type") === "application/its+xml") {
                            xml = $.parseXML(element.childNodes[0].data);
                            if (xml) {
                                _results.push(_this.addXML(xml, file));
                            } else {
                                _results.push(void 0);
                            }
                        } else {
                            _results.push(void 0);
                        }
                    } else {
                        _results.push(void 0);
                    }
                }
                return _results;
            }
        });
        return request.error(function(jqXHR, textStatus, errorThrown) {
            return $("body").append("AJAX Error: " + file + " (" + errorThrown + ").");
        });
    };
    RulesController.prototype.apply = function(node, ruleName) {
        var ret, rule, _i, _len, _ref;
        ret = {};
        _ref = this.supportedRules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            ret[rule.constructor.name] = rule.apply(node);
        }
        if (ruleName) {
            return ret[ruleName];
        } else {
            return ret;
        }
    };
    RulesController.prototype.getStandoffMarkup = function() {
        var rule, _i, _len, _ref, _results;
        _ref = this.supportedRules;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            _results.push(rule.standoffMarkup(this.content));
        }
        return _results;
    };
    return RulesController;
}();

var ParamRule, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

ParamRule = function(_super) {
    __extends(ParamRule, _super);
    function ParamRule() {
        ParamRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:param";
        this.NAME = "param";
    }
    ParamRule.prototype.parse = function(rule, content, xml) {
        var exp, paramName, paramValue;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            paramName = $(rule).attr("name");
            exp = new RegExp("\\$" + paramName, "g");
            paramValue = "'" + rule.childNodes[0].nodeValue + "'";
            return this.replaceParam(exp, paramValue, xml);
        }
    };
    ParamRule.prototype.replaceParam = function(regExp, paramValue, xml) {
        var attribute, child, _i, _j, _len, _len1, _ref, _ref1, _results;
        _ref = xml.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            if (child.tagName && child.tagName.toLowerCase() !== this.RULE_NAME) {
                _ref1 = child.attributes;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    attribute = _ref1[_j];
                    attribute.nodeValue = attribute.nodeValue.replace(regExp, paramValue);
                }
                if (child.hasChildNodes) {
                    this.replaceParam(regExp, paramValue, child);
                }
                if (child.nodeValue) {
                    _results.push(child.nodeValue = child.nodeValue.replace(regExp, paramValue));
                } else {
                    _results.push(void 0);
                }
            } else {
                _results.push(void 0);
            }
        }
        return _results;
    };
    ParamRule.prototype.apply = function(node) {
        return {};
    };
    ParamRule.prototype.def = function() {
        return {};
    };
    return ParamRule;
}(Rule);

var AllowedCharactersRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

AllowedCharactersRule = function(_super) {
    __extends(AllowedCharactersRule, _super);
    function AllowedCharactersRule() {
        this.apply = __bind(this.apply, this);
        AllowedCharactersRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:allowedcharactersrule";
        this.NAME = "allowedCharacters";
        this.attributes = {
            allowedCharacters: "its-allowed-characters"
        };
    }
    AllowedCharactersRule.prototype.createRule = function(selector, allowedCharacters) {
        var object;
        object = {};
        object.selector = selector;
        object.allowedCharacters = allowedCharacters;
        object.type = this.NAME;
        return object;
    };
    AllowedCharactersRule.prototype.parse = function(rule, content) {
        var allowedCharacters, newRule, newRules, selector, xpath, _i, _len, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            selector = $(rule).attr("selector");
            if ($(rule).attr("allowedCharacters")) {
                return this.addSelector(this.createRule(selector, $(rule).attr("allowedCharacters")));
            } else if ($(rule).attr("allowedCharactersPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("allowedCharactersPointer"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        allowedCharacters = newRule.result.value;
                    } else {
                        allowedCharacters = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(this.createRule(newRule.selector, allowedCharacters)));
                }
                return _results;
            } else {}
        }
    };
    AllowedCharactersRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "allowedCharacters" ]);
        this.applyInherit(ret, tag);
        this.applyAttributes(ret, tag);
        if (ret.allowedCharacters === "") {
            return {};
        } else {
            return ret;
        }
    };
    AllowedCharactersRule.prototype.def = function() {
        return {
            allowedCharacters: ""
        };
    };
    AllowedCharactersRule.prototype.jQSelector = {
        name: "allowedCharacters",
        callback: function(a, i, m) {
            var query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "AllowedCharactersRule");
            if (value.allowedCharacters) {
                if (query === "any") {
                    return true;
                } else if (value.allowedCharacters === query) {
                    return true;
                }
            }
            return false;
        }
    };
    return AllowedCharactersRule;
}(Rule);

var AnnotatorsRef, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

AnnotatorsRef = function(_super) {
    __extends(AnnotatorsRef, _super);
    function AnnotatorsRef() {
        this.apply = __bind(this.apply, this);
        AnnotatorsRef.__super__.constructor.apply(this, arguments);
        this.NAME = "annotatorsRef";
        this.attributeName = "its-annotators-ref";
    }
    AnnotatorsRef.prototype.parse = function(rule, content) {};
    AnnotatorsRef.prototype.apply = function(tag) {
        var name, namePart, nameParts, obj, ret, value, values, _i, _j, _len, _len1;
        ret = this.def();
        this.applyInherit(ret, tag, true);
        if ($(tag).attr(this.attributeName)) {
            values = $(tag).attr(this.attributeName);
            values = values.split(" ");
            obj = ret.annotatorsRef != null ? ret.annotatorsRef : {};
            for (_i = 0, _len = values.length; _i < _len; _i++) {
                value = values[_i];
                value = value.split("|");
                nameParts = value[0].split("-");
                name = "";
                for (_j = 0, _len1 = nameParts.length; _j < _len1; _j++) {
                    namePart = nameParts[_j];
                    name += namePart.charAt(0).toUpperCase() + namePart.slice(1);
                }
                obj[name] = value[1];
            }
            ret.annotatorsRef = obj;
            this.store(tag, ret);
        }
        return ret;
    };
    AnnotatorsRef.prototype.def = function() {
        return {};
    };
    return AnnotatorsRef;
}(Rule);

var DirectionalityRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

DirectionalityRule = function(_super) {
    __extends(DirectionalityRule, _super);
    function DirectionalityRule() {
        this.apply = __bind(this.apply, this);
        this.parse = __bind(this.parse, this);
        DirectionalityRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:dirrule";
        this.NAME = "dir";
    }
    DirectionalityRule.prototype.createRule = function(selector, dir) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.dir = dir;
        return object;
    };
    DirectionalityRule.prototype.parse = function(rule, content) {
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            return this.addSelector(this.createRule($(rule).attr("selector"), $(rule).attr(this.NAME)));
        }
    };
    DirectionalityRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "dir" ]);
        this.applyInherit(ret, tag, true);
        if (!(tag instanceof Attr) && tag.hasAttribute(this.NAME) && $(tag).attr(this.NAME) !== void 0) {
            ret = {
                dir: $(tag).attr(this.NAME)
            };
            this.store(tag, ret);
        }
        return ret;
    };
    DirectionalityRule.prototype.def = function() {
        return {
            dir: "ltr"
        };
    };
    DirectionalityRule.prototype.jQSelector = {
        name: "dir",
        callback: function(a, i, m) {
            var query, value;
            query = m[3] ? m[3] : "ltr";
            value = window.rulesController.apply(a, "DirectionalityRule");
            if (query.charAt(0) === "!") {
                query = query.substr(1);
                return value.dir !== query;
            }
            return value.dir === query;
        }
    };
    return DirectionalityRule;
}(Rule);

var DomainRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

DomainRule = function(_super) {
    __extends(DomainRule, _super);
    function DomainRule() {
        this.apply = __bind(this.apply, this);
        this.parse = __bind(this.parse, this);
        DomainRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:domainrule";
        this.NAME = "domains";
    }
    DomainRule.prototype.createRule = function(selector, domains) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.domains = domains;
        return object;
    };
    DomainRule.prototype.parse = function(rule, content) {
        var domain, domainArr, domains, key, mapping, mappingObj, mappings, matches, newRule, newRules, regEx, replace, result, ruleObject, rules, search, selector, xpath, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            selector = $(rule).attr("selector");
            rules = [];
            if ($(rule).attr("domainPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("domainPointer"));
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    domains = "";
                    _ref = newRule.results;
                    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                        result = _ref[_j];
                        domains += ", ";
                        domains += newRule.result instanceof Attr ? result.value : $(result).text();
                    }
                    domains = domains.split(",");
                    domainArr = [];
                    for (_k = 0, _len2 = domains.length; _k < _len2; _k++) {
                        domain = domains[_k];
                        domain = domain.replace(/^[\s'"]+|[\s'"]+$/g, "");
                        if (domain !== "") {
                            domainArr.push(domain);
                        }
                    }
                    rules.push(this.createRule(newRule.selector, domainArr));
                }
            } else {
                return;
            }
            if ($(rule).attr("domainMapping")) {
                mappings = $(rule).attr("domainMapping");
                mappings = mappings.split(",");
                mappingObj = {};
                for (_l = 0, _len3 = mappings.length; _l < _len3; _l++) {
                    mapping = mappings[_l];
                    mapping = mapping.replace(/^\s+|\s+$/g, "");
                    regEx = /['"]?([\w ]+)['"]? ['"]?([\w ]+)['"]?/gi;
                    if (mapping !== "" && (matches = regEx.exec(mapping))) {
                        mappingObj[matches[1]] = matches[2];
                    }
                }
                for (_m = 0, _len4 = rules.length; _m < _len4; _m++) {
                    ruleObject = rules[_m];
                    for (search in mappingObj) {
                        replace = mappingObj[search];
                        key = $.inArray(search, ruleObject.domains);
                        if (key !== -1) {
                            ruleObject.domains[key] = replace;
                        }
                    }
                }
            }
            _results = [];
            for (_n = 0, _len5 = rules.length; _n < _len5; _n++) {
                ruleObject = rules[_n];
                ruleObject.domains = ruleObject.domains.unique();
                _results.push(this.addSelector(ruleObject));
            }
            return _results;
        }
    };
    DomainRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "domains", "domainMapping" ]);
        this.applyInherit(ret, tag, true);
        return ret;
    };
    DomainRule.prototype.def = function() {
        return {};
    };
    DomainRule.prototype.jQSelector = {
        name: "domain",
        callback: function(a, i, m) {
            var k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "DomainRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else if (!(value.domains != null) || value.domains.indexOf(query) === -1) {
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }
    };
    return DomainRule;
}(Rule);

Array.prototype.unique = function() {
    var key, output, value, _i, _ref, _results;
    output = {};
    for (key = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
        output[this[key]] = this[key];
    }
    _results = [];
    for (key in output) {
        value = output[key];
        _results.push(value);
    }
    return _results;
};

var ElementsWithinTextRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

ElementsWithinTextRule = function(_super) {
    __extends(ElementsWithinTextRule, _super);
    function ElementsWithinTextRule() {
        this.apply = __bind(this.apply, this);
        ElementsWithinTextRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:withintextrule";
        this.NAME = "elementsWithinRules";
        this.attributes = {
            withinText: "its-within-text"
        };
    }
    ElementsWithinTextRule.prototype.createRule = function(selector, withinText) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.withinText = this.normalizeString(withinText);
        return object;
    };
    ElementsWithinTextRule.prototype.parse = function(rule, content) {
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            if ($(rule).attr("withinText") && $(rule).attr("selector")) {
                return this.addSelector(this.createRule($(rule).attr("selector"), $(rule).attr("withinText")));
            }
        }
    };
    ElementsWithinTextRule.prototype.apply = function(tag) {
        var ret, _ref;
        if (tag instanceof Attr) {
            return {};
        }
        ret = this.def(tag);
        this.applyRules(ret, tag, [ "withinText" ]);
        this.applyAttributes(ret, tag);
        if (ret.withinText != null) {
            ret.withinText = this.normalizeString(ret.withinText);
            if ((_ref = !ret.withinText) === "yes" || _ref === "nested" || _ref === "no") {
                ret.withinText = this.def(tag);
            }
        }
        return ret;
    };
    ElementsWithinTextRule.prototype.def = function(tag) {
        var _ref, _ref1, _ref2;
        if ($(tag).parents("body").length > 0) {
            if ((_ref = tag.nodeName.toLowerCase()) === "a" || _ref === "abbr" || _ref === "area" || _ref === "audio" || _ref === "b" || _ref === "bdi" || _ref === "bdo" || _ref === "br" || _ref === "button" || _ref === "canvas" || _ref === "cite" || _ref === "code" || _ref === "command" || _ref === "datalist" || _ref === "del" || _ref === "dfn" || _ref === "em" || _ref === "embed" || _ref === "i" || _ref === "img" || _ref === "input" || _ref === "ins" || _ref === "kbd" || _ref === "keygen" || _ref === "label" || _ref === "map" || _ref === "mark" || _ref === "math" || _ref === "meter" || _ref === "object" || _ref === "output" || _ref === "progress" || _ref === "q" || _ref === "ruby" || _ref === "s" || _ref === "samp" || _ref === "select" || _ref === "small" || _ref === "span" || _ref === "strong" || _ref === "sub" || _ref === "sup" || _ref === "svg" || _ref === "time" || _ref === "u" || _ref === "var" || _ref === "video" || _ref === "wbr") {
                return {
                    withinText: "yes"
                };
            } else if ((_ref1 = tag.nodeName.toLowerCase()) === "iframe" || _ref1 === "noscript" || _ref1 === "script" || _ref1 === "textarea") {
                return {
                    withinText: "nested"
                };
            }
        } else {
            if ((_ref2 = tag.nodeName.toLowerCase()) === "noscript" || _ref2 === "script") {
                return {
                    withinText: "nested"
                };
            }
        }
        return {
            withinText: "no"
        };
    };
    ElementsWithinTextRule.prototype.jQSelector = {
        name: "withinText",
        callback: function(a, i, m) {
            var k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "ElementsWithinTextRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    if (value.withinText !== "no") {
                        return true;
                    } else {
                        return false;
                    }
                } else if (!(value.withinText != null) || value.withinText !== query) {
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }
    };
    return ElementsWithinTextRule;
}(Rule);

var ExternalResourceRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

ExternalResourceRule = function(_super) {
    __extends(ExternalResourceRule, _super);
    function ExternalResourceRule() {
        this.apply = __bind(this.apply, this);
        ExternalResourceRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:externalresourcerefrule";
        this.NAME = "externalResource";
    }
    ExternalResourceRule.prototype.createRule = function(selector, externalResourceRef) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.externalResourceRef = externalResourceRef;
        return object;
    };
    ExternalResourceRule.prototype.parse = function(rule, content) {
        var externalResourceRef, newRule, newRules, selector, xpath, _i, _len, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            selector = $(rule).attr("selector");
            if ($(rule).attr("externalResourceRefPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("externalResourceRefPointer"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        externalResourceRef = newRule.result.value;
                    } else {
                        externalResourceRef = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(this.createRule(newRule.selector, externalResourceRef)));
                }
                return _results;
            }
        }
    };
    ExternalResourceRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "externalResourceRef" ]);
        return ret;
    };
    ExternalResourceRule.prototype.def = function() {
        return {};
    };
    ExternalResourceRule.prototype.jQSelector = {
        name: "externalResource",
        callback: function(a, i, m) {
            var k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "ExternalResourceRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else if (!(value.externalResourceRef != null) || value.externalResourceRef !== query) {
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }
    };
    return ExternalResourceRule;
}(Rule);

var IdValueRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

IdValueRule = function(_super) {
    __extends(IdValueRule, _super);
    function IdValueRule() {
        this.apply = __bind(this.apply, this);
        IdValueRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:idvaluerule";
        this.NAME = "idValue";
    }
    IdValueRule.prototype.createRule = function(selector, idValue) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.idValue = idValue;
        return object;
    };
    IdValueRule.prototype.parse = function(rule, content) {
        var idValue, newRule, newRules, selector, xpath, _i, _len, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            selector = $(rule).attr("selector");
            if ($(rule).attr("idValue")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("idValue"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        idValue = newRule.result.value;
                    } else {
                        idValue = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(this.createRule(newRule.selector, idValue)));
                }
                return _results;
            }
        }
    };
    IdValueRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "idValue" ]);
        if ($(tag).attr("xml:id") !== void 0) {
            ret.idValue = $(tag).attr("xml:id");
        }
        if ($(tag).attr("id") !== void 0) {
            ret.idValue = $(tag).attr("id");
        }
        return ret;
    };
    IdValueRule.prototype.def = function() {
        return {};
    };
    IdValueRule.prototype.jQSelector = {
        name: "idValue",
        callback: function(a, i, m) {
            var k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "IdValueRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else if (!(value.idValue != null) || value.idValue !== query) {
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }
    };
    return IdValueRule;
}(Rule);

var LanguageInformationRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

LanguageInformationRule = function(_super) {
    __extends(LanguageInformationRule, _super);
    function LanguageInformationRule() {
        this.apply = __bind(this.apply, this);
        LanguageInformationRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:langrule";
        this.NAME = "languageInformation";
    }
    LanguageInformationRule.prototype.createRule = function(selector, lang) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.lang = lang;
        return object;
    };
    LanguageInformationRule.prototype.parse = function(rule, content) {
        var lang, newRule, newRules, selector, xpath, _i, _len, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            selector = $(rule).attr("selector");
            if ($(rule).attr("langPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("langPointer"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        lang = newRule.result.value;
                    } else {
                        lang = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(this.createRule(newRule.selector, lang)));
                }
                return _results;
            }
        }
    };
    LanguageInformationRule.prototype.apply = function(tag) {
        var ret, store;
        ret = this.def();
        this.applyRules(ret, tag, [ "lang" ]);
        this.applyInherit(ret, tag, true);
        store = false;
        if (!(tag instanceof Attr) && tag.hasAttribute("xml:lang") && $(tag).attr("xml:lang") !== void 0) {
            ret.lang = $(tag).attr("xml:lang");
            store = true;
        }
        if (!(tag instanceof Attr) && tag.hasAttribute("lang") && $(tag).attr("lang") !== void 0) {
            ret.lang = $(tag).attr("lang");
            store = true;
        }
        if (store) {
            this.store(tag, ret);
        }
        return ret;
    };
    LanguageInformationRule.prototype.def = function() {
        return {};
    };
    LanguageInformationRule.prototype.jQSelector = {
        name: "lang",
        callback: function(a, i, m) {
            var invert, k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "LanguageInformationRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                invert = false;
                if (query.charAt(0) === "!") {
                    invert = true;
                    query = query.substr(1);
                }
                if (query === "any") {
                    return true;
                } else if (!invert && (!(value.lang != null) || value.lang !== query)) {
                    return false;
                } else if (invert && (!(value.lang != null) || value.lang === query)) {
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }
    };
    return LanguageInformationRule;
}(Rule);

var LocaleFilterRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

LocaleFilterRule = function(_super) {
    __extends(LocaleFilterRule, _super);
    function LocaleFilterRule() {
        this.apply = __bind(this.apply, this);
        LocaleFilterRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:localefilterrule";
        this.NAME = "localeFilter";
        this.attributes = {
            localeFilterList: "its-locale-filter-list",
            localeFilterType: "its-locale-filter-type"
        };
    }
    LocaleFilterRule.prototype.parse = function(rule, content) {
        var object;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            if ($(rule).attr("localeFilterList")) {
                object.localeFilterList = $(rule).attr("localeFilterList");
            } else {
                return;
            }
            if ($(rule).attr("localeFilterType")) {
                object.localeFilterType = this.normalizeString($(rule).attr("localeFilterType"));
            }
            return this.addSelector(object);
        }
    };
    LocaleFilterRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "localeFilterList", "localeFilterType" ]);
        this.applyInherit(ret, tag, true);
        this.applyAttributes(ret, tag);
        if (ret.localeFilterType != null) {
            ret.localeFilterType = this.normalizeString(ret.localeFilterType);
        }
        return ret;
    };
    LocaleFilterRule.prototype.def = function() {
        return {
            localeFilterList: "*",
            localeFilterType: "include"
        };
    };
    LocaleFilterRule.prototype.jQSelector = {
        name: "localeFilter",
        callback: function(a, i, m) {
            var lang, match, query, regExp, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "LocaleFilterRule");
            if (value.localeFilterList != null) {
                if (query === "any") {
                    if (value.localeFilterList === "*" && value.localeFilterType === "include") {
                        return false;
                    } else {
                        return true;
                    }
                }
                regExp = /(localeFilterList|localeFilterType|lang):[\s]?(["']?)([\w\- ,\*]+)\2(,|$)/gi;
                while (match = regExp.exec(query)) {
                    switch (match[1]) {
                      case "localeFilterList":
                        if (value.localeFilterList !== match[3]) {
                            return false;
                        }
                        break;

                      case "localeFilterType":
                        if (value.localeFilterType !== match[3]) {
                            return false;
                        }
                        break;

                      case "lang":
                        match[3] = match[3].toLowerCase();
                        lang = match[3];
                        if (value.localeFilterList === "*" && value.localeFilterType === "include") {
                            return false;
                        }
                        if (value.localeFilterList === "" && value.localeFilterType === "exclude") {
                            value.localeFilterList = "*";
                            value.localeFilterType = "include";
                        }
                        value.localeFilterList = value.localeFilterList.toLowerCase();
                        if (lang === "*") {
                            if (value.localeFilterType !== "include" || value.localeFilterList !== "*") {
                                return false;
                            }
                        } else {
                            lang = lang.split("-");
                            if (lang.length !== 2) {
                                return false;
                            }
                            if (value.localeFilterList === "*") {
                                if (value.localeFilterType !== "include") {
                                    return false;
                                }
                            } else if (value.localeFilterList.indexOf(match[3]) !== -1) {
                                if (value.localeFilterType !== "include") {
                                    return false;
                                }
                            } else if (value.localeFilterList.indexOf("" + lang[0] + "-*") !== -1) {
                                if (value.localeFilterType !== "include") {
                                    return false;
                                }
                            } else if (value.localeFilterList.indexOf("*-" + lang[1]) !== -1) {
                                if (value.localeFilterType !== "include") {
                                    return false;
                                }
                            } else if (lang[0] === "*" && value.localeFilterList.indexOf("-" + lang[1]) !== -1) {
                                if (value.localeFilterType !== "include") {
                                    return false;
                                }
                            } else if (lang[1] === "*" && value.localeFilterList.indexOf("" + lang[0] + "-") !== -1) {
                                if (value.localeFilterType !== "include") {
                                    return false;
                                }
                            } else if (value.localeFilterType !== "include") {} else {
                                return false;
                            }
                        }
                        break;

                      default:
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
    };
    return LocaleFilterRule;
}(Rule);

var LocalizationNoteRule, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

LocalizationNoteRule = function(_super) {
    __extends(LocalizationNoteRule, _super);
    function LocalizationNoteRule() {
        LocalizationNoteRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:locnoterule";
        this.NAME = "localizationNote";
        this.attributes = {
            locNote: "its-loc-note",
            locNoteRef: "its-loc-note-ref",
            locNoteType: "its-loc-note-type"
        };
    }
    LocalizationNoteRule.prototype.createRule = function(selector, locNoteType, locNote, ref) {
        var object;
        if (ref == null) {
            ref = false;
        }
        object = {};
        object.type = this.NAME;
        object.selector = selector;
        if (ref) {
            object.locNoteRef = locNote.trim();
        } else {
            object.locNote = locNote.trim();
        }
        object.locNoteType = this.normalizeString(locNoteType);
        return object;
    };
    LocalizationNoteRule.prototype.parse = function(rule, content) {
        var locNote, newRule, newRules, xpath, _i, _j, _len, _len1, _results, _results1;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            if ($(rule).attr("locNotePointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve($(rule).attr("selector"), $(rule).attr("locNotePointer"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        locNote = newRule.result.value;
                    } else {
                        locNote = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(this.createRule(newRule.selector, $(rule).attr("locNoteType"), $(newRule.result).text())));
                }
                return _results;
            } else if ($(rule).attr("locNoteRef")) {
                return this.addSelector(this.createRule($(rule).attr("selector"), $(rule).attr("locNoteType"), $(rule).attr("locNoteRef"), true));
            } else if ($(rule).attr("locNoteRefPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve($(rule).attr("selector"), $(rule).attr("locNoteRefPointer"));
                _results1 = [];
                for (_j = 0, _len1 = newRules.length; _j < _len1; _j++) {
                    newRule = newRules[_j];
                    if (newRule.result instanceof Attr) {
                        locNote = newRule.result.value;
                    } else {
                        locNote = $(newRule.result).text();
                    }
                    _results1.push(this.addSelector(this.createRule(newRule.selector, $(rule).attr("locNoteType"), locNote, true)));
                }
                return _results1;
            } else {
                if ($(rule).children().length > 0 && $(rule).children()[0].tagName.toLowerCase() === "its:locnote") {
                    return this.addSelector(this.createRule($(rule).attr("selector"), $(rule).attr("locNoteType"), $(rule).children().text()));
                }
            }
        }
    };
    LocalizationNoteRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "locNoteRef", "locNote", "locNoteType" ]);
        this.applyInherit(ret, tag);
        this.applyAttributes(ret, tag);
        if (ret.locNoteType != null) {
            ret.locNoteType = this.normalizeString(ret.locNoteType);
        }
        return ret;
    };
    LocalizationNoteRule.prototype.def = function() {
        return {};
    };
    LocalizationNoteRule.prototype.jQSelector = {
        name: "locNote",
        callback: function(a, i, m) {
            var type, value;
            type = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "LocalizationNoteRule");
            if (value.locNote) {
                if (type === "any") {
                    return true;
                } else if (value.locNoteType === type) {
                    return true;
                }
            }
            return false;
        }
    };
    return LocalizationNoteRule;
}(Rule);

var LocalizationQualityIssueRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

LocalizationQualityIssueRule = function(_super) {
    __extends(LocalizationQualityIssueRule, _super);
    function LocalizationQualityIssueRule() {
        this.apply = __bind(this.apply, this);
        this.standoffMarkup = __bind(this.standoffMarkup, this);
        this.standoffMarkupXML = __bind(this.standoffMarkupXML, this);
        LocalizationQualityIssueRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:locqualityissuerule";
        this.STANDOFF_NAME = "its:locqualityissues";
        this.NAME = "locQualityIssue";
        this.attributes = {
            locQualityIssueComment: "its-loc-quality-issue-comment",
            locQualityIssueEnabled: "its-loc-quality-issue-enabled",
            locQualityIssueProfileRef: "its-loc-quality-issue-profile-ref",
            locQualityIssueSeverity: "its-loc-quality-issue-severity",
            locQualityIssueType: "its-loc-quality-issue-type"
        };
    }
    LocalizationQualityIssueRule.prototype.standoffMarkupXML = function(rule, content, file) {
        var child, id, issue, issues, object, _i, _len, _ref;
        if (rule.tagName.toLowerCase() === this.STANDOFF_NAME) {
            object = {};
            id = $(rule).attr("xml:id");
            if (file != null) {
                if (file.indexOf("#" !== -1)) {
                    file = file.substr(0, file.indexOf("#"));
                    object.id = "" + file + "#" + id;
                } else {
                    object.id = "" + file + "#" + id;
                }
            } else {
                object.id = "#" + id;
            }
            object.type = this.NAME;
            issues = [];
            _ref = rule.childNodes;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                if (child.nodeType === 1 && child.tagName.toLowerCase() === "its:locqualityissue") {
                    issue = this.parseRuleOrStandoff(child, {});
                    issues.push(issue);
                }
            }
            object.issues = issues;
            this.addStandoff(object);
            return true;
        }
        return false;
    };
    LocalizationQualityIssueRule.prototype.standoffMarkup = function(content) {
        var _this = this;
        $("[its-loc-quality-issues-ref]", content).each(function(key, element) {
            var alreadyAdded, standoff, value, _i, _len, _ref;
            value = $(element).attr("its-loc-quality-issues-ref");
            if (value.charAt(0) !== "#") {
                alreadyAdded = false;
                _ref = _this.standoff;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    standoff = _ref[_i];
                    if (standoff.type = _this.NAME) {
                        if (standoff.id === value) {
                            alreadyAdded = true;
                            break;
                        }
                    }
                }
                if (!alreadyAdded) {
                    return window.rulesController.getFile(value);
                }
            }
        });
        return false;
    };
    LocalizationQualityIssueRule.prototype.parse = function(rule, content) {
        var object;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            this.parseRuleOrStandoff(rule, object);
            return this.addSelector(object);
        }
    };
    LocalizationQualityIssueRule.prototype.parseRuleOrStandoff = function(rule, object) {
        var found;
        found = false;
        if ($(rule).attr("locQualityIssueType")) {
            object.locQualityIssueType = $(rule).attr("locQualityIssueType");
            found = true;
        }
        if ($(rule).attr("locQualityIssueComment")) {
            object.locQualityIssueComment = $(rule).attr("locQualityIssueComment");
            found = true;
        }
        if (!found) {
            return;
        }
        if ($(rule).attr("locQualityIssueSeverity")) {
            object.locQualityIssueSeverity = $(rule).attr("locQualityIssueSeverity");
        }
        if ($(rule).attr("locQualityIssueProfileRef")) {
            object.locQualityIssueProfileRef = $(rule).attr("locQualityIssueProfileRef");
        }
        if ($(rule).attr("locQualityIssueEnabled")) {
            object.locQualityIssueEnabled = $(rule).attr("locQualityIssueEnabled");
        }
        if (!(object.locQualityIssueEnabled != null) && (object.locQualityIssueComment != null || object.locQualityIssueProfileRef != null || object.locQualityIssueSeverity != null || object.locQualityIssueType)) {
            object.locQualityIssueEnabled = true;
        }
        if (object.locQualityIssueEnabled != null) {
            object.locQualityIssueEnabled = this.normalizeYesNo(object.locQualityIssueEnabled);
        }
        if (object.locQualityIssueType != null) {
            object.locQualityIssueType = this.normalizeString(object.locQualityIssueType);
        }
        return object;
    };
    LocalizationQualityIssueRule.prototype.apply = function(tag) {
        var ret, standoff, _i, _len, _ref;
        ret = this.def();
        this.applyRules(ret, tag, [ "locQualityIssueComment", "locQualityIssueEnabled", "locQualityIssueProfileRef", "locQualityIssueSeverity", "locQualityIssueType" ]);
        this.applyInherit(ret, tag);
        this.applyAttributes(ret, tag);
        if ($(tag).attr("its-loc-quality-issues-ref") !== void 0) {
            ret.locQualityIssuesRef = $(tag).attr("its-loc-quality-issues-ref");
            _ref = this.standoff;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                standoff = _ref[_i];
                if (standoff.type = this.NAME) {
                    if (standoff.id === ret.locQualityIssuesRef) {
                        ret.locQualityIssues = standoff.issues;
                        this.store(tag, ret);
                    }
                }
            }
        }
        if (!(ret.locQualityIssueEnabled != null) && (ret.locQualityIssueComment != null || ret.locQualityIssueProfileRef != null || ret.locQualityIssueSeverity != null || ret.locQualityIssueType)) {
            ret.locQualityIssueEnabled = true;
        }
        if (ret.locQualityIssueEnabled != null) {
            ret.locQualityIssueEnabled = this.normalizeYesNo(ret.locQualityIssueEnabled);
        }
        if (ret.locQualityIssueType != null) {
            ret.locQualityIssueType = this.normalizeString(ret.locQualityIssueType);
        }
        return ret;
    };
    LocalizationQualityIssueRule.prototype.def = function() {
        return {};
    };
    LocalizationQualityIssueRule.prototype.jQSelector = {
        name: "locQualityIssue",
        callback: function(a, i, m) {
            var foundOne, issue, k, match, matchQuery, query, regExp, ret, value, _i, _len, _ref, _this = this;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "LocalizationQualityIssueRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                }
                matchQuery = function(value, type, query) {
                    var ret;
                    switch (type) {
                      case "locQualityIssueComment":
                        if (value.locQualityIssueComment !== query) {
                            return false;
                        }
                        break;

                      case "locQualityIssueEnabled":
                        return value.locQualityIssueEnabled === (query === "yes");

                      case "locQualityIssueProfileRef":
                        if (value.locQualityIssueProfileRef !== query) {
                            return false;
                        }
                        break;

                      case "locQualityIssueType":
                        if (value.locQualityIssueType !== query) {
                            return false;
                        }
                        break;

                      case "locQualityIssuesRef":
                        if (value.locQualityIssuesRef !== query) {
                            return false;
                        }
                        break;

                      case "locQualityIssueSeverity":
                        ret = _this.compareNumber(query, value.locQualityIssueSeverity);
                        if (!ret) {
                            return false;
                        }
                        break;

                      default:
                        return false;
                    }
                };
                regExp = /(locQualityIssueComment|locQualityIssueEnabled|locQualityIssueProfileRef|locQualityIssueSeverity|locQualityIssueType|locQualityIssuesRef):[\s]?(["']?)(.+)\2(,|$)/gi;
                while (match = regExp.exec(query)) {
                    ret = matchQuery(value, match[1], match[3]);
                    if (ret != null) {
                        if (!ret && value.locQualityIssues != null) {
                            foundOne = false;
                            _ref = value.locQualityIssues;
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                issue = _ref[_i];
                                ret = matchQuery(issue, match[1], match[3]);
                                if (!(ret != null)) {
                                    foundOne = true;
                                }
                            }
                            return foundOne;
                        } else {
                            return ret;
                        }
                    }
                }
                return true;
            }
            return false;
        }
    };
    return LocalizationQualityIssueRule;
}(Rule);

var LocalizationQualityRatingRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

LocalizationQualityRatingRule = function(_super) {
    __extends(LocalizationQualityRatingRule, _super);
    function LocalizationQualityRatingRule() {
        this.apply = __bind(this.apply, this);
        LocalizationQualityRatingRule.__super__.constructor.apply(this, arguments);
        this.NAME = "locQualityRating";
        this.attributes = {
            locQualityRatingScore: "its-loc-quality-rating-score",
            locQualityRatingScoreThreshold: "its-loc-quality-rating-score-threshold",
            locQualityRatingVote: "its-loc-quality-rating-vote",
            locQualityRatingVoteThreshold: "its-loc-quality-rating-vote-threshold",
            locQualityRatingProfileRef: "its-loc-quality-rating-profile-ref"
        };
    }
    LocalizationQualityRatingRule.prototype.parse = function(rule, content) {};
    LocalizationQualityRatingRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyInherit(ret, tag);
        this.applyAttributes(ret, tag);
        if (ret.locQualityRatingScore != null && ret.locQualityRatingVote != null) {
            delete ret.locQualityRatingVote;
            delete ret.locQualityRatingVoteThreshold;
        }
        if (ret.locQualityRatingScore != null) {
            ret.locQualityRatingScore = parseFloat(ret.locQualityRatingScore);
        }
        if (ret.locQualityRatingScoreThreshold != null) {
            ret.locQualityRatingScoreThreshold = parseFloat(ret.locQualityRatingScoreThreshold);
        }
        if (ret.locQualityRatingVote != null) {
            ret.locQualityRatingVote = parseInt(ret.locQualityRatingVote);
        }
        if (ret.locQualityRatingVoteThreshold != null) {
            ret.locQualityRatingVoteThreshold = parseInt(ret.locQualityRatingVoteThreshold);
        }
        return ret;
    };
    LocalizationQualityRatingRule.prototype.def = function() {
        return {};
    };
    LocalizationQualityRatingRule.prototype.jQSelector = {
        name: "locQualityRating",
        callback: function(a, i, m) {
            var k, query, value, _this = this;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "LocalizationQualityRatingRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else {
                    return this.splitQuery(query, value, {
                        locQualityRatingProfileRef: "",
                        locQualityRatingScore: function(match) {
                            return _this.compareNumber(match[2], value.locQualityRatingScore);
                        },
                        locQualityRatingScoreThreshold: function(match) {
                            return _this.compareNumber(match[2], value.locQualityRatingScoreThreshold);
                        },
                        locQualityRatingVote: function(match) {
                            return _this.compareNumber(match[2], value.locQualityRatingVote);
                        },
                        locQualityRatingVoteThreshold: function(match) {
                            return _this.compareNumber(match[2], value.locQualityRatingVoteThreshold);
                        }
                    });
                }
            }
            return false;
        }
    };
    return LocalizationQualityRatingRule;
}(Rule);

var MTConfidenceRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

MTConfidenceRule = function(_super) {
    __extends(MTConfidenceRule, _super);
    function MTConfidenceRule() {
        this.apply = __bind(this.apply, this);
        MTConfidenceRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:mtconfidencerule";
        this.NAME = "mtConfidence";
        this.attributes = {
            mtConfidence: "its-mt-confidence"
        };
    }
    MTConfidenceRule.prototype.parse = function(rule, content) {
        var object;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            if ($(rule).attr("mtConfidence")) {
                object.mtConfidence = parseFloat($(rule).attr("mtConfidence"));
            } else {
                return;
            }
            return this.addSelector(object);
        }
    };
    MTConfidenceRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "mtConfidence" ]);
        this.applyInherit(ret, tag);
        this.applyAttributes(ret, tag);
        if (ret.mtConfidence != null) {
            ret.mtConfidence = parseFloat(ret.mtConfidence);
        }
        return ret;
    };
    MTConfidenceRule.prototype.def = function() {
        return {};
    };
    MTConfidenceRule.prototype.jQSelector = {
        name: "mtConfidence",
        callback: function(a, i, m) {
            var k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "MTConfidenceRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else {
                    return this.compareNumber(query, value);
                }
            }
            return false;
        }
    };
    return MTConfidenceRule;
}(Rule);

var ProvenanceRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

ProvenanceRule = function(_super) {
    __extends(ProvenanceRule, _super);
    function ProvenanceRule() {
        this.apply = __bind(this.apply, this);
        this.getExternalStandoffMarkup = __bind(this.getExternalStandoffMarkup, this);
        this.standoffMarkup = __bind(this.standoffMarkup, this);
        this.standoffMarkupXML = __bind(this.standoffMarkupXML, this);
        ProvenanceRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:provrule";
        this.STANDOFF_NAME = "its:provenancerecords";
        this.NAME = "Provenance";
        this.attributes = {
            person: "its-person",
            personRef: "its-person-ref",
            org: "its-org",
            orgRef: "its-org-ref",
            tool: "its-tool",
            toolRef: "its-tool-ref",
            revPerson: "its-rev-person",
            revPersonRef: "its-rev-person-ref",
            revOrg: "its-rev-org",
            revOrgRef: "its-rev-org-ref",
            revTool: "its-rev-tool",
            revToolRef: "its-rev-tool-ref",
            provRef: "its-prov-ref",
            provenanceRecordsRef: "its-provenance-records-ref"
        };
    }
    ProvenanceRule.prototype.standoffMarkupXML = function(rule, content, file) {
        var attributeName, child, id, object, objectName, record, records, _i, _len, _ref, _ref1;
        if (rule.tagName.toLowerCase() === this.STANDOFF_NAME) {
            object = {};
            id = $(rule).attr("xml:id");
            if (file != null) {
                if (file.indexOf("#" !== -1)) {
                    file = file.substr(0, file.indexOf("#"));
                    object.id = "" + file + "#" + id;
                } else {
                    object.id = "" + file + "#" + id;
                }
            } else {
                object.id = "#" + id;
            }
            object.type = this.NAME;
            records = [];
            _ref = rule.childNodes;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                if (child.nodeType === 1 && child.tagName.toLowerCase() === "its:provenancerecord") {
                    record = {};
                    _ref1 = this.attributes;
                    for (objectName in _ref1) {
                        attributeName = _ref1[objectName];
                        if ($(child).attr(objectName) !== void 0) {
                            record[objectName] = $(child).attr(objectName);
                        }
                    }
                    records.push(record);
                }
            }
            object.records = records;
            this.addStandoff(object);
            return true;
        }
        return false;
    };
    ProvenanceRule.prototype.standoffMarkup = function(content) {
        var _this = this;
        $("[its-provenance-records-ref]", content).each(function(key, element) {
            var value;
            value = $(element).attr("its-provenance-records-ref");
            return _this.getExternalStandoffMarkup(value);
        });
        return false;
    };
    ProvenanceRule.prototype.getExternalStandoffMarkup = function(provenanceRecordsRef) {
        var alreadyAdded, standoff, _i, _len, _ref;
        if (provenanceRecordsRef.charAt(0) !== "#") {
            alreadyAdded = false;
            _ref = this.standoff;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                standoff = _ref[_i];
                if (standoff.type = this.NAME) {
                    if (standoff.id === provenanceRecordsRef) {
                        alreadyAdded = true;
                        break;
                    }
                }
            }
            if (!alreadyAdded) {
                return window.rulesController.getFile(provenanceRecordsRef);
            }
        }
    };
    ProvenanceRule.prototype.parse = function(rule, content) {
        var newObject, newRule, newRules, object, rules, xpath, _i, _j, _len, _len1, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            rules = [];
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            if ($(rule).attr("provenanceRecordsRefPointer") !== void 0) {
                xpath = XPath.getInstance(content);
                object.provenanceRecordsRefPointer = $(rule).attr("provenanceRecordsRefPointer");
                newRules = xpath.resolve(object.selector, object.provenanceRecordsRefPointer);
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    newObject = $.extend(true, {}, object);
                    if (newRule.result instanceof Attr) {
                        newObject.provenanceRecordsRef = newRule.result.value;
                    } else {
                        newObject.provenanceRecordsRef = $(newRule.result).text();
                    }
                    newObject.selector = newRule.selector;
                    rules.push(newObject);
                    this.getExternalStandoffMarkup(newObject.provenanceRecordsRef);
                }
            } else {
                return;
            }
            _results = [];
            for (_j = 0, _len1 = rules.length; _j < _len1; _j++) {
                rule = rules[_j];
                _results.push(this.addSelector(rule));
            }
            return _results;
        }
    };
    ProvenanceRule.prototype.apply = function(tag) {
        var ret, standoff, _i, _len, _ref;
        ret = this.def();
        this.applyRules(ret, tag, [ "provenanceRecordsRef" ]);
        this.applyInherit(ret, tag, true);
        this.applyAttributes(ret, tag);
        if (ret.provenanceRecordsRef != null) {
            _ref = this.standoff;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                standoff = _ref[_i];
                if (standoff.type = this.NAME) {
                    if (standoff.id === ret.provenanceRecordsRef) {
                        if (standoff.records != null) {
                            ret.provenanceRecords = standoff.records;
                        }
                        this.store(tag, ret);
                    }
                }
            }
        }
        return ret;
    };
    ProvenanceRule.prototype.def = function() {
        return {};
    };
    ProvenanceRule.prototype.jQSelector = {
        name: "provenance",
        callback: function(a, i, m) {
            var foundOne, k, match, query, record, test, value, _i, _j, _len, _len1, _ref;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "ProvenanceRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                }
                query = query.split(",");
                for (_i = 0, _len = query.length; _i < _len; _i++) {
                    test = query[_i];
                    match = test.match(/(person|personRef|org|orgRef|tool|toolRef|revPerson|revPersonRef|revOrg|revOrgRef|revTool|revToolRef|provRef|provenanceRecordsRef):\s*(.*?)\s*$/);
                    if (!(value[match[1]] != null) || value[match[1]] !== match[2]) {
                        if (value.provenanceRecords) {
                            foundOne = false;
                            _ref = value.provenanceRecords;
                            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                                record = _ref[_j];
                                if (record[match[1]] != null && record[match[1]] === match[2]) {
                                    foundOne = true;
                                }
                            }
                            if (!foundOne) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
    };
    return ProvenanceRule;
}(Rule);

var StorageSizeRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

StorageSizeRule = function(_super) {
    __extends(StorageSizeRule, _super);
    function StorageSizeRule() {
        this.apply = __bind(this.apply, this);
        StorageSizeRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:storagesizerule";
        this.NAME = "storageSize";
        this.attributes = {
            storageSize: "its-storage-size",
            storageEncoding: "its-storage-encoding",
            lineBreakType: "its-line-break-type"
        };
    }
    StorageSizeRule.prototype.createRule = function(selector, storageSize, storageEncoding) {
        var object;
        if (storageEncoding == null) {
            storageEncoding = null;
        }
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.storageSize = storageSize;
        if (storageEncoding != null) {
            object.storageEncoding = storageEncoding;
        }
        return object;
    };
    StorageSizeRule.prototype.parse = function(rule, content) {
        var newRule, newRules, ruleObject, rules, selector, storageEncoding, storageSize, xpath, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            rules = [];
            selector = $(rule).attr("selector");
            if ($(rule).attr("storageSize")) {
                rules.push(this.createRule(selector, $(rule).attr("storageSize")));
            } else if ($(rule).attr("storageSizePointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("storageSizePointer"));
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        storageSize = newRule.result.value;
                    } else {
                        storageSize = $(newRule.result).text();
                    }
                    rules.push(this.createRule(newRule.selector, storageSize));
                }
            } else {
                return;
            }
            if ($(rule).attr("storageEncoding")) {
                for (_j = 0, _len1 = rules.length; _j < _len1; _j++) {
                    ruleObject = rules[_j];
                    ruleObject.storageEncoding = $(rule).attr("storageEncoding");
                }
            } else if ($(rule).attr("storageEncodingPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, $(rule).attr("storageEncodingPointer"));
                for (_k = 0, _len2 = newRules.length; _k < _len2; _k++) {
                    newRule = newRules[_k];
                    if (newRule.result instanceof Attr) {
                        storageEncoding = newRule.result.value;
                    } else {
                        storageEncoding = $(newRule.result).text();
                    }
                    rules.push(this.createRule(newRule.selector, storageSize, storageEncoding));
                    for (_l = 0, _len3 = rules.length; _l < _len3; _l++) {
                        ruleObject = rules[_l];
                        ruleObject.storageEncoding = storageEncoding;
                    }
                }
            } else {
                for (_m = 0, _len4 = rules.length; _m < _len4; _m++) {
                    ruleObject = rules[_m];
                    ruleObject.storageEncoding = "UTF-8";
                }
            }
            for (_n = 0, _len5 = rules.length; _n < _len5; _n++) {
                ruleObject = rules[_n];
                if ($(rule).attr("lineBreakType")) {
                    ruleObject.lineBreakType = this.normalizeString($(rule).attr("lineBreakType"));
                } else {
                    ruleObject.lineBreakType = "lf";
                }
            }
            _results = [];
            for (_o = 0, _len6 = rules.length; _o < _len6; _o++) {
                ruleObject = rules[_o];
                _results.push(this.addSelector(ruleObject));
            }
            return _results;
        }
    };
    StorageSizeRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "storageSize", "storageEncoding", "lineBreakType" ]);
        this.applyAttributes(ret, tag);
        if (ret.lineBreakType != null) {
            ret.lineBreakType = this.normalizeString(ret.lineBreakType);
        }
        if (ret.storageSize === null) {
            return {};
        } else {
            return ret;
        }
    };
    StorageSizeRule.prototype.def = function() {
        return {
            lineBreakType: "lf",
            storageEncoding: "UTF-8",
            storageSize: null
        };
    };
    StorageSizeRule.prototype.jQSelector = {
        name: "storageSize",
        callback: function(a, i, m) {
            var query, value, _this = this;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "StorageSizeRule");
            if (value.storageSize) {
                if (query === "any") {
                    return true;
                } else {
                    return this.splitQuery(query, value, {
                        size: function(match) {
                            return _this.compareNumber(match[2], value.storageSize);
                        },
                        encoding: function(match) {
                            if (value.storageEncoding !== match[2]) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        linebreak: function() {
                            if (value.lineBreakType !== match[2]) {
                                return false;
                            } else {}
                            return true;
                        }
                    });
                }
            }
            return false;
        }
    };
    return StorageSizeRule;
}(Rule);

var TargetPointerRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

TargetPointerRule = function(_super) {
    __extends(TargetPointerRule, _super);
    function TargetPointerRule() {
        this.apply = __bind(this.apply, this);
        TargetPointerRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:targetpointerrule";
        this.NAME = "targetPointer";
    }
    TargetPointerRule.prototype.createRule = function(selector, targetPointer, target) {
        var object;
        object = {};
        object.selector = selector;
        object.type = this.NAME;
        object.targetPointer = targetPointer;
        if (target != null) {
            object.target = target;
        }
        return object;
    };
    TargetPointerRule.prototype.parse = function(rule, content) {
        var newRule, newRules, selector, target, targetPointer, xpath, _i, _len, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            selector = $(rule).attr("selector");
            if ($(rule).attr("targetPointer")) {
                targetPointer = $(rule).attr("targetPointer");
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(selector, targetPointer);
                if (newRules.length > 0) {
                    _results = [];
                    for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                        newRule = newRules[_i];
                        if (newRule.result instanceof Attr) {
                            target = newRule.result.value;
                        } else {
                            target = $(newRule.result).text();
                        }
                        _results.push(this.addSelector(this.createRule(newRule.selector, targetPointer, target)));
                    }
                    return _results;
                } else {
                    return this.addSelector(this.createRule(selector, targetPointer));
                }
            }
        }
    };
    TargetPointerRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "target", "targetPointer" ]);
        return ret;
    };
    TargetPointerRule.prototype.def = function() {
        return {};
    };
    TargetPointerRule.prototype.jQSelector = {
        name: "targetPointer",
        callback: function(a, i, m) {
            var k, query, value;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "TargetPointerRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else if (!(value.target != null) || value.target !== query) {
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }
    };
    return TargetPointerRule;
}(Rule);

var TerminologyRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

TerminologyRule = function(_super) {
    __extends(TerminologyRule, _super);
    function TerminologyRule() {
        this.apply = __bind(this.apply, this);
        TerminologyRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:termrule";
        this.NAME = "terminology";
        this.attributes = {
            termConfidence: "its-term-confidence",
            termInfoRef: "its-term-info-ref",
            term: "its-term"
        };
    }
    TerminologyRule.prototype.parse = function(rule, content) {
        var newObject, newRule, newRules, object, ruleObject, rules, xpath, _i, _j, _k, _len, _len1, _len2, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            rules = [];
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            if ($(rule).attr("term")) {
                object.term = $(rule).attr("term");
            } else {
                return;
            }
            if ($(rule).attr("termInfoPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("termInfoPointer"));
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    newObject = $.extend(true, {}, object);
                    newObject.selector = newRule.selector;
                    if (newRule.result instanceof Attr) {
                        newObject.termInfo = newRule.result.value;
                    } else {
                        newObject.termInfo = $(newRule.result).text();
                    }
                    rules.push(newObject);
                }
            } else if ($(rule).attr("termInfoRef")) {
                object.termInfoRef = $(rule).attr("termInfoRef");
                rules.push($.extend(true, {}, object));
            } else if ($(rule).attr("termInfoRefPointer")) {
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("termInfoRefPointer"));
                for (_j = 0, _len1 = newRules.length; _j < _len1; _j++) {
                    newRule = newRules[_j];
                    newObject = $.extend(true, {}, object);
                    newObject.selector = newRule.selector;
                    if (newRule.result instanceof Attr) {
                        newObject.termInfoRef = newRule.result.value;
                    } else {
                        newObject.termInfoRef = $(newRule.result).text();
                    }
                    rules.push(newObject);
                }
            } else {
                rules.push($.extend(true, {}, object));
            }
            _results = [];
            for (_k = 0, _len2 = rules.length; _k < _len2; _k++) {
                ruleObject = rules[_k];
                if (rules.term != null) {
                    rules.term = this.normalizeYesNo(rules.term);
                }
                _results.push(this.addSelector(ruleObject));
            }
            return _results;
        }
    };
    TerminologyRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "term", "termInfoRef", "termInfo" ]);
        this.applyAttributes(ret, tag);
        if (ret.term != null) {
            ret.term = this.normalizeYesNo(ret.term);
        }
        return ret;
    };
    TerminologyRule.prototype.def = function() {
        return {
            term: false
        };
    };
    TerminologyRule.prototype.jQSelector = {
        name: "terminology",
        callback: function(a, i, m) {
            var k, query, value, _this = this;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "TerminologyRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return value.term;
                } else {
                    return this.splitQuery(query, value, {
                        termConfidence: function(match) {
                            return _this.compareNumber(match[2], value.termConfidence);
                        },
                        term: function(match) {
                            if (value.term && "no" === match[2] || !value.term && "yes" === match[2]) {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        termInfoRef: ""
                    });
                }
            }
            return false;
        }
    };
    return TerminologyRule;
}(Rule);

var TextAnalysisRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

TextAnalysisRule = function(_super) {
    __extends(TextAnalysisRule, _super);
    function TextAnalysisRule() {
        this.apply = __bind(this.apply, this);
        TextAnalysisRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:textanalysisrule";
        this.NAME = "textAnalysis";
        this.attributes = {
            taClassRef: "its-ta-class-ref",
            taConfidence: "its-ta-confidence",
            taIdent: "its-ta-ident",
            taIdentRef: "its-ta-ident-ref",
            taSource: "its-ta-source"
        };
    }
    TextAnalysisRule.prototype.parse = function(rule, content) {
        var foundOne, newObject, newRule, newRules, object, ruleOb, ruleObject, rules, xpath, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            rules = [];
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            foundOne = false;
            if ($(rule).attr("taClassRefPointer")) {
                foundOne = true;
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("taClassRefPointer"));
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    newObject = $.extend(true, {}, object);
                    if (newRule.result instanceof Attr) {
                        newObject.taClassRef = newRule.result.value;
                    } else {
                        newObject.taClassRef = $(newRule.result).text();
                    }
                    newObject.selector = newRule.selector;
                    rules.push(newObject);
                }
            }
            if ($(rule).attr("taIdentRefPointer")) {
                foundOne = true;
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("taIdentRefPointer"));
                for (_j = 0, _len1 = newRules.length; _j < _len1; _j++) {
                    newRule = newRules[_j];
                    newObject = $.extend(true, {}, object);
                    newObject.selector = newRule.selector;
                    if (newRule.result instanceof Attr) {
                        newObject.taIdentRef = newRule.result.value;
                    } else {
                        newObject.taIdentRef = $(newRule.result).text();
                    }
                    rules.push(newObject);
                }
            } else if ($(rule).attr("taSourcePointer") && $(rule).attr("taIdentPointer")) {
                foundOne = true;
                xpath = XPath.getInstance(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("taSourcePointer"));
                for (_k = 0, _len2 = newRules.length; _k < _len2; _k++) {
                    newRule = newRules[_k];
                    newObject = $.extend(true, {}, object);
                    newObject.selector = newRule.selector;
                    if (newRule.result instanceof Attr) {
                        newObject.taSource = newRule.result.value;
                    } else {
                        newObject.taSource = $(newRule.result).text();
                    }
                    rules.push(newObject);
                }
                newRules = xpath.resolve(object.selector, $(rule).attr("taIdentPointer"));
                for (_l = 0, _len3 = newRules.length; _l < _len3; _l++) {
                    newRule = newRules[_l];
                    newObject = $.extend(true, {}, object);
                    newObject.selector = newRule.selector;
                    if (newRule.result instanceof Attr) {
                        newObject.taIdent = newRule.result.value;
                    } else {
                        newObject.taIdent = $(newRule.result).text();
                    }
                    rules.push(newObject);
                    for (_m = 0, _len4 = rules.length; _m < _len4; _m++) {
                        ruleOb = rules[_m];
                        ruleOb = newObject.taIdent;
                    }
                }
            }
            if (!foundOne) {
                return;
            }
            _results = [];
            for (_n = 0, _len5 = rules.length; _n < _len5; _n++) {
                ruleObject = rules[_n];
                _results.push(this.addSelector(ruleObject));
            }
            return _results;
        }
    };
    TextAnalysisRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def();
        this.applyRules(ret, tag, [ "taClassRef", "taIdent", "taIdentRef", "taSource" ]);
        this.applyAttributes(ret, tag);
        return ret;
    };
    TextAnalysisRule.prototype.def = function() {
        return {};
    };
    TextAnalysisRule.prototype.jQSelector = {
        name: "textAnalysis",
        callback: function(a, i, m) {
            var k, query, value, _this = this;
            query = m[3] ? m[3] : "any";
            value = window.rulesController.apply(a, "TextAnalysisRule");
            if (function() {
                var _results;
                _results = [];
                for (k in value) {
                    if (!__hasProp.call(value, k)) continue;
                    _results.push(k);
                }
                return _results;
            }().length !== 0) {
                if (query === "any") {
                    return true;
                } else {
                    return this.splitQuery(query, value, {
                        taConfidence: function(match) {
                            return _this.compareNumber(match[2], value.taConfidence);
                        },
                        taIdentRef: "",
                        taClassRef: "",
                        taSource: "",
                        taIdent: ""
                    });
                }
            }
            return false;
        }
    };
    return TextAnalysisRule;
}(Rule);

var TranslateRule, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

TranslateRule = function(_super) {
    __extends(TranslateRule, _super);
    function TranslateRule() {
        this.apply = __bind(this.apply, this);
        this.parse = __bind(this.parse, this);
        TranslateRule.__super__.constructor.apply(this, arguments);
        this.RULE_NAME = "its:translaterule";
        this.NAME = "translate";
    }
    TranslateRule.prototype.parse = function(rule, content) {
        var object;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            object.translate = this.normalizeYesNo($(rule).attr(this.NAME));
            return this.addSelector(object);
        }
    };
    TranslateRule.prototype.apply = function(tag) {
        var ret;
        ret = this.def(tag);
        if (ret.translate === false) {
            return ret;
        }
        this.applyRules(ret, tag, [ "translate" ]);
        this.applyInherit(ret, tag, true);
        if (!(tag instanceof Attr) && tag.hasAttribute(this.NAME) && $(tag).attr(this.NAME) !== void 0) {
            ret = {
                translate: this.normalizeYesNo($(tag).attr(this.NAME))
            };
            this.store(tag, ret);
        }
        return ret;
    };
    TranslateRule.prototype.def = function(tag) {
        var _ref, _ref1, _ref2, _ref3, _ref4;
        if (tag instanceof Attr) {
            if (tag.nodeName.toLowerCase() === "abr" && tag.ownerElement.nodeName.toLowerCase() === "th") {
                return {
                    translate: true
                };
            } else if (tag.nodeName.toLowerCase() === "alt" && ((_ref = tag.ownerElement.nodeName.toLowerCase()) === "area" || _ref === "img" || _ref === "input")) {
                return {
                    translate: true
                };
            } else if (tag.nodeName.toLowerCase() === "content" && tag.ownerElement.nodeName.toLowerCase() === "meta") {
                return {
                    translate: true
                };
            } else if (tag.nodeName.toLowerCase() === "download" && ((_ref1 = tag.ownerElement.nodeName.toLowerCase()) === "a" || _ref1 === "area")) {
                return {
                    translate: true
                };
            } else if (tag.nodeName.toLowerCase() === "label" && ((_ref2 = tag.ownerElement.nodeName.toLowerCase()) === "menuitem" || _ref2 === "menu" || _ref2 === "optgroup" || _ref2 === "option" || _ref2 === "track")) {
                return {
                    translate: true
                };
            } else if ((_ref3 = tag.nodeName.toLowerCase()) === "lang" || _ref3 === "style" || _ref3 === "title" || _ref3 === "aria-label" || _ref3 === "aria-valuetext") {
                return {
                    translate: true
                };
            } else if (tag.nodeName.toLowerCase() === "placeholder" && ((_ref4 = tag.ownerElement.nodeName.toLowerCase()) === "input" || _ref4 === "textarea")) {
                return {
                    translate: true
                };
            } else if (tag.nodeName.toLowerCase() === "srcdoc" && tag.ownerElement.nodeName.toLowerCase() === "iframe") {
                return {
                    translate: true
                };
            } else {
                return {
                    translate: false
                };
            }
        } else {
            return {
                translate: true
            };
        }
    };
    TranslateRule.prototype.jQSelector = {
        name: "translate",
        callback: function(a, i, m) {
            var query, value;
            query = m[3] ? m[3] : "yes";
            value = window.rulesController.apply(a, "TranslateRule");
            return value.translate === (query === "yes");
        }
    };
    return TranslateRule;
}(Rule);

var globalRules, rule, selectors, _i, _len;

Function.prototype.bind = Function.prototype.bind || function(thisp) {
    var fn;
    fn = this;
    return function() {
        return fn.apply(thisp, arguments);
    };
};

globalRules = [ new ParamRule(), new TranslateRule(), new LocalizationNoteRule(), new StorageSizeRule(), new AllowedCharactersRule(), new AnnotatorsRef(), new TextAnalysisRule(), new TerminologyRule(), new DirectionalityRule(), new DomainRule(), new LocaleFilterRule(), new LocalizationQualityIssueRule(), new LocalizationQualityRatingRule(), new MTConfidenceRule(), new ProvenanceRule(), new ExternalResourceRule(), new TargetPointerRule(), new IdValueRule(), new LanguageInformationRule(), new ElementsWithinTextRule() ];

selectors = {};

for (_i = 0, _len = globalRules.length; _i < _len; _i++) {
    rule = globalRules[_i];
    if (rule.jQSelector != null && typeof rule.jQSelector.callback === "function") {
        selectors[rule.jQSelector.name] = rule.jQSelector.callback.bind(rule);
    }
}

$.extend($.expr[":"], selectors);

$.extend({
    parseITS: function(callback) {
        var external_rules, internal_rules, _j, _k, _len1, _len2;
        window.XPath = XPath;
        window.rulesController = new RulesController(globalRules);
        window.rulesController.setContent($("html"));
        window.rulesController.getStandoffMarkup();
        external_rules = $('link[rel="its-rules"]');
        if (external_rules) {
            for (_j = 0, _len1 = external_rules.length; _j < _len1; _j++) {
                rule = external_rules[_j];
                window.rulesController.addLink(rule);
            }
        }
        internal_rules = $('script[type="application/its+xml"]');
        if (internal_rules) {
            for (_k = 0, _len2 = internal_rules.length; _k < _len2; _k++) {
                rule = internal_rules[_k];
                rule = $.parseXML(rule.childNodes[0].data);
                if (rule) {
                    window.rulesController.addXML(rule.childNodes[0]);
                }
            }
        }
        if (callback) {
            return callback(window.rulesController);
        }
    },
    getITSData: function(element) {
        return $(element).getITSData();
    },
    clearITSCache: function() {
        var attributes, tag, _j, _k, _len1, _len2, _ref, _ref1;
        XPath.cache = false;
        _ref = $("*");
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            tag = _ref[_j];
            delete tag.itsRuleInherit;
            delete tag.itsXPath;
            if (tag.attributes.length !== 0) {
                _ref1 = tag.attributes;
                for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                    attributes = _ref1[_k];
                    delete attributes.itsRuleInherit;
                    delete attributes.itsXPath;
                }
            }
        }
        return XPath.cache = true;
    }
});

$.fn.extend({
    getITSData: function() {
        var element, ruleName, ruleValues, value, values, _j, _len1;
        values = [];
        for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
            element = this[_j];
            ruleValues = window.rulesController.apply(element);
            if (ruleValues) {
                delete ruleValues.ParamRule;
                value = {};
                for (ruleName in ruleValues) {
                    rule = ruleValues[ruleName];
                    value = $.extend(value, rule);
                }
                values.push(value);
            }
        }
        if (values.length === 1) {
            return values.pop();
        } else {
            return values;
        }
    },
    getITSAnnotatorsRef: function(searchRuleName) {
        var annotator, element, ruleAnnotator, ruleName, ruleValues, _j, _len1, _ref;
        annotator = [];
        for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
            element = this[_j];
            ruleValues = window.rulesController.apply(element, "AnnotatorsRef");
            if (ruleValues.annotatorsRefSplitted) {
                _ref = ruleValues.annotatorsRefSplitted;
                for (ruleName in _ref) {
                    ruleAnnotator = _ref[ruleName];
                    if (searchRuleName.toLowerCase() === ruleName.toLowerCase()) {
                        annotator.push(ruleAnnotator);
                    }
                }
            }
        }
        return annotator;
    },
    getITSSplitText: function() {
        var element, prepareText, splitText, texts, _j, _len1;
        texts = [];
        prepareText = function(text) {
            return text.replace(/^\s*|\s*$/g, "");
        };
        splitText = function(element, nested) {
            var child, text, value, _j, _len1, _ref;
            if (nested == null) {
                nested = false;
            }
            value = window.rulesController.apply(element, "ElementsWithinTextRule");
            if (value.withinText === "no") {
                if (element.childNodes.length > 0) {
                    text = "";
                    _ref = element.childNodes;
                    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                        child = _ref[_j];
                        if (child.nodeType === 1) {
                            if (splitText(child, true)) {
                                text += " " + prepareText($("<div></div>").append($(child).clone()).html());
                            }
                        } else {
                            text += " " + prepareText(child.nodeValue);
                        }
                    }
                    if (text !== "") {
                        texts.push(prepareText(text));
                    }
                } else {
                    texts.push(prepareText($(element).html()));
                }
            } else if (value.withinText === "nested") {
                texts.push(prepareText($(element).html()));
            } else if (value.withinText === "yes") {
                if (!nested) {
                    splitText(element.parentNode);
                } else {
                    return true;
                }
            }
            return false;
        };
        for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
            element = this[_j];
            splitText(element);
        }
        return texts;
    }
});})(jQuery);
