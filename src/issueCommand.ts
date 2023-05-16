// eslint-disable-next-line import/no-unresolved
import {Issue, Repository} from '@octokit/webhooks-definitions/schema'
import {IIssue, AdoInputs, Commands} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'
import {RequestOptions, request} from 'https'

const acknowledgement = `Hello @{{author}}, I'm a bot that helps you rewire your GitHub issues to Azure DevOps. I've received your request to rewire this issue to Azure DevOps. I'll let you know when I'm done.`

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

  async validate(): Promise<void> {
    const creds = Buffer.from(`:${this.adoInputs.adoToken}`).toString('base64')
    core.debug(`creds: ${creds}`)
    const url =
      'https://dev.azure.com/octoshift-demo/migration/_apis/serviceendpoint/endpoints?endpointNames=decyjphr-org&api-version=7.1-preview.4'
    //const apistr = `https://dev.azure.com/${this.adoInputs.organization}/${this.adoInputs.project}/_apis/serviceendpoint/endpoints?endpointNames=decyjphr-org&api-version=7.1-preview.4`
    //const request = require('request')
    const options: RequestOptions = {
      method: 'GET',
      //url: 'https://dev.azure.com/octoshift-demo/migration/_apis/serviceendpoint/endpoints?endpointNames=decyjphr-org&api-version=7.1-preview.4',
      headers: {
        Authorization: `Basic ${creds}`
      }
    }
    request(url, options, function (res) {
      core.debug(`STATUS:  ${res.statusCode}`)
      core.debug(`HEADERS:  ${JSON.stringify(res.headers)}`)
      res.setEncoding('utf8')
      res.on('data', function (chunk) {
        core.debug(`BODY: ${chunk}`)
      })
    })
    /*
    const adoapi = await fetch(apistr, {
      headers: new Headers({ 'Authorization': 'Basic ' + btoa(login + ':' + pass) })
      } })
    fetch("http://example.com/api/endpoint")
  .then((response) => {
    // Do something with response
  })
  .catch(function (err) {
    console.log("Unable to fetch -", err);
  });
  */
    //throw new Error('Method not implemented.')
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
        body: acknowledgement.replace('{{author}}', this.actor)
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
