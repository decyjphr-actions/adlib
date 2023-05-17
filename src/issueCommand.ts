// eslint-disable-next-line import/no-unresolved
import {Issue, Repository} from '@octokit/webhooks-definitions/schema'
import {IIssue, AdoInputs, Commands} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'
import nodeFetch, {Response} from 'node-fetch'

const acknowledgement = `Hello @{{author}}, I'm a bot that helps you rewire your ADO pipelines to GitHub link to use a shared GitHub App based service connection. I've received your request to rewire your project {{ado_project}}. I'll let you know when I'm done.`
const goodValidation = `Hello @{{author}}, I will be using the following Service Connection to rewire your ADO pipelines:\n`
const badValidation = `Hello @{{author}}, I am having trouble with your request. Please see the error below:\n`
const goodPipelinesList = `Hello @{{author}}, I found the following pipelines in your project that will be rewired:\n`
const badPipelinesList = `Hello @{{author}}, I am having trouble retrieving pipelines from your project {{ado_project}}. Please refer to the error below:\n`

export class IssueCommand implements IIssue {
  repository: Repository
  issue: Issue
  adoInputs: AdoInputs
  command: Commands
  octokitClient: InstanceType<typeof GitHub>
  actor: string

  constructor(
    _octokit: InstanceType<typeof GitHub>,
    _actor: string,
    _command: Commands,
    _issue: Issue,
    _repository: Repository,
    _adoInputs: AdoInputs
  ) {
    this.issue = _issue
    this.repository = _repository
    this.adoInputs = _adoInputs
    this.command = _command
    this.octokitClient = _octokit
    this.actor = _actor
  }

  async execute(): Promise<void> {
    const _commandName = this.command as keyof typeof this
    if (typeof this[_commandName] === 'function') {
      const command = this[_commandName] as Function
      await command.call(this)
    }
  }

  removeLabels(labels: string[]): void {
    throw new Error(`Method removeLabels(${labels}) not implemented.`)
  }

  addLabels(labels: string[]): void {
    throw new Error(`Method addLabels(${labels}) not implemented.`)
  }

  async validate(): Promise<void> {
    const creds = Buffer.from(`:${this.adoInputs.adoToken}`).toString('base64')
    core.debug(`creds: ${creds}`)
    const serviceConnectionByNameUrl = `https://dev.azure.com/${this.adoInputs.adoOrg}/${this.adoInputs.adoSharedProject}/_apis/serviceendpoint/endpoints?endpointNames=${this.adoInputs.adoSharedServiceConnection}&api-version=7.0`

    const listPipelinesUrl = `https://dev.azure.com/${this.adoInputs.adoOrg}/${this.adoInputs.Destination_Project}/_apis/build/definitions?api-version=7.0`

    const headers = [
      ['Authorization', `Basic ${creds}`],
      ['Accept', 'application/json;api-version=7.1-preview.4'],
      ['Content-Type', 'application/json; charset=utf-8']
    ]
    try {
      const params = {
        owner: this.repository.owner.login,
        repo: this.repository.name,
        issue_number: this.issue.number
      }
      const serviceConnectionByNameResponse: Response = await nodeFetch(
        serviceConnectionByNameUrl,
        {
          method: 'GET',
          headers
        }
      )
      core.debug(`response: ${JSON.stringify(serviceConnectionByNameResponse)}`)
      const responseObject = await serviceConnectionByNameResponse.json()
      core.debug(`response: ${JSON.stringify(responseObject)}`)
      if (serviceConnectionByNameResponse.ok && responseObject.count === 1) {
        core.debug(`Creating issue comment with goodValidation message`)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: goodValidation
            .replace('{{author}}', this.actor)
            .concat(`\n${JSON.stringify(responseObject.value[0], null, 2)}`)
        })
      } else {
        core.debug(`Creating issue comment with badValidation message`)
        const error = `Service Connection ${this.adoInputs.adoSharedServiceConnection} not found in project ${this.adoInputs.adoSharedProject}. Error: ${serviceConnectionByNameResponse.statusText}`
        core.error(error)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: badValidation
            .replace('{{author}}', this.actor)
            .concat(`\n${error}`)
        })
      }
    } catch (error) {
      const e = error as Error & {status: number}
      const message = `${e} performing validate command`
      core.error(message)
      throw new Error(message)
    }

    try {
      const params = {
        owner: this.repository.owner.login,
        repo: this.repository.name,
        issue_number: this.issue.number
      }
      const listPipelinesResponse: Response = await nodeFetch(
        listPipelinesUrl,
        {
          method: 'GET',
          headers
        }
      )
      core.debug(`response: ${JSON.stringify(listPipelinesResponse)}`)
      core.debug(`listPipelinesResponse.ok = ${listPipelinesResponse.ok}`)
      core.debug(
        `listPipelinesResponse.status = ${listPipelinesResponse.status}`
      )
      core.debug(
        `listPipelinesResponse.statusText = ${listPipelinesResponse.statusText}`
      )
      const responseObject = await listPipelinesResponse.json()
      core.debug(`response: ${JSON.stringify(responseObject)}`)

      if (listPipelinesResponse.ok) {
        core.debug(`Creating issue comment with goodPipelinesList message`)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: goodPipelinesList
            .replace('{{author}}', this.actor)
            .concat(`\n${JSON.stringify(responseObject.value[0], null, 2)}`)
        })
      } else {
        core.debug(`Creating issue comment with badPipelinesList message`)
        const error = `No pipelines found in project ${this.adoInputs.Destination_Project}. Please check the name of the project and resubmit the issue`
        core.error(error)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: badPipelinesList
            .replace('{{author}}', this.actor)
            .replace('{{ado_project}}', this.adoInputs.Destination_Project)
            .concat(`\n${error}`)
        })
      }
    } catch (error) {
      const e = error as Error & {status: number}
      const message = `${e} performing validate command`
      core.error(message)
      throw new Error(message)
    }
  }

  async ack(): Promise<void> {
    core.debug(`ack called for ${JSON.stringify(this.issue)}`)
    const params = {
      owner: this.repository.owner.login,
      repo: this.repository.name,
      issue_number: this.issue.number
    }

    try {
      await this.octokitClient.rest.reactions.createForIssue({
        ...params,
        content: 'eyes'
      })
      await this.octokitClient.rest.issues.createComment({
        ...params,
        body: acknowledgement
          .replace('{{author}}', this.actor)
          .replace('{{ado_project}}', this.adoInputs.Destination_Project)
      })
    } catch (error) {
      const e = error as Error & {status: number}
      if (e.status === 404) {
        const message404 = `No Issue found for ${JSON.stringify(params)}`
        core.error(message404)
        throw new Error(message404)
      }
      const message = `${e} setting Ack for issue with ${JSON.stringify(
        params
      )}`
      core.error(message)
      throw new Error(message)
    }
  }
}
