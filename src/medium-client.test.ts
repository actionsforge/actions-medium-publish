import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MediumClient } from './medium-client'
import axios from 'axios'

vi.mock('axios')

describe('MediumClient', () => {
  const mockToken = 'test-token'
  const mockUserId = '123456'
  const mockUser = {
    id: mockUserId,
    name: 'Test User',
    username: 'testuser'
  }

  const mockPost = {
    title: 'Test Post',
    contentFormat: 'markdown' as const,
    content: '# Test Content',
    tags: ['test'],
    publishStatus: 'draft' as const
  }

  const mockCreatedPost = {
    id: 'post123',
    url: 'https://medium.com/@testuser/test-post-123',
    ...mockPost
  }

  let client: MediumClient

  beforeEach(() => {
    client = new MediumClient(mockToken)
    vi.resetAllMocks()
  })

  it('should get current user', async () => {
    const mockResponse = { data: { data: mockUser } }
    vi.mocked(axios.get).mockResolvedValue(mockResponse)

    const user = await client.getCurrentUser()

    expect(user).toEqual(mockUser)
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.medium.com/v1/me',
      {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }
    )
  })

  it('should create a post', async () => {
    const mockResponse = { data: { data: mockCreatedPost } }
    vi.mocked(axios.post).mockResolvedValue(mockResponse)

    const post = await client.createPost(mockUserId, mockPost)

    expect(post).toEqual(mockCreatedPost)
    expect(axios.post).toHaveBeenCalledWith(
      `https://api.medium.com/v1/users/${mockUserId}/posts`,
      mockPost,
      {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }
    )
  })

  it('should handle API errors', async () => {
    const mockError = new Error('API Error')
    vi.mocked(axios.get).mockRejectedValue(mockError)

    await expect(client.getCurrentUser()).rejects.toThrow('API Error')
  })
})
