from __future__ import annotations

from typing import Any


async def agentzero_engineer(**kwargs: Any):
    from arifosmcp.runtime.tools import agentzero_engineer as impl

    return await impl(**kwargs)


async def agentzero_validate(**kwargs: Any):
    from arifosmcp.runtime.tools import agentzero_validate as impl

    return await impl(**kwargs)


async def agentzero_armor_scan(**kwargs: Any):
    from arifosmcp.runtime.tools import agentzero_armor_scan as impl

    return await impl(**kwargs)


async def agentzero_hold_check(**kwargs: Any):
    from arifosmcp.runtime.tools import agentzero_hold_check as impl

    return await impl(**kwargs)


async def agentzero_memory_query(**kwargs: Any):
    from arifosmcp.runtime.tools import agentzero_memory_query as impl

    return await impl(**kwargs)

