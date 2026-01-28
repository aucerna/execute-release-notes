# Release Note Generator

Cloudflare Worker that generates release notes by combining Azure DevOps work items and GitHub commits, with AI-enhanced summaries.

**Production URL:** https://release-notes-generator.deliveryraptor.net

## How It Works

1. Queries Azure DevOps using a saved query (configured in `wrangler.toml`) to get pending work items
2. Fetches GitHub commits since the last release tag
3. Matches commits to DevOps items by `AB#123` references in commit messages
4. Uses OpenAI to generate user-friendly release note titles
5. Returns a CSV with the combined data

## Hosting

Runs on Cloudflare Workers under the Execute account (formerly Jeff's). To manage:
- Log into Cloudflare dashboard
- Go to Workers & Pages > release-note-generator
- Because this is under `deliveryraptor.net` it's only accessible for those with a @quorumsoftware.com address!

## Setup

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.dev.vars` file with your secrets (see Environment Variables below).

3. Run locally:
   ```bash
   npm run dev
   ```

### Production Deployment

1. Set secrets in Cloudflare:
   ```bash
   npx wrangler secret put DEVOPS_PAT
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put OPENAI_API_KEY
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

### Environment Variables

Non-private variables are baked into `wrangler.toml`

#### DEVOPS_PAT
Azure DevOps Personal Access Token with read access to work items.

To create one:
1. Go to Azure DevOps > User Settings (top right) > Personal Access Tokens
2. Click "New Token"
3. Set scope to "Work Items: Read"
4. Copy the generated token

#### GITHUB_TOKEN
GitHub Personal Access Token with repo read access.

To create one:
1. Go to GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Set scope to "repo" (for private repos) or "public_repo" (for public only)
4. Copy the generated token

#### OPENAI_API_KEY
OpenAI API key for AI-enhanced title generation.

**Action Required:** Currently uses Jeff Clement's personal OpenAI account. This will need to be migrated to either:
- A company OpenAI account, or
- Azure OpenAI once that's configured

To update: generate a new API key and run `npx wrangler secret put OPENAI_API_KEY`

## Usage

Make a GET request to your worker URL to download the CSV file with pending release items.