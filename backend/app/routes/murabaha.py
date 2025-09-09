from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal
import math

router = APIRouter()

class MurabahaInput(BaseModel):
    asset_cost: float
    profit_margin_percentage: float = 0
    profit_margin_amount: float = 0
    payment_term_months: int
    down_payment: float = 0
    processing_fee: float = 0
    documentation_fee: float = 0
    insurance_cost: float = 0
    payment_frequency: Literal["monthly", "quarterly", "semi-annual", "annual"] = "monthly"
    grace_period_months: int = 0
    early_settlement_discount: float = 0  # percentage

@router.post("/murabaha")
async def calculate_murabaha(data: MurabahaInput):
    # Calculate profit amount
    if data.profit_margin_amount > 0:
        total_profit = data.profit_margin_amount
    else:
        total_profit = data.asset_cost * (data.profit_margin_percentage / 100)

    total_sale_price = data.asset_cost + total_profit

    total_additional_fees = data.processing_fee + data.documentation_fee + data.insurance_cost
    total_price_with_fees = total_sale_price + total_additional_fees

    financed_amount = total_price_with_fees - data.down_payment

    # Grace period adjustment (no payments, but profit still accumulates)
    effective_term = data.payment_term_months - data.grace_period_months
    if effective_term <= 0:
        effective_term = data.payment_term_months  # fallback

    # Determine payment frequency
    freq_map = {
        "monthly": 12,
        "quarterly": 4,
        "semi-annual": 2,
        "annual": 1
    }
    payments_per_year = freq_map.get(data.payment_frequency, 12)
    number_of_payments = math.ceil((effective_term / 12) * payments_per_year)

    installment_amount = financed_amount / number_of_payments if number_of_payments > 0 else 0

    # Total payments made over time
    total_of_payments = installment_amount * number_of_payments
    total_cost = data.down_payment + total_of_payments + total_additional_fees

    # Early settlement logic
    early_settlement_amount = 0
    early_settlement_savings = 0
    if data.early_settlement_discount > 0:
        discount_rate = data.early_settlement_discount / 100
        early_settlement_amount = financed_amount * (1 - discount_rate)
        early_settlement_savings = financed_amount - early_settlement_amount

    # Effective profit rate
    effective_profit_rate = (total_profit / data.asset_cost) * 100 if data.asset_cost else 0

    return {
        "asset_cost": round(data.asset_cost, 2),
        "total_profit": round(total_profit, 2),
        "total_sale_price": round(total_sale_price, 2),
        "processing_fee": round(data.processing_fee, 2),
        "documentation_fee": round(data.documentation_fee, 2),
        "insurance_cost": round(data.insurance_cost, 2),
        "down_payment": round(data.down_payment, 2),
        "financed_amount": round(financed_amount, 2),
        "installment_amount": round(installment_amount, 2),
        "number_of_payments": number_of_payments,
        "payment_frequency": data.payment_frequency,
        "total_of_payments": round(total_of_payments, 2),
        "total_cost": round(total_cost, 2),
        "early_settlement_amount": round(early_settlement_amount, 2),
        "early_settlement_savings": round(early_settlement_savings, 2),
        "effective_profit_rate": round(effective_profit_rate, 2)
    }
