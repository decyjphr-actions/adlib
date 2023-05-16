import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  process.env['INPUT_ADO_PAT'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"Destination_Project":"test","Build_Definition":"7"}'
  process.env['INPUT_COMMAND'] = 'ack'
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

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
