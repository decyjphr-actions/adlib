// eslint-disable-next-line import/no-unresolved
import {IssuesEvent} from '@octokit/webhooks-definitions/schema'
import {IIssue, AdoInputs, Commands} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'

const acknowledgement = `Hello @{{author}}, I'm a bot that helps you rewire your GitHub issues to Azure DevOps. I've received your request to rewire this issue to Azure DevOps. I'll let you know when I'm done.`

export class IssueCommand implements IIssue {
  payload: IssuesEvent
  adoInputs: AdoInputs
  command: Commands
  octokitClient: InstanceType<typeof GitHub>
  actor: string

  constructor(
    _octokit: InstanceType<typeof GitHub>,
    _actor: string,
    _command: Commands,
    _issue: IssuesEvent,
    _adoInputs: AdoInputs
  ) {
    this.payload = _issue
    this.adoInputs = _adoInputs
    this.command = _command
    this.octokitClient = _octokit
    this.actor = _actor
  }
  execute(): void {
    const _commandName = this.command as keyof typeof this
    if (typeof this[_commandName] === 'function') {
      const command = this[_commandName] as Function
      command.call(this)
    }
  }

  removeLabels(labels: string[]): void {
    throw new Error(`Method removeLabels(${labels}) not implemented.`)
  }
  addLabels(labels: string[]): void {
    throw new Error(`Method addLabels(${labels}) not implemented.`)
  }
  async ack(): Promise<void> {
    core.debug(`ack called for ${JSON.stringify(this.payload)}`)
    const params = {
      owner: this.payload.repository.owner.login,
      repo: this.payload.repository.name,
      issue_number: this.payload.issue.number,
      content: 'eyes' as
        | 'eyes'
        | '+1'
        | '-1'
        | 'laugh'
        | 'confused'
        | 'heart'
        | 'hooray'
        | 'rocket'
    }

    try {
      await this.octokitClient.rest.reactions.createForIssue(params)
      await this.octokitClient.rest.issues.createComment({
        ...params,
        body: acknowledgement.replace('{{author}}', this.actor)
      })
    } catch (error) {
      const e = error as Error & {status: number}
      if (e.status === 404) {
        const message404 = `No Issue found for ${JSON.stringify(params)}`
        core.debug(message404)
        throw new Error(message404)
      }
      const message = `${e} setting Ack for issue with ${JSON.stringify(
        params
      )}`
      core.debug(message)
      throw new Error(message)
    }
  }
}
