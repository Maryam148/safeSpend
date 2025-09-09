from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

router = APIRouter()

def calculate_total_assets(cash: float, gold: float, gold_rate: float, silver: float, silver_rate: float, business_assets: float) -> float:
    """Calculate total assets value"""
    total = (
        cash +
        (gold * gold_rate) +
        (silver * silver_rate) +
        business_assets
    )
    return total

def calculate_zakatable_amount(total_assets: float, liabilities: float) -> float:
    """Calculate zakatable amount after deducting liabilities"""
    return max(total_assets - liabilities, 0)

def calculate_nisab(gold_rate: float) -> float:
    """Calculate nisab threshold (85 grams of gold)"""
    return 85 * gold_rate

def calculate_zakat_due(zakatable_amount: float, nisab: float) -> float:
    """Calculate zakat due (2.5% if above nisab)"""
    if zakatable_amount >= nisab:
        return zakatable_amount * 0.025
    return 0

class ZakatRequest(BaseModel):
    cash: float = Field(ge=0, description="Cash amount in PKR")
    gold: float = Field(ge=0, description="Gold amount in grams")
    silver: float = Field(ge=0, description="Silver amount in grams")
    business_assets: float = Field(ge=0, description="Business assets value in PKR")
    liabilities: float = Field(ge=0, description="Total liabilities in PKR")
    gold_rate_per_gram: float = Field(gt=0, description="Gold price per gram in PKR")
    silver_rate_per_gram: float = Field(ge=0, description="Silver price per gram in PKR")

class ZakatResponse(BaseModel):
    total_assets: float
    zakatable_amount: float
    nisab: float
    zakat_due: float
    is_zakat_applicable: bool

@router.post("/zakat", response_model=ZakatResponse)
def calculate_zakat(data: ZakatRequest) -> Dict[str, Any]:
    """Calculate zakat based on provided financial data"""
    
    try:
        # Calculate total assets
        total_assets = calculate_total_assets(
            data.cash,
            data.gold,
            data.gold_rate_per_gram,
            data.silver,
            data.silver_rate_per_gram,
            data.business_assets
        )

        # Calculate zakatable amount
        zakatable_amount = calculate_zakatable_amount(total_assets, data.liabilities)
        
        # Calculate nisab threshold
        nisab = calculate_nisab(data.gold_rate_per_gram)
        
        # Calculate zakat due
        zakat_due = calculate_zakat_due(zakatable_amount, nisab)
        
        # Determine if zakat is applicable
        is_zakat_applicable = zakatable_amount >= nisab

        return {
            "total_assets": round(total_assets, 2),
            "zakatable_amount": round(zakatable_amount, 2),
            "nisab": round(nisab, 2),
            "zakat_due": round(zakat_due, 2),
            "is_zakat_applicable": is_zakat_applicable
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating zakat: {str(e)}")