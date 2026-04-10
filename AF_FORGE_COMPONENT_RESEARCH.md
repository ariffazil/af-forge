# AF-FORGE: Deep Component Research & Official Documentation

**Classification:** Architecture Research | **Authority:** Muhammad Arif bin Fazil  
**Date:** 2026-04-09 | **Seal:** VAULT999

---

## Executive Summary

This document provides comprehensive research on the official documentation, manuals, and architecture for each component integrated into the AF-FORGE meta-machine. It covers:

1. **Claude Code** - Anthropic's official AI coding assistant (closed-source)
2. **OpenCode AI** - The open-source, multi-provider AI coding agent
3. **Gemini CLI** - Google's official AI agent for terminal
4. **Kimi CLI** - Moonshot AI's terminal-first coding agent
5. **Aider** - AI pair programming in your terminal
6. **OpenAI Codex CLI** - OpenAI's coding agent (Rust-based)
7. **GitHub Copilot CLI** - GitHub's terminal-native AI agent
8. **MCP Protocol** - Model Context Protocol specification
9. **AF-FORGE Integration** - How these components unified under constitutional governance

---

## Part 1: Claude Code (Anthropic)

### 1.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| Official Docs | https://code.claude.com/docs | ✅ Active |
| GitHub (Community) | https://github.com/TaGoat/claude_code_cli | Community Analysis |
| How it Works | https://code.claude.com/docs/en/how-claude-code-works | Official |

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Claude Code Architecture                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   User Input → CLI Parser → Query Engine → LLM API → Tool Loop → Terminal UI │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                        Core Pipeline                                 │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │    CLI      │  │    Query    │  │    LLM      │  │    Tool     │ │    │
│   │  │   Parser    │  │    Engine   │  │    API      │  │    Loop     │ │    │
│   │  │             │  │             │  │             │  │             │ │    │
│   │  │ • Args      │  │ • Context   │  │ • Claude    │  │ • Execution │ │    │
│   │  │ • Flags     │  │ • Prompts   │  │   Models    │  │ • Feedback  │ │    │
│   │  │ • Config    │  │ • History   │  │ • Streaming │  │ • State     │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                    Terminal UI (React + Ink)                         │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │  Components │  │    Hooks    │  │    State    │  │   Render    │ │    │
│   │  │             │  │             │  │  Management │  │   Engine    │ │    │
│   │  │ • Chat      │  │ • useChat   │  │             │  │             │ │    │
│   │  │ • Tool      │  │ • useTools  │  │ • AppState  │  │ • Terminal  │ │    │
│   │  │ • File      │  │ • useFiles  │  │ • Context   │  │ • Ink       │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                    Extension Layer                                   │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │    MCP      │  │    Hooks    │  │   Skills    │  │  Subagents  │ │    │
│   │  │  Servers    │  │  (scripts)  │  │ (domain)    │  │  (parallel) │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Plugins   │  │  Git        │  │   Tasks     │  │   Voice     │ │    │
│   │  │  (external) │  │  Worktrees  │  │  (todo)     │  │   Mode      │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Core Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | TypeScript (strict mode) |
| **Runtime** | Bun (not Node.js) |
| **UI Framework** | React + Ink (terminal React) |
| **Scale** | ~1,900 files · 512,000+ lines |
| **License** | Proprietary (closed source) |
| **Installation** | `npm install -g @anthropic-ai/claude-code` |
| **Models** | Claude 4, Claude Opus 4.6, Claude Sonnet |
| **Context** | 1M tokens (Opus 4.6) |
| **Protocols** | MCP (full support), ACP |

### 1.4 Tool System (~40 Built-in Tools)

| Category | Tools | Description |
|----------|-------|-------------|
| **File Operations** | Read, Edit, Create, Rename | Read/write files, create new, reorganize |
| **Search** | Glob, Grep, Find | Pattern matching, regex search, codebase explore |
| **Execution** | Bash, Run tests, Git ops | Shell commands, test runners, git workflows |
| **Web** | Search, Fetch | Web search, documentation lookup |
| **Code Intelligence** | LSP, Type errors | Jump to definition, find references |
| **Orchestration** | Task, TodoWrite | Subagents, task management |

### 1.5 TodoWrite Tool (Task Management)

```typescript
// TodoWrite Schema - Dependency Tracking (v2.1.16+)
interface Todo {
  content: string;        // What to do
  status: "pending" | "in_progress" | "completed";
  activeForm: string;     // What you're doing (progressive)
  dependencies?: string[]; // Prerequisites (NEW)
}

// Example
TodoWrite todos=[
  {
    "content": "Add authentication endpoint",
    "status": "in_progress",
    "activeForm": "Adding authentication endpoint",
    "dependencies": []  // No dependencies
  },
  {
    "content": "Write integration tests",
    "status": "pending",
    "activeForm": "Writing integration tests",
    "dependencies": ["Add authentication endpoint"]  // Depends on auth
  }
]
```

### 1.6 Subagents (Parallel Execution)

| Subagent Type | Purpose | Allowed Tools |
|---------------|---------|---------------|
| `Explore` | Fast codebase exploration | Glob, Grep, Read, Bash |
| `Plan` | Read-only planning mode | All read tools |
| `general-purpose` | Complex multi-step tasks | All tools |
| Custom | User-defined agents | Configurable |

```
Task subagent_type="Explore"
     prompt="Find all API endpoints and their authentication requirements"
```

### 1.7 Skills System

```yaml
# Skill Definition (YAML frontmatter)
---
name: pr-summary
description: Summarize changes in a pull request
context: fork              # Run in isolated subagent
agent: Explore             # Use Explore agent
allowed-tools: Bash(gh *)  # Restricted tool access
---

## Dynamic Context Injection
!`gh pr diff`             # Runs before sending to Claude
!`gh pr view --comments`

## Task
Summarize this pull request...
```

### 1.8 Git Worktrees (Experimental)

```bash
# Enable in settings.json
{
  "experimental": {
    "worktrees": true
  }
}

# Create isolated worktree session
gemini --worktree feature-search    # Named
gemini --worktree                    # Random name (worktree-a1b2c3d4)

# Exit preserves worktree (doesn't delete)
# Resume with session ID
cd .gemini/worktrees/feature-search
gemini --resume <session_id>

# Manual cleanup
git worktree remove .gemini/worktrees/feature-search --force
git branch -D worktree-feature-search
```

### 1.9 Claude Code Integration with AF-FORGE

| Claude Code Feature | AF-FORGE Mapping | Constitutional Layer |
|--------------------|------------------|---------------------|
| `CLAUDE.md` | `wiki/SCHEMA.md` | F2 Truth |
| TodoWrite | Task tracking | F4 Deliberation |
| Subagents | Trinity ΔΩΨ | F3 Niyyah |
| Git worktrees | Isolation | F7 Execution |
| MCP servers | Adapter Bus | F9 Anti-Hantu |
| Skills | Smith notes | F11 Memory |
| Hooks | Policy engine | F5 Uncertainty |

---

## Part 2: OpenCode AI

### 2.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| Official Docs | https://opencode.ai/docs | ✅ Active |
| GitHub | https://github.com/sst/opencode | ✅ Open Source (MIT) |
| Technical Deep Dive | https://github.com/bgauryy/open-docs | Community |

### 2.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OpenCode Architecture                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                        Client Layer                                  │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Terminal  │  │   Desktop   │  │ IDE Plugin  │  │   Server    │ │    │
│   │  │    (TUI)    │  │    (GUI)    │  │ (VS Code)   │  │   (HTTP)    │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Core Engine (Go/Bun)                            │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Session   │  │    Tool     │  │   LLM       │  │   Prompt    │ │    │
│   │  │   Manager   │  │   System    │  │  Providers  │  │  Processor  │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   ACP       │  │    MCP      │  │   LSP       │  │   Config    │ │    │
│   │  │  Protocol   │  │  Client     │  │ Integration │  │   System    │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                     Provider Layer                                   │    │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │    │
│   │  │ OpenAI  │ │Anthropic│ │  Google │ │  Local  │ │OpenCode │        │    │
│   │  │         │ │ (Claude)│ │ (Gemini)│ │ (Ollama)│ │   Zen   │        │    │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Key Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | Go (core), TypeScript/Bun (extensions) |
| **License** | MIT |
| **Installation** | Single binary (`curl -fsSL https://opencode.ai/install \| bash`) |
| **Package Managers** | npm, Homebrew, pacman, Mise, Docker |
| **Transport** | Stdio, HTTP, WebSocket |
| **Protocols** | ACP (Agent Client Protocol), MCP |

### 2.4 OpenCode Integration with AF-FORGE

| OpenCode Feature | AF-FORGE Mapping | Constitutional Layer |
|-----------------|------------------|---------------------|
| `AGENTS.md` | `wiki/SCHEMA.md` | F2 Truth (grounding) |
| `/plan` mode | 000_INIT → 444_JUDGE | F4 Deliberation |
| `/build` mode | 555_FORGE → 666_OPS | F3 Niyyah |
| `/undo` | 888_HOLD rollback | F1 Amanah |
| Tool execution | Risk-scored tools | F7 Execution |
| MCP servers | Adapter Bus | F9 Anti-Hantu |

---

## Part 3: Gemini CLI

### 3.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| Official Docs | https://geminicli.com/docs | ✅ Active |
| GitHub | https://github.com/google-gemini/gemini-cli | ✅ Open Source (Apache 2.0) |
| MCP Server Docs | https://geminicli.com/docs/tools/mcp-server/ | ✅ Detailed |

### 3.2 Core Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | TypeScript/Node.js |
| **License** | Apache 2.0 |
| **Installation** | `npm install -g @google/gemini-cli` |
| **Runtime** | Node.js 20+ |
| **Free Tier** | 60 requests/min, 1,000 requests/day |
| **Models** | Gemini 2.5 Pro (1M token context) |
| **Protocols** | MCP, A2A (Agent-to-Agent) |

### 3.3 MCP Integration Architecture

```
Discovery Layer (mcp-client.ts):
  1. Iterate configured servers (settings.json mcpServers)
  2. Establish connections (Stdio/SSE/Streamable HTTP)
  3. Fetch tool definitions via MCP protocol
  4. Sanitize and validate tool schemas
  5. Register in global ToolRegistry

Execution Layer (mcp-tool.ts):
  • Confirmation logic (trust-based bypass, allow-listing)
  • MCP server invocation
  • Response processing for LLM context and user display
```

### 3.4 Gemini CLI Integration with AF-FORGE

| Gemini CLI Feature | AF-FORGE Mapping | Constitutional Layer |
|-------------------|------------------|---------------------|
| `GEMINI.md` | `wiki/SCHEMA.md` | F2 Truth |
| Policy Engine | Risk scoring | F5 Uncertainty |
| Sandbox | Command isolation | F7 Execution |
| MCP Tools | Adapter Bus | F9 Anti-Hantu |
| Checkpoint | Session persistence | F11 Memory |

---

## Part 4: Kimi CLI (Moonshot AI)

### 4.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| GitHub | https://github.com/MoonshotAI/kimi-cli | ✅ Open Source (Apache 2.0) |
| PyPI | https://pypi.org/project/kimi-cli/ | ✅ Published |

### 4.2 Core Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | Python 3.11+ |
| **License** | Apache 2.0 |
| **Installation** | `pip install kimi-cli` |
| **Models** | Kimi K2.5 (1T params, 32B active MoE) |
| **Context** | 262K tokens |
| **Cost** | $0.60/$2.50 per million tokens (10x cheaper than Claude) |
| **Protocols** | MCP, ACP |

### 4.3 Kimi CLI Integration with AF-FORGE

| Kimi CLI Feature | AF-FORGE Mapping | Constitutional Layer |
|-----------------|------------------|---------------------|
| Context management | Short-term memory | F11 Memory |
| MCP tools | Adapter Bus | F9 Anti-Hantu |
| Shell mode | F7 Execution | Command sandboxing |
| Session persistence | VAULT999 audit | F12 Continuity |

---

## Part 5: Aider (AI Pair Programming)

### 5.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| Official Docs | https://aider.chat/docs/ | ✅ Active |
| GitHub | https://github.com/paul-gauthier/aider | ✅ Open Source (Apache 2.0) |

### 5.2 Core Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | Python |
| **License** | Apache 2.0 |
| **Installation** | `pip install aider-chat` |
| **Models** | Claude, GPT-4, Gemini, DeepSeek, Ollama (local) |
| **Git Integration** | Automatic commits with "(aider)" author |
| **Edit Format** | AST-aware unified diff |
| **Modes** | Code, Architect, Ask, Help |

### 5.3 Repository Map (Context Management)

```
Aider uses AST analysis to create a "repository map":
- File/function structure (not full content)
- Dependencies between modules
- Coding patterns and conventions

Token Budget Allocation:
- Repository structure + signatures: 40%
- Current file contents: 35%
- Related files (dependency analysis): 15%
- Chat history + examples: 10%
```

### 5.4 Aider Configuration Files

Created for AF-FORGE:
- `~/.aider/conf.yml` - Main configuration
- `~/.aider/instructions.md` - Project-specific instructions

Key features configured:
- Model: Claude 3.5 Sonnet
- Auto-commits with conventional commit format
- Secret detection patterns (F1 Amanah compliance)
- Constitutional system prompt (F1-F13)

### 5.5 Aider Integration with AF-FORGE

| Aider Feature | AF-FORGE Mapping | Constitutional Layer |
|--------------|------------------|---------------------|
| Repo map | Long-term memory | F11 Memory |
| Git commits | VAULT999 audit | F12 Continuity |
| AST analysis | Blueprint validation | F4 Deliberation |
| Multi-file coordination | Trinity ΔΩΨ | F3 Niyyah |

---

## Part 6: OpenAI Codex CLI

### 6.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| GitHub | https://github.com/openai/codex | ✅ Open Source (Apache 2.0) |
| Docs | https://platform.openai.com/docs/guides/codex-cli | Official |
| Features | https://developers.openai.com/codex/cli/features | Official |

### 6.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OpenAI Codex CLI Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Agent Loop (State Machine)                      │    │
│   │                                                                      │    │
│   │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │    │
│   │   │  Prompt  │───►│ Inference│───►│ Response │───►│  Tool    │     │    │
│   │   │ Assembly │    │          │    │ Stream   │    │ Response │     │    │
│   │   └──────────┘    └──────────┘    └──────────┘    └────┬─────┘     │    │
│   │                                                        │           │    │
│   │   └────────────────────────────────────────────────────┘           │    │
│   │                    ↑ (loop until complete)                         │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Core Components                                 │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Codex     │  │  Sandbox    │  │   Compaction│  │  Subagents  │ │    │
│   │  │   Core      │  │  (secure)   │  │   Engine    │  │  (parallel) │ │    │
│   │  │  (Rust)     │  │             │  │             │  │             │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │    MCP      │  │   Skills    │  │  Approval   │  │   Models    │ │    │
│   │  │   Client    │  │  System     │  │   Modes     │  │ (o4/gpt-5)  │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Core Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | Rust |
| **License** | Apache 2.0 |
| **Installation** | `npm install -g @openai/codex` |
| **Models** | o4-mini, gpt-5.4, gpt-5.3-codex |
| **Context** | ~128K-1M tokens (model dependent) |
| **Architecture** | Local-first, sandboxed execution |
| **Protocols** | MCP |

### 6.4 Key Features

#### Approval Modes
```bash
codex --approval-mode auto-edit      # Auto edit, ask for exec
codex --approval-mode full-auto      # Full autonomy
codex --approval-mode suggest-only   # Read-only suggestions
```

#### Context Compaction
```
When conversation exceeds token threshold:
  1. Call Responses API compaction endpoint
  2. Generate smaller representation of history
  3. Replace old input to avoid quadratic costs
```

#### Project Documentation (Layered)
```
~/.codex/instructions.md      # Personal global instructions
./codex.md                    # Shared project instructions
./subdir/codex.md             # Subpackage-specific details
```

### 6.5 Subagent Workflows

```bash
# Parallel task execution
codex "Implement feature X using 3 parallel subagents:
       - Agent 1: Design the API
       - Agent 2: Write tests
       - Agent 3: Document the feature"
```

### 6.6 Non-Interactive / CI Mode

```bash
# Headless execution for pipelines
codex -q "update CHANGELOG for next release"
codex --quiet --json "explain utils.ts"

# Resume previous runs
codex exec resume --last "Fix the race conditions"
```

### 6.7 Codex CLI Integration with AF-FORGE

| Codex CLI Feature | AF-FORGE Mapping | Constitutional Layer |
|------------------|------------------|---------------------|
| `codex.md` | `wiki/SCHEMA.md` | F2 Truth |
| Approval modes | 888_JUDGE gates | F1 Amanah |
| Compaction | Memory optimization | F11 Memory |
| Subagents | Trinity ΔΩΨ | F3 Niyyah |
| Sandbox | Execution isolation | F7 Execution |
| Skills | Smith notes | F11 Memory |

---

## Part 7: GitHub Copilot CLI

### 7.1 Official Documentation Sources

| Resource | URL | Status |
|----------|-----|--------|
| GitHub | https://github.com/github/copilot-cli | ✅ Active |
| Docs | https://docs.github.com/copilot/how-tos/copilot-cli | Official |
| Features | https://docs.github.com/en/copilot/get-started/features | Official |

### 7.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GitHub Copilot CLI Architecture                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      GitHub-Native Integration                       │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   GitHub    │  │   Issues    │  │     PRs     │  │   Actions   │ │    │
│   │  │   Repos     │  │             │  │             │  │             │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Git       │  │   Code      │  │   Review    │  │   Search    │ │    │
│   │  │   Commits   │  │   Browse    │  │   Suggest   │  │   Code      │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Agent Layer                                     │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Default   │  │   explore   │  │    task     │  │  research   │ │    │
│   │  │   Agent     │  │   Agent     │  │   Agent     │  │   Agent     │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │    │
│   │  │ code-review │  │ general-    │  │   Custom    │                   │    │
│   │  │   Agent     │  │  purpose    │  │   Agents    │                   │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                   │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Extension Layer                                 │    │
│   │                                                                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│   │  │   Skills    │  │    MCP      │  │   Custom    │  │  Autopilot  │ │    │
│   │  │   System    │  │  Servers    │  │   Agents    │  │    Mode     │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Core Technical Specifications

| Aspect | Specification |
|--------|---------------|
| **Language** | TypeScript/Node.js |
| **License** | Proprietary (GitHub/Microsoft) |
| **Installation** | `npm install -g @github/copilot` |
| **Default Model** | Claude Sonnet 4.5 (switchable) |
| **Alternative Models** | GPT-5, Gemini |
| **Protocols** | MCP |
| **Multi-repo** | ✅ Supported |
| **Plan Mode** | ✅ Yes (Shift+Tab) |

### 7.4 Key Features

#### GitHub-Native Integration
```
Unique capabilities (other CLIs don't have):
- Create PRs directly from terminal
- List/close Issues
- Review code with AI
- Access GitHub Actions
- Cross-repository workflows
```

#### Custom Agents
```yaml
# .github/agents/react-reviewer.md
---
name: react-reviewer
description: Focuses on React patterns and best practices
allowed-tools: [view, grep, glob]  # Read-only
infer: true  # Auto-delegate when React detected
---

Review React components for:
- Hook usage patterns
- Component composition
- Performance optimizations
```

#### Skills System
```
Skills vs Custom Instructions vs MCP:
┌─────────────────────┬────────────────────────────────────────────┐
│ Skills              │ Just-in-time, task-specific guidance       │
│ Custom Instructions │ Always-applied repository guidance         │
│ MCP                 │ New capabilities/tools                     │
└─────────────────────┴────────────────────────────────────────────┘

Invocation:
/skills list              # List available skills
/Markdown-Checker check README.md  # Use specific skill
```

#### Multi-Repository Workflows
```bash
# Option 1: Run from parent directory
cd ~/projects  # Contains multiple repos
copilot

# Option 2: Add directories dynamically
copilot
/add-dir /Users/me/projects/backend-service
/add-dir /Users/me/projects/shared-libs
/list-dirs

# Cross-repo task
"Update auth API. Changes span:
- @/Users/me/projects/api-gateway (routing)
- @/Users/me/projects/auth-service (logic)
- @/Users/me/projects/frontend (client)"
```

#### Autopilot Mode (Experimental)
```
Shift+Tab to cycle modes:
- Normal Mode: Step-by-step with confirmation
- Plan Mode: Read-only planning
- Autopilot Mode: Continuous execution until complete
```

### 7.5 Configuration

```bash
# Custom instructions
.github/copilot-instructions.md              # Repository-wide
.github/copilot-instructions/**/*.md         # Path-specific
AGENTS.md                                    # Agent files (compatible)

# Example copilot-instructions.md
## Build Commands
- Test: npm test
- Lint: npm run lint
- Build: npm run build

## Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
```

### 7.6 GitHub Copilot CLI Integration with AF-FORGE

| Copilot CLI Feature | AF-FORGE Mapping | Constitutional Layer |
|--------------------|------------------|---------------------|
| `copilot-instructions.md` | `wiki/SCHEMA.md` | F2 Truth |
| Plan Mode | 444_JUDGE gate | F4 Deliberation |
| Custom Agents | Trinity ΔΩΨ | F3 Niyyah |
| Skills | Smith notes | F11 Memory |
| MCP servers | Adapter Bus | F9 Anti-Hantu |
| Multi-repo | Federation | F10 Tawakkul |
| Autopilot | Full auto mode | F7 Execution |

---

## Part 8: Component Comparison Matrix

### 8.1 Feature Comparison

| Feature | Claude Code | OpenCode | Gemini CLI | Kimi CLI | Aider | Codex CLI | Copilot CLI |
|---------|-------------|----------|------------|----------|-------|-----------|-------------|
| **License** | Proprietary | MIT | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 | Proprietary |
| **Open Source** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Language** | TypeScript | Go/TS | TypeScript | Python | Python | Rust | TypeScript |
| **Runtime** | Bun | Bun/Go | Node.js | Python | Python | Native | Node.js |
| **Free Tier** | API costs | API costs | 1K req/day | Subscription | API costs | ChatGPT plan | Copilot sub |
| **Local Models** | ❌ | Ollama | ❌ | ❌ | Ollama | ❌ | ❌ |
| **MCP Support** | ✅ Full | ✅ Partial | ✅ Full | ✅ Full | ❌ | ✅ | ✅ |
| **Context Config** | CLAUDE.md | AGENTS.md | GEMINI.md | Project | .aider* | codex.md | copilot-instructions.md |
| **Plan Mode** | ✅ | `/plan` | ✅ | ❌ | Architect | ✅ | ✅ (Shift+Tab) |
| **Subagents** | ✅ (10) | ✅ | ✅ | Agent Swarm | ❌ | ✅ | ✅ |
| **Git Worktrees** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Undo/Rewind** | ✅ | `/undo` | Checkpoint | Resume | Git revert | Resume | `--resume` |
| **Sandbox** | ✅ | Basic | ✅ | Shell mode | ❌ | ✅ | ✅ |
| **Multi-repo** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Best For** | Enterprise | Multi-provider | Free usage | Cost-conscious | Git-native | OpenAI users | GitHub users |

### 8.2 Context Window & Cost

| Tool | Context Window | Cost (Input/Output) | SWE-Bench |
|------|----------------|---------------------|-----------|
| Claude Code (Opus 4.6) | 1M tokens | $5/$25 per M | 80.8% |
| Kimi K2.5 | 262K tokens | $0.60/$2.50 per M | 76.8% |
| Gemini 2.5 Pro | 1M tokens | Free tier / API | ~75% |
| GPT-5 (Codex) | 128K-1M | ChatGPT plan | ~78% |

### 8.3 Unique Differentiators

| Tool | Unique Feature | Why It Matters |
|------|----------------|----------------|
| **Claude Code** | Git worktrees + 10 subagents | Enterprise-scale parallel work |
| **OpenCode** | Multi-provider flexibility | No vendor lock-in |
| **Gemini CLI** | OAuth/IAP for remote MCP | Enterprise security |
| **Kimi CLI** | Cheapest cost + Agent Swarm | Budget-conscious at scale |
| **Aider** | AST-aware multi-file coordination | Precise refactoring |
| **Codex CLI** | Context compaction + Rust speed | Efficient long sessions |
| **Copilot CLI** | Native GitHub integration | Seamless GitHub workflow |

---

## Part 9: AF-FORGE Integration Architecture

### 9.1 Unified Component View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AF-FORGE Ω-MACHINE                                     │
│                    (Meta-Machine / The Forge)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                      Constitutional Layer (arifOS)                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │   │
│  │  │ F0 Sov. │ │ F1-F13  │ │888_JUDGE│ │999_SEAL │ │VAULT999 │          │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                     │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                      7-Component Adapter Bus                           │   │
│  │                                                                        │   │
│  │   Claude │ OpenCode │ Gemini │ Kimi │ Aider │ Codex │ Copilot         │   │
│  │      ↓        ↓        ↓       ↓      ↓       ↓       ↓               │   │
│  │   ┌────────────────────────────────────────────────────────────────┐   │   │
│  │   │                    InputEnvelope / OutputEnvelope               │   │   │
│  │   │  • Normalized tool schemas  • Constitutional injection          │   │   │
│  │   │  • Risk scoring            • Unified audit trail                │   │   │
│  │   └────────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                     │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                      Build Ritual (000_INIT → 999_SEAL)                │   │
│  │                                                                        │   │
│  │  000_INIT → 111_SENSE → 222_MIND → 333_HEART → 444_JUDGE              │   │
│  │                ↓                                                      │   │
│  │  555_FORGE → 666_OPS → 777_APEX → 999_SEAL → VAULT999                 │   │
│  │                                                                        │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Configuration Files Summary

| Component | Config File | Location | Purpose |
|-----------|-------------|----------|---------|
| **Claude Code** | `CLAUDE.md` | Repo root | Project context |
| **OpenCode** | `AGENTS.md` | Repo root | Agent instructions |
| **Gemini CLI** | `GEMINI.md` | Repo root | Project context |
| **Kimi CLI** | Project context | `.kimi/` | Session management |
| **Aider** | `conf.yml` | `~/.aider/` | Global settings |
| **Aider** | `instructions.md` | `~/.aider/` | Project guidance |
| **Codex CLI** | `config.yaml` | `~/.codex/` | Global settings |
| **Codex CLI** | `instructions.md` | `~/.codex/` | Personal guidance |
| **Codex CLI** | `codex.md` | Repo root | Project context |
| **Copilot CLI** | `copilot-instructions.md` | `.github/` | Repo guidance |
| **AF-FORGE** | `SCHEMA.md` | `wiki/` | Ω-Wiki Constitution |

---

## Appendix A: Official Documentation Links

### Claude Code
- Main: https://code.claude.com/docs
- How it Works: https://code.claude.com/docs/en/how-claude-code-works

### OpenCode
- Main: https://opencode.ai/docs
- GitHub: https://github.com/sst/opencode

### Gemini CLI
- Main: https://geminicli.com/docs
- GitHub: https://github.com/google-gemini/gemini-cli

### Kimi CLI
- GitHub: https://github.com/MoonshotAI/kimi-cli

### Aider
- Docs: https://aider.chat/docs/
- GitHub: https://github.com/paul-gauthier/aider

### OpenAI Codex CLI
- GitHub: https://github.com/openai/codex
- Docs: https://platform.openai.com/docs/guides/codex-cli

### GitHub Copilot CLI
- Docs: https://docs.github.com/copilot/how-tos/copilot-cli
- GitHub: https://github.com/github/copilot-cli

### MCP Protocol
- Specification: https://modelcontextprotocol.io/specification

---

**Seal:** VAULT999 | **Research Complete**

*"Seven tools, one constitution, infinite possibilities."*
