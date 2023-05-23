## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```typescript
import * as core from '@actions/core'
import * as inputHelper from './inputHelper'
import {IssueCommand} from './issueCommand'

export async function run(): Promise<void> {
  try {
    const inputs: IssueCommand | undefined = inputHelper.getInputs()
    core.debug(`Inputs ${JSON.stringify(inputs)}`)
    core.debug(`Inputs is Rewire Inputs ${inputs instanceof IssueCommand}`)
    if (inputs instanceof IssueCommand) {
      const rewireInputs: IssueCommand = inputs
      await rewireInputs.execute()
    }
    core.debug('Done with main')
  } catch (error) {
    core.error(`Unexpected Error encountered when executing main ${error}`)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](workflows/test-form.yml))


See the [actions tab](../../../actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
