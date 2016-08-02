'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Validator2 = require('./Validator');

var _Validator3 = _interopRequireDefault(_Validator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UriValidator = function (_Validator) {
    _inherits(UriValidator, _Validator);

    function UriValidator() {
        _classCallCheck(this, UriValidator);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(UriValidator).apply(this, arguments));
    }

    _createClass(UriValidator, [{
        key: 'compile',
        value: function compile() {
            var _this2 = this;

            var _value$split = this.value.split('?');

            var _value$split2 = _slicedToArray(_value$split, 2);

            var _value$split2$ = _value$split2[0];
            var uri = _value$split2$ === undefined ? '' : _value$split2$;
            var _value$split2$2 = _value$split2[1];
            var query = _value$split2$2 === undefined ? '' : _value$split2$2;


            uri = this.splitUri(uri);
            query = query.split('&').filter(function (v) {
                return v;
            });

            this.query = null;
            console.log({ query: query });

            if (query.length) {
                this.query = {};
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = query[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;
                        this.query[item] = true;
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
            }

            this.validators = uri.map(function (part) {
                if (part === '' || part === '*') return function () {
                    return true;
                };

                var varKey = _this2.schema.getVariableKey(part);

                if (varKey) return function (value, data) {
                    return _this2.validateVariable(varKey, value, data);
                };else return function (value) {
                    return value === part;
                };
            });
        }
    }, {
        key: 'splitUri',
        value: function splitUri(uri) {
            return uri.replace(/^\/|\/$/g, '').split('/');
        }
    }, {
        key: 'validate',
        value: function validate(value, data) {
            var _value$split3 = value.split('?');

            var _value$split4 = _slicedToArray(_value$split3, 2);

            var uri = _value$split4[0];
            var query = _value$split4[1];

            var uriParts = this.splitUri(uri);

            // Checks /some/url/22/path
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = uriParts.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2);

                    var index = _step2$value[0];
                    var part = _step2$value[1];

                    var fn = this.validators[index];

                    if (!fn || !fn(part, data)) return false;
                }

                // Checks ?orderBy&direction
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

            if (this.query && query) {
                var queryKeys = query.split('&').filter(function (v) {
                    return v;
                });

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = queryKeys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var key = _step3.value;

                        if (!(key in this.query)) return false;
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
            }
            return true;
        }
    }]);

    return UriValidator;
}(_Validator3.default);

exports.default = UriValidator;
module.exports = exports['default'];