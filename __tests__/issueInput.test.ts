import * as core from '@actions/core'
import nock from 'nock'
import * as inputHelper from '../src/inputHelper'
import {RewireInputs} from '../src/types'

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  process.env['INPUT_ADO_PAT'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"repo":"repo1", "action":"transfer", "targetOrg":"targetOrg", "issue_name":"repoinputs"}'
  process.env['GITHUB_REPOSITORY'] = 'decyjphr-org/admin'
  process.env['GITHUB_ACTOR'] = 'decyjphr'
  process.env['INPUT_ISSUE_NAME'] = 'repoinputs'
})

beforeEach(() => {
  nock.disableNetConnect()
})

test('Input Helper test', () => {
  const inputs: RewireInputs | undefined = inputHelper.getInputs()

  core.debug(`Inputs ${JSON.stringify(inputs)}`)
  core.debug(`Inputs is Rewire Inputs ${inputs instanceof RewireInputs}`)
  if (inputs instanceof RewireInputs) {
    const rewireInputs: RewireInputs = inputs
    /*
    expect(rewireInputs.action).toContain('transfer')
    expect(rewireInputs.targetOrg).toContain('targetOrg')
    expect(rewireInputs.repo).toContain('repo1')
    expect(rewireInputs.requestor).toBe('decyjphr')
    expect(rewireInputs.pat_token).toBeDefined()
    */
  }
})
