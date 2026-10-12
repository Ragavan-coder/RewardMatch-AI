from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from services.rag_service import RAGPolicyEngine

router = APIRouter(prefix="/rag", tags=["RAG Policy Assistant (v1)"])


@router.post("/query", response_model=schemas.RAGQueryResponse)
def query_policy_rag(payload: schemas.RAGQueryRequest, db: Session = Depends(get_db)):
    """
    RAG policy assistant combining vector document search with deterministic SQL rule checks.
    Returns official policy answers with verifiable source document citations and exact passages.
    """
    return RAGPolicyEngine.answer_policy_query(db, payload.query, payload.target_date)
