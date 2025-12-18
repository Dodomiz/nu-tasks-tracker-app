# FR-026 Deployment Checklist

**Feature:** Group Member Invitation System (Code-Based)  
**Status:** Ready for Deployment  
**Date:** December 17, 2025

---

## Pre-Deployment Verification

### Code Review
- [x] All 21 user stories implemented
- [x] Backend compilation successful (0 errors)
- [x] Frontend types validated
- [x] No breaking changes to existing features
- [x] Separate collection strategy (no FR-025 conflicts)

### Documentation
- [x] PRD created ([FR-026-group-member-invitation-system.md](../prds/FR-026-group-member-invitation-system.md))
- [x] Design document created ([design.md](./design.md))
- [x] Workplan created ([workplan.md](./workplan.md))
- [x] Progress tracking complete ([progress.md](./progress.md))
- [x] Implementation summary created ([implementation-summary.md](./implementation-summary.md))
- [x] Root progress.md updated

---

## Backend Deployment Steps

### 1. Database Preparation
- [ ] **Backup MongoDB** (especially `groups` and `invites` collections)
- [ ] **Verify connection string** in appsettings.json
- [ ] **Confirm database name** matches production

### 2. Build & Test
```bash
cd backend
dotnet clean
dotnet restore
dotnet build --configuration Release
```
- [ ] Build succeeds with 0 errors
- [ ] Review build warnings (if any)

### 3. Index Creation
**Automatic:** Indexes will be created on first application startup via `Program.cs`:
- `codeInvites` collection will be created automatically
- Index 1: `{ code: 1 }` (unique)
- Index 2: `{ groupId: 1, status: 1 }` (compound)
- Index 3: `{ groupId: 1, createdAt: -1 }` (sorted)

**Verification after deployment:**
```javascript
// Run in MongoDB shell
use TasksTrackerDB
db.codeInvites.getIndexes()
// Should show 4 indexes (3 above + default _id)
```

### 4. Service Registration Verification
Check `Program.cs` contains:
- [ ] `AddScoped<ICodeInvitesRepository, CodeInvitesRepository>()`
- [ ] `AddScoped<ICodeInvitesService, CodeInvitesService>()`
- [ ] `AddSingleton<CodeGeneratorService>()`
- [ ] `EnsureIndexesAsync()` call in startup scope

### 5. API Endpoints Verification
After deployment, test endpoints:

**POST /api/groups/{groupId}/code-invites**
```bash
curl -X POST https://your-api.com/api/groups/{groupId}/code-invites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
  
# Expected: 201 Created with code in response
```

**GET /api/groups/{groupId}/code-invites**
```bash
curl -X GET https://your-api.com/api/groups/{groupId}/code-invites \
  -H "Authorization: Bearer YOUR_TOKEN"
  
# Expected: 200 OK with invites array
```

**POST /api/code-invites/redeem**
```bash
curl -X POST https://your-api.com/api/code-invites/redeem \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123XY"}'
  
# Expected: 200 OK with groupId and groupName
```

---

## Frontend Deployment Steps

### 1. Environment Variables
- [ ] Verify API base URL in `.env` or configuration
- [ ] Confirm JWT token handling is working

### 2. Build & Test
```bash
cd web
npm install  # or yarn install
npm run build  # or yarn build
```
- [ ] Build succeeds with 0 errors
- [ ] Review warnings (TypeScript, linting)
- [ ] Check bundle size (should be reasonable increase)

### 3. Component Verification
Check files exist:
- [ ] `/web/src/features/groups/components/CodeInvitationsTab.tsx`
- [ ] `/web/src/features/groups/components/CreateCodeInviteForm.tsx`
- [ ] `/web/src/features/groups/components/CodeInvitationsList.tsx`
- [ ] `/web/src/features/groups/components/RedeemCodeInviteModal.tsx`
- [ ] `/web/src/types/invite.ts`

### 4. RTK Query Configuration
Check `groupApi.ts` contains:
- [ ] `createCodeInvite` mutation
- [ ] `getGroupCodeInvites` query
- [ ] `redeemCodeInvite` mutation
- [ ] Proper tag invalidation (Group LIST, CodeInvite)

---

## Post-Deployment Verification

### Smoke Tests

#### Test 1: Admin Creates Unrestricted Code
1. [ ] Login as admin user
2. [ ] Open any group → Members modal → Code Invites tab
3. [ ] Select "Anyone with the code"
4. [ ] Click "Generate Code"
5. [ ] Verify 8-character code displays
6. [ ] Click copy button → verify success toast
7. [ ] Verify code appears in invitations list below

#### Test 2: Admin Creates Email-Restricted Code
1. [ ] Select "Specific email only"
2. [ ] Enter valid email (e.g., "test@example.com")
3. [ ] Click "Generate Code"
4. [ ] Verify code displays with email restriction
5. [ ] Check invitations list shows email in "Target" column

#### Test 3: User Redeems Code (Happy Path)
1. [ ] Copy code from Test 1
2. [ ] Logout → Login as different user (or use incognito)
3. [ ] Click "Join Group" or navigate to redeem modal
4. [ ] Paste code (verify auto-uppercase)
5. [ ] Click "Join Group"
6. [ ] Verify success message with group name
7. [ ] Click "Go to Group" → verify navigation works
8. [ ] Verify user appears in Members tab

#### Test 4: Error Cases
1. [ ] Try to redeem already-used code → Expect error
2. [ ] Try to redeem with wrong email (for email-restricted) → Expect error
3. [ ] Try to redeem invalid code "INVALID1" → Expect error
4. [ ] Admin tries to create code for user already in group → Expect error
5. [ ] Non-admin tries to view Code Invites tab → Expect "Admin Access Required"

### Database Checks
```javascript
// MongoDB shell
use TasksTrackerDB

// Check codeInvites collection exists
db.getCollectionNames()  // Should include "codeInvites"

// Check sample invite document
db.codeInvites.findOne()
// Should have: code, groupId, email, invitedBy, status, createdAt

// Verify indexes
db.codeInvites.getIndexes()
// Should have 4 indexes total
```

### Monitoring

#### Application Logs
Check for:
- [ ] "MongoDB indexes for code invitations initialized successfully"
- [ ] No errors during index creation
- [ ] Code generation logs: "Code invitation created: Code=XXX"
- [ ] Redemption logs: "User {userId} redeemed invitation code {code}"

#### Error Monitoring
Watch for:
- [ ] Code collision errors (should retry automatically)
- [ ] Invalid email format errors
- [ ] Duplicate member errors
- [ ] Authorization errors (non-admin attempts)

---

## Rollback Plan

### If Issues Found
1. **Backend Rollback:**
   ```bash
   # Stop new version
   # Deploy previous version
   # Indexes remain (safe to keep)
   ```

2. **Frontend Rollback:**
   ```bash
   # Deploy previous frontend build
   # Code Invites tab won't appear (safe)
   # Existing FR-025 email invites unaffected
   ```

3. **Database Rollback:**
   ```javascript
   // Only if necessary (unlikely)
   db.codeInvites.drop()  // Removes collection
   ```

---

## Performance Benchmarks

### Expected Metrics
- **Code Generation:** <100ms (includes collision check)
- **Create Invitation:** <200ms (includes DB write)
- **Redeem Code:** <500ms (includes group update)
- **List Invitations:** <150ms (includes user name lookup)

### Load Testing (Optional)
```bash
# Use Apache Bench or similar
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" \
   -p payload.json -T application/json \
   https://your-api.com/api/groups/{id}/code-invites
```

---

## Security Checklist

- [x] **Code generation uses cryptographic RNG** (not Math.random())
- [x] **Codes are case-insensitive** (normalized to uppercase)
- [x] **Email validation uses regex** (prevents injection)
- [x] **Admin permission checks** on all create/list operations
- [x] **JWT authentication required** for all endpoints
- [x] **No sensitive data in logs** (emails logged at INFO level only)
- [x] **Unique index on code field** (prevents duplicates)
- [x] **Member limit enforced** (20 members max)

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Failed to generate unique invitation code"  
**Solution:** Retry mechanism exhausted (10 attempts). Unlikely but check database for code collisions.

**Issue:** "This invitation is for a different email address"  
**Solution:** Email mismatch. User must use correct email or admin must create unrestricted code.

**Issue:** "You are already a member of this group"  
**Solution:** User already joined. Check Members tab to confirm.

**Issue:** "Code Invites tab not visible"  
**Solution:** User is not admin. Only admins can create/view invitations.

**Issue:** TypeScript import errors in IDE  
**Solution:** Restart TypeScript server (`Cmd+Shift+P` → "TypeScript: Restart TS Server")

---

## Communication Plan

### User Notification
Draft announcement:
```
🎉 New Feature: Shareable Group Invitations!

Admins can now generate 8-character invitation codes for their groups.
- Share codes via chat, email, or any medium
- Optionally restrict to specific email addresses
- Track invitation usage in the Members modal

To get started:
1. Open any group you admin
2. Click Members → Code Invites tab
3. Generate your first code!
```

### Documentation Updates
- [ ] Update user guide with code invitation flow
- [ ] Add screenshots of new UI components
- [ ] Update API documentation (Swagger/OpenAPI)

---

## Sign-Off

### Development Team
- [ ] Backend implementation verified
- [ ] Frontend implementation verified
- [ ] Integration testing complete
- [ ] Documentation complete

### QA Team
- [ ] Smoke tests passed
- [ ] Regression tests passed
- [ ] Security review complete
- [ ] Performance acceptable

### Product Owner
- [ ] Feature matches PRD requirements
- [ ] UX flow approved
- [ ] Ready for production release

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Rollback Decision Maker:** _______________  
**Monitoring Duration:** 48 hours post-deployment  

---

**Document Version:** 1.0  
**Last Updated:** December 17, 2025
