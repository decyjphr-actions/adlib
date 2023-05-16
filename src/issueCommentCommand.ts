// eslint-disable-next-line filenames/match-regex
import {IssueCommand} from './issueCommand'
// eslint-disable-next-line import/no-unresolved
import {IssueCommentEvent} from '@octokit/webhooks-definitions/schema'
import {IIssue, AdoInputs, Commands} from './types'
import {GitHub} from '@actions/github/lib/utils'

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
}
