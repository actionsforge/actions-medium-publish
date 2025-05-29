import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

export interface ProcessedContent {
  title: string;
  content: string;
  tags?: string[];
}

export class ContentHandler {
  static async processContent(content: string): Promise<ProcessedContent> {
    // Check if content is a file path
    if (fs.existsSync(content)) {
      const fileContent = await fs.promises.readFile(content, 'utf-8');
      const { data, content: markdownContent } = matter(fileContent);

      return {
        title: data.title || path.basename(content, path.extname(content)),
        content: markdownContent,
        tags: data.tags
      };
    }

    // If content is direct markdown, try to parse frontmatter
    try {
      const { data, content: markdownContent } = matter(content);
      return {
        title: data.title || '',
        content: markdownContent,
        tags: data.tags
      };
    } catch {
      // If no frontmatter, return as is
      return {
        title: '',
        content
      };
    }
  }
}
