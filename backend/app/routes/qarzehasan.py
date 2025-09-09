from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import math

router = APIRouter()

class QardHasanRequest(BaseModel):
    loan_amount: float
    repayment_term_months: int
    repayment_frequency: str  # "monthly" or "quarterly"
    optional_donation: float = 0.0

class QardHasanResponse(BaseModel):
    installment_amount: float
    total_donation: float
    total_payable: float
    number_of_installments: int

@router.post("/qard-hasan", response_model=QardHasanResponse)
async def calculate_qard_hasan(data: QardHasanRequest):
    try:
        if data.loan_amount <= 0 or data.repayment_term_months <= 0:
            raise ValueError("Invalid input values.")

        frequency_mapping = {
            "monthly": 1,
            "quarterly": 3
        }

        months_per_installment = frequency_mapping.get(data.repayment_frequency)
        if months_per_installment is None:
            raise ValueError("Invalid repayment frequency.")

        number_of_installments = math.ceil(data.repayment_term_months / months_per_installment)

        base_installment = data.loan_amount / number_of_installments
        donation_per_installment = data.optional_donation / number_of_installments if data.optional_donation > 0 else 0
        total_installment = base_installment + donation_per_installment

        total_payable = total_installment * number_of_installments
        total_donation = donation_per_installment * number_of_installments

        return QardHasanResponse(
            installment_amount=round(total_installment, 2),
            total_donation=round(total_donation, 2),
            total_payable=round(total_payable, 2),
            number_of_installments=number_of_installments
        )

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
