import axios from 'axios';

export interface MediumPost {
  title: string;
  contentFormat: 'markdown' | 'html';
  content: string;
  tags?: string[];
  publishStatus?: 'draft' | 'unlisted' | 'public';
}

export class MediumClient {
  private readonly apiUrl = 'https://api.medium.com/v1';
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async getCurrentUser() {
    const response = await axios.get(`${this.apiUrl}/me`, { headers: this.headers });
    return response.data.data;
  }

  async createPost(userId: string, post: MediumPost) {
    const response = await axios.post(
      `${this.apiUrl}/users/${userId}/posts`,
      post,
      { headers: this.headers }
    );
    return response.data.data;
  }
}
