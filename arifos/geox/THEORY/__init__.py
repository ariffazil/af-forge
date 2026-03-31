"""
GEOX THEORY Layer — Theory of Anomalous Contrast (ToAC)
DITEMPA BUKAN DIBERI

The foundational theory that governs all GEOX interpretation:
Anomalous Contrast occurs when visual/display contrast is mistaken for 
physical signal, leading to interpretation errors.

This module is domain-agnostic. Seismic, medical, satellite — all are 
governed by the same theory of contrast conflation.
"""

from .contrast_governance import (
    ContrastVerdict,
    GovernancePolicy,
    HOLDTrigger,
    assess_conflation_risk,
)
from .contrast_taxonomy import (
    ConfidenceClass,
    ContrastTaxonomy,
    PhysicalProxy,
    SourceDomain,
    VisualTransform,
)
from .contrast_theory import (
    AnomalousContrastError,
    ConflationRisk,
    ContrastDomain,
    ContrastType,
    ToAC,
)

__all__ = [
    # Core Theory
    "ContrastDomain",
    "ContrastType",
    "AnomalousContrastError",
    "ConflationRisk",
    "ToAC",
    # Taxonomy
    "SourceDomain",
    "VisualTransform",
    "PhysicalProxy",
    "ConfidenceClass",
    "ContrastTaxonomy",
    # Governance
    "ContrastVerdict",
    "GovernancePolicy",
    "HOLDTrigger",
    "assess_conflation_risk",
]

__version__ = "1.0.0"
