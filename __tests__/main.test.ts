import nock from 'nock'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {run} from '../src/main'
import * as core from '@actions/core'

let {githubScope, adoScope} = initializeNock()

beforeAll(() => {
  process.env['INPUT_GITHUB_TOKEN'] = 'github_token'
  process.env['INPUT_ADO_PAT'] = 'ado_pat'
  process.env['INPUT_ADO_ORG'] = 'octoshift-demo'
  process.env['INPUT_ADO_SHARED_PROJECT'] = 'migration'
  process.env['INPUT_ADO_SHARED_SERVICE_CONNECTION'] = 'decyjphr-org'
  process.env['INPUT_ISSUE_BODY_JSON'] =
    '{"Destination_Project":"deco-org","Build_Definition":"7"}'
  process.env['GITHUB_REPOSITORY'] = 'decyjphr-org/admin'
  process.env['GITHUB_ACTOR'] = 'decyjphr'
  process.env['GITHUB_EVENT_PATH'] = path.join(
    __dirname,
    'fixtures',
    'issue.json'
  )
  process.env['GITHUB_EVENT_NAME'] = 'issues'
  process.env['GITHUB_SHA'] = 'SHA'
  process.env['GITHUB_REF'] = 'main'
  process.env['GITHUB_WORKFLOW'] = 'test'
  process.env['GITHUB_ACTION'] = 'labeled'
})

beforeEach(() => {
  githubScope
    .post('/repos/decyjphr-org/actions-issue-forms/issues/44/reactions')
    .reply(200, '')
    .post('/repos/decyjphr-org/actions-issue-forms/issues/44/comments')
    .reply(200, '')

  const s: string = `
    {
      "count": 1,
      "value": [
        {
          "_links": {
            "self": {
              "href": "https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/Definitions/5?revision=23"
            },
            "web": {
              "href": "https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_build/definition?definitionId=5"
            },
            "editor": {
              "href": "https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_build/designer?id=5&_a=edit-build-definition"
            },
            "badge": {
              "href": "https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/status/5"
            }
          },
          "id": 5,
          "name": "decyjphr-org.decyjphr-ado-migration"
        }
      ]
    }`

  adoScope
    .get(
      '/octoshift-demo/migration/_apis/serviceendpoint/endpoints?endpointNames=decyjphr-org&api-version=7.0'
    )
    .reply(
      200,
      `{"count":1,"value":[{"data":{"pipelinesSourceProvider":"github","AvatarUrl":"https://avatars.githubusercontent.com/u/65230155?v=4"},"id":"8595d0a6-f08d-4be4-b41b-8c3d8a804acc","name":"decyjphr-org","type":"GitHub","url":"https://github.com","createdBy":{"displayName":"Yadhav Jayaraman","url":"https://spsprodcus4.vssps.visualstudio.com/A391ec8f1-cd05-40fb-9efc-2091c511fe73/_apis/Identities/493a77a8-762a-63b5-b799-9623b04ea3ed","_links":{"avatar":{"href":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"}},"id":"493a77a8-762a-63b5-b799-9623b04ea3ed","uniqueName":"yajayara@microsoft.com","imageUrl":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk","descriptor":"aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"},"description":"","authorization":{"scheme":"InstallationToken"},"isShared":true,"isReady":true,"owner":"Library","serviceEndpointProjectReferences":[{"projectReference":{"id":"f72cd1d1-0714-4155-9027-f3612d93faee","name":"migration"},"name":"decyjphr-org"},{"projectReference":{"id":"40715695-80ae-4251-8a94-516e4ded0a2a","name":"deco-org"},"name":"octoshift-demo-deco-org"}]}]}`
    )
    .get('/octoshift-demo/_apis/projects/deco-org?api-version=7.0')
    .reply(
      200,
      `{"id":"40715695-80ae-4251-8a94-516e4ded0a2a","name":"deco-org","url":"https://dev.azure.com/octoshift-demo/_apis/projects/40715695-80ae-4251-8a94-516e4ded0a2a","state":"wellFormed","revision":43,"_links":{"self":{"href":"https://dev.azure.com/octoshift-demo/_apis/projects/40715695-80ae-4251-8a94-516e4ded0a2a"},"collection":{"href":"https://dev.azure.com/octoshift-demo/_apis/projectCollections/1209f044-0a15-424f-8f85-6ac212240c6b"},"web":{"href":"https://dev.azure.com/octoshift-demo/deco-org"}},"visibility":"organization","defaultTeam":{"id":"71503462-c3c1-4a94-a34a-da14b29b2a45","name":"deco-org Team","url":"https://dev.azure.com/octoshift-demo/_apis/projects/40715695-80ae-4251-8a94-516e4ded0a2a/teams/71503462-c3c1-4a94-a34a-da14b29b2a45"},"lastUpdateTime":"2023-04-10T21:45:39.803Z"}`
    )
    .get(
      '/octoshift-demo/_apis/serviceendpoint/endpoints/8595d0a6-f08d-4be4-b41b-8c3d8a804acc?api-version=7.0'
    )
    .reply(
      200,
      `{"data":{"pipelinesSourceProvider":"github","AvatarUrl":"https://avatars.githubusercontent.com/u/65230155?v=4"},"id":"8595d0a6-f08d-4be4-b41b-8c3d8a804acc","name":"decyjphr-org","type":"GitHub","url":"https://github.com","createdBy":{"displayName":"Yadhav Jayaraman","url":"https://spsprodcus4.vssps.visualstudio.com/A391ec8f1-cd05-40fb-9efc-2091c511fe73/_apis/Identities/493a77a8-762a-63b5-b799-9623b04ea3ed","_links":{"avatar":{"href":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"}},"id":"493a77a8-762a-63b5-b799-9623b04ea3ed","uniqueName":"yajayara@microsoft.com","imageUrl":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk","descriptor":"aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"},"description":"","authorization":{"parameters":{"IdToken":null,"IdSignature":null},"scheme":"InstallationToken"},"isShared":true,"isReady":true,"owner":"Library","serviceEndpointProjectReferences":[{"projectReference":{"id":"f72cd1d1-0714-4155-9027-f3612d93faee","name":"migration"},"name":"decyjphr-org"},{"projectReference":{"id":"40715695-80ae-4251-8a94-516e4ded0a2a","name":"deco-org"},"name":"octoshift-demo-deco-org"}]}`
    )
    .patch(
      '/octoshift-demo/_apis/serviceendpoint/endpoints/8595d0a6-f08d-4be4-b41b-8c3d8a804acc?api-version=7.0'
    )
    .reply(
      200,
      `{"data":{"pipelinesSourceProvider":"github","AvatarUrl":"https://avatars.githubusercontent.com/u/65230155?v=4"},"id":"8595d0a6-f08d-4be4-b41b-8c3d8a804acc","name":"decyjphr-org","type":"GitHub","url":"https://github.com","createdBy":{"displayName":"Yadhav Jayaraman","url":"https://spsprodcus4.vssps.visualstudio.com/A391ec8f1-cd05-40fb-9efc-2091c511fe73/_apis/Identities/493a77a8-762a-63b5-b799-9623b04ea3ed","_links":{"avatar":{"href":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"}},"id":"493a77a8-762a-63b5-b799-9623b04ea3ed","uniqueName":"yajayara@microsoft.com","imageUrl":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk","descriptor":"aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"},"description":"","authorization":{"parameters":{"IdToken":null,"IdSignature":null},"scheme":"InstallationToken"},"isShared":true,"isReady":true,"owner":"Library","serviceEndpointProjectReferences":[{"projectReference":{"id":"f72cd1d1-0714-4155-9027-f3612d93faee","name":"migration"},"name":"decyjphr-org"},{"projectReference":{"id":"40715695-80ae-4251-8a94-516e4ded0a2a","name":"deco-org"},"name":"octoshift-demo-deco-org"}]}`
    )
    .get('/octoshift-demo/deco-org/_apis/build/definitions?api-version=7.0')
    .reply(200, s)
    .get(
      '/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/Definitions/5?revision=23'
    )
    .reply(
      200,
      `{"triggers":[{"branchFilters":[],"pathFilters":[],"settingsSourceType":2,"batchChanges":false,"maxConcurrentBuildsPerBranch":1,"triggerType":"continuousIntegration"},{"settingsSourceType":2,"branchFilters":["+main"],"forks":{"enabled":true,"allowSecrets":true,"allowFullAccessToken":false},"pathFilters":[],"requireCommentsForNonTeamMembersOnly":false,"requireCommentsForNonTeamMemberAndNonContributors":false,"isCommentRequiredForPullRequest":false,"triggerType":"pullRequest"}],"properties":{},"tags":[],"_links":{"self":{"href":"https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/Definitions/5?revision=23"},"web":{"href":"https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_build/definition?definitionId=5"},"editor":{"href":"https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_build/designer?id=5&_a=edit-build-definition"},"badge":{"href":"https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/status/5"}},"jobAuthorizationScope":"projectCollection","jobTimeoutInMinutes":60,"jobCancelTimeoutInMinutes":5,"process":{"yamlFilename":"azure-pipelines.yml","type":2},"repository":{"properties":{"apiUrl":"https://api.github.com/repos/decyjphr-org/decyjphr-ado-migration","branchesUrl":"https://api.github.com/repos/decyjphr-org/decyjphr-ado-migration/branches","cloneUrl":"https://github.com/decyjphr-org/decyjphr-ado-migration.git","connectedServiceId":"8595d0a6-f08d-4be4-b41b-8c3d8a804acc","defaultBranch":"main","fullName":"decyjphr-org/decyjphr-ado-migration","hasAdminPermissions":"False","isFork":"False","isPrivate":"True","lastUpdated":"01/24/2023 16:48:18","manageUrl":"https://github.com/decyjphr-org/decyjphr-ado-migration","nodeId":"R_kgDOHhkGmg","ownerId":"65230155","orgName":"decyjphr-org","refsUrl":"https://api.github.com/repos/decyjphr-org/decyjphr-ado-migration/git/refs","safeRepository":"decyjphr-org/decyjphr-ado-migration","shortName":"decyjphr-ado-migration","ownerAvatarUrl":"https://avatars.githubusercontent.com/u/65230155?v=4","archived":"False","externalId":"504956570","ownerIsAUser":"False","reportBuildStatus":"true","fetchDepth":"1"},"id":"decyjphr-org/decyjphr-ado-migration","type":"GitHub","name":"decyjphr-org/decyjphr-ado-migration","url":"https://github.com/decyjphr-org/decyjphr-ado-migration.git","defaultBranch":"refs/heads/main","clean":null,"checkoutSubmodules":false},"quality":"definition","authoredBy":{"displayName":"Yadhav Jayaraman","url":"https://spsprodcus4.vssps.visualstudio.com/A391ec8f1-cd05-40fb-9efc-2091c511fe73/_apis/Identities/493a77a8-762a-63b5-b799-9623b04ea3ed","_links":{"avatar":{"href":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"}},"id":"493a77a8-762a-63b5-b799-9623b04ea3ed","uniqueName":"yajayara@microsoft.com","imageUrl":"https://dev.azure.com/octoshift-demo/_apis/GraphProfile/MemberAvatars/aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk","descriptor":"aad.NDkzYTc3YTgtNzYyYS03M2I1LWI3OTktOTYyM2IwNGVhM2Vk"},"drafts":[],"queue":{"_links":{"self":{"href":"https://dev.azure.com/octoshift-demo/_apis/build/Queues/36"}},"id":36,"name":"Azure Pipelines","url":"https://dev.azure.com/octoshift-demo/_apis/build/Queues/36","pool":{"id":9,"name":"Azure Pipelines","isHosted":true}},"id":5,"name":"decyjphr-org.decyjphr-ado-migration","url":"https://dev.azure.com/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/Definitions/5?revision=23","uri":"vstfs:///Build/Definition/5","path":"","type":"build","queueStatus":"enabled","revision":23,"createdDate":"2023-05-22T20:48:36.46Z","project":{"id":"40715695-80ae-4251-8a94-516e4ded0a2a","name":"deco-org","url":"https://dev.azure.com/octoshift-demo/_apis/projects/40715695-80ae-4251-8a94-516e4ded0a2a","state":"wellFormed","revision":43,"visibility":"organization","lastUpdateTime":"2023-04-10T21:45:39.803Z"}}`
    )
    .put(
      '/octoshift-demo/40715695-80ae-4251-8a94-516e4ded0a2a/_apis/build/Definitions/5?revision=23&api-version=7.0'
    )
    .reply(200, '{}')
  //nock.disableNetConnect()
})

test('main test', () => {
  run()
})
/*
// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', async () => {
  process.env['INPUT_COMMAND'] = 'ack'
  //process.env['INPUT_GITHUB_TOKEN'] = 'abc'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())

  
})
*/
function initializeNock(): {githubScope: nock.Scope; adoScope: nock.Scope} {
  nock.disableNetConnect()
  return {
    githubScope: nock('https://api.github.com'),
    adoScope: nock('https://dev.azure.com')
  }
}

function teardownNock(githubScope: nock.Scope): void {
  expect(githubScope.isDone()).toBe(true)

  nock.cleanAll()
}

function cleanAll(): void {
  nock.cleanAll()
}
