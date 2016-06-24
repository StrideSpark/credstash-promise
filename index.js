/// <reference path = "typings/index.d.ts" />
"use strict";
var Credstash = require('credstash');
var credstash = new Credstash();
function fetchCred(name) {
    return new Promise(function (resolve, reject) {
        return credstash.get(name, function (err, secret) {
            if (err)
                reject(err);
            else
                resolve(secret);
        });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fetchCred;
//# sourceMappingURL=index.js.map