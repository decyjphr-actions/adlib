// eslint-disable-next-line import/no-unresolved
import {Issue, Repository} from '@octokit/webhooks-definitions/schema'
import {IIssue, AdoInputs, Commands} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as core from '@actions/core'
import nodeFetch, {Response} from 'node-fetch'

const acknowledgement = `Hello @{{author}}, 
I'm a bot that helps you rewire your ADO pipelines to GitHub link to use a shared GitHub App based service connection. 
I've received your request to rewire your project {{ado_project}}. 
If everything looks good, I'll let you know the next steps. 

If you have any questions, please reach out to @decyjphr. You can also type the commands below as an issue comment to interact with me:
ack - Acknowledge the request
validate - Validate the request
rewire - Rewire the project
approve - Approve the request
`
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
  headers = [
    ['Authorization', `Basic empty`],
    ['Accept', 'application/json;api-version=7.1-preview.4'],
    ['Content-Type', 'application/json; charset=utf-8']
  ]

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
    this.adoInputs.adoToken = Buffer.from(
      `:${this.adoInputs.adoToken}`
    ).toString('base64')
    this.command = _command
    this.octokitClient = _octokit
    this.actor = _actor
    this.headers = [
      ['Authorization', `Basic ${this.adoInputs.adoToken}`],
      ['Accept', 'application/json;api-version=7.1-preview.4'],
      ['Content-Type', 'application/json; charset=utf-8']
    ]
  }

  async execute(): Promise<void> {
    const _commandName = this.command as keyof typeof this
    if (typeof this[_commandName] === 'function') {
      const command = this[_commandName] as Function
      core.debug(`Calling ${this.command}...`)
      await command.call(this)
    }
  }

  async rewire(): Promise<void> {
    try {
      const params = {
        owner: this.repository.owner.login,
        repo: this.repository.name,
        issue_number: this.issue.number
      }
      const sharedServiceConnection = await this.getSharedServiceConnection()
      if (sharedServiceConnection) {
        // Share this service connection to the user's project
        const shareServiceConnectionResponse =
          await this.shareServiceConnection(sharedServiceConnection)
        core.debug(`Creating issue comment with Share success message`)
        const success = `Hello ${this.actor} Service Connection ${this.adoInputs.adoSharedServiceConnection} was successfully shared with the project ${this.adoInputs.Destination_Project}}`
        core.debug(success)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: success.concat(
            `\n${JSON.stringify(shareServiceConnectionResponse, null, 2)}`
          )
        })
      } else {
        core.debug(`Creating issue comment with BadValidation message`)
        const error = `Service Connection ${this.adoInputs.adoSharedServiceConnection} not found in project ${this.adoInputs.adoSharedProject}}`
        core.error(error)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: badValidation
            .replace('{{author}}', this.actor)
            .concat(`\n${error}`)
        })
      }

      const pipelinesList = await this.getADOPipelinesList()

      if (pipelinesList) {
        core.debug(`Creating issue comment with GoodPipelinesList message`)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: goodPipelinesList
            .replace('{{author}}', this.actor)
            .concat(`\n${JSON.stringify(pipelinesList, null, 2)}`)
        })
      } else {
        core.debug(`Creating issue comment with BadPipelinesList message`)
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

  removeLabels(labels: string[]): void {
    throw new Error(`Method removeLabels(${labels}) not implemented.`)
  }

  addLabels(labels: string[]): void {
    throw new Error(`Method addLabels(${labels}) not implemented.`)
  }

  async validate(): Promise<void> {
    try {
      const params = {
        owner: this.repository.owner.login,
        repo: this.repository.name,
        issue_number: this.issue.number
      }
      const sharedServiceConnection: {
        id: string
        name: string
        type: string
      } | null = await this.getSharedServiceConnection()
      if (sharedServiceConnection) {
        const body = goodValidation
          .replace('{{author}}', this.actor)
          .concat(this.printSharedServiceConnection(sharedServiceConnection))
        core.debug(`Creating issue comment with GoodValidation message ${body}`)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body
        })
      } else {
        core.debug(`Creating issue comment with BadValidation message`)
        const error = `Service Connection ${this.adoInputs.adoSharedServiceConnection} not found in project ${this.adoInputs.adoSharedProject}}`
        core.error(error)
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body: badValidation
            .replace('{{author}}', this.actor)
            .concat(`\n${error}`)
        })
      }

      const pipelinesList = await this.getADOPipelinesList()

      if (pipelinesList) {
        const body = goodPipelinesList
          .replace('{{author}}', this.actor)
          .concat(this.printPipelinesList(pipelinesList))
        core.debug(
          `Creating issue comment with GoodPipelinesList message ${body}`
        )
        await this.octokitClient.rest.issues.createComment({
          ...params,
          body
        })
      } else {
        core.debug(`Creating issue comment with BadPipelinesList message`)
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

  private printSharedServiceConnection(sharedServiceConnection: {
    id: string
    name: string
    type: string
  }): string {
    return `
| id | name | type |
| -- | -- | -- |
| ${sharedServiceConnection.id} | ${sharedServiceConnection.name} | ${sharedServiceConnection.type} |
`
  }

  private printPipelinesList(pipelinesList: unknown[]): string {
    return `
| id | name | url |
| -- | -- | -- |
${pipelinesList.reduce((x: unknown, y: unknown) => {
  return `${x} | ${(y as {id: string}).id} | ${(y as {name: string}).name} | ${
    (y as {url: string}).url
  } |\n`
}, '')}
`
  }

  private async getADOPipelinesList(): Promise<unknown[] | null> {
    const listPipelinesUrl = `https://dev.azure.com/${this.adoInputs.adoOrg}/${this.adoInputs.Destination_Project}/_apis/build/definitions?api-version=7.0`
    const pipelinesList = []
    const listPipelinesResponse: Response = await nodeFetch(listPipelinesUrl, {
      method: 'GET',
      headers: this.headers
    })
    core.debug(`response: ${JSON.stringify(listPipelinesResponse)}`)
    core.debug(`listPipelinesResponse.ok = ${listPipelinesResponse.ok}`)
    core.debug(`listPipelinesResponse.status = ${listPipelinesResponse.status}`)
    core.debug(
      `listPipelinesResponse.statusText = ${listPipelinesResponse.statusText}`
    )
    const responseObject = await listPipelinesResponse.json()
    core.debug(`response: ${JSON.stringify(responseObject)}`)

    if (listPipelinesResponse.ok) {
      for (const build of responseObject.value) {
        const pipeline = await this.getBuildDefinition(build._links.self.href)
        if (pipeline) {
          pipelinesList.push(pipeline)
        }
      }
      return pipelinesList
    } else {
      const error = `No pipelines found in project ${this.adoInputs.Destination_Project}. Please check the name of the project and resubmit the issue`
      core.error(error)
      return null
    }
  }

  async shareServiceConnection(sharedServiceConnection: {
    id?: string
  }): Promise<unknown> {
    const destinationProject: {id: string} | null =
      await this.getDestinationProject()
    core.debug(`destinationProject: ${JSON.stringify(destinationProject)}`)
    if (destinationProject) {
      core.debug(`${JSON.stringify(destinationProject)} found`)
    }

    const data = [
      {
        name: `${this.adoInputs.adoOrg}-${this.adoInputs.Destination_Project}`,
        projectReference: {
          id: `${destinationProject?.id as string}`,
          name: `${this.adoInputs.Destination_Project}`
        }
      }
    ]

    core.debug(`data: ${JSON.stringify(data)}`)
    const shareUrl = `https://dev.azure.com/${this.adoInputs.adoOrg}/_apis/serviceendpoint/endpoints/${sharedServiceConnection.id}?api-version=7.0`
    const shareServiceConnectionResponse: Response = await nodeFetch(shareUrl, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data)
    })
    core.debug(
      `shareServiceConnectionResponse response: ${JSON.stringify(
        shareServiceConnectionResponse
      )}`
    )
    core.debug(
      `shareServiceConnectionResponse.ok = ${shareServiceConnectionResponse.ok}`
    )
    core.debug(
      `shareServiceConnectionResponse.status = ${shareServiceConnectionResponse.status}`
    )
    core.debug(
      `listPipelinesResponse.statusText = ${shareServiceConnectionResponse.statusText}`
    )
    const responseObject = await shareServiceConnectionResponse.json()
    core.debug(
      `shareServiceConnectionResponse JSON response : ${JSON.stringify(
        responseObject
      )}`
    )
    if (shareServiceConnectionResponse.ok) {
      return responseObject
    } else {
      const error = `Error sharing service connection ${this.adoInputs.adoSharedServiceConnection} in project ${this.adoInputs.adoSharedProject}`
      core.error(error)
      return null
    }
  }

  private async getDestinationProject(): Promise<{id: string} | null> {
    const projectByNameUrl = `https://dev.azure.com/${this.adoInputs.adoOrg}/_apis/projects/${this.adoInputs.Destination_Project}?api-version=7.0`

    const projectByNameResponse: Response = await nodeFetch(projectByNameUrl, {
      method: 'GET',
      headers: this.headers
    })
    core.debug(
      `projectByNameResponse response: ${JSON.stringify(projectByNameResponse)}`
    )
    const responseObject = await projectByNameResponse.json()
    core.debug(
      `projectByNameResponse JSON response : ${JSON.stringify(responseObject)}`
    )
    if (projectByNameResponse.ok) {
      return responseObject
    } else {
      const error = `Project  ${this.adoInputs.Destination_Project} not found in org ${this.adoInputs.adoOrg}. Error: ${projectByNameResponse.statusText}`
      core.error(error)
      return null
    }
  }

  private async getBuildDefinition(
    fetchUrl: string
  ): Promise<{id: string} | null> {
    const buildDefinitionResponse: Response = await nodeFetch(fetchUrl, {
      method: 'GET',
      headers: this.headers
    })
    core.debug(
      `buildDefinitionResponse response: ${JSON.stringify(
        buildDefinitionResponse
      )}`
    )
    const responseObject = await buildDefinitionResponse.json()
    core.debug(
      `buildDefinitionResponse JSON response : ${JSON.stringify(
        responseObject
      )}`
    )
    if (buildDefinitionResponse.ok) {
      return responseObject
    } else {
      const error = `Build Definition not found for url ${fetchUrl}. Error: ${buildDefinitionResponse.statusText}`
      core.error(error)
      return null
    }
  }
  private async getSharedServiceConnection(): Promise<{
    id: string
    name: string
    type: string
  } | null> {
    const serviceConnectionByNameUrl = `https://dev.azure.com/${this.adoInputs.adoOrg}/${this.adoInputs.adoSharedProject}/_apis/serviceendpoint/endpoints?endpointNames=${this.adoInputs.adoSharedServiceConnection}&api-version=7.0`

    const serviceConnectionByNameResponse: Response = await nodeFetch(
      serviceConnectionByNameUrl,
      {
        method: 'GET',
        headers: this.headers
      }
    )
    core.debug(
      `serviceConnectionByNameResponse response: ${JSON.stringify(
        serviceConnectionByNameResponse
      )}`
    )
    const responseObject = await serviceConnectionByNameResponse.json()
    core.debug(
      `serviceConnectionByName JSON response : ${JSON.stringify(
        responseObject
      )}`
    )
    if (serviceConnectionByNameResponse.ok && responseObject.count === 1) {
      return responseObject.value[0]
    } else {
      const error = `Service Connection ${this.adoInputs.adoSharedServiceConnection} not found in project ${this.adoInputs.adoSharedProject}. Error: ${serviceConnectionByNameResponse.statusText}`
      core.error(error)
      return null
    }
  }

  async ack(): Promise<void> {
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
      const body = acknowledgement
        .replace('{{author}}', this.actor)
        .replace('{{ado_project}}', this.adoInputs.Destination_Project)

      core.debug(`Ack issued: ${body}`)
      await this.octokitClient.rest.issues.createComment({
        ...params,
        body
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
