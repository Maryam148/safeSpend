from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Partner(BaseModel):
    name: str
    investment: float

class PartnershipRequest(BaseModel):
    partners: List[Partner]

@router.post("/business-partnership-split")
def calculate_partnership_split(data: PartnershipRequest):
    total_investment = sum(p.investment for p in data.partners)

    if total_investment == 0:
        raise HTTPException(status_code=400, detail="Total investment cannot be zero.")

    split_result = []
    for partner in data.partners:
        percentage = (partner.investment / total_investment) * 100
        split_result.append({
            "name": partner.name,
            "percentage": percentage
        })

    return {"split": split_result}
