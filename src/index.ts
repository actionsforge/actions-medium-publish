import * as core from '@actions/core'
import { MediumClient } from './medium-client'
import { ContentHandler } from './content-handler'
import * as fs from 'fs'
import * as path from 'path'

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

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2)
  const fileIndex = args.indexOf('-f') !== -1 ? args.indexOf('-f') : args.indexOf('--file')
  const tokenIndex = args.indexOf('-t') !== -1 ? args.indexOf('-t') : args.indexOf('--token')
  const publicationIndex = args.indexOf('-p') !== -1 ? args.indexOf('-p') : args.indexOf('--publication')
  const dryRunIndex = args.indexOf('--dry-run')

  if (fileIndex === -1 || tokenIndex === -1) {
    console.error('Usage: node index.js -f <file> -t <token> [-p <publication>] [--dry-run]')
    process.exit(1)
  }

  const file = args[fileIndex + 1]
  const token = args[tokenIndex + 1]
  const publication = publicationIndex !== -1 ? args[publicationIndex + 1] : undefined
  const isDryRun = dryRunIndex !== -1

  if (!file || !token) {
    console.error('File and token are required')
    process.exit(1)
  }

  const filePath = path.resolve(file)
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const mediumClient = new MediumClient(token)

  ContentHandler.processContent(content)
    .then(processedContent => {
      if (isDryRun) {
        console.log('\n=== Medium Publish Dry Run ===\n')
        console.log('File:', filePath)
        console.log('\n=== Content Processing Results ===')
        console.log('\nTitle:', processedContent.title || '(No title found)')
        console.log('\nTags:', processedContent.tags?.join(', ') || 'none')
        console.log('\nContent Preview:')
        const preview = processedContent.content.split('\n').slice(0, 5).join('\n')
        console.log(preview)
        if (processedContent.content.split('\n').length > 5) {
          console.log('...')
        }
        console.log('\n=== Content Statistics ===')
        console.log('Total lines:', processedContent.content.split('\n').length)
        console.log('Total characters:', processedContent.content.length)
        console.log('Word count:', processedContent.content.split(/\s+/).filter(Boolean).length)
        console.log('\n=== Publication Details ===')
        console.log('Status: Would be published as public')
        if (publication) {
          console.log('Publication ID:', publication)
        }
        console.log('\nNote: This is a dry run. No content was actually published to Medium.')
        process.exit(0)
      }

      return mediumClient.getCurrentUser()
        .then(user => mediumClient.createPost(user.id, {
          title: processedContent.title,
          contentFormat: 'markdown',
          content: processedContent.content,
          tags: processedContent.tags,
          publishStatus: 'public'
        }))
        .then(result => {
          console.log('Successfully published to Medium!')
          console.log(`URL: ${result.url}`)
        })
    })
    .catch(error => {
      console.error('Error:', error)
      process.exit(1)
    })
} else {
  run()
}
