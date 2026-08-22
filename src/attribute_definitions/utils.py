import asyncio
import json
from datetime import UTC, datetime

from src.attribute_definitions import constants

_store_lock = asyncio.Lock()


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def to_definition_out(record: dict):
    from src.attribute_definitions.schemas import AttributeDefinitionOut

    return AttributeDefinitionOut(
        id=record["id"],
        key=record["key"],
        label=record["label"],
        status=record["status"],
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )


def label_available(data: dict[str, dict], label: str, exclude_id: str | None = None) -> bool:
    return not any(
        record["id"] != exclude_id and record["status"] == "active" and record["label"] == label
        for record in data.values()
    )


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
