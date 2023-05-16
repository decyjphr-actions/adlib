import nock from 'nock'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {run} from '../src/main'
import * as core from '@actions/core'

let githubScope: nock.Scope

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  process.env['INPUT_ADO_PAT'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"Destination_Project":"test","Build_Definition":"7"}'
  process.env['INPUT_COMMAND'] = 'validate'
  process.env['GITHUB_REPOSITORY'] = 'decyjphr-org/admin'
  process.env['GITHUB_ACTOR'] = 'decyjphr'
  process.env['INPUT_ISSUE_NAME'] = 'repoinputs'
  process.env['GITHUB_EVENT_PATH'] = path.join(
    __dirname,
    'fixtures',
    'issue.json'
  )
  process.env['GITHUB_EVENT_NAME'] = 'issues'
  process.env['GITHUB_SHA'] = 'SHA'
  process.env['GITHUB_REF'] = 'main'
  process.env['GITHUB_WORKFLOW'] = 'test'
  process.env['GITHUB_ACTION'] = 'labeled'
})

beforeEach(() => {
  githubScope = initializeNock()
  githubScope
    .post('/repos/decyjphr-org/actions-issue-forms/issues/44/reactions')
    .reply(200, '')
    .post('/repos/decyjphr-org/actions-issue-forms/issues/44/comments')
    .reply(200, '')
})

test('main test', () => {
  run()
})
/*
// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', async () => {
  process.env['INPUT_COMMAND'] = 'ack'
  //process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())

  
})
*/
function initializeNock(): nock.Scope {
  nock.disableNetConnect()
  return nock('https://api.github.com')
}

function teardownNock(githubScope: nock.Scope): void {
  expect(githubScope.isDone()).toBe(true)

  nock.cleanAll()
}

function cleanAll(): void {
  nock.cleanAll()
}
