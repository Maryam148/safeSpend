from .zakat import router as zakat_router
from .leasing import router as leasing_router
from .mudarabah import router as mudarabah_router
from .murabaha import router as murabaha_router
from .istisna import router as istisna_router
from .takaful import router as takaful_router
from .qarzehasan import router as qarz_router
from .partnership import router as partnership_router
from .pension import router as pension_router
from .prices import router as prices_router
from .chat import router as chat_router

all_routes = [
    zakat_router, 
    leasing_router, 
    mudarabah_router, 
    murabaha_router, 
    istisna_router, 
    takaful_router, 
    qarz_router, 
    partnership_router, 
    pension_router,
    prices_router,
    chat_router
]
