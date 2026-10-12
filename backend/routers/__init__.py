from fastapi import APIRouter
from routers.auth import router as auth_router
from routers.cards import router as cards_router
from routers.rewards import router as rewards_router
from routers.optimizer import router as optimizer_router
from routers.transactions import router as transactions_router
from routers.v1 import v1_router

api_router = APIRouter(prefix="/api")

# Existing application routers
api_router.include_router(auth_router)
api_router.include_router(cards_router)
api_router.include_router(rewards_router)
api_router.include_router(optimizer_router)
api_router.include_router(transactions_router)

# Master Data Collection & RAG v1 Router
api_router.include_router(v1_router)

__all__ = ["api_router"]
