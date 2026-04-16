import math
from typing import List, Dict

class OrthogonalityEngine:
    """
    Computes Ωₒᵣₜₕₒ (Orthogonality) and Peace² (Stability).
    Governs the Gate at Stage 666.
    """
    
    @staticmethod
    def compute_omega(correlations: List[float]) -> float:
        """
        Ωₒᵣₜₕₒ = 1 - mean(|ρᵢⱼ|)
        ρᵢⱼ = Pearson correlation between domains.
        """
        if not correlations:
            return 1.0
        abs_corr = [abs(rho) for rho in correlations]
        mean_rho = sum(abs_corr) / len(abs_corr)
        return round(1.0 - mean_rho, 4)

    @staticmethod
    def compute_peace2(maruah: float, kappa_r: float, npv: float) -> float:
        """
        Peace² = (Maruah × κᵣ) × sign(NPV)
        """
        sign_npv = 1 if npv >= 0 else -1
        score = (maruah * kappa_r) * sign_npv
        return round(score, 4)

    @staticmethod
    def get_verdict(omega: float, peace2: float, ds: float) -> str:
        """
        Calculates SEAL/HOLD/VOID based on canonical thresholds.
        """
        if omega < 0.85 or peace2 < 0.40 or ds > 0.50:
            return "VOID"
        if omega < 0.95 or peace2 < 0.70 or ds > 0.20:
            return "HOLD"
        return "SEAL"
