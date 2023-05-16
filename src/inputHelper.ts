import * as core from '@actions/core'
import * as github from '@actions/github'
// eslint-disable-next-line import/no-unresolved
import {IssuesEvent} from '@octokit/webhooks-definitions/schema'

import {AdoInputs, Commands, InputVariables} from './types'
import {IssueCommand} from './issueCommand'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): IssueCommand | undefined {
  const commandstr: string = core.getInput(InputVariables.Command, {
    required: true
  })
  const command: Commands = Commands[commandstr as keyof typeof Commands]

  const adoToken: string = core.getInput(InputVariables.AdoToken, {
    required: true
  })
  const issue_body: string = core.getInput(InputVariables.IssueBody, {
    required: true
  })
  core.debug(issue_body)
  const adoInputs: AdoInputs = Object.assign({}, JSON.parse(issue_body), {
    adoToken
  })

  const actor = process.env.GITHUB_ACTOR //core.getInput(Inputs.Requestor, {required: true})
  if (!actor) {
    throw new Error('actor is undefined')
  }

  const githubToken: string = core.getInput(InputVariables.GitHubToken, {
    required: true
  })

  const octokit = github.getOctokit(githubToken)

  //core.debug(`context is ${JSON.stringify(github.context)}`)

  if (github.context.eventName === 'issues') {
    const issuePayload = github.context.payload as IssuesEvent
    core.info(`The Issue Payload is: ${JSON.stringify(issuePayload)}`)
    const rewireInputs: IssueCommand = new IssueCommand(
      octokit,
      command,
      issuePayload,
      adoInputs
    )
    return rewireInputs
  }

  return undefined
}
