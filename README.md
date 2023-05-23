<p align="center">
  <a href="README.md"><img alt="adlib status" src="https://github.com/decyjphr-actions/adlib/actions/workflows/check-dist.yml/badge.svg"></a>
</p>

# Adlib

Adlib is a TypeScript Action that processes user's requests as `Issues` to `Rewire` ADO pipelines in their project to use a pre-defined GitHub App-based  `ADO service connection`:rocket:

## How it works

The action takes the following inputs:

- **ado_pat:**: This is the ADO PAT token needed to complete the operation in ADO. The PAT requires the following permissions:
  - build: _read_execute_
  - code: _read_write_manage_
  - graph: _read_manage_
  - pipeline resources: _use_manage_
  - Project and Team: _read_write_manage_
  - Service Connection: _read_query_manage_
- **ado_org:** This is the org that has the projects
- **ado_shared_project:** This is the shared services project that has the `service connection` that needs to be shared
- **ado_shared_service_connection:** This is the `service connection` name for the one to be shared
- **github_token:** This is the `GITHUB_TOKEN` provided in the Actions workflow
- **issue_body_json:** This is the issue body that has the input of the issue. For this Action, the issue body needs the following information:
  ```json
  {
    Destination_Project: <project where the user needs the pipelines to be rewired>
  }
- **command:** This is the command to be executed. The following commands are supported:
  - ack: Create an Acknowledgement that the Action was able to receive the user input.
  - validate: Validate that the Action can operate on the user input.
  - share: Create a shared `service connection` in the users project.
  - rewire: Share the `service connection` and rewire the pipelines to use the shared `service connection`
  
  Note: Whenever a command is received, the Action creates an :look: emoticon on the issue or the issue comment.
  
## How to use

In your repository you should have a `.github/workflows` folder with GitHub workflow similar to 

`.github/workflows/test.yml`
This file should look like the following:
```yml
name: Test Action

on:
  issues:
    types: [labeled]    
  issue_comment:
jobs:
  test:
    name: Test Action
    if: contains(github.event.issue.labels.*.name, 'issueops-share-ado')
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v3
      - id: parse
        name: Run Issue form parser
        uses: peter-murray/issue-forms-body-parser@v2.0.0
        with:
          issue_id: ${{ github.event.issue.number }}
          separator: '###'
          label_marker_start: '>>'
          label_marker_end: '<<' 
      - id: issueinput
        name: Parse Issue Input to get the type
        uses: actions/github-script@v5
        env:
          payload: ${{ steps.parse.outputs.payload }}
        with:
          script: |
            const {payload} = process.env
            console.log(JSON.stringify(payload,null,2))
            const input = JSON.parse(payload)
            core.setOutput('issue_name', input.issue_name);

      - id: issue-labeled
        if: github.event_name == 'issues'
        uses: ./
        with:
          ado_pat: ${{ secrets.ADO_PAT }}
          ado_org: ${{ secrets.ADO_ORG }}
          ado_shared_project: ${{ secrets.ADO_SHARED_PROJECT }}
          ado_shared_service_connection: ${{ secrets.ADO_SHARED_SERVICE_CONNECTION }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          issue_body_json: ${{ steps.parse.outputs.payload }}
          command: 'ack'
      
      - id: issue-comment-input
        if: github.event_name == 'issue_comment'
        uses: ./
        with:
          ado_pat: ${{ secrets.ADO_PAT }}
          ado_org: ${{ secrets.ADO_ORG }}
          ado_shared_project: ${{ secrets.ADO_SHARED_PROJECT }}
          ado_shared_service_connection: ${{ secrets.ADO_SHARED_SERVICE_CONNECTION }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          issue_body_json: ${{ steps.parse.outputs.payload }}
          command: ${{ github.event.comment.body }}
```

### Triggering the Workflow
In our approach, the Action must be part of a workflow that gets triggered when an `Issue` is `labeled` or `Commented`

There is a step in the workflow that parses the Issue body and converts it to the input JSON.

There are two steps one to process the request when triggered by an `issues.labeled` event, and the other by the `issue_comment` event.
For the `issues.labeled` event, the default `command` is `ack`; for the `issue_comment` event, the `command` is the issue comment body.


## How to contribute

If you would like to help contribute to this **GitHub** Action, please see [CONTRIBUTING](.github/CONTRIBUTING.md)

