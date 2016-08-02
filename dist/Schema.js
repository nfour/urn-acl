'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Acl = exports.UriValidator = exports.Validator = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _Validator = require('./Validator');

var _Validator2 = _interopRequireDefault(_Validator);

var _UriValidator = require('./UriValidator');

var _UriValidator2 = _interopRequireDefault(_UriValidator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.Validator = _Validator2.default;
exports.UriValidator = _UriValidator2.default;

var UrnSchema = function () {
    function UrnSchema(keyInput) {
        var mapping = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var config = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, UrnSchema);

        this.config = {
            open: "${",
            close: "}"
        };

        this.config = _extends({}, this.config, config);

        this.keys = keyInput.split(':');
        this.validators = this.keys.map(function (key) {
            return mapping[key] || _Validator2.default;
        });

        this.open = (0, _utils.escapeRegex)(this.config.open);
        this.close = (0, _utils.escapeRegex)(this.config.close);

        this.regex = {
            // "${some.variable}" to "some.variable"
            variable: new RegExp('^' + this.open + '([^' + this.close + ']+)' + this.close + '$')
        };
    }

    /**
     *  Compiles an URN
     *
     *  @return {Object}
     */


    _createClass(UrnSchema, [{
        key: 'compile',
        value: function compile(urnStr) {
            var _urnStr$split = urnStr.split(':');

            var _urnStr$split2 = _toArray(_urnStr$split);

            var ident = _urnStr$split2[0];

            var parts = _urnStr$split2.slice(1);

            if (ident !== "urn") throw new Error('Invalid urn at 0, ' + urnStr);

            var compiled = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = parts.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2);

                    var index = _step$value[0];
                    var value = _step$value[1];

                    var key = this.keys[index];
                    var Fn = this.validators[index];

                    if (!key) break;

                    var validator = new Fn(this, { key: key, value: value });
                    validator.compile();

                    compiled.push(validator);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return compiled;
        }
    }, {
        key: 'createAcl',
        value: function createAcl(roles) {
            return new Acl(this, roles);
        }
    }, {
        key: 'getVariableKey',
        value: function getVariableKey() {
            var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            var match = value.match(this.regex.variable) || [];
            var varKey = match[1] || null;

            return varKey;
        }
    }]);

    return UrnSchema;
}();

exports.default = UrnSchema;

var Acl = exports.Acl = function () {
    function Acl(schema, groups) {
        _classCallCheck(this, Acl);

        this.schema = schema;
        this.inputGroups = groups;

        this.groups = this.compile(groups);
    }

    _createClass(Acl, [{
        key: 'compile',
        value: function compile(urnGroups) {
            var _this = this;

            var validatorGroups = {};

            for (var key in urnGroups) {
                validatorGroups[key] = urnGroups[key].map(function (urn) {
                    return _this.schema.compile(urn);
                });
            }

            return validatorGroups;
        }
    }, {
        key: 'validate',
        value: function validate(groupKey, request, data) {
            var group = this.groups[groupKey];

            if (!group) return { valid: false, error: 'Invalid group \'' + groupKey + '\'' };

            var result = { valid: true, group: groupKey };

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = group[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var validators = _step2.value;

                    var urnInvalidated = false;

                    var last = validators.length - 1;

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = validators.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var _step3$value = _slicedToArray(_step3.value, 2);

                            var index = _step3$value[0];
                            var validator = _step3$value[1];

                            var value = request[validator.key];

                            var wildcarded = validator.value === '*' || validator.value === '' && index !== last;
                            var valid = wildcarded || validator.validate(value, data);

                            if (!valid) {
                                urnInvalidated = true;
                                result = _extends({}, result, { value: value, index: index, wildcarded: wildcarded, key: validator.key });
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }

                    if (urnInvalidated) {
                        result = _extends({}, result, { valid: false });
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return result;
        }
    }]);

    return Acl;
}();