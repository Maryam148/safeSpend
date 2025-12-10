from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(tags=["prices"])

# Cache for prices to avoid excessive API calls
_price_cache = {
    "gold": None,
    "silver": None,
    "last_updated": None,
    "cache_duration": timedelta(minutes=5)  # Cache for 5 minutes
}

class MetalPricesResponse(BaseModel):
    gold_price_per_gram: float
    silver_price_per_gram: float
    gold_price_per_ounce: float
    silver_price_per_ounce: float
    currency: str
    last_updated: str
    source: str


def fetch_metal_prices_from_api() -> dict:
    """
    Fetch live gold and silver prices from a free API.
    Uses metals.live API which provides free tier access.
    """
    try:
        # Using metals.live free API (no key required)
        response = requests.get(
            "https://api.metals.live/v1/spot",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            # metals.live returns array with gold and silver spot prices
            gold_price_usd = None
            silver_price_usd = None
            
            for metal in data:
                if metal.get("metal") == "gold":
                    gold_price_usd = metal.get("price")
                elif metal.get("metal") == "silver":
                    silver_price_usd = metal.get("price")
            
            if gold_price_usd and silver_price_usd:
                return {
                    "gold_usd": gold_price_usd,
                    "silver_usd": silver_price_usd,
                    "source": "metals.live"
                }
    except Exception as e:
        print(f"metals.live API error: {e}")
    
    # Fallback to goldapi.io if available (requires API key)
    gold_api_key = os.getenv("GOLD_API_KEY")
    if gold_api_key:
        try:
            headers = {"x-access-token": gold_api_key}
            gold_resp = requests.get(
                "https://www.goldapi.io/api/XAU/USD",
                headers=headers,
                timeout=10
            )
            silver_resp = requests.get(
                "https://www.goldapi.io/api/XAG/USD", 
                headers=headers,
                timeout=10
            )
            
            if gold_resp.status_code == 200 and silver_resp.status_code == 200:
                gold_data = gold_resp.json()
                silver_data = silver_resp.json()
                return {
                    "gold_usd": gold_data.get("price"),
                    "silver_usd": silver_data.get("price"),
                    "source": "goldapi.io"
                }
        except Exception as e:
            print(f"goldapi.io API error: {e}")
    
    return None


def get_usd_to_pkr_rate() -> float:
    """Fetch current USD to PKR exchange rate"""
    try:
        # Using exchangerate-api.com free tier
        response = requests.get(
            "https://api.exchangerate-api.com/v4/latest/USD",
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("rates", {}).get("PKR", 278.0)  # Fallback rate
    except Exception as e:
        print(f"Exchange rate API error: {e}")
    
    # Fallback to approximate rate if API fails
    return 278.0


@router.get("/prices/metals", response_model=MetalPricesResponse)
async def get_metal_prices():
    """
    Get live gold and silver prices in PKR per gram.
    Prices are cached for 5 minutes to avoid excessive API calls.
    """
    global _price_cache
    
    now = datetime.utcnow()
    
    # Check cache
    if (_price_cache["last_updated"] and 
        _price_cache["gold"] and 
        _price_cache["silver"] and
        now - _price_cache["last_updated"] < _price_cache["cache_duration"]):
        
        return MetalPricesResponse(
            gold_price_per_gram=_price_cache["gold"]["per_gram_pkr"],
            silver_price_per_gram=_price_cache["silver"]["per_gram_pkr"],
            gold_price_per_ounce=_price_cache["gold"]["per_ounce_usd"],
            silver_price_per_ounce=_price_cache["silver"]["per_ounce_usd"],
            currency="PKR",
            last_updated=_price_cache["last_updated"].isoformat(),
            source=_price_cache.get("source", "cache")
        )
    
    # Fetch fresh prices
    prices = fetch_metal_prices_from_api()
    
    if not prices:
        # Use fallback prices based on approximate market rates
        # Gold: ~$2,650/oz, Silver: ~$31/oz (as of late 2024)
        prices = {
            "gold_usd": 2650.0,
            "silver_usd": 31.0,
            "source": "fallback (market closed or API unavailable)"
        }
    
    # Get exchange rate
    usd_to_pkr = get_usd_to_pkr_rate()
    
    # Convert from USD per troy ounce to PKR per gram
    # 1 troy ounce = 31.1035 grams
    GRAMS_PER_OUNCE = 31.1035
    
    gold_per_gram_pkr = (prices["gold_usd"] / GRAMS_PER_OUNCE) * usd_to_pkr
    silver_per_gram_pkr = (prices["silver_usd"] / GRAMS_PER_OUNCE) * usd_to_pkr
    
    # Update cache
    _price_cache["gold"] = {
        "per_ounce_usd": prices["gold_usd"],
        "per_gram_pkr": round(gold_per_gram_pkr, 2)
    }
    _price_cache["silver"] = {
        "per_ounce_usd": prices["silver_usd"],
        "per_gram_pkr": round(silver_per_gram_pkr, 2)
    }
    _price_cache["last_updated"] = now
    _price_cache["source"] = prices["source"]
    
    return MetalPricesResponse(
        gold_price_per_gram=round(gold_per_gram_pkr, 2),
        silver_price_per_gram=round(silver_per_gram_pkr, 2),
        gold_price_per_ounce=round(prices["gold_usd"], 2),
        silver_price_per_ounce=round(prices["silver_usd"], 2),
        currency="PKR",
        last_updated=now.isoformat(),
        source=prices["source"]
    )


@router.get("/prices/exchange-rate")
async def get_exchange_rate():
    """Get current USD to PKR exchange rate"""
    rate = get_usd_to_pkr_rate()
    return {
        "usd_to_pkr": rate,
        "currency_pair": "USD/PKR",
        "timestamp": datetime.utcnow().isoformat()
    }

