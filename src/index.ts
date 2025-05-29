import * as core from '@actions/core'

async function run() {
  try {
    const token = core.getInput('mediumToken')
    const title = core.getInput('title')
    const content = core.getInput('content')

    core.info(`Would publish "${title}" with token ${token.slice(0, 4)}...`)
    // TODO: implement actual Medium API call
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
