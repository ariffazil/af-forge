# AF-FORGE × OpenCode Alignment Map

> **Purpose:** Align OpenCode with AF-FORGE's constitutional, event-sourced agent runtime architecture.  
> **Date:** 2026-04-10  
> **Author:** OpenCode (MiniMax-M2.7) for Arif

---

## Executive Summary

**AF-FORGE** is a constitutionally-governed, event-sourced agent runtime with Planner/Executor/Verifier triad.  
**OpenCode** is a general-purpose AI coding agent (140K GitHub stars) with deep extensibility.

**Goal:** Run OpenCode *as* or *alongside* AF-FORGE, leveraging OpenCode's superior UX/UI while AF-FORGE provides governance, memory tiers, and constitutional floors.

---

## Architecture Comparison

| Dimension | AF-FORGE | OpenCode |
|-----------|----------|----------|
| **Core Loop** | Event-sourced state machine | LLM tool-calling loop |
| **Agents** | CoordinatorAgent + WorkerAgent + 5 profiles | Primary (build/plan) + Subagents |
| **Tools** | 6 tools (file, search, shell) | 13+ built-in + custom |
| **LLM Providers** | Mock, OpenAI Responses, Ollama | 75+ via Models.dev |
| **Memory** | ShortTerm + LongTerm + MemoryContract tiers | Session-based |
| **Governance** | F1-F13 constitutional floors + 888_HOLD | Permission system |
| **Event Sourcing** | Append-only hash-chained log | Session compaction |
| **Background Jobs** | BackgroundJobManager | Plugins + scheduler |
| **HTTP Bridge** | Port 7071 | Server mode (port 4096) |
| **Extensibility** | TypeScript classes | Plugins, MCP, Skills, Custom Tools |

---

## Component Mapping

### 1. Tools

| AF-FORGE Tool | OpenCode Built-in | OpenCode Custom Tool | Notes |
|---------------|-------------------|---------------------|-------|
| `read_file` | `read` | - | OpenCode's read supports line ranges |
| `write_file` | `write` | - | OpenCode's write overwrites files |
| `list_files` | `list` | - | OpenCode's list supports glob patterns |
| `grep_text` | `grep` | - | Uses ripgrep under the hood |
| `run_tests` | - | Create custom tool | Map to `npm test` / pytest runner |
| `run_command` | `bash` | - | Most powerful; needs permission controls |

**Recommended:** Create AF-FORGE MCP Server to expose all 6 tools uniformly.

### 2. Agent Profiles

| AF-FORGE Profile | Token Budget | Max Turns | OpenCode Agent | Mapping Strategy |
|------------------|--------------|-----------|----------------|-----------------|
| `explore` | 12,000 | 6 | `explore` subagent | Direct map - read-only exploration |
| `fix` | 20,000 | 8 | `build` + restrictions | Use `build` with limited turns |
| `test` | 10,000 | 4 | `build` restricted | Create `tester` subagent |
| `coordinator` | 24,000 | 10 | `general` + `build` | Use `general` for multi-task |
| `worker` | 8,000 | 5 | `build` restricted | Create `worker` subagent |

**Note:** OpenCode's `explore` subagent already exists and is read-only - perfect for AF-FORGE's `explore` profile.

### 3. LLM Providers

| AF-FORGE Provider | OpenCode Provider | Config |
|-------------------|-------------------|--------|
| `mock` | Use OpenCode's built-in mock | For testing |
| `openai_responses` | `openai/*` models | Set `OPENAI_API_KEY` |
| `ollama` | `ollama/*` models | Set `OLLAMA_BASE_URL` |

**Strategy:** OpenCode can use Ollama for local models, matching AF-FORGE's Ollama support.

### 4. Memory Architecture

| AF-FORGE | OpenCode Integration | Notes |
|----------|---------------------|-------|
| ShortTermMemory | OpenCode session messages | In-memory transcript |
| LongTermMemory | Plugin/External | Store in `~/.agent-workbench/memory.json` |
| MemoryContract | Skills system | Use SKILL.md for persistent instructions |

**Recommended:** Create plugin to sync OpenCode sessions with AF-FORGE LongTermMemory.

### 5. Governance Floors

| AF-FORGE Floor | Principle | OpenCode Permission/Plugin | Implementation |
|----------------|-----------|---------------------------|----------------|
| F3 Input Clarity | SABAR verdict | `question` tool + plugin | Validate empty/gibberish input |
| F4 Entropy | HOLD verdict | `tool.execute.before` hook | Track risk delta |
| F6 Harm/Dignity | VOID verdict | Permission denied | Block destructive patterns |
| F7 Confidence | HOLD verdict | Plugin | Detect overconfidence |
| F8 Grounding | HOLD verdict | Custom tool | Evidence counting |
| F9 Injection | VOID verdict | Plugin | Prompt injection detection |
| F11 Coherence | HOLD verdict | Custom tool | Contradiction detection |
| F13 Sovereign | 888_HOLD | Permission `ask` | Human approval gate |

**888_HOLD Equivalent:** OpenCode's `permission` system with `ask` mode acts as human approval gate.

### 6. Modes

| AF-FORGE Mode | OpenCode Equivalent | Notes |
|---------------|---------------------|-------|
| `internal_mode` | Full permissions | All tools allowed |
| `external_safe_mode` | Restricted permissions | `bash` denied, redaction active |

### 7. HTTP Bridge

| AF-FORGE | OpenCode | Integration |
|----------|----------|-------------|
| Port 7071 | Port 4096 (server mode) | AF-FORGE can run as MCP server |
| `/sense` endpoint | SDK `session.prompt()` | Constitutional checks via plugin |

### 8. Event Sourcing

| AF-FORGE | OpenCode | Notes |
|----------|----------|-------|
| Append-only log | Session compaction | OpenCode compacts context |
| Task state machine | Session status | Could add plugin for event sourcing |

### 9. Background Jobs

| AF-FORGE | OpenCode | Plugin |
|----------|----------|--------|
| BackgroundJobManager | `opencode-scheduler` | Community plugin exists |

---

## Implementation Roadmap

### Phase 1: Core Alignment (Do Now)

1. **Create AGENTS.md** for AF-FORGE workspace
2. **Create MCP Server** for AF-FORGE tools (run_command with policy)
3. **Create custom agents** matching AF-FORGE profiles
4. **Configure permissions** to match AF-FORGE's risk levels

### Phase 2: Governance Integration (Do Next)

1. **Create governance plugin** implementing F3-F11 floors
2. **Implement 888_HOLD** as permission ask mode
3. **Add constitutional prompts** to agent profiles
4. **Create approval workflow** via `question` tool

### Phase 3: Memory Integration (Do Later)

1. **Create memory plugin** syncing with AF-FORGE LongTermMemory
2. **Implement MemoryContract tiers** as OpenCode Skills
3. **Add session event logging** for replay capability

### Phase 4: Advanced Features (Future)

1. **Multi-agent orchestration** via OpenCode subagents
2. **Background job scheduling** via `opencode-scheduler`
3. **A2A agent discovery** integration

---

## Files to Create

### 1. `.opencode/agents/forge-explore.md`
Read-only agent for AF-FORGE exploration.

### 2. `.opencode/agents/forge-coordinator.md`
Multi-task coordinator agent.

### 3. `.opencode/agents/forge-worker.md`
Restricted worker agent for subtasks.

### 4. `.opencode/plugins/governance.ts`
Plugin implementing constitutional floors.

### 5. `.opencode/plugins/afforgemcp.ts`
MCP server bridging AF-FORGE tools.

### 6. `.opencode/skills/constitution/SKILL.md`
Constitutional principles as skill.

### 7. `.opencode/tools/run-tests.ts`
AF-FORGE run_tests custom tool.

### 8. `opencode.json`
Main config with AF-FORGE settings.

---

## OpenCode Configuration for AF-FORGE

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "ollama/llama3.2",
  "permission": {
    "bash": "ask",
    "edit": "ask",
    "run_tests": "allow",
    "forge_*": "allow"
  },
  "mcp": {
    "afforge": {
      "type": "local",
      "command": ["node", "dist/src/server.js"],
      "enabled": true
    }
  },
  "agent": {
    "forge-explore": {
      "description": "AF-FORGE exploration agent - read-only repository analysis",
      "mode": "subagent",
      "permission": {
        "edit": "deny",
        "bash": "deny"
      }
    },
    "forge-coordinator": {
      "description": "AF-FORGE coordinator - multi-agent task orchestration",
      "mode": "subagent",
      "permission": {
        "bash": "ask"
      }
    }
  }
}
```

---

## Constitutional Prompt for OpenCode Agents

```
You are operating under arifOS constitutional principles:

F1 Amanah - No irreversible action without human approval (VAULT999/888_HOLD)
F2 Truth - No ungrounded claims (evidence threshold τ ≥ 0.99)  
F9 Anti-Hantu - No deception or manipulation
F13 Sovereign - Human (Arif) holds final authority

For dangerous operations (destructive, credential, infra_mutation), 
you must request approval via the question tool before proceeding.
```

---

## Skill: Constitutional Advisor

**File:** `.opencode/skills/constitutional-advisor/SKILL.md`

```markdown
---
name: constitutional-advisor
description: Applies arifOS F1-F13 constitutional principles to agent decisions
license: MIT
compatibility: opencode
metadata:
  author: Arif
  version: 1.0
---

## Constitutional Principles

You must apply these principles to all agent actions:

### F1 Amanah (Trust)
- No irreversible actions without 888_HOLD approval
- Destructive tools require explicit human consent

### F2 Truth (Evidence)
- All claims must have supporting evidence
- Use grounding tool to verify claims

### F9 Anti-Hantu (Anti-Deception)
- No manipulation, deception, or hidden agendas
- All tool use must be transparent

### F13 Sovereign (Human Authority)
- Human (Arif) has final decision authority
- Use question tool for approval on high-risk actions

## Risk Levels
- safe: Immediate execution allowed
- guarded: Proceed with caution
- dangerous: Request 888_HOLD approval
```

---

## MCP Server for AF-FORGE

Expose AF-FORGE as MCP server for OpenCode:

```json
{
  "mcp": {
    "afforge-tools": {
      "type": "local",
      "command": ["node", "dist/src/mcp-server.js"],
      "enabled": true
    }
  }
}
```

Tools exposed:
- `forge_read_file` - Read files with sandboxing
- `forge_write_file` - Write files with approval
- `forge_run_command` - Run with policy enforcement
- `forge_governance_check` - Run constitutional floors

---

## Plugin: Governance Engine

**File:** `.opencode/plugins/governance.ts`

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const GovernancePlugin: Plugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      const tool = input.tool
      
      // F4 Entropy - Risk delta tracking
      if (tool === "bash" || tool === "write") {
        const risk = assessRisk(input)
        if (risk === "critical") {
          throw new Error("F13 SOVEREIGN: 888_HOLD required for critical operations")
        }
      }
      
      // F9 Injection - Prompt injection detection  
      if (input.tool === "bash") {
        if (detectInjection(input.args.command)) {
          throw new Error("F9 ANTI-HANTU: Prompt injection detected")
        }
      }
    },
    
    "permission.asked": async (input, output) => {
      // Show constitutional context in permission prompt
      output.context = {
        principle: identifyPrinciple(input.tool),
        riskLevel: assessRisk(input)
      }
    }
  }
}
```

---

## Summary: What You Get

| AF-FORGE Feature | OpenCode Integration | Benefit |
|-------------------|---------------------|---------|
| Constitutional governance | Plugin + Permissions | Human sovereignty over AI actions |
| 888_HOLD gate | Permission `ask` mode | Approval workflow for dangerous ops |
| Event-sourced audit | Session logging plugin | Full replay capability |
| Memory tiers | Skills + External storage | Persistent institutional memory |
| Multi-agent coordination | Subagent system | Parallel task execution |
| Tool risk levels | Permission system | Fine-grained access control |
| Planner/Executor/Verifier | Agent profiles + Tools | Structured task completion |

**Result:** OpenCode gains AF-FORGE's constitutional rigor while AF-FORGE gains OpenCode's UX, ecosystem, and 140K community.

---

## Next Steps

1. ✅ Understand both architectures (Done)
2. ⬜ Create AGENTS.md for AF-FORGE workspace
3. ⬜ Create custom agent profiles
4. ⬜ Create governance plugin
5. ⬜ Create MCP server for AF-FORGE tools
6. ⬜ Configure permissions and modes
7. ⬜ Test full integration
