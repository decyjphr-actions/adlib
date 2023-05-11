import * as core from '@actions/core'
import nock from 'nock'
import * as inputHelper from '../src/inputHelper'
import {RewireInputs} from '../src/types'
import * as path from 'path'

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  process.env['INPUT_ADO_PAT'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"repo":"repo1", "action":"transfer", "targetOrg":"targetOrg", "issue_name":"repoinputs"}'
  process.env['GITHUB_REPOSITORY'] = 'decyjphr-org/admin'
  process.env['GITHUB_ACTOR'] = 'decyjphr'
  process.env['INPUT_ISSUE_NAME'] = 'repoinputs'
  process.env['GITHUB_EVENT_PATH'] = path.join(
    __dirname,
    'fixtures',
    'issue.json'
  )
  process.env['GITHUB_EVENT_NAME'] = 'issue'
  process.env['GITHUB_SHA'] = 'SHA'
  process.env['GITHUB_REF'] = 'main'
  process.env['GITHUB_WORKFLOW'] = 'test'
  process.env['GITHUB_ACTION'] = 'labeled'
})

beforeEach(() => {
  nock.disableNetConnect()
})

test('Input Helper test', () => {
  const inputs: RewireInputs | undefined = inputHelper.getInputs()

  core.debug(`Inputs ${JSON.stringify(inputs)}`)
  core.debug(`Inputs is Rewire Inputs ${inputs instanceof RewireInputs}`)
  //expect(inputs).toBeDefined()
  //expect(inputs).toBeInstanceOf(RewireInputs)
  if (inputs instanceof RewireInputs) {
    const rewireInputs: RewireInputs = inputs
  }
})
