from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from math import ceil

router = APIRouter()

class IstisnaInput(BaseModel):
    manufacturing_cost: float
    profit_margin_percentage: float
    delivery_period_months: int
    payment_schedule: str  # e.g., "monthly", "quarterly", etc.
    advance_payment: float
    additional_costs: float

@router.post("/istisna")
async def calculate_istisna(data: IstisnaInput):
    try:
        # Extract values
        cost = data.manufacturing_cost
        margin_pct = data.profit_margin_percentage
        delivery_months = data.delivery_period_months
        schedule = data.payment_schedule
        advance = data.advance_payment
        additional = data.additional_costs

        # Calculate profit and total sale price
        profit_amount = (cost * margin_pct) / 100
        total_sale_price = cost + profit_amount + additional

        # Calculate number of payments
        frequency_map = {
            "monthly": 1,
            "quarterly": 3,
            "semi-annual": 6,
            "lump-sum": delivery_months  # single payment at end
        }

        if schedule not in frequency_map:
            raise ValueError("Invalid payment schedule")

        interval = frequency_map[schedule]
        number_of_payments = 1 if schedule == "lump-sum" else ceil(delivery_months / interval)

        # Financed amount
        financed_amount = total_sale_price - advance

        # Installment amount
        installment_amount = financed_amount / number_of_payments if number_of_payments > 0 else financed_amount

        return {
            "total_sale_price": round(total_sale_price, 2),
            "advance_payment": round(advance, 2),
            "financed_amount": round(financed_amount, 2),
            "installment_amount": round(installment_amount, 2),
            "number_of_payments": number_of_payments,
            "profit_amount": round(profit_amount, 2),
            "payment_schedule": schedule
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation failed: {str(e)}")
