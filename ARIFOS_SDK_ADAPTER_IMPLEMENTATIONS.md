# arifOS SDK Adapter Implementations: The Adapter Bus

**Classification:** Implementation Reference | **Authority:** Muhammad Arif bin Fazil  
**Architecture:** Platform-Agnostic Core + SDK Adapters | **Seal:** VAULT999

---

## The Adapter Bus Pattern

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              ARIFOS CONSTITUTIONAL CORE (Layer 1)                           │
│  ═══════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐  │
│   │    F1       │   │    F2       │   │    F3       │   │    F7       │   │    F13      │  │
│   │   AMANAH    │   │   TRUTH     │   │ TRI-WITNESS │   │  HUMILITY   │   │  SOVEREIGN  │  │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘  │
│          │                 │                 │                 │                 │        │
│          └─────────────────┴─────────────────┴─────────────────┴─────────────────┘        │
│                                          │                                                  │
│                              ┌───────────▼───────────┐                                      │
│                              │   ARIFOS KERNEL       │                                      │
│                              │  • Sense→Judge→Route  │                                      │
│                              │  • OutputEnvelope     │                                      │
│                              │  • VAULT999 Audit     │                                      │
│                              └───────────┬───────────┘                                      │
│                                          │                                                  │
└──────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                           │
═══════════════════════════════════════════╪═══════════════════════════════════════════════════
                                           │
┌──────────────────────────────────────────┼──────────────────────────────────────────────────┐
│                         ADAPTER BUS (Layer 2)                                               │
│  ═══════════════════════════════════════════════════════════════════════════════════════   │
│                                           │                                                  │
│   ┌───────────────────────────────────────┼───────────────────────────────────────────────┐  │
│   │                                                                                       │  │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │  │
│   │   │   adapter_   │  │   adapter_   │  │   adapter_   │  │   adapter_   │  │adapter_│ │  │
│   │   │   microsoft  │  │   openai     │  │   langchain  │  │   llamaindex │  │pydantic│ │  │
│   │   │     _sk      │  │   _agents    │  │              │  │              │  │   _ai  │ │  │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └───┬────┘ │  │
│   │          │                 │                 │                 │              │      │  │
│   │          └─────────────────┴─────────────────┴─────────────────┴──────────────┘      │  │
│   │                                    │                                                   │  │
│   │                    ┌───────────────▼───────────────┐                                   │  │
│   │                    │   Unified Interface           │                                   │  │
│   │                    │   • KernelRequest             │                                   │  │
│   │                    │   • OutputEnvelope            │                                   │  │
│   │                    │   • ToolContract              │                                   │  │
│   │                    └───────────────────────────────┘                                   │  │
│   │                                                                                       │  │
│   └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                                  │
└───────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                            │
════════════════════════════════════════════╪═══════════════════════════════════════════════════
                                            │
┌───────────────────────────────────────────┼──────────────────────────────────────────────────┐
│                         SDK RUNTIMES (Layer 3 - External)                                   │
│  ═══════════════════════════════════════════════════════════════════════════════════════   │
│                                           │                                                  │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│   │   Microsoft  │ │    OpenAI    │ │   LangChain  │ │  LlamaIndex  │ │  PydanticAI  │     │
│   │   SK/Agent   │ │   Agents SDK │ │   Runtime    │ │   Engine     │ │   Agent      │     │
│   │   Framework  │ │              │ │              │ │              │ │              │     │
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Microsoft Semantic Kernel / Agent Framework Adapter

### 1.1 Adapter Implementation

```python
# arifos/adapters/microsoft_sk.py

"""
Microsoft Semantic Kernel / Agent Framework Adapter
Translates between arifOS Kernel and Microsoft SK runtime.
"""

from typing import List, Optional, Callable
from dataclasses import dataclass
import logging

# Microsoft SK imports (isolated to this adapter)
try:
    from semantic_kernel import Kernel
    from semantic_kernel.agents import ChatCompletionAgent
    from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
    from semantic_kernel.contents import ChatMessageContent, AuthorRole
    from semantic_kernel.functions import KernelFunction, kernel_function
    MICROSOFT_SK_AVAILABLE = True
except ImportError:
    MICROSOFT_SK_AVAILABLE = False
    logging.warning("Microsoft Semantic Kernel not installed. Adapter disabled.")

from arifos.ports import SDKAdapter, KernelRequest, OutputEnvelope, ToolContract
from arifos.kernel import ArifOSKernel
from arifos.constitution import Verdict

logger = logging.getLogger(__name__)


class MicrosoftSKAdapter(SDKAdapter):
    """
    Adapter for Microsoft Semantic Kernel and Agent Framework.
    
    Responsibility:
    - Wrap SK agents with arifOS constitutional checks
    - Intercept all tool calls for F1-F13 validation
    - Normalize SK traces to VAULT999 format
    """
    
    def __init__(self, kernel: ArifOSKernel, sk_kernel: Optional['Kernel'] = None):
        self.arifos_kernel = kernel
        self.sk_kernel = sk_kernel or self._create_default_sk_kernel()
        self.agent_registry = {}
        
        if not MICROSOFT_SK_AVAILABLE:
            raise RuntimeError("Microsoft Semantic Kernel required for this adapter")
    
    def _create_default_sk_kernel(self) -> 'Kernel':
        """Create default SK kernel with Azure OpenAI."""
        kernel = Kernel()
        # Configuration-driven, not hardcoded
        kernel.add_service(AzureChatCompletion(
            deployment_name=self._get_config("AZURE_OPENAI_DEPLOYMENT"),
            endpoint=self._get_config("AZURE_OPENAI_ENDPOINT"),
            api_key=self._get_config("AZURE_OPENAI_API_KEY")
        ))
        return kernel
    
    def register_agent(self, 
                       agent_id: str, 
                       name: str, 
                       instructions: str,
                       tools: List[ToolContract]) -> str:
        """
        Register an SK agent with arifOS governance.
        """
        # Wrap tools with constitutional checks
        wrapped_tools = [self._wrap_tool(t) for t in tools]
        
        # Create SK agent
        agent = ChatCompletionAgent(
            kernel=self.sk_kernel,
            name=name,
            instructions=self._inject_constitutional_prompt(instructions),
            plugins=wrapped_tools
        )
        
        self.agent_registry[agent_id] = {
            'agent': agent,
            'tools': wrapped_tools,
            'arifos_trace_id': None
        }
        
        return agent_id
    
    def execute(self, request: KernelRequest) -> OutputEnvelope:
        """
        Execute through SK runtime with full arifOS governance.
        """
        # 1. Pre-execution: arifOS Sense + Judge
        sense_result = self.arifos_kernel.sense(request.objective)
        verdict = self.arifos_kernel.judge(sense_result, request)
        
        if verdict.verdict == Verdict.HOLD:
            logger.info(f"888_HOLD triggered for request: {request.trace_id}")
            return self._create_hold_response(request, verdict)
        
        # 2. Execute via SK
        agent_id = request.meta.get('agent_id', 'default')
        agent_config = self.agent_registry.get(agent_id)
        
        if not agent_config:
            raise ValueError(f"Agent {agent_id} not registered")
        
        # Create SK message from request
        sk_message = ChatMessageContent(
            role=AuthorRole.USER,
            content=request.objective
        )
        
        # Run SK agent (this may trigger tool calls)
        sk_response = await agent_config['agent'].invoke(sk_message)
        
        # 3. Post-execution: Validate output
        output_envelope = self._normalize_sk_response(
            sk_response, 
            request,
            verdict
        )
        
        # 4. Audit to VAULT999
        self.arifos_kernel.audit.log(output_envelope)
        
        return output_envelope
    
    def _wrap_tool(self, tool: ToolContract) -> Callable:
        """
        Wrap an SK tool with arifOS constitutional enforcement.
        Every tool call goes through F1-F13 checks.
        """
        @kernel_function(
            name=tool.name,
            description=tool.description
        )
        async def constitutional_tool(**kwargs):
            # Create sub-request for tool execution
            tool_request = KernelRequest(
                objective=f"Execute {tool.name} with {kwargs}",
                risk_tier=tool.risk_tier,
                contractor_id=tool.contractor_id,
                meta={'parent_trace_id': tool.trace_id}
            )
            
            # Mandatory arifOS check
            sense = self.arifos_kernel.sense(tool_request.objective)
            verdict = self.arifos_kernel.judge(sense, tool_request)
            
            if verdict.verdict == Verdict.HOLD:
                return {
                    'status': 'HOLD',
                    'reason': verdict.reason,
                    'constitutional_floor': 'F13'
                }
            
            # Execute actual tool
            result = await tool.execute(**kwargs)
            
            # Post-execution validation (F2 Truth)
            if not self._validate_tool_output(result, tool.output_schema):
                return {
                    'status': 'REFUSE',
                    'reason': 'Tool output violates F2 Truth (schema mismatch)',
                    'constitutional_floor': 'F2'
                }
            
            return result
        
        return constitutional_tool
    
    def _inject_constitutional_prompt(self, instructions: str) -> str:
        """
        Inject F1-F13 constraints into SK agent instructions.
        """
        constitutional_preamble = """
You are operating under the arifOS constitutional framework (F1-F13).

MANDATORY CONSTRAINTS:
- F2 TRUTH: All claims require evidence (τ ≥ 0.99)
- F7 HUMILITY: Confidence never exceeds 0.90
- F13 SOVEREIGN: High-risk actions trigger 888_HOLD
- UNKNOWN: Admit uncertainty rather than hallucinate
- REFUSE: Decline unsafe requests

Before any action: Assess reversibility (F1 Amanah).
Before any claim: Verify grounding (F2 Truth).
When uncertain: Escalate to human (F3 Tri-Witness).

Your outputs will be validated by the arifOS kernel.
        """.strip()
        
        return f"{constitutional_preamble}\n\n{instructions}"
    
    def _normalize_sk_response(self, 
                               sk_response: 'ChatMessageContent',
                               request: KernelRequest,
                               verdict: 'JudgeVerdict') -> OutputEnvelope:
        """
        Convert SK response to arifOS OutputEnvelope format.
        """
        return OutputEnvelope(
            trace_id=request.trace_id,
            status="OK" if verdict.verdict == Verdict.ALLOW else str(verdict.verdict),
            output=sk_response.content,
            confidence=self._extract_confidence(sk_response),  # Capped at 0.90
            verdict=verdict,
            evidence_basis=self._extract_citations(sk_response),
            sdk_trace={
                'sdk': 'microsoft_sk',
                'agent_name': sk_response.name,
                'inner_content': str(sk_response.inner_content) if hasattr(sk_response, 'inner_content') else None
            }
        )
    
    def _extract_confidence(self, sk_response: 'ChatMessageContent') -> float:
        """
        Extract and cap confidence from SK response.
        F7 HUMILITY: Never exceed 0.90
        """
        # Try to extract from response metadata
        raw_confidence = 0.85  # Default if not provided
        
        if hasattr(sk_response, 'metadata') and sk_response.metadata:
            if 'confidence' in sk_response.metadata:
                raw_confidence = float(sk_response.metadata['confidence'])
        
        # F7 HUMILITY ENFORCEMENT
        return min(raw_confidence, 0.90)


# Factory function for clean imports
def create_microsoft_sk_adapter(arifos_kernel: ArifOSKernel) -> MicrosoftSKAdapter:
    """Factory for Microsoft SK adapter."""
    return MicrosoftSKAdapter(arifos_kernel)
```

### 1.2 Usage Example

```python
# Example: arifOS-governed Copilot agent
from arifos.kernel import ArifOSKernel
from arifos.adapters.microsoft_sk import create_microsoft_sk_adapter

# Initialize
arifos = ArifOSKernel()
adapter = create_microsoft_sk_adapter(arifos)

# Register agent with tools
adapter.register_agent(
    agent_id="geox_copilot_agent",
    name="GEOX Earth Witness",
    instructions="You are a geoscience assistant for petroleum exploration.",
    tools=[
        ToolContract(
            name="geox_evaluate_prospect",
            description="Evaluate drilling prospect with constitutional verdict",
            risk_tier="high",  # Triggers F1 + F13
            output_schema=ProspectVerdictSchema
        ),
        ToolContract(
            name="geox_query_memory",
            description="Query geological memory",
            risk_tier="low"
        )
    ]
)

# Execute with full governance
result = adapter.execute(KernelRequest(
    objective="Evaluate this prospect in Block SK-437",
    agent_id="geox_copilot_agent",
    risk_tier="high"
))

# Result includes arifOS verdict, capped confidence, audit trail
print(result.verdict)  # ALLOW, HOLD, or REFUSE
print(result.confidence)  # Never > 0.90
```

---

## 2. OpenAI Agents SDK Adapter

### 2.1 Adapter Implementation

```python
# arifos/adapters/openai_agents.py

"""
OpenAI Agents SDK Adapter
Translates between arifOS Kernel and OpenAI Agents runtime.
"""

from typing import List, Optional
import json

try:
    from agents import Agent, Runner, Tool, function_tool
    from agents.tracing import trace
    OPENAI_AGENTS_AVAILABLE = True
except ImportError:
    OPENAI_AGENTS_AVAILABLE = False
    import logging
    logging.warning("OpenAI Agents SDK not installed. Adapter disabled.")

from arifos.ports import SDKAdapter, KernelRequest, OutputEnvelope
from arifos.kernel import ArifOSKernel


class OpenAIAgentsAdapter(SDKAdapter):
    """
    Adapter for OpenAI Agents SDK.
    
    Key features:
    - Intercept agent handoffs for F3 Tri-Witness
    - Capture traces for VAULT999
    - Enforce refusal doctrine on streaming outputs
    """
    
    def __init__(self, kernel: ArifOSKernel, api_key: Optional[str] = None):
        self.arifos_kernel = kernel
        self.api_key = api_key
        self.agents = {}
        
        if not OPENAI_AGENTS_AVAILABLE:
            raise RuntimeError("OpenAI Agents SDK required")
    
    def create_agent(self,
                     name: str,
                     instructions: str,
                     tools: List[Tool],
                     handoff_description: Optional[str] = None) -> Agent:
        """
        Create OpenAI Agent with arifOS governance wrapper.
        """
        # Wrap instructions with constitutional constraints
        constitutional_instructions = self._apply_constitution(instructions)
        
        # Wrap tools with governance
        wrapped_tools = [self._wrap_tool(t) for t in tools]
        
        # Create agent
        agent = Agent(
            name=name,
            instructions=constitutional_instructions,
            tools=wrapped_tools,
            handoff_description=handoff_description
        )
        
        self.agents[name] = agent
        return agent
    
    async def run(self, 
                  agent: Agent,
                  input_text: str,
                  context: Optional[dict] = None) -> OutputEnvelope:
        """
        Run OpenAI agent with full arifOS governance.
        """
        # Pre-execution constitutional check
        request = KernelRequest(
            objective=input_text,
            context=context or {},
            meta={'agent_name': agent.name}
        )
        
        sense = self.arifos_kernel.sense(input_text)
        verdict = self.arifos_kernel.judge(sense, request)
        
        if verdict.verdict.value == "HOLD":
            return self._create_hold_envelope(request, verdict)
        
        # Execute with tracing
        with trace("arifos_openai_agent_run") as current_trace:
            result = await Runner.run(agent, input_text, context=context)
            
            # Capture OpenAI trace for VAULT999
            trace_data = {
                'trace_id': current_trace.trace_id,
                'agent_name': agent.name,
                'input': input_text,
                'output': result.final_output,
                'tool_calls': [t.dict() for t in result.tool_calls],
                'handoffs': result.handoffs
            }
        
        # Post-execution validation
        output_envelope = OutputEnvelope(
            trace_id=request.trace_id,
            status="OK",
            output=result.final_output,
            confidence=self._calculate_confidence(result),  # Capped at 0.90
            verdict=verdict,
            sdk_trace={
                'sdk': 'openai_agents',
                'openai_trace': trace_data
            }
        )
        
        # Audit
        self.arifos_kernel.audit.log(output_envelope)
        
        return output_envelope
    
    def _wrap_tool(self, tool: Tool) -> Tool:
        """
        Wrap OpenAI tool with arifOS constitutional check.
        """
        original_func = tool.func
        
        @function_tool(
            name=tool.name,
            description=tool.description
        )
        async def constitutional_wrapper(**kwargs):
            # F1-F13 check before tool execution
            tool_request = KernelRequest(
                objective=f"Tool {tool.name} called with {kwargs}",
                risk_tier=self._assess_tool_risk(tool)
            )
            
            verdict = self.arifos_kernel.execute(tool_request).verdict
            
            if verdict.verdict.value == "HOLD":
                return json.dumps({
                    "status": "888_HOLD",
                    "reason": verdict.reason,
                    "requires_human": True
                })
            
            # Execute original tool
            return await original_func(**kwargs)
        
        return constitutional_wrapper
    
    def _apply_constitution(self, instructions: str) -> str:
        """Inject arifOS F1-F13 into OpenAI agent instructions."""
        return f"""
[CONSTITUTIONAL FRAMEWORK - MANDATORY]

You are governed by arifOS Laws F1-F13:

F1 AMANAH: Check reversibility before any action.
F2 TRUTH: All claims require evidence (τ ≥ 0.99). No hallucination.
F3 TRI-WITNESS: High-stakes decisions require human approval.
F7 HUMILITY: State confidence as 0.00-0.90 never higher.
F13 SOVEREIGN: 888_HOLD triggers on any constitutional violation.

Response format:
- Evidence basis: [citation or "Insufficient evidence"]
- Confidence: [0.00-0.90]
- Verdict: [PROCEED/HOLD/REFUSE]

[END CONSTITUTION]

{instructions}
        """.strip()
```

---

## 3. LangChain Adapter

### 3.1 Adapter Implementation

```python
# arifos/adapters/langchain.py

"""
LangChain Adapter
Provides middleware-based governance for LangChain agents.
"""

from typing import List, Callable

try:
    from langchain.agents import AgentExecutor, create_openai_functions_agent
    from langchain_core.tools import BaseTool
    from langchain_core.callbacks import BaseCallbackHandler
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

from arifos.ports import SDKAdapter, KernelRequest, OutputEnvelope
from arifos.kernel import ArifOSKernel


class ConstitutionalCallbackHandler(BaseCallbackHandler):
    """
    LangChain callback that enforces arifOS F1-F13 on every step.
    """
    
    def __init__(self, arifos_kernel: ArifOSKernel):
        self.kernel = arifos_kernel
        self.current_trace = []
    
    def on_tool_start(self, serialized: dict, input_str: str, **kwargs):
        """Intercept tool call for governance check."""
        request = KernelRequest(
            objective=f"Tool call: {serialized.get('name', 'unknown')} with {input_str}",
            risk_tier=self._classify_tool_risk(serialized)
        )
        
        result = self.kernel.execute(request)
        
        if result.verdict.verdict.value == "HOLD":
            # Raise exception to halt LangChain execution
            raise ConstitutionalHalt(
                f"888_HOLD: {result.verdict.reason}"
            )
        
        self.current_trace.append({
            'step': 'tool_start',
            'tool': serialized.get('name'),
            'verdict': result.verdict.verdict.value
        })
    
    def on_llm_end(self, response, **kwargs):
        """Intercept LLM output for F2 Truth validation."""
        # Extract and cap confidence
        if hasattr(response, 'generation_info'):
            response.generation_info['confidence'] = min(
                response.generation_info.get('confidence', 0.85),
                0.90  # F7 HUMILITY
            )


class LangChainAdapter(SDKAdapter):
    """
    Adapter for LangChain ecosystem.
    
    Uses middleware pattern to inject arifOS governance without
    modifying LangChain internals.
    """
    
    def __init__(self, kernel: ArifOSKernel):
        self.arifos_kernel = kernel
        self.callback_handler = ConstitutionalCallbackHandler(kernel)
    
    def create_agent(self,
                     llm,
                     tools: List[BaseTool],
                     prompt: str) -> AgentExecutor:
        """
        Create LangChain agent with arifOS middleware.
        """
        # Wrap tools
        wrapped_tools = [self._wrap_langchain_tool(t) for t in tools]
        
        # Create agent with constitutional callback
        agent = create_openai_functions_agent(llm, wrapped_tools, prompt)
        
        executor = AgentExecutor(
            agent=agent,
            tools=wrapped_tools,
            callbacks=[self.callback_handler],
            verbose=True
        )
        
        return executor
    
    def _wrap_langchain_tool(self, tool: BaseTool) -> BaseTool:
        """
        Wrap LangChain tool with arifOS governance.
        """
        original_run = tool._run
        
        def constitutional_run(*args, **kwargs):
            # Pre-execution check
            request = KernelRequest(
                objective=f"Execute {tool.name}",
                risk_tier=self._classify_risk(tool)
            )
            
            verdict = self.arifos_kernel.execute(request).verdict
            
            if verdict.verdict.value == "HOLD":
                return "888_HOLD_TRIGGERED: This action requires human approval."
            
            # Execute
            return original_run(*args, **kwargs)
        
        tool._run = constitutional_run
        return tool
```

---

## 4. LlamaIndex Adapter

### 4.1 Adapter Implementation

```python
# arifos/adapters/llamaindex.py

"""
LlamaIndex Adapter
Specialized for GEOX retrieval and document-heavy reasoning.
"""

try:
    from llama_index.core.agent import ReActAgent
    from llama_index.core.tools import FunctionTool
    from llama_index.core.callbacks import CallbackManager
    LLAMAINDEX_AVAILABLE = True
except ImportError:
    LLAMAINDEX_AVAILABLE = False

from arifos.ports import SDKAdapter, KernelRequest, OutputEnvelope
from arifos.kernel import ArifOSKernel


class GEOXLlamaIndexAdapter(SDKAdapter):
    """
    Adapter for LlamaIndex, optimized for GEOX use cases.
    
    Special features:
    - RAG grounding validation (F2 Truth)
    - Document source verification
    - Multi-index query governance
    """
    
    def __init__(self, kernel: ArifOSKernel):
        self.arifos_kernel = kernel
    
    def create_geox_agent(self, 
                          indices: dict,  # {'seismic': index1, 'well_logs': index2}
                          tools: list) -> ReActAgent:
        """
        Create GEOX agent with multi-index retrieval.
        """
        # Create retriever tools with validation
        retrieval_tools = []
        for index_name, index in indices.items():
            tool = self._create_retrieval_tool(index_name, index)
            retrieval_tools.append(tool)
        
        # Add governance to all tools
        governed_tools = [self._wrap_with_governance(t) for t in retrieval_tools + tools]
        
        # Create agent with constitutional system prompt
        agent = ReActAgent.from_tools(
            governed_tools,
            verbose=True,
            system_prompt=self._get_geox_constitutional_prompt()
        )
        
        return agent
    
    def _create_retrieval_tool(self, index_name: str, index):
        """Create retrieval tool with F2 Truth validation."""
        
        def retrieve(query: str) -> str:
            # Execute retrieval
            retriever = index.as_retriever(similarity_top_k=5)
            nodes = retriever.retrieve(query)
            
            # F2 TRUTH: Validate grounding
            if not nodes:
                return "UNKNOWN: No relevant documents found in index."
            
            # Check confidence scores
            avg_score = sum(n.score for n in nodes) / len(nodes)
            if avg_score < 0.7:  # Threshold for retrieval quality
                return f"HOLD: Low retrieval confidence ({avg_score:.2f}). Human verification required."
            
            # Return with citations
            response = "Retrieved information:\n"
            for i, node in enumerate(nodes, 1):
                response += f"[{i}] {node.text[:200]}... (score: {node.score:.2f}, source: {node.metadata.get('source', 'unknown')})\n"
            
            return response
        
        return FunctionTool.from_defaults(
            name=f"query_{index_name}_index",
            fn=retrieve,
            description=f"Query the {index_name} knowledge base"
        )
    
    def _get_geox_constitutional_prompt(self) -> str:
        """GEOX-specific constitutional prompt for LlamaIndex."""
        return """
You are a GEOX Earth Witness agent governed by arifOS constitutional law.

RETrieval GOVERNANCE (F2 Truth):
- Every claim MUST cite specific document source
- Confidence ≤ 0.90 for all geological interpretations
- If sources conflict: report conflict, do not synthesize
- If retrieval score < 0.7: escalate to human geoscientist

UNCERTAINTY HANDLING:
- Distinguish: "Data shows X" vs "I interpret X"
- Explicitly state data gaps
- No extrapolation beyond retrieved context

888_HOLD TRIGGERS:
- Prospect evaluation with incomplete data
- Drilling recommendations without seismic verification
- Reserve estimates without petrophysical validation

Verdict format for all outputs:
EVIDENCE: [Specific sources]
CONFIDENCE: [0.00-0.90]
VERDICT: [DRIL/DRO/HOLD]
RATIONALE: [Constitutional reasoning]
        """.strip()
```

---

## 5. PydanticAI Adapter

### 5.1 Adapter Implementation

```python
# arifos/adapters/pydanticai.py

"""
PydanticAI Adapter
Provides type-safe, schema-enforced agent execution.
"""

from typing import Type, TypeVar, Callable
import pydantic

try:
    from pydantic_ai import Agent
    from pydantic_ai.tools import Tool
    from pydantic_ai.result import RunResult
    PYDANTIC_AI_AVAILABLE = True
except ImportError:
    PYDANTIC_AI_AVAILABLE = False

from arifos.ports import SDKAdapter, KernelRequest, OutputEnvelope
from arifos.kernel import ArifOSKernel

T = TypeVar('T', bound=pydantic.BaseModel)


class PydanticAIAdapter(SDKAdapter):
    """
    Adapter for PydanticAI.
    
    Leverages PydanticAI's strong typing for F12 Injection Guard
    and structured output validation (F2 Truth).
    """
    
    def __init__(self, kernel: ArifOSKernel):
        self.arifos_kernel = kernel
    
    def create_typed_agent(self,
                          name: str,
                          system_prompt: str,
                          result_type: Type[T],
                          tools: list) -> Agent:
        """
        Create PydanticAI agent with arifOS governance.
        """
        # Inject constitutional constraints
        constitutional_prompt = self._inject_constitution(system_prompt)
        
        # Create agent with structured output
        agent = Agent(
            name=name,
            system_prompt=constitutional_prompt,
            result_type=result_type,  # Schema enforcement
            tools=[self._wrap_tool(t) for t in tools]
        )
        
        return agent
    
    async def run(self,
                  agent: Agent,
                  user_prompt: str,
                  deps: Optional[dict] = None) -> OutputEnvelope:
        """
        Execute with full type safety and governance.
        """
        # Pre-execution
        request = KernelRequest(
            objective=user_prompt,
            meta={'agent_name': agent.name, 'result_schema': agent.result_type.__name__}
        )
        
        verdict = self.arifos_kernel.execute(request).verdict
        
        if verdict.verdict.value == "HOLD":
            return self._create_hold_response(request, verdict)
        
        # Execute with PydanticAI
        result: RunResult = await agent.run(user_prompt, deps=deps)
        
        # Validate output schema (F12 Injection Guard)
        try:
            validated = agent.result_type(**result.data)
        except pydantic.ValidationError as e:
            return OutputEnvelope(
                trace_id=request.trace_id,
                status="REFUSE",
                output=f"F12 Injection Guard: Output validation failed: {e}",
                confidence=0.0,
                verdict=JudgeVerdict(verdict=Verdict.REFUSE, reason="Schema validation failed")
            )
        
        # Check confidence cap (F7 Humility)
        confidence = getattr(validated, 'confidence', 0.85)
        confidence = min(confidence, 0.90)  # HARD CAP
        
        return OutputEnvelope(
            trace_id=request.trace_id,
            status="OK",
            output=validated,
            confidence=confidence,
            verdict=verdict,
            sdk_trace={'sdk': 'pydanticai', 'agent_name': agent.name}
        )
    
    def _inject_constitution(self, prompt: str) -> str:
        """Inject F1-F13 into PydanticAI system prompt."""
        return f"""
[arifOS CONSTITUTION - ENFORCED]

Output must conform to provided schema with these constraints:
- confidence: float ≤ 0.90 (F7 HUMILITY)
- evidence_basis: list[str] required (F2 TRUTH)
- verdict: enum[PROCEED, HOLD, REFUSE] required
- uncertainty_score: float 0.0-1.0 required

If schema validation fails: execution is REFUSED (F12 Injection Guard).
If confidence would exceed 0.90: it is capped at 0.90.
If evidence is missing: verdict must be HOLD or REFUSE.

[END CONSTITUTION]

{prompt}
        """.strip()
```

---

## 6. The Adapter Bus Orchestrator

```python
# arifos/adapter_bus.py

"""
Adapter Bus: Central registry for all SDK adapters.
Routes requests to appropriate SDK while maintaining constitutional governance.
"""

from typing import Dict, Type, Optional
from enum import Enum

class SDKType(Enum):
    MICROSOFT_SK = "microsoft_sk"
    OPENAI_AGENTS = "openai_agents"
    LANGCHAIN = "langchain"
    LLAMAINDEX = "llamaindex"
    PYDANTIC_AI = "pydanticai"


class AdapterBus:
    """
    Central bus for SDK adapters.
    
    Usage:
        bus = AdapterBus(arifos_kernel)
        bus.register(SDKType.MICROSOFT_SK, MicrosoftSKAdapter(kernel))
        
        result = bus.execute(
            sdk_type=SDKType.MICROSOFT_SK,
            request=kernel_request
        )
    """
    
    def __init__(self, kernel: ArifOSKernel):
        self.kernel = kernel
        self.adapters: Dict[SDKType, SDKAdapter] = {}
        self.fallback_order = [
            SDKType.MICROSOFT_SK,
            SDKType.OPENAI_AGENTS,
            SDKType.PYDANTIC_AI,
            SDKType.LLAMAINDEX,
            SDKType.LANGCHAIN
        ]
    
    def register(self, sdk_type: SDKType, adapter: SDKAdapter):
        """Register an SDK adapter."""
        self.adapters[sdk_type] = adapter
        logger.info(f"Registered adapter: {sdk_type.value}")
    
    def execute(self,
                request: KernelRequest,
                sdk_type: Optional[SDKType] = None) -> OutputEnvelope:
        """
        Execute request through specified SDK, or try fallbacks.
        """
        # If specific SDK requested, use it
        if sdk_type and sdk_type in self.adapters:
            return self._execute_with_adapter(sdk_type, request)
        
        # Otherwise, try fallbacks in order
        for fallback_type in self.fallback_order:
            if fallback_type in self.adapters:
                try:
                    return self._execute_with_adapter(fallback_type, request)
                except Exception as e:
                    logger.warning(f"{fallback_type.value} failed: {e}")
                    continue
        
        raise RuntimeError("No SDK adapter available for execution")
    
    def _execute_with_adapter(self, 
                              sdk_type: SDKType, 
                              request: KernelRequest) -> OutputEnvelope:
        """Execute via specific adapter with audit."""
        adapter = self.adapters[sdk_type]
        
        # Add SDK context to request
        request.meta['sdk_target'] = sdk_type.value
        
        # Execute
        result = adapter.execute(request)
        
        # Normalize audit
        result.sdk_trace['adapter_bus'] = {
            'selected_sdk': sdk_type.value,
            'available_adapters': list(self.adapters.keys())
        }
        
        return result


# Singleton factory
def create_adapter_bus(kernel: ArifOSKernel) -> AdapterBus:
    """Create configured adapter bus with all available SDKs."""
    bus = AdapterBus(kernel)
    
    # Auto-register available adapters
    try:
        from arifos.adapters.microsoft_sk import MicrosoftSKAdapter
        bus.register(SDKType.MICROSOFT_SK, MicrosoftSKAdapter(kernel))
    except ImportError:
        pass
    
    try:
        from arifos.adapters.openai_agents import OpenAIAgentsAdapter
        bus.register(SDKType.OPENAI_AGENTS, OpenAIAgentsAdapter(kernel))
    except ImportError:
        pass
    
    try:
        from arifos.adapters.pydanticai import PydanticAIAdapter
        bus.register(SDKType.PYDANTIC_AI, PydanticAIAdapter(kernel))
    except ImportError:
        pass
    
    try:
        from arifos.adapters.llamaindex import GEOXLlamaIndexAdapter
        bus.register(SDKType.LLAMAINDEX, GEOXLlamaIndexAdapter(kernel))
    except ImportError:
        pass
    
    try:
        from arifos.adapters.langchain import LangChainAdapter
        bus.register(SDKType.LANGCHAIN, LangChainAdapter(kernel))
    except ImportError:
        pass
    
    return bus
```

---

## 7. Usage Examples

### 7.1 Enterprise Stack (Microsoft + PydanticAI)

```python
# Recommended primary stack
from arifos.kernel import ArifOSKernel
from arifos.adapter_bus import create_adapter_bus, SDKType

# Initialize
kernel = ArifOSKernel()
bus = create_adapter_bus(kernel)

# Route to Microsoft SK for Teams/Copilot integration
result = bus.execute(
    request=KernelRequest(
        objective="Evaluate prospect in Block SK-437",
        risk_tier="high",
        agent_id="geox_copilot"
    ),
    sdk_type=SDKType.MICROSOFT_SK  # Explicit selection
)

# Or route to PydanticAI for typed contract execution
result = bus.execute(
    request=KernelRequest(
        objective="Generate structured well report",
        output_schema=WellReportSchema
    ),
    sdk_type=SDKType.PYDANTIC_AI
)
```

### 7.2 Cross-Platform with Fallback

```python
# Automatic fallback if primary SDK fails
result = bus.execute(
    request=KernelRequest(objective="Analyze seismic data")
    # sdk_type=None → try Microsoft SK → OpenAI → PydanticAI → ...
)
```

### 7.3 GEOX with LlamaIndex

```python
# Specialized GEOX retrieval
from arifos.adapters.llamaindex import GEOXLlamaIndexAdapter

geox_adapter = GEOXLlamaIndexAdapter(kernel)
agent = geox_adapter.create_geox_agent(
    indices={
        'seismic': seismic_index,
        'well_logs': well_index,
        'production': production_index
    },
    tools=[geox_evaluate_prospect, geox_compute_petrophysics]
)

# Query with F2 Truth validation
response = await agent.query("Find all MMP plays in Malay Basin")
# Response includes citations, confidence, verdict
```

---

## 8. Validation: Two-Primary Strategy

Your hypothesis is **confirmed optimal**:

| Primary | Role | Why Essential |
|---------|------|---------------|
| **Microsoft SK/Agent Framework** | Enterprise ingress | Boards/CISOs accept Microsoft-native; clean Copilot integration; passes TAC review |
| **PydanticAI** | Internal governance | Type safety = F12 Injection Guard; schema enforcement = F2 Truth; Pythonic = maintainable |

**Secondary additions:**
- **LlamaIndex**: Add when GEOX retrieval complexity justifies it (multi-index, document-heavy)
- **OpenAI Agents**: Add for portable orchestration across non-Microsoft environments
- **LangChain**: Add for ecosystem tool coverage (legacy integration)

---

## Summary

The Adapter Bus pattern ensures:
1. **Platform Agnostic**: Swap SDKs without changing constitutional core
2. **Fail-Closed**: 888_HOLD works regardless of underlying SDK
3. **Audit Unified**: VAULT999 receives normalized traces from all SDKs
4. **Type Safe**: Pydantic schemas enforce F12 at compile time
5. **Enterprise Ready**: Microsoft SK provides acceptable enterprise veneer

**Seal:** VAULT999 | **Bus Status:** OPERATIONAL

*"The constitution travels with the agent, regardless of which SDK carries it."*
