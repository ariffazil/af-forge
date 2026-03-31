"""
Theory of Anomalous Contrast (ToAC) — Core Definitions
DITEMPA BUKAN DIBERI

The foundational theory: Conflation of display contrast with physical 
signal leads to systematic interpretation errors.

Reference:
    Bond, C. E., Gibbs, A. D., Shipton, Z. K., & Jones, S. (2007).
    "What do you think this is? 'Conceptual uncertainty' in geoscience 
    interpretation." GSA Today, 17(11), 4-10.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Literal


class ContrastDomain(Enum):
    """
    The three domains of contrast in any interpretation system.
    
    Anomalous Contrast occurs when these domains are conflated.
    """
    PHYSICAL = auto()     # Real signal in the physical world
    DISPLAY = auto()      # Visual representation choices
    PERCEPTUAL = auto()   # Human visual perception


class ContrastType(Enum):
    """
    Types of contrast that can exist in each domain.
    
    Physical: Real differences in the measured phenomenon
    Display: Artifacts of visualization choices
    Perceptual: Features that "pop out" to human vision
    """
    # Physical domain contrasts
    IMPEDANCE = "impedance_contrast"          # Seismic: rock property contrast
    DENSITY = "density_contrast"              # CT/MRI: tissue density
    REFLECTANCE = "reflectance_contrast"      # Satellite: surface albedo

    # Display domain contrasts
    COLORMAP = "colormap_contrast"            # Choice of color scale
    DYNAMIC_RANGE = "dynamic_range"           # Histogram stretch
    EDGE_ENHANCEMENT = "edge_enhancement"     # Sobel, CLAHE, sharpening
    GAMMA = "gamma_correction"                # Non-linear intensity mapping

    # Perceptual domain contrasts
    LUMINANCE_EDGE = "luminance_edge"         # Brightness boundaries
    COLOR_EDGE = "color_edge"                 # Hue/saturation boundaries
    TEXTURE = "texture_contrast"              # Pattern differences


@dataclass(frozen=True)
class ConflationRisk:
    """
    Assessment of risk that display/perceptual contrast is mistaken
    for physical contrast.
    
    This is the core of ToAC: quantifying the anomalous risk.
    """
    # Probability that a perceived feature is display artifact only
    artifact_probability: float  # 0.0 - 1.0

    # Probability that a perceived feature exists in physical domain
    physical_probability: float  # 0.0 - 1.0

    # Severity if conflation error occurs
    severity: Literal["low", "medium", "high", "critical"]

    # Factors contributing to risk
    contributing_factors: list[str] = field(default_factory=list)

    # Mitigation strategies
    mitigations: list[str] = field(default_factory=list)

    def __post_init__(self):
        # Validate probabilities
        if not (0.0 <= self.artifact_probability <= 1.0):
            raise ValueError("artifact_probability must be in [0, 1]")
        if not (0.0 <= self.physical_probability <= 1.0):
            raise ValueError("physical_probability must be in [0, 1]")

    @property
    def conflation_likelihood(self) -> float:
        """
        Likelihood that perception → physical inference is wrong.
        
        High when artifact_prob is high AND physical_prob is low.
        """
        return self.artifact_probability * (1 - self.physical_probability)

    @property
    def requires_hold(self) -> bool:
        """True if this risk level should trigger a governance HOLD."""
        return (
            self.severity in ("high", "critical")
            or self.conflation_likelihood > 0.5
        )


class AnomalousContrastError(Exception):
    """
    Raised when conflation of contrast domains is detected.
    
    This is a governance exception, not a code error. It indicates
    that the interpretation cannot proceed without resolving the
    anomalous contrast risk.
    """

    def __init__(
        self,
        message: str,
        risk: ConflationRisk | None = None,
        remediation: str = "",
    ):
        super().__init__(message)
        self.risk = risk
        self.remediation = remediation


@dataclass
class ToAC:
    """
    Theory of Anomalous Contrast — Central governing class.
    
    Implements the core theorem: All interpretation must explicitly
track contrast across all three domains (Physical, Display, Perceptual)
    and flag when conflation risk exceeds thresholds.
    
    This is domain-agnostic. Seismic, medical, satellite — all use 
    the same ToAC instance with different parameters.
    """

    # Domain being interpreted
    domain: Literal["seismic", "medical", "satellite", "generic"]

    # Physical quantities that can create contrast in this domain
    physical_quantities: list[str] = field(default_factory=list)

    # Common display transforms that create artifacts
    artifact_transforms: list[str] = field(default_factory=list)

    # Historical failure rates (e.g., Bond et al. 79%)
    historical_failure_rates: dict[str, float] = field(default_factory=dict)

    def assess_risk(
        self,
        feature_type: str,
        source_domain: ContrastDomain,
        transforms_applied: list[str],
    ) -> ConflationRisk:
        """
        Assess conflation risk for a feature.
        
        Args:
            feature_type: What kind of feature (fault, horizon, tumor, etc.)
            source_domain: Which domain created this feature
            transforms_applied: List of display transforms that were used
            
        Returns:
            ConflationRisk assessment
        """
        # Base risk from historical data
        base_artifact_prob = self.historical_failure_rates.get(feature_type, 0.3)

        # Increase risk for each suspicious transform
        suspicious_transforms = ["CLAHE", "sharpening", "edge_enhance", "gamma"]
        for transform in transforms_applied:
            if any(s in transform.lower() for s in suspicious_transforms):
                base_artifact_prob += 0.15

        # Cap at 0.9 (never 100% certain it's artifact)
        artifact_prob = min(0.9, base_artifact_prob)

        # Physical probability depends on source domain
        if source_domain == ContrastDomain.PHYSICAL:
            physical_prob = 0.8
        elif source_domain == ContrastDomain.DISPLAY:
            physical_prob = 0.3
        else:  # PERCEPTUAL
            physical_prob = 0.2

        # Determine severity
        conflation = artifact_prob * (1 - physical_prob)
        if conflation > 0.7:
            severity = "critical"
        elif conflation > 0.5:
            severity = "high"
        elif conflation > 0.3:
            severity = "medium"
        else:
            severity = "low"

        return ConflationRisk(
            artifact_probability=artifact_prob,
            physical_probability=physical_prob,
            severity=severity,
            contributing_factors=[
                f"Source domain: {source_domain.name}",
                f"Transforms applied: {transforms_applied}",
                f"Historical failure rate: {base_artifact_prob:.0%}",
            ],
            mitigations=[
                "Cross-validate with alternative transforms",
                "Check consistency across multiple views",
                "Validate with orthogonal data if possible",
            ]
        )

    def validate_interpretation(
        self,
        interpretation: dict[str, Any],
    ) -> tuple[bool, ConflationRisk | None]:
        """
        Validate an interpretation for anomalous contrast.
        
        Returns:
            (is_valid, risk_if_invalid)
        """
        # Check if interpretation acknowledges display uncertainty
        has_uncertainty = "uncertainty" in interpretation
        has_contrast_metadata = "contrast_metadata" in interpretation

        if not has_contrast_metadata:
            # Missing contrast tracking = high risk
            risk = ConflationRisk(
                artifact_probability=0.7,
                physical_probability=0.4,
                severity="high",
                contributing_factors=["Missing contrast_metadata"],
                mitigations=["Add contrast_metadata to interpretation"],
            )
            return False, risk

        # Check uncertainty band (F7 Humility)
        uncertainty = interpretation.get("uncertainty", 0.5)
        if uncertainty < 0.03 or uncertainty > 0.15:
            risk = ConflationRisk(
                artifact_probability=0.5,
                physical_probability=0.5,
                severity="medium",
                contributing_factors=[
                    f"Uncertainty {uncertainty} outside constitutional band [0.03, 0.15]"
                ],
                mitigations=["Adjust uncertainty to F7-compliant range"],
            )
            return False, risk

        return True, None


# Pre-configured ToAC instances for common domains

TOAC_SEISMIC = ToAC(
    domain="seismic",
    physical_quantities=[
        "impedance_contrast",
        "waveform_similarity",
        "discontinuity",
        "reflection_strength",
    ],
    artifact_transforms=[
        "CLAHE",
        "Sobel_filter",
        "gamma_correction",
        "histogram_equalization",
        "AGC",
    ],
    historical_failure_rates={
        "fault": 0.79,  # Bond et al. 2007
        "horizon": 0.25,
        "channel": 0.45,
        "unconformity": 0.60,
    },
)

TOAC_MEDICAL = ToAC(
    domain="medical",
    physical_quantities=[
        "tissue_density",
        "perfusion",
        "diffusion_coefficient",
    ],
    artifact_transforms=[
        "window_level",
        "histogram_stretch",
        "edge_enhance",
    ],
    historical_failure_rates={
        "tumor": 0.15,
        "fracture": 0.20,
        "lesion": 0.25,
    },
)

TOAC_GENERIC = ToAC(
    domain="generic",
    physical_quantities=["signal_intensity", "feature_presence"],
    artifact_transforms=["colormap", "filtering", "enhancement"],
    historical_failure_rates={"feature": 0.40},
)
