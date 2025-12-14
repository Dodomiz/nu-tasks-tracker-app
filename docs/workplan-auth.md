# Work Plan: Authentication & User Management
# NU Tasks Management Application

**Document Version:** 1.0  
**Created:** December 14, 2025  
**Sprint Duration:** 2 weeks per sprint  
**Team:** 1 Developer with AI Assistance  
**Target:** Complete authentication MVP in 3 sprints (6 weeks)

---

## Vision & Success Metrics

### Vision Statement

**For** families and small teams **who** need secure access to shared task management,  
**the** NU Authentication System **is a** user account management solution **that** provides seamless registration, login, and security with minimal friction while maintaining enterprise-grade protection.

### Success Metrics

**User Metrics:**
- Registration completion rate: >85%
- Login success rate: >95%
- Password reset completion: >80%
- Average time to first login: <2 minutes

**Security Metrics:**
- Zero unauthorized access incidents
- Account lockout effectiveness: 100% after 5 failed attempts
- Token refresh success rate: >99%
- Email verification rate: >70% within 24 hours

**Technical Metrics:**
- API response time: <150ms (95th percentile)
- Authentication uptime: >99.9%
- Password hash time: <500ms
- JWT generation time: <50ms

---

## Timeline Overview

**Total Scope:**
- 3 Epics (Frontend, Backend, Testing)
- 14 User Stories
- 3 Sprints (6 weeks)
- Estimated Effort: 24 developer-days with AI assistance

**Layered Approach:**
1. **Frontend First:** Build UI components and state management
2. **Backend Second:** Implement APIs and services
3. **Tests Last:** Comprehensive testing coverage

---

## Epic FE-001: Frontend Authentication Features

**Description:**  
Build complete client-side authentication experience including registration, login, profile management, and session persistence with secure token management and seamless user experience.

**Business Value:**  
- Direct user touchpoint for account creation and access
- First impression of application quality and security
- Enables user retention through persistent sessions
- Foundation for all authenticated user interactions

**Success Criteria:**
- [ ] Intuitive registration and login forms
- [ ] Client-side validation prevents invalid submissions
- [ ] Auth state persists across page refreshes
- [ ] Automatic token refresh prevents forced logouts
- [ ] Profile management with image upload
- [ ] Responsive design works on mobile and desktop

**Estimated Effort:** 9.5 days with AI  
**Priority:** **CRITICAL** (User-facing blocker)

---

## Frontend User Stories

### Story FE-US-001: Registration Form Component

**As a** new user  
**I want to** see an intuitive registration form  
**So that** I can easily create an account

**Acceptance Criteria:**
- [ ] **Given** I visit /register, **when** page loads, **then** I see form with firstName, lastName, email, password, confirmPassword fields
- [ ] **Given** I enter valid data, **when** I submit, **then** form sends POST /api/auth/register request
- [ ] **Given** passwords don't match, **when** I submit, **then** I see "Passwords do not match" error message
- [ ] **Given** email invalid format, **when** I blur field, **then** I see "Invalid email format" error
- [ ] **Given** password <8 characters, **when** I blur field, **then** I see "Password must be at least 8 characters" error
- [ ] **Given** registration successful, **when** response received, **then** I'm redirected to /dashboard
- [ ] **Given** registration fails, **when** error received, **then** I see error message from server (e.g., "Email already exists")
- [ ] **Given** request in progress, **when** waiting, **then** submit button is disabled with "Creating account..." text

**Technical Notes:**
- Use Tailwind CSS for styling (consistent with design system)
- Form component: Use controlled inputs with useState
- Validation: HTML5 required, email type, password minLength={8}
- Client-side validation: Check password match before submit
- RTK Query: Create useRegisterMutation() in authApiSlice
- Error display: Toast notification or inline error message
- Loading state: Disable button, show spinner or loading text

**Dependencies:**
- Auth pages routes already exist in Next.js app
- RTK Query store configured
- Tailwind CSS installed and configured

**Estimated Effort:** 1.5 days
- Form UI with Tailwind: 0.5 day
- Client-side validation: 0.5 day
- RTK Query mutation setup: 0.25 day
- Error handling and loading states: 0.25 day

**Priority:** **Must Have** (MVP Blocker)

---

### Story FE-US-002: Login Form Component

**As a** returning user  
**I want to** log in with my email and password  
**So that** I can access my account

**Acceptance Criteria:**
- [ ] **Given** I visit /login, **when** page loads, **then** I see form with email and password fields
- [ ] **Given** valid credentials, **when** I submit, **then** form sends POST /api/auth/login request
- [ ] **Given** login successful, **when** tokens received, **then** I'm redirected to /dashboard
- [ ] **Given** invalid credentials, **when** error received, **then** I see "Invalid email or password" error
- [ ] **Given** account locked, **when** login attempted, **then** I see "Account locked until [time]" error
- [ ] **Given** request in progress, **when** waiting, **then** submit button disabled with "Signing in..." text
- [ ] **Given** form, **when** I click "Forgot Password", **then** I'm navigated to /forgot-password
- [ ] **Given** I'm already logged in, **when** I visit /login, **then** I'm redirected to /dashboard

**Technical Notes:**
- Use same styling patterns as registration form
- RTK Query: Create useLoginMutation() in authApiSlice
- On success: dispatch(setCredentials({ user, accessToken, refreshToken }))
- Error handling: Display generic "Invalid email or password" (security best practice)
- Redirect: Use Next.js useRouter() for navigation

**Dependencies:**
- FE-US-001 completed (registration form patterns established)
- Redux slice for auth state created

**Estimated Effort:** 1.25 days
- Form UI: 0.25 day
- RTK Query mutation: 0.25 day
- Redux integration: 0.5 day
- Error handling and redirects: 0.25 day

**Priority:** **Must Have** (MVP Blocker)

---

### Story FE-US-003: Auth State Management (Redux + localStorage)

**As a** logged-in user  
**I want** my session to persist across page refreshes  
**So that** I don't have to log in every time I reload the page

**Acceptance Criteria:**
- [ ] **Given** I log in, **when** tokens received, **then** tokens saved to localStorage under 'auth' key
- [ ] **Given** tokens in localStorage, **when** app loads, **then** Redux auth state is hydrated with tokens
- [ ] **Given** I'm logged in, **when** I refresh page, **then** I remain logged in (Redux state restored)
- [ ] **Given** tokens expired, **when** app loads, **then** stale tokens removed and I'm redirected to /login
- [ ] **Given** I log out, **when** logout complete, **then** tokens removed from localStorage and Redux cleared
- [ ] **Given** auth state changes, **when** update occurs, **then** localStorage syncs automatically

**Technical Notes:**
- Use redux-persist library (already in package.json)
- Configure persistConfig for auth slice only
- Storage: localStorage (not sessionStorage - persist across browser restart)
- Persist: { user, accessToken, refreshToken, refreshTokenExpiresAt }
- Hydration: On app mount, load from localStorage before rendering protected routes
- Cleanup: On logout, call persistor.purge() to clear storage

**Dependencies:**
- Redux store setup with authSlice
- FE-US-002 completed (login flow exists)

**Estimated Effort:** 1.5 days
- Redux-persist configuration: 0.75 day
- localStorage sync logic: 0.5 day
- Hydration on app load: 0.25 day

**Priority:** **Must Have** (Critical UX issue)

---

### Story FE-US-004: Automatic Token Refresh

**As a** logged-in user  
**I want** my access token to refresh automatically before expiry  
**So that** I don't get logged out while actively using the app

**Acceptance Criteria:**
- [ ] **Given** API returns 401, **when** access token expired, **then** frontend automatically calls POST /api/auth/refresh-token
- [ ] **Given** refresh succeeds, **when** new tokens received, **then** original API request is retried with new token
- [ ] **Given** refresh fails, **when** 401 returned, **then** user is logged out and redirected to /login
- [ ] **Given** multiple simultaneous 401s, **when** refresh triggered, **then** only one refresh request made (mutex)
- [ ] **Given** refresh in progress, **when** new requests made, **then** requests queued until refresh completes
- [ ] **Given** refresh succeeds, **when** tokens updated, **then** localStorage and Redux state update automatically

**Technical Notes:**
- Use RTK Query baseQueryWithReauth pattern
- Implement mutex to prevent concurrent refresh requests
- Queue requests during refresh using Promise-based queue
- Update tokens in Redux: dispatch(setCredentials({ accessToken, refreshToken }))
- Retry original request with new token
- On refresh failure: dispatch(logout()), navigate('/login')

**Dependencies:**
- FE-US-002 completed (login flow exists)
- FE-US-003 completed (token persistence exists)
- Backend refresh-token endpoint ready

**Estimated Effort:** 2 days
- baseQueryWithReauth implementation: 1 day
- Mutex for concurrent refresh: 0.5 day
- Request retry logic: 0.25 day
- Testing refresh scenarios: 0.25 day

**Priority:** **Must Have** (Prevents forced logouts)

---

### Story FE-US-005: Forgot Password Flow (Frontend)

**As a** user who forgot my password  
**I want to** request a password reset via email  
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] **Given** I'm on /login, **when** I click "Forgot Password", **then** I'm navigated to /forgot-password
- [ ] **Given** I enter email, **when** I submit, **then** form sends POST /api/auth/forgot-password request
- [ ] **Given** request successful, **when** response received, **then** I see "If email exists, reset link sent" message
- [ ] **Given** I click reset link in email, **when** link opened, **then** I'm navigated to /reset-password?token=xxx
- [ ] **Given** I'm on /reset-password, **when** page loads, **then** I see newPassword and confirmPassword fields
- [ ] **Given** valid passwords, **when** I submit, **then** form sends POST /api/auth/reset-password { token, newPassword }
- [ ] **Given** reset successful, **when** complete, **then** I'm redirected to /login with success message
- [ ] **Given** token invalid/expired, **when** error received, **then** I see "Link expired or invalid" error

**Technical Notes:**
- Two pages: /forgot-password and /reset-password
- RTK Query mutations: useForgotPasswordMutation(), useResetPasswordMutation()
- Generic success message (don't reveal if email exists - security)
- Token passed as URL query param: ?token=xxx
- Validation: Password match, min 8 characters

**Dependencies:**
- FE-US-001 completed (form patterns established)
- Backend forgot-password and reset-password endpoints ready

**Estimated Effort:** 1.75 days
- Forgot password page: 0.5 day
- Reset password page: 0.5 day
- RTK Query mutations: 0.5 day
- Error handling and validation: 0.25 day

**Priority:** **Should Have** (Critical for user recovery)

---

### Story FE-US-006: User Profile Page

**As a** logged-in user  
**I want to** view and update my profile information  
**So that** I can keep my account details current

**Acceptance Criteria:**
- [ ] **Given** I'm logged in, **when** I visit /profile, **then** I see my firstName, lastName, email, profileImageUrl
- [ ] **Given** profile page, **when** I edit firstName or lastName, **then** I can save changes with "Save" button
- [ ] **Given** I save changes, **when** update successful, **then** I see success message and Redux state updates
- [ ] **Given** profile page, **when** I upload profile image, **then** image preview shown immediately
- [ ] **Given** invalid image (>5MB or wrong format), **when** I try to upload, **then** I see error "Image must be <5MB and JPG/PNG"
- [ ] **Given** email field, **when** displayed, **then** it's disabled (cannot change email - security policy)
- [ ] **Given** profile page, **when** I click "Change Password", **then** modal opens with password fields

**Technical Notes:**
- RTK Query: useGetProfileQuery(), useUpdateProfileMutation()
- Image upload: Use <input type="file" accept="image/jpeg,image/png" />
- Image preview: FileReader API to generate data URL
- Validation: Max file size 5MB, MIME types: image/jpeg, image/png
- Form: Controlled inputs with useState, populate from query data
- Update Redux: On successful update, refetch profile or update cache

**Dependencies:**
- FE-US-003 completed (auth state management exists)
- Backend profile endpoints ready

**Estimated Effort:** 1.5 days
- Profile page UI: 0.5 day
- Profile fetch and update mutations: 0.5 day
- Image upload and preview: 0.25 day
- Validation and error handling: 0.25 day

**Priority:** **Could Have** (Nice to have, low priority for MVP)

---

## Epic BE-001: Backend Authentication APIs

**Description:**  
Implement secure authentication endpoints and services including user registration, login, JWT token management, email verification, password reset, and account security features.

**Business Value:**  
- Enables secure user access control and data protection
- Foundation for all backend features (groups, tasks, etc.)
- Builds user trust through security best practices
- Prevents unauthorized access and data breaches

**Success Criteria:**
- [ ] Users can register with email/password
- [ ] Users can log in and receive JWT tokens
- [ ] Tokens refresh automatically before expiry
- [ ] Passwords securely hashed (BCrypt/PBKDF2)
- [ ] Failed login attempts trigger account lockout
- [ ] Email verification confirms valid emails
- [ ] Password reset flow works end-to-end

**Estimated Effort:** 10.25 days with AI  
**Priority:** **CRITICAL** (Blocks all other features)

---

## Backend User Stories

### Story BE-US-001: User Registration Endpoint

**As a** new user  
**I want** the backend to create my account with email and password  
**So that** I can access the application

**Acceptance Criteria:**
- [ ] **Given** valid email and password (8+ chars), **when** POST /api/auth/register, **then** account created in MongoDB with 201 status
- [ ] **Given** duplicate email, **when** registration attempted, **then** return 409 "Email already exists"
- [ ] **Given** invalid email format, **when** submitted, **then** return 400 "Invalid email format"
- [ ] **Given** password <8 characters, **when** submitted, **then** return 400 "Password must be at least 8 characters"
- [ ] **Given** successful registration, **when** account created, **then** password is hashed with BCrypt (work factor 10-12)
- [ ] **Given** successful registration, **when** complete, **then** return JWT access token (60min) and refresh token (7 days)
- [ ] **Given** user registered, **when** I check MongoDB, **then** document contains: _id, email, passwordHash, firstName, lastName, createdAt, updatedAt
- [ ] **Given** registration request, **when** processing, **then** response time <200ms (95th percentile)

**Technical Notes:**
- Controller: AuthController.Register(RegisterRequest request)
- Service: AuthService.RegisterAsync(email, password, firstName, lastName)
- Password hashing: Use BCrypt.Net-Next library or ASP.NET Core Identity
- JWT generation: HS256 algorithm, 256-bit secret from appsettings.json
- Access token claims: { userId, email, role: "RegularUser" }
- Refresh token: GUID stored in User.RefreshToken, User.RefreshTokenExpiresAt
- Validation: Email regex (RFC 5322), password min length 8
- Repository: UserRepository.CreateAsync(user), UserRepository.GetByEmailAsync(email)
- Response: { user: { id, email, firstName, lastName }, accessToken, refreshToken }

**Dependencies:**
- User domain model exists (MongoDB.Bson attributes)
- UserRepository exists with CRUD methods
- MongoDB connection configured in appsettings.json
- JWT settings in appsettings.json (SecretKey, Issuer, Audience)

**Estimated Effort:** 2.5 days
- AuthController and RegisterRequest DTO: 0.5 day
- AuthService.RegisterAsync() with password hashing: 0.75 day
- JWT token generation logic: 0.75 day
- Input validation and error handling: 0.25 day
- Manual testing with Postman: 0.25 day

**Priority:** **Must Have** (MVP Blocker)

---

### Story BE-US-002: User Login Endpoint

**As a** registered user  
**I want** to log in with email and password  
**So that** I can access my account and receive tokens

**Acceptance Criteria:**
- [ ] **Given** valid credentials, **when** POST /api/auth/login, **then** return 200 with access token and refresh token
- [ ] **Given** invalid email, **when** login attempted, **then** return 401 "Invalid email or password"
- [ ] **Given** invalid password, **when** login attempted, **then** return 401 "Invalid email or password" and increment User.FailedLoginAttempts
- [ ] **Given** 5 failed attempts, **when** next login attempted, **then** account locked and return 403 "Account locked until [time]"
- [ ] **Given** locked account (LockoutUntil > now), **when** login attempted, **then** return 403 "Account locked until [time]"
- [ ] **Given** successful login, **when** complete, **then** User.FailedLoginAttempts reset to 0
- [ ] **Given** successful login, **when** tokens generated, **then** refresh token stored in User.RefreshToken with expiry
- [ ] **Given** login request, **when** processing, **then** response time <150ms (95th percentile)

**Technical Notes:**
- Controller: AuthController.Login(LoginRequest request)
- Service: AuthService.LoginAsync(email, password)
- Password verification: BCrypt.Verify(plainPassword, user.PasswordHash)
- Failed attempts: User.FailedLoginAttempts (int), User.LockoutUntil (DateTime?)
- Account lockout: If FailedLoginAttempts >= 5, set LockoutUntil = DateTime.UtcNow.AddMinutes(15)
- Token generation: Reuse logic from RegisterAsync (extract to AuthService.GenerateTokens())
- Security: Generic error message (don't reveal if email exists or password wrong)
- Update repository: UserRepository.UpdateAsync(user) to save failed attempts and lockout

**Dependencies:**
- BE-US-001 completed (token generation logic exists)
- User model has FailedLoginAttempts and LockoutUntil fields

**Estimated Effort:** 2 days
- AuthController.Login() endpoint: 0.5 day
- Password verification logic: 0.25 day
- Failed attempt tracking and lockout: 0.75 day
- Error handling and responses: 0.25 day
- Testing with Postman: 0.25 day

**Priority:** **Must Have** (MVP Blocker)

---

### Story BE-US-003: Token Refresh Endpoint

**As a** logged-in user  
**I want** my access token to be refreshed automatically  
**So that** I don't get logged out while using the app

**Acceptance Criteria:**
- [ ] **Given** valid refresh token, **when** POST /api/auth/refresh-token, **then** return 200 with new access token and new refresh token
- [ ] **Given** expired refresh token, **when** refresh attempted, **then** return 401 "Refresh token expired"
- [ ] **Given** invalid refresh token, **when** refresh attempted, **then** return 401 "Invalid refresh token"
- [ ] **Given** successful refresh, **when** complete, **then** old refresh token invalidated (replaced with new one)
- [ ] **Given** refresh token rotation, **when** new token issued, **then** MongoDB updated with new User.RefreshToken and User.RefreshTokenExpiresAt
- [ ] **Given** user logged out, **when** refresh attempted, **then** User.RefreshToken is null and return 401
- [ ] **Given** refresh request, **when** processing, **then** response time <100ms (95th percentile)

**Technical Notes:**
- Controller: AuthController.RefreshToken(RefreshTokenRequest request)
- Service: AuthService.RefreshTokenAsync(refreshToken)
- Token validation: 
  1. Find user by User.RefreshToken == refreshToken
  2. Check User.RefreshTokenExpiresAt > DateTime.UtcNow
- Token rotation: Generate new GUID, update User.RefreshToken and User.RefreshTokenExpiresAt
- Security: Single-use refresh tokens (old token invalidated immediately)
- Response: { accessToken, refreshToken }
- Repository: UserRepository.GetByRefreshTokenAsync(token), UserRepository.UpdateAsync(user)

**Dependencies:**
- BE-US-001 and BE-US-002 completed (token generation exists)
- User model has RefreshToken and RefreshTokenExpiresAt fields

**Estimated Effort:** 1.5 days
- AuthController.RefreshToken() endpoint: 0.5 day
- Token validation logic: 0.5 day
- Token rotation (invalidate old): 0.25 day
- Testing: 0.25 day

**Priority:** **Must Have** (Prevents forced logouts)

---

### Story BE-US-004: Logout Endpoint

**As a** logged-in user  
**I want** to log out of my account  
**So that** my session is invalidated and my account is secure

**Acceptance Criteria:**
- [ ] **Given** I'm logged in, **when** POST /api/auth/logout, **then** return 200 and User.RefreshToken cleared in MongoDB
- [ ] **Given** logout complete, **when** I check MongoDB, **then** User.RefreshToken is null and User.RefreshTokenExpiresAt is null
- [ ] **Given** I'm logged out, **when** I try to use old access token, **then** token still valid until expiry (stateless JWT)
- [ ] **Given** I'm logged out, **when** I try to refresh, **then** return 401 (refresh token null in database)
- [ ] **Given** logout request, **when** processing, **then** response time <50ms

**Technical Notes:**
- Controller: AuthController.Logout() [Authorize] attribute required
- Service: AuthService.LogoutAsync(userId)
- Clear tokens: Set User.RefreshToken = null, User.RefreshTokenExpiresAt = null
- Access tokens: Cannot be revoked (stateless), remain valid until 60min expiry
- Security: Keep access token expiry short to minimize risk window
- Repository: UserRepository.UpdateAsync(user)

**Dependencies:**
- BE-US-002 completed (login and refresh token logic exists)
- JWT middleware configured for [Authorize] attribute

**Estimated Effort:** 0.75 day
- AuthController.Logout() endpoint: 0.25 day
- Clear refresh token logic: 0.25 day
- Testing: 0.25 day

**Priority:** **Must Have** (Security requirement)

---

### Story BE-US-005: Email Verification Endpoint

**As a** newly registered user  
**I want** to verify my email address  
**So that** the system confirms I own the email

**Acceptance Criteria:**
- [ ] **Given** user registers, **when** account created, **then** email verification token generated and stored in User.EmailVerificationToken
- [ ] **Given** verification token, **when** email sent, **then** link format: https://app.nu/verify-email?token=xxx
- [ ] **Given** valid token, **when** GET /api/auth/verify-email?token=xxx, **then** return 200 and set User.IsEmailVerified = true
- [ ] **Given** invalid token, **when** verification attempted, **then** return 400 "Invalid verification token"
- [ ] **Given** expired token (>24 hours old), **when** verification attempted, **then** return 400 "Verification link expired"
- [ ] **Given** already verified email, **when** verification attempted, **then** return 200 "Email already verified"
- [ ] **Given** verification successful, **when** complete, **then** User.EmailVerificationToken cleared

**Technical Notes:**
- Controller: AuthController.VerifyEmail(string token)
- Service: AuthService.VerifyEmailAsync(token)
- Token generation: GUID, store in User.EmailVerificationToken with User.EmailVerificationExpiresAt (24 hours)
- Email template: HTML template with verification link
- Email service: EmailServerAccess.SendVerificationEmailAsync(email, token)
- Repository: UserRepository.GetByEmailVerificationTokenAsync(token)

**Dependencies:**
- BE-US-001 completed (registration exists)
- Email service integration (SendGrid or SMTP configured)
- User model has EmailVerificationToken, EmailVerificationExpiresAt, IsEmailVerified fields

**Estimated Effort:** 2 days
- Verification endpoint: 0.5 day
- Token generation on registration: 0.25 day
- Email service integration: 0.75 day
- Email template design: 0.25 day
- Testing: 0.25 day

**Priority:** **Should Have** (Security best practice)

---

### Story BE-US-006: Forgot Password Endpoint

**As a** user who forgot my password  
**I want** to request a password reset via email  
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] **Given** I submit email, **when** POST /api/auth/forgot-password, **then** return 200 "If email exists, reset link sent" (don't reveal if email exists)
- [ ] **Given** email exists in database, **when** request processed, **then** reset token generated and stored in User.PasswordResetToken
- [ ] **Given** reset token, **when** email sent, **then** link format: https://app.nu/reset-password?token=xxx
- [ ] **Given** email not in database, **when** request processed, **then** return 200 (generic message, no token generated)
- [ ] **Given** reset token, **when** generated, **then** User.PasswordResetExpiresAt set to 1 hour from now

**Technical Notes:**
- Controller: AuthController.ForgotPassword(ForgotPasswordRequest request)
- Service: AuthService.ForgotPasswordAsync(email)
- Token generation: GUID, store in User.PasswordResetToken with User.PasswordResetExpiresAt (1 hour)
- Email: EmailServerAccess.SendPasswordResetEmailAsync(email, token)
- Security: Always return success message (don't reveal if email exists)
- Repository: UserRepository.GetByEmailAsync(email)

**Dependencies:**
- Email service configured (BE-US-005 or standalone)
- User model has PasswordResetToken and PasswordResetExpiresAt fields

**Estimated Effort:** 1.5 days
- Forgot password endpoint: 0.5 day
- Token generation: 0.25 day
- Email integration: 0.5 day
- Testing: 0.25 day

**Priority:** **Should Have** (Critical for user recovery)

---

### Story BE-US-007: Reset Password Endpoint

**As a** user with a reset token  
**I want** to set a new password  
**So that** I can log in again

**Acceptance Criteria:**
- [ ] **Given** valid token and new password, **when** POST /api/auth/reset-password, **then** return 200 and password updated
- [ ] **Given** invalid token, **when** reset attempted, **then** return 400 "Invalid or expired reset link"
- [ ] **Given** expired token (>1 hour old), **when** reset attempted, **then** return 400 "Invalid or expired reset link"
- [ ] **Given** token already used, **when** reused, **then** return 400 "Link already used"
- [ ] **Given** successful reset, **when** complete, **then** password hashed with BCrypt and User.PasswordHash updated
- [ ] **Given** successful reset, **when** complete, **then** User.PasswordResetToken cleared
- [ ] **Given** successful reset, **when** complete, **then** all refresh tokens invalidated (User.RefreshToken = null)

**Technical Notes:**
- Controller: AuthController.ResetPassword(ResetPasswordRequest request)
- Request: { token, newPassword }
- Service: AuthService.ResetPasswordAsync(token, newPassword)
- Token validation: Check User.PasswordResetToken == token AND User.PasswordResetExpiresAt > DateTime.UtcNow
- Password update: Hash newPassword with BCrypt, update User.PasswordHash
- Token single-use: Clear User.PasswordResetToken and User.PasswordResetExpiresAt after use
- Security: Invalidate all refresh tokens (force re-login on all devices)

**Dependencies:**
- BE-US-006 completed (forgot password flow exists)
- Password hashing logic exists (BE-US-001)

**Estimated Effort:** 1 day
- Reset password endpoint: 0.5 day
- Token validation and password update: 0.25 day
- Testing: 0.25 day

**Priority:** **Should Have** (Critical for user recovery)

---

### Story BE-US-008: Rate Limiting Middleware

**As a** system administrator  
**I want** rate limiting on authentication endpoints  
**So that** brute-force attacks are prevented

**Acceptance Criteria:**
- [ ] **Given** login endpoint, **when** >5 requests from same IP in 1 minute, **then** return 429 "Too Many Requests"
- [ ] **Given** registration endpoint, **when** >3 requests from same IP in 5 minutes, **then** return 429
- [ ] **Given** rate limit exceeded, **when** user waits, **then** rate limit resets after time window
- [ ] **Given** rate limit error, **when** returned, **then** response includes "Retry-After" header with seconds to wait
- [ ] **Given** different IPs, **when** requests made, **then** each IP has independent rate limit

**Technical Notes:**
- Use AspNetCoreRateLimit NuGet package
- Configuration in appsettings.json:
  ```json
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "GeneralRules": [
      { "Endpoint": "*/api/auth/login", "Period": "1m", "Limit": 5 },
      { "Endpoint": "*/api/auth/register", "Period": "5m", "Limit": 3 }
    ]
  }
  ```
- Store rate limit state in MemoryCache (single server) or Redis (distributed)
- Middleware: app.UseIpRateLimiting() before app.UseEndpoints()

**Dependencies:**
- BE-US-001 and BE-US-002 completed (endpoints exist)

**Estimated Effort:** 1 day
- Install and configure AspNetCoreRateLimit: 0.5 day
- Configure rate limit rules: 0.25 day
- Testing with multiple requests: 0.25 day

**Priority:** **Should Have** (Security hardening)

---

## Epic QA-001: Testing & Quality Assurance

**Description:**  
Comprehensive testing coverage for authentication flows including unit tests, integration tests, and end-to-end testing to ensure security, reliability, and correctness.

**Business Value:**  
- Prevents security vulnerabilities and regressions
- Ensures reliable user experience
- Enables confident refactoring and feature additions
- Reduces production bugs and support costs

**Success Criteria:**
- [ ] Unit test coverage: >80% for AuthService
- [ ] Integration tests: All auth endpoints covered
- [ ] Frontend tests: Critical user flows tested
- [ ] Security audit: No critical vulnerabilities
- [ ] Performance: All endpoints meet response time targets

**Estimated Effort:** 4.25 days with AI  
**Priority:** **HIGH** (Quality gate for production)

---

## Testing User Stories

### Story QA-US-001: Backend Unit Tests

**As a** developer  
**I want** comprehensive unit tests for AuthService  
**So that** business logic is verified and regressions prevented

**Acceptance Criteria:**
- [ ] **Given** AuthService.RegisterAsync(), **when** valid input, **then** user created with hashed password
- [ ] **Given** AuthService.RegisterAsync(), **when** duplicate email, **then** throw exception
- [ ] **Given** AuthService.LoginAsync(), **when** valid credentials, **then** return tokens
- [ ] **Given** AuthService.LoginAsync(), **when** invalid password, **then** increment failed attempts and throw exception
- [ ] **Given** AuthService.LoginAsync(), **when** 5 failed attempts, **then** lock account and throw exception
- [ ] **Given** AuthService.RefreshTokenAsync(), **when** valid token, **then** return new tokens
- [ ] **Given** AuthService.RefreshTokenAsync(), **when** expired token, **then** throw exception
- [ ] **Given** AuthService.GenerateTokens(), **when** called, **then** access token contains correct claims
- [ ] **Given** password verification, **when** correct password, **then** return true
- [ ] **Given** password hashing, **when** output generated, **then** hash is irreversible (cannot get plain password)

**Technical Notes:**
- Use xUnit test framework
- Moq for mocking IUserRepository
- Test coverage: >80% code coverage for AuthService
- AAA pattern: Arrange, Act, Assert
- Test naming: [MethodName]_[Scenario]_[ExpectedResult]
- Example: RegisterAsync_DuplicateEmail_ThrowsException()

**Dependencies:**
- Backend user stories BE-US-001 through BE-US-007 completed

**Estimated Effort:** 1.5 days
- Write unit tests for AuthService: 1 day
- Setup test project and mocks: 0.25 day
- Coverage analysis and gap filling: 0.25 day

**Priority:** **Must Have** (Quality gate)

---

### Story QA-US-002: Backend Integration Tests

**As a** developer  
**I want** integration tests for authentication endpoints  
**So that** full API request/response flow is verified

**Acceptance Criteria:**
- [ ] **Given** POST /api/auth/register with valid data, **when** request made, **then** return 201 with tokens
- [ ] **Given** POST /api/auth/register with duplicate email, **when** request made, **then** return 409
- [ ] **Given** POST /api/auth/login with valid credentials, **when** request made, **then** return 200 with tokens
- [ ] **Given** POST /api/auth/login with invalid credentials, **when** request made, **then** return 401
- [ ] **Given** POST /api/auth/refresh-token with valid token, **when** request made, **then** return 200 with new tokens
- [ ] **Given** POST /api/auth/logout, **when** request made, **then** return 200 and refresh token cleared

**Technical Notes:**
- Use xUnit + WebApplicationFactory<Program>
- TestContainers for MongoDB (Docker-based test database)
- Each test: Start server → Make HTTP request → Assert response
- Setup: Create test MongoDB instance, seed data if needed
- Teardown: Clear MongoDB collections after each test
- Use HttpClient from WebApplicationFactory

**Dependencies:**
- Backend endpoints BE-US-001 through BE-US-004 completed
- Docker installed for TestContainers

**Estimated Effort:** 1.5 days
- Setup WebApplicationFactory and TestContainers: 0.5 day
- Write integration tests for all endpoints: 0.75 day
- Testing and debugging: 0.25 day

**Priority:** **Must Have** (Quality gate)

---

### Story QA-US-003: Frontend Unit Tests

**As a** frontend developer  
**I want** unit tests for auth components and logic  
**So that** UI behavior is verified

**Acceptance Criteria:**
- [ ] **Given** RegistrationForm, **when** passwords don't match, **then** show error message
- [ ] **Given** RegistrationForm, **when** valid data submitted, **then** call useRegisterMutation()
- [ ] **Given** LoginForm, **when** valid credentials submitted, **then** call useLoginMutation()
- [ ] **Given** LoginForm, **when** error received, **then** display error message
- [ ] **Given** Protected route, **when** user not authenticated, **then** redirect to /login
- [ ] **Given** Token refresh, **when** 401 received, **then** call refresh-token endpoint
- [ ] **Given** Logout, **when** triggered, **then** clear localStorage and Redux state

**Technical Notes:**
- Use Vitest + React Testing Library
- Mock RTK Query: Use MSW (Mock Service Worker) for API calls
- Test user interactions: fireEvent.change(), fireEvent.click()
- Assert on screen: expect(screen.getByText('...')).toBeInTheDocument()
- Mock localStorage: Setup mock before each test
- Coverage target: >70% for auth-related components

**Dependencies:**
- Frontend user stories FE-US-001 through FE-US-005 completed
- Vitest and React Testing Library installed

**Estimated Effort:** 1.25 days
- Write tests for forms and auth flows: 0.75 day
- Setup MSW mocks: 0.25 day
- Coverage analysis: 0.25 day

**Priority:** **Should Have** (Good practice, not MVP blocker)

---

## Sprint Plans

### Sprint 1: Frontend Foundation (4 stories, 7.5 days)

**Sprint Goal:** Users can register, login, and maintain authenticated sessions through intuitive UI

**Committed Stories:**
1. ✅ FE-US-001: Registration Form Component (1.5 days) - **Must Have**
2. ✅ FE-US-002: Login Form Component (1.25 days) - **Must Have**
3. ✅ FE-US-003: Auth State Management (1.5 days) - **Must Have**
4. ✅ FE-US-004: Automatic Token Refresh (2 days) - **Must Have**
5. ⚠️ FE-US-005: Forgot Password Flow (1.75 days) - **Should Have**

**Total Effort:** 7.5 days (with buffer: 9 days)  
**Team Capacity:** 10 days (1 dev × 2 weeks × 50% time)  
**Buffer:** 20% (1.5 days for polish and unexpected issues)

**Sprint Deliverables:**
- ✅ Working registration and login forms
- ✅ Client-side validation and error handling
- ✅ Redux state management with localStorage persistence
- ✅ Automatic token refresh prevents logouts
- ⚠️ Password reset UI (if time permits)

**Definition of Done:**
- [ ] All acceptance criteria met
- [ ] Forms responsive on mobile and desktop
- [ ] Error messages user-friendly
- [ ] Loading states provide clear feedback
- [ ] Code reviewed and merged to main
- [ ] Manual testing on Chrome, Firefox, Safari

---

### Sprint 2: Backend Implementation (7 stories, 10.25 days)

**Sprint Goal:** Secure authentication APIs with JWT tokens, email verification, and password reset

**Committed Stories:**
1. ✅ BE-US-001: User Registration Endpoint (2.5 days) - **Must Have**
2. ✅ BE-US-002: User Login Endpoint (2 days) - **Must Have**
3. ✅ BE-US-003: Token Refresh Endpoint (1.5 days) - **Must Have**
4. ✅ BE-US-004: Logout Endpoint (0.75 day) - **Must Have**
5. ⚠️ BE-US-005: Email Verification Endpoint (2 days) - **Should Have**
6. ⚠️ BE-US-006: Forgot Password Endpoint (1.5 days) - **Should Have**
7. ⚠️ BE-US-007: Reset Password Endpoint (1 day) - **Should Have**
8. 🔶 BE-US-008: Rate Limiting Middleware (1 day) - **Should Have**

**Total Effort:** 10.25 days (without rate limiting: 9.25 days)  
**Team Capacity:** 10 days (1 dev × 2 weeks × 50% time)  
**Buffer:** 0% (tight schedule, may defer rate limiting to Sprint 3)

**Sprint Deliverables:**
- ✅ Registration and login APIs
- ✅ JWT token generation and refresh
- ✅ Logout functionality
- ⚠️ Email verification (if SendGrid configured)
- ⚠️ Password reset flow
- 🔶 Rate limiting (stretch goal)

**Definition of Done:**
- [ ] All acceptance criteria met
- [ ] API response times <150ms (95th percentile)
- [ ] Passwords securely hashed (BCrypt)
- [ ] Account lockout after 5 failed attempts
- [ ] Tested with Postman/Thunder Client
- [ ] Code reviewed and merged to main
- [ ] Swagger documentation updated

---

### Sprint 3: Testing & Polish (3 stories, 4.25 days + buffer)

**Sprint Goal:** Comprehensive testing coverage and production readiness

**Committed Stories:**
1. ✅ QA-US-001: Backend Unit Tests (1.5 days) - **Must Have**
2. ✅ QA-US-002: Backend Integration Tests (1.5 days) - **Must Have**
3. ⚠️ QA-US-003: Frontend Unit Tests (1.25 days) - **Should Have**
4. 🔶 FE-US-006: User Profile Page (1.5 days) - **Could Have**

**Total Effort:** 4.25 days (tests only)  
**Team Capacity:** 10 days (1 dev × 2 weeks × 50% time)  
**Buffer:** 57% (5.75 days for bug fixes, polish, documentation)

**Sprint Deliverables:**
- ✅ Unit tests: >80% coverage for AuthService
- ✅ Integration tests: All auth endpoints
- ⚠️ Frontend tests: Critical flows
- 🔶 User profile page (if time permits)
- ✅ Security audit completed
- ✅ Performance benchmarks verified
- ✅ Documentation: API docs, setup guide

**Definition of Done:**
- [ ] All MVP acceptance criteria met
- [ ] Tests pass in CI/CD pipeline
- [ ] No critical security vulnerabilities
- [ ] API performance targets met
- [ ] Frontend responsive on mobile and desktop
- [ ] E2E testing: Register → Login → Profile → Logout
- [ ] README updated with auth setup instructions
- [ ] Production deployment ready

---

## Dependencies & Risks

### Technical Dependencies

**Internal Dependencies:**
| Dependency | Status | Blocker For | Notes |
|------------|--------|-------------|-------|
| User domain model | ✅ Complete | All auth stories | MongoDB.Bson attributes configured |
| UserRepository | ✅ Complete | All backend stories | CRUD methods implemented |
| MongoDB connection | ✅ Complete | All backend stories | Connection string in appsettings.json |
| JWT middleware | ✅ Complete | Token validation | Microsoft.AspNetCore.Authentication.JwtBearer |
| Redux store | ✅ Complete | Frontend state | Store configured with authSlice |
| RTK Query | ✅ Complete | API calls | Base query with auth headers |
| Tailwind CSS | ✅ Complete | UI styling | Config in tailwind.config.js |

**External Dependencies:**
| Dependency | Status | Blocker For | Mitigation |
|------------|--------|-------------|------------|
| SendGrid API | ⏳ Pending | BE-US-005, BE-US-006 | Use SMTP fallback or mock in dev |
| Azure Blob/S3 | ⏳ Pending | FE-US-006 (profile image) | Skip profile image for MVP |
| Docker | ✅ Installed | QA-US-002 (TestContainers) | Required for integration tests |
| .NET 9 SDK | ✅ Installed | All backend development | N/A |
| Node.js 20+ | ✅ Installed | All frontend development | N/A |

### Risks & Mitigation

**High Risk:**
1. **Password Hashing Performance**
   - **Risk:** BCrypt too slow (>500ms), degrades registration UX
   - **Impact:** High (affects registration and login)
   - **Mitigation:** Benchmark BCrypt work factor (10-12), use async operations, monitor performance
   - **Contingency:** Reduce work factor to 10, optimize database queries

2. **Email Deliverability**
   - **Risk:** Verification/reset emails go to spam
   - **Impact:** Medium (users can't verify accounts)
   - **Mitigation:** Configure SPF/DKIM records, use SendGrid verified sender, test with mail-tester.com
   - **Contingency:** Provide manual verification bypass for MVP, use transactional email service

**Medium Risk:**
3. **Token Refresh Race Conditions**
   - **Risk:** Multiple simultaneous API calls trigger concurrent refresh attempts
   - **Impact:** Medium (intermittent 401 errors, poor UX)
   - **Mitigation:** Implement mutex on frontend, queue requests during refresh
   - **Contingency:** Increase access token expiry to 4 hours, reduce refresh frequency

4. **Rate Limiting False Positives**
   - **Risk:** Legitimate users behind shared IP (NAT) hit rate limits
   - **Impact:** Medium (frustrated users, support tickets)
   - **Mitigation:** Combine IP + user agent for rate limiting, whitelist known good IPs
   - **Contingency:** Add CAPTCHA for rate-limited users, increase limits temporarily

**Low Risk:**
5. **localStorage Security**
   - **Risk:** Tokens in localStorage vulnerable to XSS attacks
   - **Impact:** Low (mitigated by Content Security Policy)
   - **Mitigation:** Implement strict CSP, sanitize all user input, use HttpOnly cookies in future
   - **Contingency:** Move to HttpOnly cookies in Phase 2

---

## Success Criteria Checklist

**MVP Complete When:**
- [ ] Users can register with email/password (FE-US-001, BE-US-001)
- [ ] Users can log in and receive JWT tokens (FE-US-002, BE-US-002)
- [ ] Access tokens refresh automatically before expiry (FE-US-004, BE-US-003)
- [ ] Passwords securely hashed (BCrypt/PBKDF2) (BE-US-001)
- [ ] Failed login attempts trigger account lockout (BE-US-002)
- [ ] Users can log out (FE logout, BE-US-004)
- [ ] Frontend auth state persists across page refreshes (FE-US-003)
- [ ] All API endpoints respond <150ms (95th percentile)
- [ ] Unit tests: >80% coverage for AuthService (QA-US-001)
- [ ] Integration tests: All auth endpoints covered (QA-US-002)
- [ ] Security review: No critical vulnerabilities
- [ ] Documentation: API docs and setup guide complete

**Phase 2 Complete When:**
- [ ] Email verification sends and processes links (BE-US-005)
- [ ] Password reset flow works end-to-end (FE-US-005, BE-US-006, BE-US-007)
- [ ] Rate limiting prevents brute-force attacks (BE-US-008)
- [ ] All emails deliver successfully (not spam)
- [ ] User profile management working (FE-US-006)
- [ ] Frontend unit tests: >70% coverage (QA-US-003)

---

## Out of Scope (Future Enhancements)

**Phase 3 - Advanced Authentication:**
- Social login (Google, Facebook, Apple)
- Two-factor authentication (2FA) via SMS/Authenticator app
- Biometric authentication (Face ID, Touch ID) on mobile
- OAuth 2.0 provider (allow third-party apps to use NU auth)
- Session management (view active sessions, revoke individual sessions)
- Login history and activity log
- CAPTCHA for suspicious login attempts
- IP-based geolocation and login alerts

**Not Planned:**
- Multi-factor authentication (MFA) with hardware keys
- Single Sign-On (SSO) with enterprise providers (SAML, LDAP)
- Passwordless authentication (magic links, WebAuthn)
- Account linking (merge duplicate accounts)
- Social media account recovery

---

## Appendix: AI Co-Development Notes

### Productivity Estimates

**With AI Assistance (GitHub Copilot, ChatGPT, Claude):**
- **Frontend Forms:** 4x faster (AI generates Tailwind markup, validation logic)
- **Backend Endpoints:** 5x faster (AI generates controller boilerplate, DTOs)
- **JWT Implementation:** 3x faster (AI provides standard security patterns)
- **Password Hashing:** 4x faster (AI suggests libraries and best practices)
- **Unit Tests:** 6x faster (AI writes test scaffolding and assertions)
- **Integration Tests:** 5x faster (AI generates test data and setup code)
- **Documentation:** 10x faster (AI drafts API docs from code signatures)

**Estimated Without AI:**
- Sprint 1: 7.5 days → 20 days (167% increase)
- Sprint 2: 10.25 days → 27 days (163% increase)
- Sprint 3: 4.25 days → 10 days (135% increase)
- **Total: 24 days with AI vs. 57 days without AI (58% time savings)**

### AI Best Practices

1. **Use AI for:** Boilerplate code, test generation, documentation, standard patterns
2. **Human review for:** Security logic, business rules, architecture decisions
3. **Pair programming:** AI generates code, human reviews and refines
4. **Prompt engineering:** Provide context (tech stack, patterns, constraints)
5. **Iterative refinement:** Start with AI draft, iterate with feedback
6. **Security:** Always manually review authentication and authorization logic
7. **Testing:** Use AI for test generation, but verify edge cases manually

---

**Document Created:** December 14, 2025  
**Last Updated:** December 14, 2025  
**Status:** Ready for Sprint 1 Kickoff  
**Next Review:** After Sprint 1 (December 27, 2025)
