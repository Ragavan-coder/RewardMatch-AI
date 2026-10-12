from fastapi import APIRouter
from routers.v1.cards_v1 import router as cards_router
from routers.v1.upi_v1 import router as upi_router
from routers.v1.offers_v1 import router as offers_router
from routers.v1.admin_v1 import router as admin_router
from routers.v1.rag_v1 import router as rag_router
from routers.v1.activity_v1 import router as activity_router
from routers.v1.savings_v1 import router as savings_router
from routers.v1.monitor_v1 import router as monitor_router
from routers.v1.reports_v1 import router as reports_router
from routers.v1.notifications_v1 import router as notifications_router

v1_router = APIRouter(prefix="/v1")
v1_router.include_router(cards_router)
v1_router.include_router(upi_router)
v1_router.include_router(offers_router)
v1_router.include_router(admin_router)
v1_router.include_router(rag_router)
v1_router.include_router(activity_router)
v1_router.include_router(savings_router)
v1_router.include_router(monitor_router)
v1_router.include_router(reports_router)
v1_router.include_router(notifications_router)

__all__ = ["v1_router"]

