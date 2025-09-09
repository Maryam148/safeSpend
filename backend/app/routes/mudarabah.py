from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Dict, Any
import logging

# Configure logging for this module
logger = logging.getLogger(__name__)

router = APIRouter(tags=["mudarabah"])

def calculate_net_profit(total_revenue: float, total_expenses: float) -> float:
    """Calculate net profit or loss"""
    return total_revenue - total_expenses

def calculate_profit_distribution(
    net_profit: float,
    rabbul_mal_ratio: float,
    mudarib_ratio: float
) -> tuple:
    """Calculate profit distribution based on agreed ratios"""
    if net_profit > 0:
        rabbul_mal_share = net_profit * (rabbul_mal_ratio / 100)
        mudarib_share = net_profit * (mudarib_ratio / 100)
    else:
        rabbul_mal_share = 0
        mudarib_share = 0
    
    return rabbul_mal_share, mudarib_share

def calculate_loss_distribution(
    net_loss: float,
    rabbul_mal_investment: float,
    total_investment: float
) -> tuple:
    """In Mudarabah, losses are borne by capital provider only"""
    if net_loss < 0:
        # Loss is borne by Rabb-ul-Mal proportionally to their investment
        rabbul_mal_loss = abs(net_loss) * (rabbul_mal_investment / total_investment)
        mudarib_loss = 0  # Mudarib only loses time and effort
    else:
        rabbul_mal_loss = 0
        mudarib_loss = 0
    
    return rabbul_mal_loss, mudarib_loss

def calculate_total_returns(
    rabbul_mal_investment: float,
    mudarib_investment: float,
    rabbul_mal_profit: float,
    mudarib_profit: float,
    rabbul_mal_loss: float,
    management_fee: float,
    performance_bonus: float
) -> tuple:
    """Calculate total returns for both parties"""
    rabbul_mal_total = rabbul_mal_investment + rabbul_mal_profit - rabbul_mal_loss
    mudarib_total = mudarib_investment + mudarib_profit + management_fee + performance_bonus
    
    return rabbul_mal_total, mudarib_total

def calculate_roi(net_profit: float, total_investment: float) -> float:
    """Calculate return on investment percentage"""
    if total_investment == 0:
        return 0
    return (net_profit / total_investment) * 100

class ProfitSharingRequest(BaseModel):
    # Investment Details
    rabbul_mal_investment: float = Field(gt=0, description="Capital provider investment")
    mudarib_investment: float = Field(ge=0, default=0, description="Manager investment")
    
    # Revenue & Expenses
    total_revenue: float = Field(ge=0, description="Total business revenue")
    total_expenses: float = Field(ge=0, description="Total business expenses")
    
    # Profit Sharing Ratios
    rabbul_mal_profit_ratio: float = Field(ge=0, le=100, description="Capital provider profit share %")
    mudarib_profit_ratio: float = Field(ge=0, le=100, description="Manager profit share %")
    
    # Additional Information
    project_duration_months: int = Field(gt=0, default=12, description="Project duration")
    management_fee: float = Field(ge=0, default=0, description="Management fee")
    performance_bonus: float = Field(ge=0, default=0, description="Performance bonus")
    
    # Pydantic V2 model validator
    @model_validator(mode='after')
    def validate_profit_ratios(self):
        """Ensure profit ratios sum to 100%"""
        total = self.rabbul_mal_profit_ratio + self.mudarib_profit_ratio
        if total != 100:
            raise ValueError(f'Profit sharing ratios must sum to 100%, currently {total}%')
        return self

class ProfitSharingResponse(BaseModel):
    # Financial Summary
    total_investment: float
    total_revenue: float
    total_expenses: float
    net_profit: float
    roi: float
    
    # Rabb-ul-Mal (Capital Provider)
    rabbul_mal_investment: float
    rabbul_mal_profit_share: float
    rabbul_mal_loss_share: float
    rabbul_mal_total_return: float
    
    # Mudarib (Manager)
    mudarib_investment: float
    mudarib_profit_share: float
    management_fee: float
    performance_bonus: float
    mudarib_total_return: float
    
    # Additional Info
    project_duration_months: int
    monthly_roi: float

@router.post("/mudarabah", response_model=ProfitSharingResponse)
async def calculate_profit_sharing(data: ProfitSharingRequest) -> Dict[str, Any]:
    """Calculate Mudarabah profit sharing based on Islamic finance principles"""
    
    try:
        logger.info(f"Received mudarabah calculation request: {data}")
        
        # Calculate total investment
        total_investment = data.rabbul_mal_investment + data.mudarib_investment
        
        # Validate total investment
        if total_investment <= 0:
            raise HTTPException(status_code=400, detail="Total investment must be greater than zero")
        
        # Calculate net profit/loss
        net_profit = calculate_net_profit(data.total_revenue, data.total_expenses)
        logger.info(f"Net profit calculated: {net_profit}")
        
        # Calculate profit distribution
        rabbul_mal_profit, mudarib_profit = calculate_profit_distribution(
            net_profit,
            data.rabbul_mal_profit_ratio,
            data.mudarib_profit_ratio
        )
        
        # Calculate loss distribution (Islamic principle: losses borne by capital provider)
        rabbul_mal_loss, mudarib_loss = calculate_loss_distribution(
            net_profit,
            data.rabbul_mal_investment,
            total_investment
        )
        
        # Calculate total returns
        rabbul_mal_total, mudarib_total = calculate_total_returns(
            data.rabbul_mal_investment,
            data.mudarib_investment,
            rabbul_mal_profit,
            mudarib_profit,
            rabbul_mal_loss,
            data.management_fee,
            data.performance_bonus
        )
        
        # Calculate ROI
        roi = calculate_roi(net_profit, total_investment)
        monthly_roi = roi / data.project_duration_months if data.project_duration_months > 0 else 0
        
        result = {
            # Financial Summary
            "total_investment": round(total_investment, 2),
            "total_revenue": round(data.total_revenue, 2),
            "total_expenses": round(data.total_expenses, 2),
            "net_profit": round(net_profit, 2),
            "roi": round(roi, 2),
            
            # Rabb-ul-Mal (Capital Provider)
            "rabbul_mal_investment": round(data.rabbul_mal_investment, 2),
            "rabbul_mal_profit_share": round(rabbul_mal_profit, 2),
            "rabbul_mal_loss_share": round(rabbul_mal_loss, 2),
            "rabbul_mal_total_return": round(rabbul_mal_total, 2),
            
            # Mudarib (Manager)
            "mudarib_investment": round(data.mudarib_investment, 2),
            "mudarib_profit_share": round(mudarib_profit, 2),
            "management_fee": round(data.management_fee, 2),
            "performance_bonus": round(data.performance_bonus, 2),
            "mudarib_total_return": round(mudarib_total, 2),
            
            # Additional Info
            "project_duration_months": data.project_duration_months,
            "monthly_roi": round(monthly_roi, 2)
        }
        
        logger.info(f"Calculation successful, returning: {result}")
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating profit sharing: {str(e)}")

# Utility endpoint for ratio validation
@router.post("/profit-sharing/validate-ratios")
async def validate_ratios(rabbul_mal_ratio: float, mudarib_ratio: float):
    """Validate that profit sharing ratios sum to 100%"""
    
    total = rabbul_mal_ratio + mudarib_ratio
    
    return {
        "rabbul_mal_ratio": rabbul_mal_ratio,
        "mudarib_ratio": mudarib_ratio,
        "total": total,
        "is_valid": total == 100,
        "message": "Ratios are valid" if total == 100 else f"Ratios sum to {total}%, should be 100%"
    }

# Test endpoint
@router.get("/test-mudarabah")
async def test_mudarabah():
    return {"message": "Mudarabah router is working", "status": "ok"}