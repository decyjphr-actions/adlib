/* eslint-disable no-shadow */
// eslint-disable-next-line import/no-unresolved
import {IssuesEvent} from '@octokit/webhooks-definitions/schema'

export enum InputVariables {
  IssueBody = 'issue_body_json',
  GitHubToken = 'github_token',
  AdoToken = 'ado_pat',
  Requestor = 'Requestor',
  IssueName = 'issue_name'
}

type IssueBody = {
  Destination_Project: string
  adoBuild_DefinitionBuildId: string
}

//type InputVariablesStrings = keyof typeof InputVariables

export type AdoInputs = IssueBody & {
  adoToken: string
}

export class RewireInputs {
  payload: IssuesEvent
  adoInputs: AdoInputs

  constructor(_issue: IssuesEvent, _adoInputs: AdoInputs) {
    this.payload = _issue
    this.adoInputs = _adoInputs
  }
}

export interface IIssue {
  id: number
  title: string
  body: string
  author: string

  removeLabels(labels: string[]): void
  addLabels(labels: string[]): void
}
