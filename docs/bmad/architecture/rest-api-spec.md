# REST API Spec

```yaml
openapi: 3.0.0
info:
  title: StandUpStrip API
  version: 1.0.0
  description: API for daily standup management
servers:
  - url: /api
    description: Base API path
paths:
  /auth/register:
    post:
      summary: Register new user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email: {type: string}
                password: {type: string}
                name: {type: string}
  /teams:
    post:
      summary: Create new team
      security:
        - bearerAuth: []
  /standups:
    post:
      summary: Submit standup
      security:
        - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---
