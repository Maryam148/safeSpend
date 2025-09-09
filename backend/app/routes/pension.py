from fastapi import APIRouter
from pydantic import BaseModel
from math import pow

router = APIRouter()

class PensionInput(BaseModel):
    current_age: int
    retirement_age: int
    monthly_contribution: float
    expected_return_rate: float  # annual rate in %
    inflation_rate: float = 0.0  # optional

@router.post("/pension-planner")
def calculate_pension(data: PensionInput):
    n_years = data.retirement_age - data.current_age
    n_months = n_years * 12
    monthly_rate = (data.expected_return_rate / 100) / 12

    # Future Value of Monthly Contributions (FV of annuity)
    fv = data.monthly_contribution * ((pow(1 + monthly_rate, n_months) - 1) / monthly_rate)

    # Adjust for inflation
    inflation_adjustment = pow(1 + (data.inflation_rate / 100), n_years)
    real_fv = fv / inflation_adjustment if inflation_adjustment else fv

    return {
        "future_value": round(real_fv, 2),
        "years_until_retirement": n_years,
        "inflation_rate": data.inflation_rate,
        "monthly_contribution": data.monthly_contribution,
        "expected_return_rate": data.expected_return_rate
    }
