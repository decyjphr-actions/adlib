import * as core from '@actions/core'
import * as github from '@actions/github'
// eslint-disable-next-line import/no-unresolved
import {IssuesEvent} from '@octokit/webhooks-definitions/schema'

import {AdoInputs, InputVariables, RewireInputs} from './types'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): RewireInputs | undefined {
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

  //const pat_token: string = core.getInput(InputVariables.Token, {
  //  required: true
  //})
  core.debug(`xxx ${JSON.stringify(process.env.GITHUB_EVENT_PATH)}`)
  core.debug(`context is ${JSON.stringify(github.context)}`)

  if (github.context.eventName === 'issue') {
    const issuePayload = github.context.payload as IssuesEvent
    core.info(`The Issue Payload is: ${issuePayload}`)
    const rewireInputs: RewireInputs = new RewireInputs(issuePayload, adoInputs)
    return rewireInputs
  }

  return undefined
}
