import os
import base64
from cryptography.hazmat.primitives.asymmetric import ed25519

class VaultSigner:
    """
    Handles Ed25519 signing for VAULT999 records and A2A signaling.
    Anchors trust back to the Architect.
    """
    
    @staticmethod
    def generate_seed() -> bytes:
        return os.urandom(32)

    @staticmethod
    def sign_payload(payload: str, private_key_hex: str) -> str:
        key_bytes = bytes.fromhex(private_key_hex)
        private_key = ed25519.Ed25519PrivateKey.from_private_bytes(key_bytes)
        signature = private_key.sign(payload.encode())
        return base64.b64encode(signature).decode()

    @staticmethod
    def verify_signature(payload: str, signature: str, public_key_hex: str) -> bool:
        try:
            pub_bytes = bytes.fromhex(public_key_hex)
            public_key = ed25519.Ed25519PublicKey.from_public_bytes(pub_bytes)
            sig_bytes = base64.b64decode(signature)
            public_key.verify(sig_bytes, payload.encode())
            return True
        except Exception:
            return False
