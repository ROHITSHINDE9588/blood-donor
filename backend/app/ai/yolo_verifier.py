from pathlib import Path

import cv2
from PIL import Image

try:
    from ultralytics import YOLO
except Exception:  # pragma: no cover - optional runtime dependency behavior
    YOLO = None

from app.config import get_settings
from app.schemas.ai import VerificationResult


class DocumentVerifier:
    def __init__(self):
        self.settings = get_settings()
        self._model = None

    @property
    def model(self):
        if self._model is None and YOLO is not None:
            self._model = YOLO(self.settings.yolo_model_path)
        return self._model

    def verify(self, path: Path, document_type: str) -> VerificationResult:
        reasons: list[str] = []
        confidence = 0.0

        if path.suffix.lower() == ".pdf":
            return VerificationResult(
                accepted=True,
                document_type=document_type,
                confidence=0.72,
                extracted_text="PDF OCR placeholder. Connect Tesseract or a cloud OCR provider in production.",
                reasons=["PDF accepted for manual review"],
            )

        image = cv2.imread(str(path))
        if image is None:
            return VerificationResult(accepted=False, document_type=document_type, confidence=0, reasons=["Unreadable image"])

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur_score < 75:
            reasons.append("Image appears blurry")

        width, height = Image.open(path).size
        if width < 500 or height < 300:
            reasons.append("Image resolution is too low")

        if self.model is not None:
            results = self.model(str(path), verbose=False)
            if results and len(results[0].boxes) > 0:
                confidence = float(results[0].boxes.conf.max().item())
            else:
                reasons.append("No recognizable document object detected")
        else:
            confidence = 0.68
            reasons.append("YOLO unavailable; used image quality fallback")

        accepted = confidence >= 0.45 and not any("blurry" in reason.lower() for reason in reasons)
        extracted_text = "OCR extraction placeholder. Add pytesseract/easyocr for live extraction."
        return VerificationResult(
            accepted=accepted,
            document_type=document_type,
            confidence=round(confidence, 3),
            extracted_text=extracted_text,
            reasons=reasons,
        )


document_verifier = DocumentVerifier()
