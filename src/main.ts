import * as core from '@actions/core'
import * as inputHelper from './inputHelper'
import {RewireInputs} from './types'

async function run(): Promise<void> {
  try {
    const inputs: RewireInputs | undefined = inputHelper.getInputs()
    core.debug(`Inputs ${JSON.stringify(inputs)}`)
    core.debug(`Inputs is Rewire Inputs ${inputs instanceof RewireInputs}`)
    core.debug('Done with main')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
