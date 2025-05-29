import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContentHandler } from './content-handler'
import * as fs from 'fs'
import * as path from 'path'

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  promises: {
    readFile: vi.fn()
  }
}))

vi.mock('path', () => ({
  basename: vi.fn(),
  extname: vi.fn()
}))

describe('ContentHandler', () => {
  const mockMarkdownContent = `---
title: Test Article
tags:
  - test
  - github-actions
---

# Test Content
This is a test article.`

  const mockDirectContent = '# Direct Content\nThis is direct markdown content.'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.existsSync).mockReturnValue(false)
  })

  it('should process content from a file path', async () => {
    const mockFilePath = '/test/article.md'
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.promises.readFile).mockResolvedValue(mockMarkdownContent)
    vi.mocked(path.basename).mockReturnValue('article')
    vi.mocked(path.extname).mockReturnValue('.md')

    const result = await ContentHandler.processContent(mockFilePath)

    expect(result).toEqual({
      title: 'Test Article',
      content: '\n# Test Content\nThis is a test article.',
      tags: ['test', 'github-actions']
    })
  })

  it('should process direct markdown content with frontmatter', async () => {
    const result = await ContentHandler.processContent(mockMarkdownContent)

    expect(result).toEqual({
      title: 'Test Article',
      content: '\n# Test Content\nThis is a test article.',
      tags: ['test', 'github-actions']
    })
  })

  it('should process direct markdown content without frontmatter', async () => {
    const result = await ContentHandler.processContent(mockDirectContent)

    expect(result).toEqual({
      title: '',
      content: '# Direct Content\nThis is direct markdown content.'
    })
  })

  it('should use filename as title when no title in frontmatter', async () => {
    const contentWithoutTitle = `---
tags:
  - test
---

# Content`
    const mockFilePath = '/test/article.md'

    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.promises.readFile).mockResolvedValue(contentWithoutTitle)
    vi.mocked(path.basename).mockReturnValue('article')
    vi.mocked(path.extname).mockReturnValue('.md')

    const result = await ContentHandler.processContent(mockFilePath)

    expect(result).toEqual({
      title: 'article',
      content: '\n# Content',
      tags: ['test']
    })
  })
})
