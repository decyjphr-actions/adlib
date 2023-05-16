import * as core from '@actions/core'
import * as inputHelper from './inputHelper'
import {IssueCommand} from './issueCommand'

async function run(): Promise<void> {
  try {
    const inputs: IssueCommand | undefined = inputHelper.getInputs()
    core.debug(`Inputs ${JSON.stringify(inputs)}`)
    core.debug(`Inputs is Rewire Inputs ${inputs instanceof IssueCommand}`)
    if (inputs instanceof IssueCommand) {
      const rewireInputs: IssueCommand = inputs
      rewireInputs.execute()
    }
    core.debug('Done with main')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
