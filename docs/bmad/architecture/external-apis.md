# External APIs

### Google Gemini API
- **Purpose:** Content generation and summarization
- **Base URL:** `https://generativelanguage.googleapis.com`
- **Authentication:** API Key (via Header/Query param)
- **Rate Limits:** 15 RPM (Free Tier)
- **Key Endpoints:** `POST /v1beta/models/gemini-pro:generateContent`
- **Integration Notes:** Must handle timeouts gracefuly; implement fallback logic if API key is invalid or quota exceeded.

### Email Service (SMTP/Resend)
- **Purpose:** Transactional emails (Verification, Password Reset)
- **Authentication:** SMTP Credentials / API Key
- **Integration Notes:** Async sending recommended to avoid blocking HTTP threads.

---
