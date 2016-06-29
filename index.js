/// <reference path = "index.d.ts" />
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
exports.fetchCred = fetchCred;
//# sourceMappingURL=index.js.map