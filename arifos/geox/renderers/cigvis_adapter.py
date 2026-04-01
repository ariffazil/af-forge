"""
GEOX CIGVis Renderer Adapter — DITEMPA BUKAN DIBERI

Plugs cigvis as a visualization backend for GEOX.

CIGVis strengths:
- 3D seismic slices
- Horizon surfaces
- Fault meshes/traces
- Well trajectories and curves
- Multi-canvas comparison
- Browser/remote visualization via viserplot

What cigvis is NOT responsible for:
- Intent parsing
- Audit logic
- Hold logic
- Geological claim generation
- Canonical schema ownership

Architecture:
  Canonical state → SceneCompiler → CigvisAdapter → cigvis nodes → viserplot/plot3D
"""

from __future__ import annotations

import logging
import socket
from pathlib import Path
from typing import Any

from arifos.geox.renderers.base import (
    RenderMode,
    RenderResult,
    RenderSession,
    RendererAdapter,
)

logger = logging.getLogger("geox.renderers.cigvis")

CIGVIS_AVAILABLE = True
try:
    import cigvis
    import numpy as np
    import viser
except ImportError:
    CIGVIS_AVAILABLE = False
    cigvis = None
    np = None
    viser = None


class CigvisAdapter(RendererAdapter):
    """
    CIGVis renderer adapter for GEOX.

    Converts neutral render primitives into cigvis nodes
    and manages rendering sessions.
    """

    name = "cigvis"
    supports_interactive = True

    def __init__(self, output_dir: str = "/tmp/geox_renders"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._sessions: dict[str, RenderSession] = {}
        self._port_range = (8100, 8200)
        self._used_ports: set[int] = set()

    def compile_scene(self, canonical_state: dict[str, Any]) -> dict[str, Any]:
        """
        Compile canonical state to cigvis-compatible scene.

        Args:
            canonical_state: GeoX state dict

        Returns:
            cigvis-compatible scene dict
        """
        if not CIGVIS_AVAILABLE:
            logger.warning("CIGVis not available, returning empty scene")
            return {"nodes": [], "camera": None}

        from arifos.geox.renderers.scene_compiler import SceneCompiler

        compiler = SceneCompiler()
        scene = compiler.compile(canonical_state)

        nodes = self._primitives_to_nodes(scene)

        return {
            "nodes": nodes,
            "scene": scene,
            "metadata": {
                "primitive_count": scene.get_primitive_count(),
                "title": scene.metadata.title,
            },
        }

    def _primitives_to_nodes(self, scene: Any) -> list[Any]:
        """Convert neutral primitives to cigvis nodes."""
        if not CIGVIS_AVAILABLE:
            return []

        nodes = []

        for volume_slice in scene.volume_slices:
            node = self._volume_slice_to_node(volume_slice)
            if node is not None:
                nodes.append(node)

        for surface in scene.surfaces:
            node = self._surface_to_node(surface)
            if node is not None:
                nodes.append(node)

        for fault in scene.faults:
            node = self._fault_to_node(fault)
            if node is not None:
                nodes.append(node)

        for well in scene.wells:
            node = self._well_to_node(well)
            if node is not None:
                nodes.append(node)

        return nodes

    def _volume_slice_to_node(self, volume_slice: Any) -> Any | None:
        """Convert volume slice primitive to cigvis node."""
        if not CIGVIS_AVAILABLE or volume_slice.data is None:
            return None

        try:
            data = volume_slice.data
            if hasattr(data, "numpy"):
                data = data.numpy()
            elif not isinstance(data, np.ndarray):
                data = np.array(data)

            return cigvis.SeismicSlice(
                data,
                slice_type=volume_slice.direction.value,
                value=volume_slice.slice_value,
                cmap=volume_slice.cmap,
                clim=volume_slice.clim,
            )
        except Exception as e:
            logger.warning(f"Failed to create volume slice node: {e}")
            return None

    def _surface_to_node(self, surface: Any) -> Any | None:
        """Convert surface primitive to cigvis node."""
        if not CIGVIS_AVAILABLE:
            return None

        try:
            vertices = np.array([[v.x, v.y, v.z] for v in surface.vertices])
            if surface.triangles:
                triangles = np.array(surface.triangles)
                return cigvis.Mesh(
                    vertices,
                    triangles,
                    color=surface.color.to_hex(),
                    opacity=surface.opacity,
                )
            else:
                return cigvis.Points(vertices, color=surface.color.to_hex())
        except Exception as e:
            logger.warning(f"Failed to create surface node: {e}")
            return None

    def _fault_to_node(self, fault: Any) -> Any | None:
        """Convert fault primitive to cigvis node."""
        if not CIGVIS_AVAILABLE:
            return None

        try:
            if fault.trace_points:
                points = np.array([[p.x, p.y, p.z] for p in fault.trace_points])
                return cigvis.Points(points, color=fault.color.to_hex(), point_size=5)
            elif fault.vertices:
                vertices = np.array([[v.x, v.y, v.z] for v in fault.vertices])
                return cigvis.Lines(vertices, color=fault.color.to_hex())
            return None
        except Exception as e:
            logger.warning(f"Failed to create fault node: {e}")
            return None

    def _well_to_node(self, well: Any) -> Any | None:
        """Convert well trajectory primitive to cigvis node."""
        if not CIGVIS_AVAILABLE:
            return None

        try:
            trajectory = np.array([[p.x, p.y, p.z] for p in well.trajectory])
            return cigvis.WellTrajectory(
                trajectory,
                name=well.name,
                color=well.color.to_hex(),
            )
        except Exception as e:
            logger.warning(f"Failed to create well node: {e}")
            return None

    def render_snapshot(
        self,
        scene: dict[str, Any],
        output_path: str | None = None,
        width: int = 1200,
        height: int = 800,
    ) -> RenderResult:
        """
        Render a static snapshot PNG.

        Args:
            scene: Compiled cigvis scene
            output_path: Optional path to save PNG
            width: Image width
            height: Image height

        Returns:
            RenderResult with artifact_path
        """
        if not CIGVIS_AVAILABLE:
            return RenderResult(
                success=False,
                errors=["CIGVis not installed. Run: pip install cigvis"],
            )

        try:
            import tempfile
            from PIL import Image

            nodes = scene.get("nodes", [])

            if not nodes:
                return RenderResult(
                    success=False,
                    errors=["No renderable nodes in scene"],
                )

            scene_obj = cigvis.plot3D(
                nodes,
                return_scene=True,
                off_screen=True,
            )

            rendered = scene_obj.get_image()
            rendered = rendered.resize((width, height), Image.LANCZOS)

            if output_path is None:
                from datetime import datetime

                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = str(self.output_dir / f"geox_snapshot_{timestamp}.png")

            rendered.save(output_path)

            return RenderResult(
                success=True,
                artifact_path=output_path,
                scene_summary=scene.get("metadata", {}),
            )

        except Exception as e:
            logger.exception(f"Snapshot render failed: {e}")
            return RenderResult(
                success=False,
                errors=[str(e)],
            )

    def launch_interactive(
        self,
        scene: dict[str, Any],
        port: int | None = None,
        ttl_seconds: int = 300,
    ) -> RenderResult:
        """
        Launch an interactive viserplot server session.

        Args:
            scene: Compiled cigvis scene
            port: Specific port or None for auto-allocation
            ttl_seconds: Session time-to-live

        Returns:
            RenderResult with session and access_url
        """
        if not CIGVIS_AVAILABLE:
            return RenderResult(
                success=False,
                errors=["CIGVis not installed. Run: pip install cigvis"],
            )

        if not self.supports_interactive:
            return RenderResult(
                success=False,
                errors=["Interactive mode not supported by this adapter"],
            )

        try:
            if port is None:
                port = self._allocate_port()

            session_id = f"viser_{port}"

            server = viser.create_server(host="0.0.0.0", port=port)
            nodes = scene.get("nodes", [])

            if nodes:
                cigvis.plot3D(
                    nodes,
                    server=server,
                    return_scene=False,
                )

            scene_id = scene.get("metadata", {}).get("title", session_id)

            render_session = RenderSession(
                session_id=session_id,
                started_at=datetime.now(timezone.utc),
                scene_id=scene_id,
                access_url=f"http://localhost:{port}",
                port=port,
                ttl_seconds=ttl_seconds,
            )

            self._sessions[session_id] = render_session
            self._used_ports.add(port)

            logger.info(f"Launched interactive session {session_id} on port {port}")

            return RenderResult(
                success=True,
                scene_id=scene_id,
                embedded_url=render_session.access_url,
                session=render_session,
            )

        except Exception as e:
            logger.exception(f"Interactive launch failed: {e}")
            return RenderResult(
                success=False,
                errors=[str(e)],
            )

    def shutdown_session(self, session_id: str) -> bool:
        """
        Shutdown a rendering session.

        Args:
            session_id: Session to shutdown

        Returns:
            True if session was found and shutdown
        """
        if session_id in self._sessions:
            session = self._sessions.pop(session_id)
            if session.port:
                self._used_ports.discard(session.port)
            logger.info(f"Shutdown session {session_id}")
            return True
        return False

    def get_active_sessions(self) -> list[RenderSession]:
        """Return list of currently active sessions."""
        self.cleanup_expired_sessions()
        return list(self._sessions.values())

    def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions. Returns count of removed sessions."""
        expired = [sid for sid, session in self._sessions.items() if session.is_expired()]
        for sid in expired:
            self.shutdown_session(sid)
        return len(expired)

    def _allocate_port(self) -> int:
        """Allocate an available port from the configured range."""
        for port in range(self._port_range[0], self._port_range[1]):
            if port not in self._used_ports:
                if self._is_port_available(port):
                    return port
        raise RuntimeError(f"No available ports in range {self._port_range}")

    def _is_port_available(self, port: int) -> bool:
        """Check if a port is available."""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                s.bind(("0.0.0.0", port))
                return True
        except OSError:
            return False


class StaticCigvisRenderer:
    """
    Static snapshot renderer using cigvis.

    For use when interactive mode is not available or not needed.
    """

    def __init__(self, adapter: CigvisAdapter | None = None):
        self.adapter = adapter or CigvisAdapter()

    def render(
        self,
        canonical_state: dict[str, Any],
        output_path: str | None = None,
        width: int = 1200,
        height: int = 800,
    ) -> RenderResult:
        """
        Render canonical state to static PNG.

        Args:
            canonical_state: GEOX canonical state
            output_path: Path to save PNG
            width: Image width
            height: Image height

        Returns:
            RenderResult with artifact_path
        """
        scene = self.adapter.compile_scene(canonical_state)
        return self.adapter.render_snapshot(scene, output_path, width, height)


class InteractiveCigvisRenderer:
    """
    Interactive renderer using viserplot.

    For use when browser-based visualization is needed.
    """

    def __init__(self, adapter: CigvisAdapter | None = None):
        self.adapter = adapter or CigvisAdapter()

    def render(
        self,
        canonical_state: dict[str, Any],
        port: int | None = None,
        ttl_seconds: int = 300,
    ) -> RenderResult:
        """
        Launch interactive viserplot session.

        Args:
            canonical_state: GEOX canonical state
            port: Specific port or None for auto-allocation
            ttl_seconds: Session TTL

        Returns:
            RenderResult with session and access_url
        """
        if not CIGVIS_AVAILABLE:
            return RenderResult(
                success=False,
                errors=["CIGVis not installed. Run: pip install cigvis[viser]"],
            )

        scene = self.adapter.compile_scene(canonical_state)
        return self.adapter.launch_interactive(scene, port, ttl_seconds)
