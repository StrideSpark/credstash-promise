
const Credstash = require('@stridespark/credstash');
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

export async function fetchAppCred(env: string, appName: string, name: string, defaultValue: string): Promise<string> {
    try {
        const appVal = fetchCred(`${env}.${appName}.${name}`)
        const result = await appVal;
        return result;
    } catch (err) {
        // if a different error, return it
        if (err.message.indexOf('secret not found') === -1) {
            throw err;
        }
    }
    try {
        const envVal = fetchCred(`${env}.${name}`);
        return await envVal;
    } catch (err) {
        // if a different error, return it
        if (err.message.indexOf('secret not found') === -1) {
            throw err;
        }
    }
    return defaultValue;
}
