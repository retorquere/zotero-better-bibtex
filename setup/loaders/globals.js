export let process = require('process/browser.js');
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
export var global = Function('return this')();
export var globalThis = global;
export var Buffer = require('buffer').Buffer;
