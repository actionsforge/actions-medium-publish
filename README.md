# Medium Publisher GitHub Action

This GitHub Action allows you to automatically publish markdown content to Medium from your GitHub repository. It supports publishing both draft and public articles, with support for frontmatter metadata.

## Features

- Publish markdown content to Medium
- Support for frontmatter metadata (title, tags)
- Multiple publishing statuses (draft, unlisted, public)
- File-based or direct content input
- Automatic title extraction from frontmatter or filename

## Usage

### Basic Usage

```yaml
name: Publish to Medium

on:
  push:
    branches:
      - main
    paths:
      - 'articles/**/*.md'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Publish to Medium
        uses: yourusername/medium-publisher@v1
        with:
          mediumToken: ${{ secrets.MEDIUM_TOKEN }}
          content: articles/my-article.md
          publishStatus: draft
```

### Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `mediumToken` | Yes | Your Medium integration token |
| `content` | Yes | Path to markdown file or direct markdown content |
| `title` | No | Article title (optional if provided in frontmatter) |
| `publishStatus` | No | Publishing status: `draft`, `unlisted`, or `public` (default: `draft`) |

### Outputs

| Output | Description |
|--------|-------------|
| `postUrl` | URL of the published post |
| `postId` | ID of the published post |

### Markdown Frontmatter

The action supports frontmatter in your markdown files to specify metadata:

```markdown
---
title: My Article Title
tags: [technology, programming, github]
---

# Article Content
Your article content here...
```

### Medium Integration Token

To use this action, you need a Medium integration token:

1. Go to your Medium account settings
2. Navigate to the "Integration tokens" section
3. Generate a new token
4. Add the token as a secret in your GitHub repository settings

## Examples

### Publishing a Draft Article

```yaml
- name: Publish Draft
  uses: yourusername/medium-publisher@v1
  with:
    mediumToken: ${{ secrets.MEDIUM_TOKEN }}
    content: articles/draft.md
    publishStatus: draft
```

### Publishing a Public Article

```yaml
- name: Publish Public
  uses: yourusername/medium-publisher@v1
  with:
    mediumToken: ${{ secrets.MEDIUM_TOKEN }}
    content: articles/public.md
    publishStatus: public
```

### Using Direct Content

```yaml
- name: Publish Direct Content
  uses: yourusername/medium-publisher@v1
  with:
    mediumToken: ${{ secrets.MEDIUM_TOKEN }}
    content: |
      # My Article
      This is my article content...
    title: My Article Title
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Testing

Run the test suite:
```bash
npm test
```

### Building

Build the action:
```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
