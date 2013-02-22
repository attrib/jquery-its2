var XPath, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

XPath = function() {
    function XPath(element) {
        this.parents = __bind(this.parents, this);
        this.build = __bind(this.build, this);
        this.path = "";
        this.element = null;
        if (element === void 0 || element.length <= 0) {
            return null;
        }
        if (element.jquery != null) {
            this.element = element;
        } else {
            this.element = $(element);
        }
        this.build();
    }
    XPath.prototype.build = function() {
        this.path = this.path.concat(this.parents());
        return this.path = this.path.concat(this.index(this.element.get(0)));
    };
    XPath.prototype.parents = function() {
        var parentPath, _this = this;
        parentPath = "";
        $.each(this.element.parents().get().reverse(), function(i, parent) {
            return parentPath = parentPath.concat(_this.index(parent));
        });
        return parentPath;
    };
    XPath.prototype.index = function(element) {
        var nodeName, position, prevSiblings;
        nodeName = element.nodeName.toLowerCase();
        prevSiblings = $(element).prevAll(nodeName);
        position = prevSiblings.length + 1;
        if ($(element).parents().length === 0) {
            return "/" + nodeName;
        } else {
            return "/" + nodeName + "[" + position + "]";
        }
    };
    XPath.prototype.filter = function(selector) {
        return selector.replace(/h:/g, "");
    };
    XPath.prototype.query = function(selector, resultType) {
        var domElement;
        domElement = this.element.get(0);
        if (domElement instanceof Attr) {
            domElement = domElement.ownerElement;
        }
        return document.evaluate(selector, domElement, null, resultType, null);
    };
    XPath.prototype.process = function(selector) {
        var attribute, docElement, domElement, nsResolver, res, result, xpe;
        selector = this.filter(selector);
        xpe = new XPathEvaluator();
        domElement = this.element.get(0);
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
        var matchedElement, obj, result, ret, unrolled, xpath;
        selector = this.filter(selector);
        pointer = this.filter(pointer);
        result = this.query(selector, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        unrolled = [];
        while (matchedElement = result.iterateNext()) {
            xpath = new XPath(matchedElement);
            ret = xpath.query(pointer, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
            obj = {
                selector: xpath.path,
                result: ret.iterateNext()
            };
            unrolled.push(obj);
        }
        return unrolled;
    };
    return XPath;
}();

var Rule, staticData, __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

staticData = {};

Rule = function() {
    function Rule() {
        this.store = __bind(this.store, this);
        this.apply = __bind(this.apply, this);
        this.parse = __bind(this.parse, this);
        this.rules = [];
        this.applied = {};
    }
    Rule.prototype.parse = function(rule, content) {
        throw new Error("AbstractClass Rule: method parse not implemented.");
    };
    Rule.prototype.apply = function(node) {
        throw new Error("AbstractClass Rule: method apply not implemented.");
    };
    Rule.prototype.def = function() {
        throw new Error("AbstractClass Rule: method def not implemented.");
    };
    Rule.prototype.addSelector = function(object) {
        return this.rules.push(object);
    };
    Rule.prototype.inherited = function(node) {
        var parent, parents, xpath, _i, _len;
        parents = $(node).parents();
        parents.splice(0, 0, $(node));
        for (_i = 0, _len = parents.length; _i < _len; _i++) {
            parent = parents[_i];
            xpath = new XPath(parent);
            if (this.applied[xpath.path]) {
                return this.applied[xpath.path];
            }
        }
    };
    Rule.prototype.store = function(node, object) {
        var xpath;
        xpath = new XPath(node);
        return this.applied[xpath.path] = object;
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
    RulesController.prototype.addXML = function(xml) {
        var child, _i, _len, _ref, _results;
        if (xml.tagName && xml.tagName.toLowerCase() === "its:rules" && ($(xml).attr("version") === "2.0" || $(xml).attr("its:version") === "2.0")) {
            return this.parseXML(xml);
        } else {
            if (xml.hasChildNodes) {
                _ref = xml.childNodes;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    _results.push(this.addXML(child));
                }
                return _results;
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
            return _this.addXML(data.childNodes[0]);
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
    return RulesController;
}();

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
    var normalize;
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
            object.translate = normalize($(rule).attr(this.NAME));
            return this.addSelector(object);
        }
    };
    TranslateRule.prototype.apply = function(tag) {
        var ret, rule, value, xpath, _i, _len, _ref;
        ret = tag instanceof Attr ? this.defAttr() : this.def();
        xpath = new XPath(tag);
        _ref = this.rules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            if (rule.type = this.NAME) {
                if (xpath.process(rule.selector)) {
                    ret = {
                        translate: rule.translate
                    };
                    this.store(tag, ret);
                }
            }
        }
        value = this.inherited(tag);
        if (value instanceof Object) {
            ret = value;
        }
        if ($(tag).attr(this.NAME) !== void 0) {
            ret = {
                translate: normalize($(tag).attr(this.NAME))
            };
        }
        return ret;
    };
    TranslateRule.prototype.def = function() {
        return {
            translate: true
        };
    };
    TranslateRule.prototype.defAttr = function() {
        return {
            translate: false
        };
    };
    normalize = function(translateString) {
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
    return TranslateRule;
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
    LocalizationNoteRule.prototype.createLocalizationNote = function(selector, locNoteType, locNote, ref) {
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
        object.locNoteType = locNoteType;
        return object;
    };
    LocalizationNoteRule.prototype.parse = function(rule, content) {
        var locNote, newRule, newRules, xpath, _i, _j, _len, _len1, _results, _results1;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            if ($(rule).attr("locNotePointer")) {
                xpath = new XPath(content);
                newRules = xpath.resolve($(rule).attr("selector"), $(rule).attr("locNotePointer"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        locNote = newRule.result.value;
                    } else {
                        locNote = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(this.createLocalizationNote(newRule.selector, $(rule).attr("locNoteType"), $(newRule.result).text())));
                }
                return _results;
            } else if ($(rule).attr("locNoteRef")) {
                return this.addSelector(this.createLocalizationNote($(rule).attr("selector"), $(rule).attr("locNoteType"), $(rule).attr("locNoteRef"), true));
            } else if ($(rule).attr("locNoteRefPointer")) {
                xpath = new XPath(content);
                newRules = xpath.resolve($(rule).attr("selector"), $(rule).attr("locNoteRefPointer"));
                _results1 = [];
                for (_j = 0, _len1 = newRules.length; _j < _len1; _j++) {
                    newRule = newRules[_j];
                    if (newRule.result instanceof Attr) {
                        locNote = newRule.result.value;
                    } else {
                        locNote = $(newRule.result).text();
                    }
                    _results1.push(this.addSelector(this.createLocalizationNote(newRule.selector, $(rule).attr("locNoteType"), locNote, true)));
                }
                return _results1;
            } else {
                if ($(rule).children().length > 0 && $(rule).children()[0].tagName.toLowerCase() === "its:locnote") {
                    return this.addSelector(this.createLocalizationNote($(rule).attr("selector"), $(rule).attr("locNoteType"), $(rule).children().text()));
                }
            }
        }
    };
    LocalizationNoteRule.prototype.apply = function(tag) {
        var attributeName, objectName, ret, rule, xpath, _i, _len, _ref, _ref1;
        ret = this.def();
        xpath = new XPath(tag);
        _ref = this.rules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            if (rule.type === this.NAME) {
                if (xpath.process(rule.selector)) {
                    if (rule.locNoteRef) {
                        ret.locNoteRef = rule.locNoteRef;
                    }
                    if (rule.locNote) {
                        ret.locNote = rule.locNote;
                    }
                    if (rule.locNoteType) {
                        ret.locNoteType = rule.locNoteType;
                    }
                }
            }
        }
        _ref1 = this.attributes;
        for (objectName in _ref1) {
            attributeName = _ref1[objectName];
            if ($(tag).attr(attributeName)) {
                ret[objectName] = $(tag).attr(attributeName);
            }
        }
        return ret;
    };
    LocalizationNoteRule.prototype.def = function() {
        return {};
    };
    return LocalizationNoteRule;
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
    StorageSizeRule.prototype.parse = function(rule, content) {
        var newRule, newRules, object, ruleObject, rules, rulesTmp, storageEncoding, xpath, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            rules = [];
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            if ($(rule).attr("storageSize")) {
                object.storageSize = $(rule).attr("storageSize");
                rules.push(object);
            } else if ($(rule).attr("storageSizePointer")) {
                xpath = new XPath(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("storageSizePointer"));
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        object.storageSize = newRule.result.value;
                    } else {
                        object.storageSize = $(newRule.result).text();
                    }
                    rules.push(object);
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
                xpath = new XPath(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("storageEncodingPointer"));
                rulesTmp = [];
                for (_k = 0, _len2 = newRules.length; _k < _len2; _k++) {
                    newRule = newRules[_k];
                    if (newRule.result instanceof Attr) {
                        storageEncoding = newRule.result.value;
                    } else {
                        storageEncoding = $(newRule.result).text();
                    }
                    for (_l = 0, _len3 = rules.length; _l < _len3; _l++) {
                        ruleObject = rules[_l];
                        ruleObject.storageEncoding = storageEncoding;
                        rulesTmp.push(ruleObject);
                    }
                }
                rules = rulesTmp;
            } else {
                for (_m = 0, _len4 = rules.length; _m < _len4; _m++) {
                    ruleObject = rules[_m];
                    ruleObject.storageEncoding = "UTF-8";
                }
            }
            for (_n = 0, _len5 = rules.length; _n < _len5; _n++) {
                ruleObject = rules[_n];
                if ($(rule).attr("lineBreakType")) {
                    ruleObject.lineBreakType = $(rule).attr("lineBreakType");
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
        var attributeName, objectName, ret, rule, xpath, _i, _len, _ref, _ref1;
        ret = this.def();
        xpath = new XPath(tag);
        _ref = this.rules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            if (rule.type = this.NAME) {
                if (xpath.process(rule.selector)) {
                    if (rule.storageSize) {
                        ret.storageSize = rule.storageSize;
                    }
                    if (rule.storageEncoding) {
                        ret.storageEncoding = rule.storageEncoding;
                    }
                    if (rule.lineBreakType) {
                        ret.lineBreakType = rule.lineBreakType;
                    }
                }
            }
        }
        _ref1 = this.attributes;
        for (objectName in _ref1) {
            attributeName = _ref1[objectName];
            if ($(tag).attr(attributeName)) {
                ret[objectName] = $(tag).attr(attributeName);
            }
        }
        ret.lineBreakType = ret.lineBreakType.toLowerCase();
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
    return StorageSizeRule;
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
    AllowedCharactersRule.prototype.parse = function(rule, content) {
        var allowedCharactersPointer, newRule, newRules, object, xpath, _i, _len, _results;
        if (rule.tagName.toLowerCase() === this.RULE_NAME) {
            object = {};
            object.selector = $(rule).attr("selector");
            object.type = this.NAME;
            if ($(rule).attr("allowedCharacters")) {
                object.allowedCharacters = $(rule).attr("allowedCharacters");
                return this.addSelector(object);
            } else if ($(rule).attr("allowedCharactersPointer")) {
                allowedCharactersPointer = $(rule).attr("allowedCharactersPointer");
                xpath = new XPath(content);
                newRules = xpath.resolve(object.selector, $(rule).attr("allowedCharactersPointer"));
                _results = [];
                for (_i = 0, _len = newRules.length; _i < _len; _i++) {
                    newRule = newRules[_i];
                    if (newRule.result instanceof Attr) {
                        object.allowedCharacters = newRule.result.value;
                    } else {
                        object.allowedCharacters = $(newRule.result).text();
                    }
                    _results.push(this.addSelector(object));
                }
                return _results;
            } else {}
        }
    };
    AllowedCharactersRule.prototype.apply = function(tag) {
        var attributeName, objectName, ret, rule, xpath, _i, _len, _ref, _ref1;
        ret = this.def();
        xpath = new XPath(tag);
        _ref = this.rules;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            rule = _ref[_i];
            if (rule.type = this.NAME) {
                if (xpath.process(rule.selector)) {
                    if (rule.allowedCharacters) {
                        ret.allowedCharacters = rule.allowedCharacters;
                    }
                }
            }
        }
        _ref1 = this.attributes;
        for (objectName in _ref1) {
            attributeName = _ref1[objectName];
            if ($(tag).attr(attributeName)) {
                ret[objectName] = $(tag).attr(attributeName);
            }
        }
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
    return AllowedCharactersRule;
}(Rule);

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

var $;

$ = jQuery;

$.extend({
    parseITS: function(callback) {
        var external_rules, globalRules, internal_rules, rule, _i, _j, _len, _len1;
        window.XPath = XPath;
        globalRules = [ new TranslateRule(), new LocalizationNoteRule(), new StorageSizeRule(), new AllowedCharactersRule(), new ParamRule() ];
        external_rules = $('link[rel="its-rules"]');
        window.rulesController = new RulesController(globalRules);
        window.rulesController.setContent($("html"));
        if (external_rules) {
            for (_i = 0, _len = external_rules.length; _i < _len; _i++) {
                rule = external_rules[_i];
                window.rulesController.addLink(rule);
            }
        }
        internal_rules = $('script[type="application/its+xml"]');
        if (internal_rules) {
            for (_j = 0, _len1 = internal_rules.length; _j < _len1; _j++) {
                rule = internal_rules[_j];
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
    }
});

$.fn.extend({
    getITSData: function() {
        var element, rule, ruleName, ruleValues, value, values, _i, _len;
        values = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
            element = this[_i];
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
    }
});

$.extend($.expr[":"], {
    translate: function(a, i, m) {
        var query, value;
        query = m[3] ? m[3] : "yes";
        value = window.rulesController.apply(a, "TranslateRule");
        return value.translate === (query === "yes");
    },
    locNote: function(a, i, m) {
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
    },
    storageSize: function(a, i, m) {
        var match, match2, query, test, value, _i, _len;
        query = m[3] ? m[3] : "any";
        value = window.rulesController.apply(a, "StorageSizeRule");
        if (value.storageSize) {
            if (query === "any") {
                return true;
            } else {
                query = query.split(",");
                for (_i = 0, _len = query.length; _i < _len; _i++) {
                    test = query[_i];
                    match = test.match(/(size|encoding|linebreak):\s*(.*?)\s*$/);
                    console.log(match);
                    switch (match[1]) {
                      case "size":
                        match2 = match[2].match(/([<>!=]*)\s*(\d*)/);
                        console.log(match2);
                        if (match2[2]) {
                            switch (match2[1]) {
                              case "":
                              case "=":
                              case "==":
                                if (value.storageSize !== match2[2]) {
                                    return false;
                                }
                                break;

                              case "!=":
                                if (value.storageSize === match2[2]) {
                                    return false;
                                }
                                break;

                              case ">":
                                if (value.storageSize > match2[2]) {
                                    return false;
                                }
                                break;

                              case "<":
                                if (value.storageSize < match2[2]) {
                                    return false;
                                }
                                break;

                              default:
                                return false;
                            }
                        } else {
                            return false;
                        }
                        break;

                      case "encoding":
                        if (value.storageEncoding !== match[2]) {
                            return false;
                        }
                        break;

                      case "linebreak":
                        if (value.lineBreakType !== match[2]) {
                            return false;
                        }
                        break;

                      default:
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    },
    allowedCharacters: function(a, i, m) {
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
});