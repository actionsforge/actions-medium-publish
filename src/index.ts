import * as core from '@actions/core'
import { MediumClient } from './medium-client'
import { ContentHandler } from './content-handler'

async function run() {
  try {
    // Get and validate inputs
    const token = core.getInput('mediumToken')
    const title = core.getInput('title')
    const content = core.getInput('content')
    const publishStatus = core.getInput('publishStatus') || 'draft'

    // Validate required inputs
    if (!token) {
      throw new Error('Medium token is required')
    }
    if (!content) {
      throw new Error('Content is required')
    }

    // Validate publish status
    if (!['draft', 'unlisted', 'public'].includes(publishStatus)) {
      throw new Error('Publish status must be one of: draft, unlisted, public')
    }

    // Process content
    let processedContent
    try {
      processedContent = await ContentHandler.processContent(content)
    } catch (error) {
      throw new Error(`Failed to process content: ${(error as Error).message}`)
    }

    const finalTitle = title || processedContent.title
    if (!finalTitle) {
      throw new Error('Title is required. Provide it either in the action input or in the markdown frontmatter')
    }

    // Initialize Medium client
    const client = new MediumClient(token)

    // Get user info
    let user
    try {
      user = await client.getCurrentUser()
      core.info(`Authenticated as ${user.name}`)
    } catch (error) {
      throw new Error(`Failed to authenticate with Medium: ${(error as Error).message}`)
    }

    // Create post
    let post
    try {
      post = await client.createPost(user.id, {
        title: finalTitle,
        contentFormat: 'markdown',
        content: processedContent.content,
        tags: processedContent.tags,
        publishStatus: publishStatus as 'draft' | 'unlisted' | 'public'
      })
    } catch (error) {
      throw new Error(`Failed to create post: ${(error as Error).message}`)
    }

    core.info(`Successfully created post: ${post.url}`)
    core.setOutput('postUrl', post.url)
    core.setOutput('postId', post.id)
  } catch (error) {
    const errorMessage = (error as Error).message
    core.error(errorMessage)
    core.setFailed(errorMessage)
  }
}

run()
