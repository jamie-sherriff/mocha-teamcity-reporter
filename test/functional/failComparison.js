'use strict';
const {execFile} = require('child_process');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const { logMochaOutput, getMochaPath } = require('./helpers');
const internalMochaPath = getMochaPath();

describe('Check TeamCity Output is correct with outer suite', function () {
    let teamCityStdout, teamCityStderr, teamCityOutputArray;
    function verifyResults() {
        it('stdout output should exist', function () {
            assert.ok(teamCityStdout, 'has output');
            assert.ok(teamCityOutputArray, 'array of output is populated');
            assert.ok(teamCityOutputArray.length >= 10, 'at least 10 lines of output');
        });

        it('stderr output should not exist', function () {
            assert.ok(teamCityStderr.length === 0);
        });

        it('failComparison is present', function () {
            const rowToCheck = teamCityOutputArray[4];
            expect(rowToCheck).to.include('##teamcity[testFailed');
            expect(rowToCheck).to.include('name=\'Failing Test @fail');
            expect(rowToCheck).to.include('type=\'comparisonFailure\'');
            expect(rowToCheck).to.include('flowId=');
            expect(rowToCheck).to.not.include('duration=');
            expect(rowToCheck).to.include('details=\'2 == 1');
            expect(rowToCheck).to.include('captureStandardOutput=\'true\'');
            expect(rowToCheck).to.not.include('simple.js:11:11');
            expect(rowToCheck).to.include(']');
        });
    }

    describe('specified as an env var', function () {
        before(function (done) {
            const opts = {
                env: Object.assign({
                    MOCHA_TEAMCITY_FAIL_COMPARISON: 'true'
                }, process.env)
            };

            execFile(internalMochaPath, [
                'test/test_data',
                '--reporter',
                'lib/teamcity'
            ], opts, (err, stdout, stderr) => {
                teamCityStdout = stdout;
                teamCityStderr = stderr;
                teamCityOutputArray = stdout.split('\n');
                logMochaOutput(stdout, stderr);
                done();
            });
        });
        verifyResults();
    });

    describe('specified with --reporter-options', function () {
        before(function (done) {
            execFile(internalMochaPath, [
                'test/test_data',
                '--reporter',
                'lib/teamcity',
                '--reporter-options',
                'failComparison=true'
            ], (err, stdout, stderr) => {
                teamCityStdout = stdout;
                teamCityStderr = stderr;
                teamCityOutputArray = stdout.split('\n');
                logMochaOutput(stdout, stderr);
                done();
            });
        });
        verifyResults();
    });

});
