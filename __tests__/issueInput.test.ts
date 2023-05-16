import nock from 'nock'
import * as inputHelper from '../src/inputHelper'
import {IssueCommand} from '../src/issueCommand'
import * as path from 'path'
import {IIssue} from '../src/types'
//import { initializeNock, repository, cleanAll, teardownNock } from './common'

let githubScope: nock.Scope

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  process.env['INPUT_ADO_PAT'] = 'abc'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"Destination_Project":"test","Build_Definition":"7"}'
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
  //nock.disableNetConnect()
})
/*
test('Input Helper test', () => {
  const inputs: IssueCommand | undefined = inputHelper.getInputs()

  //expect(inputs).toBeDefined()
  //expect(inputs).toBeInstanceOf(RewireInputs)
  if (inputs instanceof IssueCommand) {
    const rewireInputs: IssueCommand = inputs
  }
})
*/
test('Input Helper Ack test', () => {
  process.env['INPUT_COMMAND'] = 'ack'
  const inputs: IIssue | undefined = inputHelper.getInputs()

  expect(inputs).toBeDefined()
  expect(inputs).toBeInstanceOf(IssueCommand)
  if (inputs instanceof IssueCommand) {
    const rewireInputs: IssueCommand = inputs
    rewireInputs.execute()
  }
})

test('Input Helper Validate test', () => {
  process.env['INPUT_COMMAND'] = 'validate'
  const inputs: IIssue | undefined = inputHelper.getInputs()

  expect(inputs).toBeDefined()
  expect(inputs).toBeInstanceOf(IssueCommand)
  if (inputs instanceof IssueCommand) {
    const rewireInputs: IssueCommand = inputs
    rewireInputs.execute()
  }
})

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
