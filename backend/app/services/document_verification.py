from pathlib import Path

from app.ai.yolo_verifier import document_verifier
from app.schemas.ai import VerificationResult


def verify_document(path: Path, document_type: str) -> VerificationResult:
    return document_verifier.verify(path, document_type)
