from app.config import get_settings


def send_email(to_email: str, subject: str, body: str) -> None:
    settings = get_settings()
    if settings.environment == "development":
        print(f"[email:dev] to={to_email} subject={subject} body={body}")
    else:
        # Integrate SMTP, SendGrid, SES, or Resend here.
        print(f"[email:queued] to={to_email} subject={subject}")
