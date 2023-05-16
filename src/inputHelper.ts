/* eslint-disable import/no-unresolved */
import * as core from '@actions/core'
import * as github from '@actions/github'

import {
  IssuesEvent,
  IssueCommentEvent
} from '@octokit/webhooks-definitions/schema'

import {AdoInputs, Commands, InputVariables} from './types'
import {IssueCommand} from './issueCommand'
import {IssueCommentCommand} from './issueCommentCommand'

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): IssueCommand | undefined {
  const commandstr: string = core.getInput(InputVariables.Command, {
    required: true
  })

  const command: Commands = Commands[commandstr as keyof typeof Commands]
  core.debug(`Command is = ${command}`)

  const adoToken: string = core.getInput(InputVariables.AdoToken, {
    required: true
  })
  core.debug(`adoToken is = ${adoToken}`)

  const issue_body: string = core.getInput(InputVariables.IssueBody, {
    required: true
  })
  core.debug(`Issue Body is = ${issue_body}`)

  const adoInputs: AdoInputs = Object.assign({}, JSON.parse(issue_body), {
    adoToken
  })
  core.debug(`adoInputs is = ${JSON.stringify(adoInputs)}`)

  const actor = process.env.GITHUB_ACTOR //core.getInput(Inputs.Requestor, {required: true})
  if (!actor) {
    throw new Error('actor is undefined')
  }

  const githubToken: string = core.getInput(InputVariables.GitHubToken, {
    required: true
  })
  core.debug(`githubToken is = ${githubToken}`)

  const octokit = github.getOctokit(githubToken)

  core.debug(`context.eventName is ${JSON.stringify(github.context.eventName)}`)

  core.debug(
    `context.payload.action is ${JSON.stringify(github.context.payload.action)}`
  )

  if (github.context.eventName === 'issues') {
    const issuePayload = github.context.payload as IssuesEvent
    //core.info(`The Issue Payload is: ${JSON.stringify(issuePayload)}`)
    const rewireInputs: IssueCommand = new IssueCommand(
      octokit,
      actor,
      command,
      issuePayload.issue,
      issuePayload.repository,
      adoInputs
    )
    return rewireInputs
  } else if (github.context.eventName === 'issue_comment') {
    const issueCommentPayload = github.context.payload as IssueCommentEvent
    //core.info(
    //  `The Issue Comment Payload is: ${JSON.stringify(issueCommentPayload)}`
    // )
    const rewireInputs: IssueCommentCommand = new IssueCommentCommand(
      octokit,
      actor,
      command,
      adoInputs,
      issueCommentPayload
    )
    return rewireInputs
  }

  return undefined
}
