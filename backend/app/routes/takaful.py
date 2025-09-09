from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class TakafulInput(BaseModel):
    age: int
    coverage_amount: float
    term_years: int
    health_status: str  # "excellent", "good", "average", "poor"

@router.post("/api/takaful")
def estimate_takaful(input: TakafulInput):
    if input.age <= 0 or input.coverage_amount <= 0 or input.term_years <= 0:
        raise HTTPException(status_code=400, detail="Invalid input values")

    # Base rate per 1000 PKR coverage (simplified)
    base_rate = 0.8

    # Adjust rate by age
    if input.age < 30:
        age_factor = 1.0
    elif input.age < 45:
        age_factor = 1.2
    elif input.age < 60:
        age_factor = 1.5
    else:
        age_factor = 2.0

    # Adjust rate by health status
    health_factors = {
        "excellent": 0.9,
        "good": 1.0,
        "average": 1.2,
        "poor": 1.5
    }

    health_factor = health_factors.get(input.health_status.lower(), 1.0)

    # Final premium rate per 1000 PKR
    premium_rate = base_rate * age_factor * health_factor

    # Calculate annual contribution
    annual_contribution = (input.coverage_amount / 1000) * premium_rate

    return {
        "annual_contribution": round(annual_contribution, 2)
    }
