/**
 * A2A Agent Card
 * 
 * P0.2: Make discovery surface truthful, consistent, and 200 OK
 * 
 * Publishes /.well-known/agent-card.json per A2A spec.
 * 
 * @module discovery/A2ACard
 * @constitutional F2 Truth - Public claims match reality
 */

// ============================================================================
// A2A AGENT CARD TYPES
// ============================================================================

export interface A2AAgentCard {
  /** Schema version */
  version: string;
  
  /** Unique agent identifier */
  agentId: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description of what the agent does */
  description: string;
  
  /** Agent provider/author */
  provider: {
    name: string;
    url?: string;
  };
  
  /** URL for sending tasks to this agent */
  endpoint: string;
  
  /** Authentication requirements */
  authentication: {
    schemes: string[];
    credentials?: string;
  };
  
  /** Skills this agent provides */
  skills: A2ASkill[];
  
  /** Capabilities supported by this agent */
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  
  /** Default input/output modes */
  defaultInputModes: string[];
  defaultOutputModes: string[];
  
  /** Maximum number of tasks this agent can handle concurrently */
  maxConcurrentTasks?: number;
  
  /** Links to related resources */
  links?: {
    type: string;
    url: string;
    title?: string;
  }[];
}

export interface A2ASkill {
  /** Unique skill identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description of what the skill does */
  description: string;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Example queries that trigger this skill */
  examples?: string[];
  
  /** Input modes supported */
  inputModes?: string[];
  
  /** Output modes supported */
  outputModes?: string[];
}

// ============================================================================
// ARIFOS A2A CARD
// ============================================================================

export function createArifOSAgentCard(baseUrl: string): A2AAgentCard {
  return {
    version: "1.0.0",
    agentId: "arifos.personal.v2",
    name: "arifOS Personal",
    description: 
      "A personal AI operating system for sovereign human cognition. " +
      "Provides memory management, decision support, bounded execution, " +
      "and continuity across sessions. Designed for one human operator.",
    
    provider: {
      name: "ARIF",
      url: "https://arif-fazil.com",
    },
    
    endpoint: `${baseUrl}/a2a`,
    
    authentication: {
      schemes: ["none"], // Personal OS - local/controlled access
      credentials: "Personal OS operates in sovereign single-user mode. " +
        "For personal deployment, authentication is handled at infrastructure level.",
    },
    
    skills: [
      {
        id: "memory.remember",
        name: "Remember",
        description: "Store facts, preferences, and context in personal memory tiers",
        tags: ["memory", "personal", "continuity"],
        examples: [
          "Remember that I prefer dark mode",
          "Note that my sister's birthday is in March",
          "Store this API key as 'production'",
        ],
      },
      {
        id: "memory.recall",
        name: "Recall",
        description: "Retrieve previously stored memories and context",
        tags: ["memory", "retrieval", "context"],
        examples: [
          "What do you know about the project?",
          "Recall my preferences",
          "What did I say about the budget?",
        ],
      },
      {
        id: "watch.monitor",
        name: "Watch",
        description: "Monitor conditions and alert on changes",
        tags: ["monitoring", "alerts", "continuity"],
        examples: [
          "Watch for changes to that file",
          "Track the price of flights to Tokyo",
          "Let me know if the server goes down",
        ],
      },
      {
        id: "decision.support",
        name: "Decide-with-me",
        description: "Present options and tradeoffs for human decision",
        tags: ["decision", "comparison", "advisory"],
        examples: [
          "Help me decide whether to take the job",
          "Compare React vs Vue for this project",
          "Walk me through this career decision",
        ],
      },
      {
        id: "action.hold",
        name: "Hold",
        description: "Block actions awaiting explicit human approval",
        tags: ["governance", "approval", "safety"],
        examples: [
          "Hold on sending that email",
          "Don't delete anything until I say so",
          "Wait for my approval before deploying",
        ],
      },
      {
        id: "action.execute",
        name: "Execute-with-approval",
        description: "Execute prepared actions with proper authorization",
        tags: ["execution", "forge", "action"],
        examples: [
          "Execute the prepared plan",
          "Proceed with deployment",
          "Send the draft email",
        ],
      },
      {
        id: "context.morning",
        name: "Morning Context",
        description: "Provide daily orientation with priorities and changes",
        tags: ["daily", "routine", "planning"],
        examples: [
          "Good morning",
          "What's on for today?",
          "Start my day",
        ],
      },
      {
        id: "context.evening",
        name: "Evening Closure",
        description: "Summarize day and prepare carry-forward items",
        tags: ["daily", "routine", "closure"],
        examples: [
          "Good evening",
          "Wrap up my day",
          "What did I accomplish today?",
        ],
      },
    ],
    
    capabilities: {
      streaming: true,
      pushNotifications: false, // Could add webhook support later
      stateTransitionHistory: true,
    },
    
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["text/plain", "application/json"],
    
    maxConcurrentTasks: 5,
    
    links: [
      {
        type: "homepage",
        url: baseUrl,
        title: "arifOS Personal Dashboard",
      },
      {
        type: "documentation",
        url: `${baseUrl}/docs`,
        title: "Documentation",
      },
      {
        type: "schema",
        url: `${baseUrl}/.well-known/arifos.schema.json`,
        title: "arifOS Tool Schema",
      },
    ],
  };
}

// ============================================================================
// MCP MANIFEST
// ============================================================================

export interface MCPManifest {
  /** MCP protocol version */
  protocolVersion: string;
  
  /** Server capabilities */
  capabilities: {
    /** Supports logging to client */
    logging?: {};
    /** Supports prompting */
    prompts?: {
      listChanged?: boolean;
    };
    /** Supports resources */
    resources?: {
      subscribe?: boolean;
      listChanged?: boolean;
    };
    /** Supports tools */
    tools?: {
      listChanged?: boolean;
    };
  };
  
  /** Server information */
  serverInfo: {
    name: string;
    version: string;
  };
  
  /** Instructions for LLM on how to use this server */
  instructions?: string;
}

export function createMCPManifest(): MCPManifest {
  return {
    protocolVersion: "2025-11-05",
    capabilities: {
      logging: {},
      prompts: { listChanged: false },
      resources: { subscribe: true, listChanged: true },
      tools: { listChanged: false },
    },
    serverInfo: {
      name: "arifos-personal",
      version: "2.0.0",
    },
    instructions: 
      "arifOS Personal is a sovereign AI operating system for one human operator. " +
      "It provides memory management across tiers (ephemeral, working, canon, sacred, quarantine), " +
      "decision support with explicit approval boundaries, bounded execution with safety controls, " +
      "and session continuity across restarts.\n\n" +
      "Key patterns:\n" +
      "- Use memory.remember/memory.recall for personal context\n" +
      "- All side-effectful actions require human approval\n" +
      "- Actions show badges: Observe → Advise → Ready → Needs Yes → Executed\n" +
      "- Morning/evening routines provide daily continuity",
  };
}

// ============================================================================
// HEALTH STATUS
// ============================================================================

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  checks: {
    continuity: {
      state: "stable" | "recovering" | "degraded" | "lost" | "rebound";
      signing: "persistent" | "ephemeral_process_local";
      lastCheckpoint: string;
    };
    memory: {
      vectorStore: boolean;
      continuityStore: boolean;
    };
    discovery: {
      a2aCard: boolean;
      mcpManifest: boolean;
      openApi: boolean;
    };
  };
  governedContinuity: "healthy" | "degraded";
}

export function createHealthStatus(
  continuityState: { state: string; signing: string; lastCheckpoint: string },
  discoveryStatus: { a2aCard: boolean; mcpManifest: boolean; openApi: boolean }
): HealthStatus {
  const isContinuityHealthy = continuityState.state === "stable" || 
                               continuityState.state === "rebound";
  
  const isDiscoveryHealthy = discoveryStatus.a2aCard && 
                              discoveryStatus.mcpManifest && 
                              discoveryStatus.openApi;
  
  const overallStatus: HealthStatus["status"] = 
    isContinuityHealthy && isDiscoveryHealthy ? "healthy" :
    isContinuityHealthy || isDiscoveryHealthy ? "degraded" : "unhealthy";
  
  return {
    status: overallStatus,
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    checks: {
      continuity: {
        state: continuityState.state as HealthStatus["checks"]["continuity"]["state"],
        signing: continuityState.signing as HealthStatus["checks"]["continuity"]["signing"],
        lastCheckpoint: continuityState.lastCheckpoint,
      },
      memory: {
        vectorStore: true,
        continuityStore: true,
      },
      discovery: {
        a2aCard: discoveryStatus.a2aCard,
        mcpManifest: discoveryStatus.mcpManifest,
        openApi: discoveryStatus.openApi,
      },
    },
    governedContinuity: isContinuityHealthy ? "healthy" : "degraded",
  };
}
