import { fetchAppCred } from "../src/index";
import { assert } from 'chai';
import * as AWS from 'aws-sdk';
AWS.config.region = 'us-west-2';

describe('credstash-promise', function () {
    it('fetches app-level creds', async function () {
        const result = await fetchAppCred('test', 'credstash-promise', 'testval.foo', 'default');
        assert.equal(result, 'applevel');
    })

    it('fetches env-level creds when app has nothing', async function () {
        const result = await fetchAppCred('test', 'bad-app', 'testval.foo', 'default');
        assert.equal(result, 'envlevel');
    })


    it('fetches default creds when env and app has nothing', async function () {
        const result = await fetchAppCred('bad-env', 'bad-app', 'testval.foo', 'default');
        assert.equal(result, 'default');
    })


    it('throws on errors besides missing secrets', async function () {
        AWS.config.region = undefined;
        let hasErrored = false;
        try {
            await fetchAppCred('bad-env', 'bad-app', 'testval.foo', 'default');
        } catch (err) {
            assert.equal(err.message, 'Missing region in config')
            hasErrored = true;
        }
        assert.isTrue(hasErrored)
    })

})