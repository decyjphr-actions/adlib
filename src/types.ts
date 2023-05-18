/* eslint-disable no-shadow */

export enum InputVariables {
  IssueBody = 'issue_body_json',
  GitHubToken = 'github_token',
  AdoToken = 'ado_pat',
  Requestor = 'Requestor',
  IssueName = 'issue_name',
  Command = 'command',
  AdoOrg = 'ado_org',
  AdoSharedProject = 'ado_shared_project',
  AdoSharedServiceConnection = 'ado_shared_service_connection'
}

export enum Commands {
  ack = 'ack',
  secure = 'secure',
  rewire = 'rewire',
  comment = 'comment',
  validate = 'validate'
}

type IssueBody = {
  Destination_Project: string
  adoBuild_DefinitionBuildId: string
  comment?: string
}

//type InputVariablesStrings = keyof typeof InputVariables

export type AdoInputs = IssueBody & {
  adoToken: string
  adoOrg: string
  adoSharedProject: string
  adoSharedServiceConnection: string
}

export interface IIssue {
  removeLabels(labels: string[]): void
  addLabels(labels: string[]): void
  ack(): void
  rewire(): void
  execute(): void
  share(): void
}
