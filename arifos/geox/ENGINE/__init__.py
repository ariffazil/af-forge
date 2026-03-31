"""
GEOX ENGINE Layer — Contrast-Aware Processing Core
DITEMPA BUKAN DIBERI

The ENGINE implements the Theory of Anomalous Contrast (ToAC) from the 
THEORY layer. It provides:

  - ContrastSpace: Unified representation of all contrast types
  - TransformRegistry: Catalog of visual transforms with risk metadata  
  - AnomalyDetector: Automatic detection of conflation errors

The ENGINE is domain-agnostic. Seismic, medical, satellite — all use
the same engine with different configuration.
"""

from .anomaly_detector import AnomalyDetector, ConflationAlert
from .contrast_space import ContrastFeature, ContrastSpace
from .transform_registry import TransformRegistry, get_registry

__all__ = [
    "ContrastSpace",
    "ContrastFeature",
    "TransformRegistry",
    "get_registry",
    "AnomalyDetector",
    "ConflationAlert",
]
