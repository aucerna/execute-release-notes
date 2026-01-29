# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Release Note Generator - a Cloudflare Worker that generates release notes by combining Azure DevOps work items with GitHub commits, using OpenAI for AI-enhanced title generation.

## Commands

```bash
# Local development
npm run dev         # Start local Cloudflare Worker (requires .dev.vars with secrets)

# Deployment
npm run deploy      # Deploy to Cloudflare Workers

# Set production secrets
npx wrangler secret put DEVOPS_PAT
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put OPENAI_API_KEY
```

## Architecture

**Single-file Worker** ([worker.js](worker.js)) - The entire application is in one file:

- **Routes**: `/` serves the UI, `/api/generate` returns SSE stream of generation progress
- **Data Flow**:
  1. Fetch DevOps work items via saved query (`DEVOPS_SAVED_QUERY_ID`)
  2. Fetch GitHub commits from master branch since last release tag
  3. Match commits to DevOps items via `AB#{id}` pattern in commit messages
  4. Enhance titles using OpenAI (`gpt-4.1-mini`)
  5. Stream results back via Server-Sent Events

**Key Functions**:
- `fetchDevOpsItems()` - Queries Azure DevOps API using saved query
- `fetchGithubCommits()` - Gets commits after current release version tag from `updates.aucerna.app/execute/21/current.txt`
- `enhanceTitle()` - Sends items to OpenAI for release note generation
- `extractTags()` - Auto-tags items based on content keywords

**Environment Variables** (non-secrets in `wrangler.toml`, secrets in `.dev.vars` locally):
- `DEVOPS_PAT`, `GITHUB_TOKEN`, `OPENAI_API_KEY` - API credentials (secrets)
- `GITHUB_REPO`, `DEVOPS_ORG`, `DEVOPS_PROJECT`, `DEVOPS_SAVED_QUERY_ID` - Config (in wrangler.toml)

**UI**: Windows 95-style interface embedded in `serveUI()`, uses EventSource for real-time progress updates.
