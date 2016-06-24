/// <reference path = "typings/index.d.ts" />

const Credstash = require('credstash');
const credstash = new Credstash();

export function fetchCred(name: string): Promise<string> {
    return new Promise<string>(
        (resolve, reject) =>
            credstash.get(name, (err: any, secret: string) => {
                if (err) reject(err);
                else resolve(secret);
            })
    );
}
