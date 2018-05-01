import { fetchAppCred, fetchCredHistory, fetchCred, listSecrets, listAllSecretsAllVersions, putSecret, deleteSecret } from '../src/index';
import { assert } from 'chai';

describe('credstash-promise', function() {
    describe('fetch app cred', function() {
        it('fetches full-level creds', async function() {
            const result = await fetchAppCred('test', 'credstash-promise', 'testval.foo');
            assert.equal(result, 'applevel');
        });

        it('fetches env-level creds when app has nothing', async function() {
            const result = await fetchAppCred('test', 'bad-app', 'testval.foo');
            assert.equal(result, 'envlevel');
        });

        it('fetches app-level creds when env has nothing', async function() {
            const result = await fetchAppCred('bad-env', 'credstash-promise', 'testval.foo');
            assert.equal(result, 'app-name-only');
        });

        it('fetches default creds when env and app has nothing', async function() {
            const result = await fetchAppCred('bad-env', 'bad-app', 'testval.foo');
            assert.equal(result, 'default4');
        });

        it('throws when no matching values', async function() {
            try {
                await fetchAppCred('not', 'in', 'existence');
            } catch (err) {
                assert.match(err, /no secrets match/);
                return;
            }
            assert.fail();
        });
    });

    describe('fetchCred', function() {
        it('does not throw when missing values', async function() {
            const result = await fetchCred('not a thing');
            assert.isUndefined(result);
        });

        it('does throw for other reasons', async function() {
            try {
                await fetchCred(undefined as any);
            } catch (err) {
                assert.match(err, /name is a required parameter/);
                return;
            }
            assert.fail();
        });
    });

    describe('fetch cred history', function() {
        it('as expected', async function() {
            const results = await fetchCredHistory('testval.foo');
            assert.deepEqual(results, [
                { version: '0000000000000000004', secret: 'default4' },
                { version: '0000000000000000003', secret: 'default3' },
                { version: '0000000000000000002', secret: 'default2' },
                { version: '0000000000000000001', secret: 'default' },
            ]);
        });

        it('no val', async function() {
            const results = await fetchCredHistory('not a val');
            assert.lengthOf(results, 0);
        });

        it('throws if no name', async function() {
            try {
                await fetchCredHistory(undefined as any);
            } catch (err) {
                assert.match(err, /name is a required parameter/);
                return;
            }
            assert.fail();
        });
    });

    describe('list secrets', function() {
        it('list all secrets - no filter', async function() {
            const results = await listAllSecretsAllVersions();
            assert.isAtLeast(results.length, 100);
            assert.includeDeepMembers(results, [
                { name: 'testval.foo', version: '0000000000000000004' },
                { name: 'testval.foo', version: '0000000000000000003' },
                { name: 'testval.foo', version: '0000000000000000002' },
                { name: 'testval.foo', version: '0000000000000000001' },
            ]);
        });

        it('list all secrets - filter', async function() {
            const results = await listAllSecretsAllVersions('foo');
            assert.isAtLeast(results.length, 4);
            assert.includeDeepMembers(results, [
                { name: 'testval.foo', version: '0000000000000000004' },
                { name: 'testval.foo', version: '0000000000000000003' },
                { name: 'testval.foo', version: '0000000000000000002' },
                { name: 'testval.foo', version: '0000000000000000001' },
            ]);
        });

        it('list secrets - no filter', async function() {
            const results = await listSecrets();
            assert.isAtLeast(results.length, 10);
            assert.includeMembers(results, ['testval.foo']);
        });
        it('list secrets - filter', async function() {
            const results = await listSecrets('testval.');
            assert.isAtLeast(results.length, 1);
            assert.includeMembers(results, ['testval.foo']);
        });
    });

    describe('modify secrets', function() {
        it('as expected', async function() {
            //start by deleting all versions of 'hi'
            await deleteSecret('hi');

            //put two values in for 'hi':
            let result = await putSecret('hi', 'there');
            assert.deepEqual(result, { name: 'hi', version: '0000000000000000001' });
            assert.equal(await fetchCred('hi'), 'there');
            result = await putSecret('hi', 'there2');
            assert.deepEqual(result, { name: 'hi', version: '0000000000000000002' });
            assert.equal(await fetchCred('hi'), 'there2');

            //delete the most recent version and make sure the previous version is still there:
            await deleteSecret('hi', '2');
            assert.equal(await fetchCred('hi'), 'there');

            //delete all versions and make sure nothing is there:
            await deleteSecret('hi');
            assert.isUndefined(await fetchCred('hi'));
        });
    });
});
