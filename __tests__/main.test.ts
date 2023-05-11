import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  process.env['INPUT_ADO_PAT'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"repo":"repo1", "action":"transfer", "targetOrg":"targetOrg", "issue_name":"repoinputs"}'
  process.env['GITHUB_REPOSITORY'] = 'decyjphr-org/admin'
  process.env['GITHUB_ACTOR'] = 'decyjphr'
  process.env['INPUT_ISSUE_NAME'] = 'repoinputs'
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
