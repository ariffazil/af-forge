"""
GEOX Seismic Tools — ToAC-Governed Seismic Interpretation
DITEMPA BUKAN DIBERI

Seismic-specific implementations of the Contrast Canon:

  - SeismicSingleLineTool: 2D seismic attribute computation with bias audit
  - SeismicAttributeCalculator: Physical attribute implementations
  - SeismicInterpretationProtocol: Interpretation workflow with ToAC checkpoints

All seismic tools enforce:
  1. PHYSICAL_SIGNAL first (compute attributes before visualization)
  2. Explicit bias audit (Bond et al. 2007 compliance)
  3. Transform chain transparency (every colormap, gain, filter documented)
  4. Anomaly detection (flag features where visual >> physical)
"""

from .seismic_attribute_calculator import (
    AttributeResult,
    SeismicAttributeCalculator,
    compute_dip_steered_coherence,
    compute_semblance,
)
from .seismic_interpretation_protocol import (
    InterpretationCheckpoint,
    InterpretationStep,
    SeismicInterpretationProtocol,
)
from .seismic_single_line_tool import SeismicSingleLineTool

__all__ = [
    # Main tools
    "SeismicSingleLineTool",
    "SeismicAttributeCalculator",
    "SeismicInterpretationProtocol",
    # Data structures
    "AttributeResult",
    "InterpretationStep",
    "InterpretationCheckpoint",
    # Low-level functions
    "compute_semblance",
    "compute_dip_steered_coherence",
]
