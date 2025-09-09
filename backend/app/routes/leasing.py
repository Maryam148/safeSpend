# leasing.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

router = APIRouter()

def calculate_capitalized_cost(vehicle_price: float, down_payment: float, trade_in_value: float) -> float:
    """Calculate the capitalized cost (adjusted vehicle price)"""
    return vehicle_price - down_payment - trade_in_value

def calculate_residual_value(vehicle_price: float, residual_percentage: float) -> float:
    """Calculate residual value based on percentage"""
    return vehicle_price * (residual_percentage / 100)

def calculate_depreciation(capitalized_cost: float, residual_value: float) -> float:
    """Calculate total depreciation over lease term"""
    return capitalized_cost - residual_value

def calculate_depreciation_payment(total_depreciation: float, lease_term_months: int) -> float:
    """Calculate monthly depreciation payment"""
    return total_depreciation / lease_term_months

def convert_interest_rate_to_money_factor(interest_rate: float) -> float:
    """Convert annual interest rate to money factor"""
    return interest_rate / 2400

def convert_money_factor_to_interest_rate(money_factor: float) -> float:
    """Convert money factor to annual interest rate"""
    return money_factor * 2400

def calculate_finance_payment(capitalized_cost: float, residual_value: float, money_factor: float) -> float:
    """Calculate monthly finance payment (interest)"""
    return (capitalized_cost + residual_value) * money_factor

def calculate_monthly_tax(depreciation_payment: float, finance_payment: float, tax_rate: float) -> float:
    """Calculate monthly sales tax"""
    return (depreciation_payment + finance_payment) * (tax_rate / 100)

def calculate_monthly_payment(depreciation_payment: float, finance_payment: float, monthly_tax: float) -> float:
    """Calculate total monthly lease payment"""
    return depreciation_payment + finance_payment + monthly_tax

def calculate_due_at_signing(
    first_month_payment: float,
    down_payment: float,
    security_deposit: float,
    acquisition_fee: float,
    include_first_month: bool
) -> float:
    """Calculate total amount due at signing"""
    due_at_signing = down_payment + security_deposit + acquisition_fee
    
    if include_first_month:
        due_at_signing += first_month_payment
    
    return due_at_signing

def calculate_total_costs(
    monthly_payment: float,
    lease_term_months: int,
    due_at_signing: float,
    disposition_fee: float,
    gap_insurance: float,
    extended_warranty: float,
    maintenance_package: float
) -> dict:
    """Calculate various total cost metrics"""
    total_of_payments = monthly_payment * lease_term_months
    total_lease_cost = total_of_payments + due_at_signing + disposition_fee + gap_insurance + extended_warranty + maintenance_package
    
    return {
        "total_of_payments": total_of_payments,
        "total_lease_cost": total_lease_cost
    }

class LeasingRequest(BaseModel):
    # Vehicle Information
    vehicle_price: float = Field(gt=0, description="Vehicle price")
    down_payment: float = Field(ge=0, default=0, description="Down payment amount")
    trade_in_value: float = Field(ge=0, default=0, description="Trade-in value")
    
    # Lease Terms
    lease_term_months: int = Field(gt=0, default=36, description="Lease term in months")
    annual_mileage: int = Field(gt=0, default=12000, description="Annual mileage limit")
    residual_value_percentage: float = Field(gt=0, le=100, default=60, description="Residual value percentage")
    
    # Financial Details
    money_factor: Optional[float] = Field(ge=0, default=None, description="Money factor (lease rate)")
    interest_rate: Optional[float] = Field(ge=0, default=None, description="Annual interest rate percentage")
    sales_tax_rate: float = Field(ge=0, le=50, default=0, description="Sales tax rate percentage")
    
    # Additional Costs
    acquisition_fee: float = Field(ge=0, default=0, description="Acquisition fee")
    disposition_fee: float = Field(ge=0, default=0, description="Disposition fee")
    security_deposit: float = Field(ge=0, default=0, description="Security deposit")
    first_month_payment: bool = Field(default=False, description="Include first month payment upfront")
    
    # Insurance & Extras
    gap_insurance: float = Field(ge=0, default=0, description="GAP insurance cost")
    extended_warranty: float = Field(ge=0, default=0, description="Extended warranty cost")
    maintenance_package: float = Field(ge=0, default=0, description="Maintenance package cost")

class LeasingResponse(BaseModel):
    # Monthly Payment Details
    monthly_payment: float
    depreciation_payment: float
    finance_payment: float
    monthly_tax: float
    
    # Lease Summary
    vehicle_price: float
    capitalized_cost: float
    residual_value: float
    total_depreciation: float
    
    # Financial Details
    money_factor: float
    annual_interest_rate: float
    
    # Total Costs
    due_at_signing: float
    total_of_payments: float
    total_lease_cost: float
    
    # Additional Information
    monthly_mileage_limit: float
    disposition_fee: float
    
    # Cost Breakdown
    additional_costs: Dict[str, float]

@router.post("/leasing", response_model=LeasingResponse)
def calculate_leasing(data: LeasingRequest) -> Dict[str, Any]:
    """Calculate lease payment and terms based on provided data"""
    
    try:
        # Validate input: Either money_factor or interest_rate must be provided
        if data.money_factor is None and data.interest_rate is None:
            raise HTTPException(status_code=400, detail="Either money_factor or interest_rate must be provided")
        
        # Calculate money factor and interest rate
        if data.money_factor is not None:
            money_factor = data.money_factor
            annual_interest_rate = convert_money_factor_to_interest_rate(money_factor)
        else:
            annual_interest_rate = data.interest_rate
            money_factor = convert_interest_rate_to_money_factor(annual_interest_rate)
        
        # Calculate capitalized cost
        capitalized_cost = calculate_capitalized_cost(
            data.vehicle_price,
            data.down_payment,
            data.trade_in_value
        )
        
        # Calculate residual value
        residual_value = calculate_residual_value(
            data.vehicle_price,
            data.residual_value_percentage
        )
        
        # Calculate depreciation
        total_depreciation = calculate_depreciation(capitalized_cost, residual_value)
        depreciation_payment = calculate_depreciation_payment(total_depreciation, data.lease_term_months)
        
        # Calculate finance payment
        finance_payment = calculate_finance_payment(capitalized_cost, residual_value, money_factor)
        
        # Calculate monthly tax
        monthly_tax = calculate_monthly_tax(depreciation_payment, finance_payment, data.sales_tax_rate)
        
        # Calculate monthly payment
        monthly_payment = calculate_monthly_payment(depreciation_payment, finance_payment, monthly_tax)
        
        # Calculate due at signing
        due_at_signing = calculate_due_at_signing(
            monthly_payment,
            data.down_payment,
            data.security_deposit,
            data.acquisition_fee,
            data.first_month_payment
        )
        
        # Calculate total costs
        total_costs = calculate_total_costs(
            monthly_payment,
            data.lease_term_months,
            due_at_signing,
            data.disposition_fee,
            data.gap_insurance,
            data.extended_warranty,
            data.maintenance_package
        )
        
        # Additional calculations
        monthly_mileage_limit = data.annual_mileage / 12
        
        # Additional costs breakdown
        additional_costs = {
            "acquisition_fee": data.acquisition_fee,
            "disposition_fee": data.disposition_fee,
            "security_deposit": data.security_deposit,
            "gap_insurance": data.gap_insurance,
            "extended_warranty": data.extended_warranty,
            "maintenance_package": data.maintenance_package
        }
        
        return {
            # Monthly Payment Details
            "monthly_payment": round(monthly_payment, 2),
            "depreciation_payment": round(depreciation_payment, 2),
            "finance_payment": round(finance_payment, 2),
            "monthly_tax": round(monthly_tax, 2),
            
            # Lease Summary
            "vehicle_price": round(data.vehicle_price, 2),
            "capitalized_cost": round(capitalized_cost, 2),
            "residual_value": round(residual_value, 2),
            "total_depreciation": round(total_depreciation, 2),
            
            # Financial Details
            "money_factor": round(money_factor, 6),
            "annual_interest_rate": round(annual_interest_rate, 2),
            
            # Total Costs
            "due_at_signing": round(due_at_signing, 2),
            "total_of_payments": round(total_costs["total_of_payments"], 2),
            "total_lease_cost": round(total_costs["total_lease_cost"], 2),
            
            # Additional Information
            "monthly_mileage_limit": round(monthly_mileage_limit, 0),
            "disposition_fee": round(data.disposition_fee, 2),
            
            # Cost Breakdown
            "additional_costs": {k: round(v, 2) for k, v in additional_costs.items()}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating lease: {str(e)}")

# Additional utility endpoint for money factor conversion
@router.post("/leasing/convert-rate")
def convert_rate(interest_rate: Optional[float] = None, money_factor: Optional[float] = None):
    """Convert between interest rate and money factor"""
    
    if interest_rate is not None:
        return {
            "interest_rate": interest_rate,
            "money_factor": convert_interest_rate_to_money_factor(interest_rate)
        }
    elif money_factor is not None:
        return {
            "money_factor": money_factor,
            "interest_rate": convert_money_factor_to_interest_rate(money_factor)
        }
    else:
        raise HTTPException(status_code=400, detail="Either interest_rate or money_factor must be provided")