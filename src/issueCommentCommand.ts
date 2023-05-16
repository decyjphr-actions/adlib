// eslint-disable-next-line filenames/match-regex
import {IssueCommand} from './issueCommand'
// eslint-disable-next-line import/no-unresolved
import {IssueCommentEvent} from '@octokit/webhooks-definitions/schema'
import {IIssue, AdoInputs, Commands} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'

const acknowledgement = `Hello @{{author}}, I see you've commented on this issue. I'll let you know if everything is good to proceed.`
export class IssueCommentCommand extends IssueCommand implements IIssue {
  issueComment: IssueCommentEvent

  constructor(
    _octokit: InstanceType<typeof GitHub>,
    _actor: string,
    _command: Commands,
    _adoInputs: AdoInputs,
    _issueComment: IssueCommentEvent
  ) {
    super(
      _octokit,
      _actor,
      _command,
      _issueComment.issue,
      _issueComment.repository,
      _adoInputs
    )
    this.issueComment = _issueComment
  }
  async ack(): Promise<void> {
    core.debug(`ack called for ${JSON.stringify(this.issue)}`)
    const params = {
      owner: this.repository.owner.login,
      repo: this.repository.name,
      issue_number: this.issue.number
    }
    const commentParams = {
      owner: this.repository.owner.login,
      repo: this.repository.name,
      comment_id: this.issueComment.comment.id
    }

    try {
      await this.octokitClient.rest.reactions.createForIssueComment({
        ...commentParams,
        content: 'eyes'
      })
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
