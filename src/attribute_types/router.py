from fastapi import APIRouter

from src.attribute_types.registry import list_attribute_types
from src.attribute_types.schemas import AttributeTypeOut

router = APIRouter(tags=["attribute-types"])


@router.get("/attribute-types", response_model=list[AttributeTypeOut])
async def get_attribute_types() -> list[AttributeTypeOut]:
    return list_attribute_types()
