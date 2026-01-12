# Security

### Input Validation
- **Library:** Java Bean Validation (JSR 380) / Jakarta Validation
- **Location:** DTO level (@NotNull, @Size, @Email)
- **Rules:** All API inputs must be vetted before processing.

### Authentication & Authorization
- **Auth Method:** JWT (Bearer Token)
- **Patterns:** Spring Security Filter Chain
- **Password:** Bcrypt Hashing (strength 10)

### Secrets Management
- **Production:** Platform Environment Variables (Never committed to git)
- **Development:** `.env` file (gitignored)

---

*Document created using BMad-METHOD™ Architecture Template v2.0*
