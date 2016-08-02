'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.escapeRegex = escapeRegex;
function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}