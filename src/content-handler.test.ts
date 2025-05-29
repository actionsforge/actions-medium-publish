import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContentHandler } from './content-handler'
import * as fs from 'fs'
import * as path from 'path'

describe('ContentHandler', () => {
  const mockMarkdownContent = `---
title: Test Article
tags: [test, github-actions]
---

# Test Content
This is a test article.`

  const mockDirectContent = '# Direct Content\nThis is direct markdown content.'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should process content from a file path', async () => {
    const mockFilePath = '/test/article.md'
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue(mockMarkdownContent)

    const result = await ContentHandler.processContent(mockFilePath)

    expect(result).toEqual({
      title: 'Test Article',
      content: '# Test Content\nThis is a test article.',
      tags: ['test', 'github-actions']
    })
  })

  it('should process direct markdown content with frontmatter', async () => {
    const result = await ContentHandler.processContent(mockMarkdownContent)

    expect(result).toEqual({
      title: 'Test Article',
      content: '# Test Content\nThis is a test article.',
      tags: ['test', 'github-actions']
    })
  })

  it('should process direct markdown content without frontmatter', async () => {
    const result = await ContentHandler.processContent(mockDirectContent)

    expect(result).toEqual({
      title: '',
      content: mockDirectContent
    })
  })

  it('should use filename as title when no title in frontmatter', async () => {
    const mockFilePath = '/test/article.md'
    const contentWithoutTitle = `---
tags: [test]
---

# Content`

    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue(contentWithoutTitle)

    const result = await ContentHandler.processContent(mockFilePath)

    expect(result.title).toBe('article')
  })
})
