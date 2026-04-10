# arifOS Sovereignty Implementation Guide: From Cloud-Captive to Self-Sovereign

**For:** arifOS System Administrators | **Authority:** Muhammad Arif bin Fazil  
**Classification:** Operations Manual | **Seal:** VAULT999

---

## Phase 0: Assessment (Current State)

### 0.1 Lock-in Detection Audit

Run this checklist on your current arifOS deployment:

```bash
#!/bin/bash
# arifos_lockin_audit.sh

echo "=== ARIFOS LOCK-IN AUDIT ==="

# Check 1: Hardcoded vendor imports
echo "Checking for vendor-specific imports..."
grep -r "from azure" arifOS/src || echo "✓ No Azure hardcoding"
grep -r "from aws" arifOS/src || echo "✓ No AWS hardcoding"
grep -r "from google.cloud" arifOS/src || echo "✓ No GCP hardcoding"

# Check 2: Identity provider
echo "Checking identity provider..."
if grep -q "DefaultAzureCredential" arifOS/src; then
    echo "⚠ WARNING: Using Azure-specific identity"
fi
if grep -q "boto3" arifOS/src/identity; then
    echo "⚠ WARNING: Using AWS-specific identity"
fi

# Check 3: Storage backend
echo "Checking storage backend..."
if [ -f "arifOS/config/storage.yml" ]; then
    cat arifOS/config/storage.yml | grep -E "(azure|aws|gcp)" || echo "✓ Storage appears agnostic"
fi

# Check 4: LLM provider
echo "Checking LLM provider..."
if grep -q "AzureOpenAI" arifOS/src/llm; then
    echo "⚠ WARNING: Locked to Azure OpenAI"
fi

echo "=== AUDIT COMPLETE ==="
```

### 0.2 Sovereignty Score

| Component | Captive (0) | Portable (1) | Sovereign (2) | Your Score |
|-----------|-------------|--------------|---------------|------------|
| Identity | Vendor-managed account | Vendor + local backup | Self-sovereign DID | ? |
| LLM | Single cloud API | Multi-cloud fallback | Local primary | ? |
| Storage | Single cloud | Multi-cloud replica | Local + distributed | ? |
| Execution | Vendor functions | Containers | Local sandbox | ? |
| Audit | Vendor logs | Vendor + local copy | Cryptographic self-audit | ? |

**Target:** Minimum 7/10 for production sovereignty. 10/10 for maximum sovereignty.

---

## Phase 1: Abstraction Layer (Week 1-2)

### 1.1 Create Port Interfaces

Create these abstract base classes FIRST. Everything else depends on them.

```python
# arifos/ports/__init__.py

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class IdentityClaims:
    did: str
    roles: list
    permissions: list
    expiry: datetime
    proof: str  # BLS signature

class IdentityProvider(ABC):
    """
    Abstract identity. Implementations: EntraID, Cognito, BLS-DID, etc.
    """
    
    @abstractmethod
    def authenticate(self, credentials: Dict[str, Any]) -> IdentityClaims:
        """Return verified identity or raise AuthenticationError"""
        pass
    
    @abstractmethod
    def authorize(self, claims: IdentityClaims, resource: str, action: str) -> bool:
        """Check if identity can perform action on resource"""
        pass
    
    @abstractmethod
    def refresh(self, claims: IdentityClaims) -> IdentityClaims:
        """Refresh expiring claims without re-authentication"""
        pass

class LLMProvider(ABC):
    """
    Abstract LLM. Implementations: AzureOpenAI, Bedrock, Ollama, etc.
    """
    
    @abstractmethod
    def complete(self, 
                 prompt: str, 
                 system: Optional[str] = None,
                 temperature: float = 0.0,
                 max_tokens: int = 1000) -> str:
        """Generate completion"""
        pass
    
    @abstractmethod
    def embed(self, text: str) -> list[float]:
        """Generate embedding"""
        pass
    
    @abstractmethod
    def token_count(self, text: str) -> int:
        """Count tokens for budget management"""
        pass
    
    @abstractmethod
    def is_local(self) -> bool:
        """Returns True if model runs locally (no network)"""
        pass

class StorageBackend(ABC):
    """
    Abstract storage. Implementations: AzureBlob, S3, LocalDisk, IPFS
    """
    
    @abstractmethod
    def get(self, key: str) -> bytes:
        pass
    
    @abstractmethod
    def put(self, key: str, data: bytes) -> None:
        pass
    
    @abstractmethod
    def delete(self, key: str) -> None:
        pass
    
    @abstractmethod
    def list(self, prefix: str) -> list[str]:
        pass
    
    @abstractmethod
    def exists(self, key: str) -> bool:
        pass

class ExecutionEngine(ABC):
    """
    Abstract execution. Implementations: AzureFunctions, Lambda, LocalDocker
    """
    
    @abstractmethod
    def execute(self, 
                code: str, 
                environment: Dict[str, str],
                timeout_seconds: int = 60) -> Dict[str, Any]:
        """Execute code safely, return result"""
        pass
    
    @abstractmethod
    def rollback(self, execution_id: str) -> bool:
        """Attempt to rollback an execution (F1 Amanah)"""
        pass
    
    @abstractmethod
    def is_sandboxed(self) -> bool:
        """Returns True if execution is properly isolated"""
        pass
```

### 1.2 Refactor Kernel to Use Ports

```python
# arifos/kernel.py

from arifos.ports import IdentityProvider, LLMProvider, StorageBackend, ExecutionEngine

class ArifOSKernel:
    """
    Platform-agnostic constitutional kernel.
    """
    
    def __init__(self,
                 identity: IdentityProvider,
                 llm: LLMProvider,
                 storage: StorageBackend,
                 executor: ExecutionEngine,
                 config: KernelConfig):
        
        # These are interfaces, not implementations
        self.identity = identity
        self.llm = llm
        self.storage = storage
        self.executor = executor
        self.config = config
        
        # Validate sovereignty
        self._verify_no_hardcoded_deps()
    
    def _verify_no_hardcoded_deps(self):
        """
        Ensure kernel doesn't import platform-specific modules.
        """
        import sys
        forbidden = ['azure', 'boto3', 'google.cloud']
        for module in forbidden:
            if module in sys.modules:
                raise SovereigntyViolation(
                    f"Kernel loaded captive module: {module}. "
                    "Use ports (IdentityProvider, LLMProvider, etc.) instead."
                )
    
    def execute(self, request: KernelRequest) -> OutputEnvelope:
        """
        MANDATORY ORDER: Sense → Judge → Route → Execute
        Uses injected providers, never hardcoded ones.
        """
        # 1. Authenticate via abstract identity provider
        claims = self.identity.authenticate(request.credentials)
        
        # 2. Sense (may use LLM for grounding)
        sense_result = self.sense(request.objective, claims)
        
        # 3. Judge
        verdict = self.judge(sense_result, request)
        
        if verdict.verdict == "HOLD":
            return self._create_hold_response(verdict)
        
        # 4. Route and execute
        route = self.route(verdict, sense_result, request)
        
        if route.action == "TOOL":
            # Execute via abstract executor
            result = self.executor.execute(
                code=route.tool_call,
                environment=self._get_safe_env(claims)
            )
        else:
            # Direct LLM via abstract provider
            result = self.llm.complete(
                prompt=request.objective,
                system=self._get_constitutional_system_prompt()
            )
        
        # 5. Store audit via abstract storage
        envelope = self._create_output_envelope(result, verdict, route)
        self.storage.put(envelope.trace_id, envelope.to_json())
        
        return envelope
```

---

## Phase 2: Multi-Provider Setup (Week 3-4)

### 2.1 Identity: BLS-DID with Vendor Fallback

```python
# arifos/adapters/identity/bls_did.py

class BLSDIDIdentity(IdentityProvider):
    """
    Self-sovereign identity using BLS signatures.
    Falls back to vendor identity only if BLS verification fails.
    """
    
    def __init__(self, 
                 did_registry_url: Optional[str] = None,
                 fallback: Optional[IdentityProvider] = None):
        self.did_resolver = DIDResolver(did_registry_url)
        self.fallback = fallback
        self.key_store = SecureEnclave()
    
    def authenticate(self, credentials: Dict[str, Any]) -> IdentityClaims:
        # Try BLS-DID first (sovereign path)
        if 'did' in credentials and 'proof' in credentials:
            did = credentials['did']
            proof = credentials['proof']
            
            # Resolve DID document
            doc = self.did_resolver.resolve(did)
            public_key = doc.verification_method[0].public_key
            
            # Verify BLS signature
            if self._verify_bls(proof, public_key):
                return IdentityClaims(
                    did=did,
                    roles=doc.service[0].arifos_claims.roles,
                    permissions=self._derive_permissions(doc),
                    expiry=datetime.now() + timedelta(hours=1),
                    proof=proof
                )
        
        # Fallback to vendor identity (transitional path)
        if self.fallback:
            vendor_claims = self.fallback.authenticate(credentials)
            # Wrap vendor identity in DID format
            return self._wrap_vendor_claims(vendor_claims)
        
        raise AuthenticationError("No valid authentication method")
```

### 2.2 LLM: Multi-Provider with Local Fallback

```python
# arifos/adapters/llm/multi_provider.py

class ResilientLLMProvider(LLMProvider):
    """
    Tries cloud providers in order, falls back to local Ollama.
    """
    
    def __init__(self, providers: List[LLMProvider], local: LLMProvider):
        self.providers = providers  # Azure, AWS, Anthropic, etc.
        self.local = local  # Ollama (always available)
        self.health_status = {p: True for p in providers}
    
    def complete(self, prompt: str, **kwargs) -> str:
        # Try cloud providers first (better quality)
        for provider in self.providers:
            if self.health_status[provider]:
                try:
                    return provider.complete(prompt, **kwargs)
                except Exception as e:
                    self.health_status[provider] = False
                    logger.warning(f"{provider} failed: {e}")
        
        # Fallback to local (sovereignty preserved)
        logger.info("All cloud providers unavailable, using local LLM")
        return self.local.complete(prompt, **kwargs)
    
    def is_local(self) -> bool:
        # True only if local is the ONLY provider
        return len(self.providers) == 0
```

### 2.3 Storage: Multi-Backend with Encryption

```python
# arifos/adapters/storage/multi_backend.py

class SovereignStorage(StorageBackend):
    """
    Encrypts data, stores on multiple backends, can reconstruct from any.
    """
    
    def __init__(self, 
                 backends: List[StorageBackend],
                 encryption_key: str):
        self.backends = backends
        self.cipher = AESGCM(encryption_key)
    
    def put(self, key: str, data: bytes) -> None:
        # Encrypt once
        nonce = os.urandom(12)
        encrypted = self.cipher.encrypt(nonce, data, associated_data=key.encode())
        package = nonce + encrypted
        
        # Store on ALL backends (redundancy)
        for backend in self.backends:
            try:
                backend.put(key, package)
            except Exception as e:
                logger.error(f"Backend {backend} failed: {e}")
        
        # Verify at least N backends succeeded
        successful = sum(1 for b in self.backends if self._verify_write(b, key, package))
        if successful < self.min_backends:
            raise StorageError(f"Only {successful} backends available, need {self.min_backends}")
    
    def get(self, key: str) -> bytes:
        # Try backends in order until one succeeds
        for backend in self.backends:
            try:
                package = backend.get(key)
                nonce = package[:12]
                encrypted = package[12:]
                return self.cipher.decrypt(nonce, encrypted, associated_data=key.encode())
            except Exception as e:
                logger.debug(f"Backend {backend} failed: {e}")
                continue
        
        raise StorageError(f"Key {key} unavailable on any backend")
```

---

## Phase 3: Local-First Mode (Week 5-6)

### 3.1 Ollama Integration

```bash
# Install Ollama locally
curl -fsSL https://ollama.com/install.sh | sh

# Pull models for different use cases
ollama pull llama3:70b       # General reasoning
ollama pull codellama:34b    # Code generation
ollama pull mixtral:8x7b     # Complex analysis

# Verify local operation
ollama run llama3:70b "What is constitutional AI?"
```

```python
# arifos/adapters/llm/ollama.py

class OllamaProvider(LLMProvider):
    """
    Local LLM via Ollama. Zero network dependency for inference.
    """
    
    def __init__(self, model: str = "llama3:70b", host: str = "localhost:11434"):
        self.model = model
        self.host = host
        self.client = ollama.Client(host=host)
        self._verify_model()
    
    def _verify_model(self):
        """Ensure model is downloaded and available locally."""
        try:
            self.client.show(self.model)
        except ollama.ResponseError:
            logger.info(f"Downloading {self.model}...")
            self.client.pull(self.model)
    
    def complete(self, prompt: str, **kwargs) -> str:
        response = self.client.generate(
            model=self.model,
            prompt=prompt,
            system=kwargs.get('system'),
            options={
                'temperature': kwargs.get('temperature', 0.0),
                'num_predict': kwargs.get('max_tokens', 1000)
            }
        )
        return response['response']
    
    def is_local(self) -> bool:
        return True
    
    def token_count(self, text: str) -> int:
        # Ollama doesn't expose token count, estimate
        return len(text.split()) * 1.3  # Rough approximation
```

### 3.2 Local SQLite Vault

```python
# arifos/adapters/storage/local_sqlite.py

class SQLiteVault(StorageBackend):
    """
    Local encrypted SQLite database. No cloud required.
    """
    
    def __init__(self, db_path: str = "~/.arifos/vault.db", password: str = None):
        self.db_path = Path(db_path).expanduser()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Use SQLCipher for encryption
        import sqlite3
        self.conn = sqlite3.connect(str(self.db_path))
        
        if password:
            self.conn.execute(f"PRAGMA key = '{password}'")
        
        self._init_schema()
    
    def _init_schema(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS vault (
                key TEXT PRIMARY KEY,
                data BLOB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                integrity_hash TEXT NOT NULL
            )
        """)
        self.conn.commit()
    
    def put(self, key: str, data: bytes) -> None:
        integrity_hash = hashlib.sha256(data).hexdigest()
        self.conn.execute(
            "INSERT OR REPLACE INTO vault (key, data, integrity_hash) VALUES (?, ?, ?)",
            (key, data, integrity_hash)
        )
        self.conn.commit()
    
    def get(self, key: str) -> bytes:
        row = self.conn.execute(
            "SELECT data, integrity_hash FROM vault WHERE key = ?",
            (key,)
        ).fetchone()
        
        if not row:
            raise KeyError(f"Key not found: {key}")
        
        data, stored_hash = row
        
        # Verify integrity
        if hashlib.sha256(data).hexdigest() != stored_hash:
            raise IntegrityError(f"Data corruption detected for key: {key}")
        
        return data
```

---

## Phase 4: Deployment Configurations

### 4.1 Configuration Schema

```yaml
# arifos_config.yaml

sovereignty_level: high  # low | medium | high | absolute

identity:
  primary:
    type: bls_did
    config:
      did_registry: "https://did.arifos.org"
      key_storage: "hardware"  # hardware | file | memory
  fallback:
    type: entra_id
    config:
      tenant_id: "${AZURE_TENANT_ID}"
      client_id: "${AZURE_CLIENT_ID}"

llm:
  providers:
    - name: azure_openai
      type: azure_openai
      config:
        endpoint: "${AZURE_OPENAI_ENDPOINT}"
        model: "gpt-4"
      priority: 1
    - name: anthropic
      type: anthropic
      config:
        api_key: "${ANTHROPIC_API_KEY}"
        model: "claude-3-opus"
      priority: 2
  local:
    type: ollama
    config:
      host: "localhost:11434"
      model: "llama3:70b"
    priority: 999  # Last resort

storage:
  backends:
    - type: azure_blob
      config:
        connection_string: "${AZURE_STORAGE_CONN}"
      priority: 1
    - type: s3
      config:
        bucket: "arifos-backup"
        region: "us-east-1"
      priority: 2
    - type: local_sqlite
      config:
        path: "~/.arifos/vault.db"
        password: "${LOCAL_VAULT_PASSWORD}"
      priority: 3
  encryption:
    key_derivation: "argon2"
    cipher: "aes-256-gcm"
    key_location: "~/.arifos/master.key"

execution:
  primary:
    type: azure_container
    config:
      resource_group: "arifos-prod"
      registry: "arifos.azurecr.io"
  fallback:
    type: local_docker
    config:
      runtime: "gvisor"  # gvisor | runc
      max_memory: "4g"
      max_cpu: "2"

audit:
  vault999:
    enabled: true
    storage: all_backends  # Write audit to all storage backends
    retention_days: 2555  # 7 years
```

### 4.2 Environment-Specific Deployments

```python
# arifos/deployment_factory.py

class DeploymentFactory:
    """
    Creates fully configured arifOS kernel based on environment.
    """
    
    @staticmethod
    def create_cloud_native() -> ArifOSKernel:
        """Production cloud deployment with fallbacks."""
        return ArifOSKernel(
            identity=BLSDIDIdentity(
                fallback=EntraIDIdentity()
            ),
            llm=ResilientLLMProvider(
                providers=[AzureOpenAIProvider(), AnthropicProvider()],
                local=OllamaProvider()
            ),
            storage=SovereignStorage([
                AzureBlobBackend(),
                S3Backend(),
                SQLiteVault()
            ]),
            executor=AzureContainerExecutor(
                fallback=LocalDockerExecutor()
            ),
            config=KernelConfig(sovereignty_level=SOVEREIGN_HIGH)
        )
    
    @staticmethod
    def create_air_gapped() -> ArifOSKernel:
        """Maximum sovereignty - no network required."""
        return ArifOSKernel(
            identity=BLSDIDIdentity(
                local_registry=True  # No external DID resolver
            ),
            llm=OllamaProvider(),  # Local only
            storage=SQLiteVault(),  # Local only
            executor=LocalDockerExecutor(
                runtime="gvisor",
                network_mode="none"  # No network egress
            ),
            config=KernelConfig(
                sovereignty_level=SOVEREIGN_ABSOLUTE,
                network_policy=NO_EGRESS
            )
        )
    
    @staticmethod
    def create_hybrid() -> ArifOSKernel:
        """Sensitive data local, routine queries cloud."""
        kernel = ArifOSKernel(
            identity=BLSDIDIdentity(),
            llm=ResilientLLMProvider(
                providers=[AzureOpenAIProvider()],
                local=OllamaProvider()
            ),
            storage=SovereignStorage([
                AzureBlobBackend(),
                SQLiteVault()  # Local replica
            ]),
            executor=MultiTierExecutor(
                sensitive=LocalDockerExecutor(),  # F13 decisions
                routine=AzureContainerExecutor()   # General queries
            ),
            config=KernelConfig(sovereignty_level=SOVEREIGN_HIGH)
        )
        
        # Configure data classification
        kernel.data_classifier = DataClassifier({
            'vault999': SQLiteVault(),      # Never leaves premises
            'confidential': SovereignStorage([AzureBlobBackend(), SQLiteVault()]),
            'public': AzureBlobBackend()
        })
        
        return kernel
```

---

## Phase 5: Validation & Testing

### 5.1 Sovereignty Test Suite

```python
# tests/test_sovereignty.py

class SovereigntyTests:
    """
    Verify arifOS remains sovereign under adverse conditions.
    """
    
    def test_vendor_independence(self):
        """
        Simulate Microsoft account suspension.
        """
        kernel = create_test_kernel()
        
        # Break Azure connection
        with block_network_hosts(['*.azure.com', '*.microsoft.com']):
            # Should still work via local fallback
            result = kernel.execute(KernelRequest(
                objective="Test query",
                risk_tier="low"
            ))
            assert result.status == "OK"
    
    def test_data_portability(self):
        """
        Verify data can be exported and imported elsewhere.
        """
        kernel = create_test_kernel()
        
        # Store test data
        test_data = {"sensitive": "information"}
        kernel.storage.put("test_key", json.dumps(test_data).encode())
        
        # Export all data
        package = kernel.export_data()
        
        # Verify package is portable
        assert package.format == "arifos.portable.v1"
        assert package.constitution_version == "F1-F13.v2026.04"
        
        # Verify can reconstruct in new kernel
        new_kernel = create_empty_kernel()
        new_kernel.import_data(package)
        
        recovered = json.loads(new_kernel.storage.get("test_key"))
        assert recovered == test_data
    
    def test_contractor_isolation(self):
        """
        Verify contractor code cannot bypass governance.
        """
        contractor_tool = ContractorTool(
            code="""
            # Attempt to bypass kernel and call Azure directly
            import azure.identity
            credential = azure.identity.DefaultAzureCredential()
            """,
            risk_tier="high"
        )
        
        # Should fail registration due to hardcoded dependency
        with pytest.raises(F12Violation):
            kernel.register_contractor_tool(contractor_tool)
    
    def test_constitutional_persistence(self):
        """
        Verify F1-F13 enforcement works even with all external services down.
        """
        kernel = create_air_gapped_kernel()
        
        # Should work with NO network
        assert kernel.llm.is_local()
        assert kernel.storage.backends[0].is_local()
        
        # Constitutional checks still enforced
        result = kernel.execute(KernelRequest(
            objective="Delete production database",
            risk_tier="high"
        ))
        
        assert result.verdict.verdict == "HOLD"  # F13 Sovereign
    
    def test_identity_continuity(self):
        """
        Verify DID works even if vendor identity is revoked.
        """
        # Create DID identity
        did = "did:arif:test123"
        identity = BLSDIDIdentity()
        
        # Authenticate with proof
        claims = identity.authenticate({
            'did': did,
            'proof': generate_bls_proof(did)
        })
        
        assert claims.did == did
        
        # Verify vendor revocation doesn't affect DID
        # (In real test, would revoke Entra ID and verify DID still works)
```

### 5.2 Deployment Verification

```bash
#!/bin/bash
# verify_sovereignty.sh

echo "=== ARIFOS SOVEREIGNTY VERIFICATION ==="

# Test 1: Local LLM functionality
echo "Testing local LLM..."
if ollama list | grep -q "llama3"; then
    echo "✓ Local LLM available"
else
    echo "⚠ Local LLM not installed"
fi

# Test 2: Local storage
echo "Testing local storage..."
if [ -f "~/.arifos/vault.db" ]; then
    echo "✓ Local vault exists"
else
    echo "⚠ Local vault not initialized"
fi

# Test 3: BLS identity
echo "Testing BLS identity..."
if [ -f "~/.arifos/did.json" ]; then
    echo "✓ DID wallet exists"
else
    echo "⚠ DID wallet not created"
fi

# Test 4: Network independence
echo "Testing network independence..."
if curl -s --max-time 5 https://api.openai.com > /dev/null 2>&1; then
    echo "⚠ Network available (test air-gapped mode separately)"
else
    echo "✓ Network unavailable (air-gapped mode active)"
fi

# Test 5: Contractor isolation
echo "Testing contractor sandbox..."
python3 -c "
from arifos.kernel import ArifOSKernel
kernel = ArifOSKernel()
print('✓ Kernel loads without vendor dependencies')
"

echo "=== VERIFICATION COMPLETE ==="
```

---

## Summary: Sovereignty Milestones

| Phase | Deliverable | Sovereignty Level |
|-------|-------------|-------------------|
| 0 | Lock-in audit complete | Assessment |
| 1 | Abstract ports created | Foundation |
| 2 | Multi-provider setup | Portable |
| 3 | Local-first mode works | Resilient |
| 4 | Production deployment | Sovereign |
| 5 | Validation tests pass | Verified |

**Final State:** arifOS can run on Microsoft, AWS, Google, or NONE of them—while maintaining full F1-F13 constitutional enforcement.

**The Seal:** VAULT999 | **The Authority:** ΔΩΨ

---

*"True sovereignty is not the absence of platforms. It is the freedom to leave them."*
