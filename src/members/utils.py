import asyncio
import json
from datetime import UTC, datetime

from src.members import constants

_store_lock = asyncio.Lock()


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def to_member_out(record: dict):
    from src.members.schemas import MemberOut

    return MemberOut(
        id=record["id"],
        name=record["name"],
        email=record["email"],
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )


def email_exists(data: dict[str, dict], email: str, exclude_id: str | None = None) -> bool:
    return any(r["email"] == email and r["id"] != exclude_id for r in data.values())


def load_sync() -> dict[str, dict]:
    if not constants.DATA_FILE.exists():
        return {}
    try:
        return json.loads(constants.DATA_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def save_sync(data: dict[str, dict]) -> None:
    constants.DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_file = constants.DATA_FILE.with_name(f"{constants.DATA_FILE.name}.tmp")
    tmp_file.write_text(json.dumps(data, indent=2, default=str))
    tmp_file.replace(constants.DATA_FILE)


async def load() -> dict[str, dict]:
    async with _store_lock:
        return await asyncio.to_thread(load_sync)


async def save(data: dict[str, dict]) -> None:
    async with _store_lock:
        await asyncio.to_thread(save_sync, data)
