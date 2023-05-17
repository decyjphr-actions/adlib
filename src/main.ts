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
