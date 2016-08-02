'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _transposer = require('transposer');

var _transposer2 = _interopRequireDefault(_transposer);

var _lutils = require('lutils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Validator = function () {
    function Validator(schema, _ref) {
        var key = _ref.key;
        var value = _ref.value;

        _classCallCheck(this, Validator);

        this.schema = schema;
        this.key = key;
        this.value = value;
    }

    _createClass(Validator, [{
        key: 'compile',
        value: function compile() {
            var _this = this;

            var varKey = this.schema.getVariableKey(this.value);

            if (varKey) this.validate = function (value, data) {
                return _this.validateVariable(varKey, value, data);
            };
        }
    }, {
        key: 'validateVariable',
        value: function validateVariable(varKey, value, data) {
            var resolvedValue = new _transposer2.default(data).get(varKey);

            var compare = function compare(input) {
                return String(input) === value;
            };

            if (_lutils.typeOf.Array(resolvedValue)) return resolvedValue.some(compare);

            return compare(resolvedValue);
        }
    }, {
        key: 'validate',
        value: function validate(value) {
            return value === this.value;
        }
    }]);

    return Validator;
}();

exports.default = Validator;
module.exports = exports['default'];