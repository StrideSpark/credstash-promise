import Credstash = require('nodecredstash');
import * as _ from 'lodash';

const credstash = Credstash({
    awsOpts: {
        region: 'us-west-2',
    },
});

/*
Fetch specific secrets
*/
export async function fetchCred(name: string): Promise<string | undefined> {
    try {
        const val = credstash.getSecret({ name });
        const result = await val;
        return result;
    } catch (err) {
        // if a different error, return it
        if (err.message.indexOf('could not be found') === -1) {
            throw err;
        }
    }
}

export async function fetchAppCred(env: string, appName: string, name: string): Promise<string> {
    const fullVal = await fetchCred(`${env}.${appName}.${name}`);
    if (fullVal != undefined) return fullVal;

    const envVal = await fetchCred(`${env}.${name}`);
    if (envVal != undefined) return envVal;

    const appVal = await fetchCred(`${appName}.${name}`);
    if (appVal != undefined) return appVal;

    const defaultVal = await fetchCred(name);
    if (defaultVal != undefined) return defaultVal;

    throw Error('no secrets match env=' + env + ', appName=' + appName + ', name=' + name);
}

export async function fetchCredHistory(name: string): Promise<{ version: string; secret: string }[]> {
    try {
        const vals = credstash.getAllVersions({ name });
        const results = await vals;
        return results;
    } catch (err) {
        // if a different error, return it
        if (err.message.indexOf('secret not found') === -1) {
            throw err;
        }
        return [];
    }
}

/*
List secrets
*/
export async function listAllSecretsAllVersions(contains?: string): Promise<{ name: string; version: string }[]> {
    const results: { name: string; version: string }[] = (await credstash.listSecrets()) as any;
    if (contains != undefined) {
        return results.filter(r => r.name.toLowerCase().indexOf(contains.toLowerCase()) !== -1);
    }
    return results;
}

export async function listSecrets(contains?: string): Promise<string[]> {
    const results = await listAllSecretsAllVersions(contains);
    return _.uniq(results.map(r => r.name));
}

/*
Modify secrets
*/

export async function putSecret(name: string, secret: string): Promise<{ name: string; version: string }> {
    try {
        await credstash.putSecret({ name, secret, context: {} });
        return { name, version: '0000000000000000001' };
    } catch (err) {
        if (err.message.indexOf('is already in the credential store') !== -1) {
            const newVersion = await credstash.incrementVersion({ name });
            await credstash.putSecret({ name, secret, context: {}, version: +newVersion });
            return { name, version: newVersion };
        }
        throw err;
    }
}

export async function deleteSecret(name: string, version?: string) {
    if (version != undefined) {
        if (isNaN(Number(version))) {
            throw Error('version must be a number, not ' + version);
        }
        await credstash.deleteSecret({ name, version: Number(version) });
    } else {
        await credstash.deleteSecrets({ name });
    }
}
