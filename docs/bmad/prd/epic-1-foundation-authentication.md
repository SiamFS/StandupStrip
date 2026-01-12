# Epic 1: Foundation & Authentication

**Expanded Goal:** Set up the full-stack application infrastructure (Next.js frontend, Spring Boot backend, PostgreSQL database) and implement secure user authentication with email verification and password reset flows. This epic delivers a fully functional auth system that supports all subsequent features.

### Story 1.1: User Registration

**As a** new user,  
**I want** to register with my email and password,  
**so that** I can create an account and access the application.

**Acceptance Criteria:**
1. Registration form accepts email (unique validation) and password (min 8 characters)
2. Password is hashed with bcrypt before storage
3. User record is created with `verified=false` status
4. Verification email is sent with unique token (24-hour expiry)
5. User cannot log in until email is verified
6. Duplicate email registration returns 409 Conflict error

### Story 1.2: Email Verification

**As a** registered user,  
**I want** to verify my email address via a link,  
**so that** I can activate my account and log in.

**Acceptance Criteria:**
1. Clicking verification link validates token and marks user as verified
2. Expired tokens (>24 hours) return error with "Resend Verification" option
3. Already-verified users see success message without error
4. Invalid tokens return 404 error
5. Successful verification redirects to login page with success toast

### Story 1.3: User Login

**As a** verified user,  
**I want** to log in with my email and password,  
**so that** I can access my teams and standups.

**Acceptance Criteria:**
1. Login form accepts email and password
2. Unverified users receive 403 error with "Resend Verification Email" link
3. Invalid credentials return 401 error
4. Successful login returns JWT token (24-hour expiry)
5. JWT is stored in localStorage and included in all API requests
6. User is redirected to dashboard after login

### Story 1.4: Password Reset Flow

**As a** user who forgot my password,  
**I want** to reset it via email,  
**so that** I can regain access to my account.

**Acceptance Criteria:**
1. "Forgot Password" link on login page opens reset request form
2. Entering email sends reset token (1-hour expiry) to user's email
3. Reset link opens form with new password input (min 8 characters)
4. Submitting new password updates password hash and invalidates token
5. Expired tokens return error with option to request new reset
6. Successful reset redirects to login with success toast

### Story 1.5: User Profile Management

**As a** logged-in user,  
**I want** to view and update my profile information,  
**so that** I can keep my account details current.

**Acceptance Criteria:**
1. Profile page displays name, email, and verification status
2. User can update name (min 2 characters)
3. User can update email (triggers new verification email)
4. Profile updates return success toast
5. Invalid inputs show validation errors

---
