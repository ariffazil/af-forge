"""
GEOX Earth Intelligence Skills MCP Server
FastMCP-based server exposing GEOX skills as MCP resources, prompts, and tools.
"""

import json
import os
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("geox")

REGISTRY_PATH = Path(__file__).parent.parent / "registry" / "registry.json"
SKILLS_PATH = Path(__file__).parent.parent / "skills"


@mcp.resource("geox://registry")
def get_registry() -> str:
    """Return the full GEOX skills registry."""
    with open(REGISTRY_PATH) as f:
        return f.read()


@mcp.resource("geox://skills/{skill_id}")
def get_skill(skill_id: str) -> str:
    """Return a specific skill document."""
    skill_path = SKILLS_PATH / skill_id.replace(".", "/") + ".md"
    if not skill_path.exists():
        return json.dumps({"error": f"Skill not found: {skill_id}"})
    with open(skill_path) as f:
        return f.read()


@mcp.resource("geox://domains/{domain}")
def get_domain_skills(domain: str) -> str:
    """Return all skills in a domain."""
    domain_path = SKILLS_PATH / domain
    if not domain_path.exists():
        return json.dumps({"error": f"Domain not found: {domain}"})

    skills = []
    for skill_file in domain_path.glob("*.md"):
        with open(skill_file) as f:
            skills.append(f.read())
    return json.dumps({"domain": domain, "skills": skills})


@mcp.prompt()
def geox_mission_template(scenario: str, location: str, objective: str) -> str:
    """GEOX mission prompt template for structured task execution."""
    return f"""You are executing a GEOX mission.

Scenario: {scenario}
Location: {location}
Objective: {objective}

Available GEOX skills: Use registry at geox://registry to select appropriate skills.
Follow the 888 HOLD protocol for irreversible actions.
Report all findings with confidence bands.
"""


@mcp.prompt()
def geox_human_approval_request(action: str, risk: str, justification: str) -> str:
    """Prompt for requesting human approval under 888 HOLD protocol."""
    return f"""HUMAN APPROVAL REQUIRED (888 HOLD)

Proposed Action: {action}
Risk Classification: {risk}
Justification: {justification}

This action requires explicit human confirmation before proceeding.
Awaiting approval response with CONFIRM or REJECT.
"""


@mcp.tool()
def list_skills(domain: str = None, substrate: str = None) -> dict:
    """List GEOX skills with optional filters."""
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)

    skills = registry["skills"]
    if domain:
        skills = [s for s in skills if s["domain"] == domain]
    if substrate:
        skills = [s for s in skills if substrate in s.get("substrates", [])]

    return {
        "count": len(skills),
        "skills": [
            {"id": s["id"], "title": s["title"], "domain": s["domain"]} for s in skills
        ],
    }


@mcp.tool()
def get_skill_metadata(skill_id: str) -> dict:
    """Get detailed metadata for a specific skill."""
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)

    for skill in registry["skills"]:
        if skill["id"] == skill_id:
            return skill

    return {"error": f"Skill not found: {skill_id}"}


@mcp.tool()
def get_dependencies(skill_id: str) -> dict:
    """Get skill dependencies."""
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)

    for skill in registry["skills"]:
        if skill["id"] == skill_id:
            deps = skill.get("depends_on", [])
            dep_skills = [s for s in registry["skills"] if s["id"] in deps]
            return {
                "skill": skill_id,
                "depends_on": [
                    {"id": s["id"], "title": s["title"]} for s in dep_skills
                ],
            }

    return {"error": f"Skill not found: {skill_id}"}


@mcp.tool()
def check_888_hold(action: str, risk_class: str) -> dict:
    """Check if action requires 888 HOLD human approval."""
    high_risk = risk_class in ["high", "critical"]
    return {
        "action": action,
        "risk_class": risk_class,
        "requires_approval": high_risk,
        "hold_type": "888_HOLD" if high_risk else "AUTO_APPROVE",
        "message": "HUMAN APPROVAL REQUIRED" if high_risk else "Auto-approved",
    }


if __name__ == "__main__":
    mcp.run()
