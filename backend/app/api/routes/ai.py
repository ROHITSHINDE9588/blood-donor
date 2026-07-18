from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database.session import get_db
from app.models import BloodRequest, User, UserRole
from app.schemas.ai import RankDonorRequest, RankedDonor, VerificationResult, ChatRequest, ChatResponse, DemandPrediction
from app.services.document_verification import verify_document
from app.services.ranking import rank_donors
from app.utils.uploads import save_secure_upload

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/rank-donor", response_model=list[RankedDonor])
def rank_donor(
    payload: RankDonorRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    request = db.get(BloodRequest, payload.request_id) if payload.request_id else None
    return rank_donors(db, payload.blood_group, payload.latitude, payload.longitude, request=request, city=payload.city)


@router.post("/verify-id", response_model=VerificationResult)
async def verify_id(
    file: UploadFile = File(...),
    _: User = Depends(require_roles(UserRole.DONOR, UserRole.HOSPITAL, UserRole.ADMIN)),
):
    path = await save_secure_upload(file, "ids")
    return verify_document(path, "identity_card")


@router.post("/verify-certificate", response_model=VerificationResult)
async def verify_certificate(
    file: UploadFile = File(...),
    _: User = Depends(require_roles(UserRole.HOSPITAL, UserRole.ADMIN)),
):
    path = await save_secure_upload(file, "certificates")
    return verify_document(path, "blood_donation_certificate")


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatRequest,
    _: User = Depends(get_current_user),
):
    # Mock fallback logic as requested by user's plan
    msg = payload.message.lower()
    if "tattoo" in msg:
        reply = "You can usually donate blood after getting a tattoo, but most organizations require you to wait 3 to 6 months depending on the state and if the facility was state-regulated."
    elif "antibiotics" in msg:
        reply = "If you are taking antibiotics for an active infection, you should not donate. However, if you have finished the course and feel healthy, you are typically eligible to donate."
    elif "age" in msg:
        reply = "Generally, blood donors must be at least 17 years old (or 16 with parental consent) and in good health."
    else:
        reply = "I am an AI assistant here to help you with blood donation questions! While I can provide general guidelines, please always consult with your local blood bank or doctor for medical advice."
    
    return ChatResponse(reply=reply)


@router.get("/predictive-demand", response_model=list[DemandPrediction])
def get_predictive_demand(
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    # Mock data for demonstration purposes
    return [
        DemandPrediction(blood_group="O-", predicted_demand_units=45, trend="increasing"),
        DemandPrediction(blood_group="A+", predicted_demand_units=20, trend="stable"),
        DemandPrediction(blood_group="B-", predicted_demand_units=15, trend="decreasing"),
        DemandPrediction(blood_group="AB+", predicted_demand_units=30, trend="increasing"),
    ]
