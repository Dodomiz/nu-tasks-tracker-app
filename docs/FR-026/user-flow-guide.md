# FR-026 User Flow Guide

**Feature:** Code-Based Group Invitations  
**Version:** 1.0  
**Date:** December 18, 2025

---

## Overview

FR-026 enables group admins to generate shareable 8-character invitation codes that members can use to join groups. This document describes the complete user experience.

---

## For Group Admins: Creating Invitation Codes

### Step 1: Access Code Invitations
1. Navigate to any group you admin
2. Click the "Manage Members" button
3. Click the "Code Invites" tab (3rd tab)

### Step 2: Generate a Code
You have two options:

#### Option A: Unrestricted Code (Anyone)
1. Select **"Anyone with the code"** radio button
2. Click **"Generate Code"**
3. Code appears (e.g., "A7B9C2XZ")
4. Click the **copy button** to copy to clipboard
5. Share via any medium (text, email, chat, etc.)

#### Option B: Email-Restricted Code
1. Select **"Specific email only"** radio button
2. Enter the recipient's email address
3. Click **"Generate Code"**
4. Code appears with email restriction indicator
5. Copy and share with that specific person

### Step 3: Track Invitations
- View all active invitations in the list below
- See status: **Pending** (unused) or **Used** (redeemed)
- See who created each invitation and when
- Copy codes directly from the list

---

## For Members: Redeeming Invitation Codes

### Access Points

Members can redeem codes from **three locations**:

#### 1. Dashboard (No Groups Yet)
**Path:** Login → Dashboard (empty state)

```
┌─────────────────────────────────────┐
│  You're not part of any groups yet  │
│                                      │
│  [Create First Group] [Join with Code] │
└─────────────────────────────────────┘
```
- Click **"Join Group with Code"**
- Modal opens immediately

#### 2. Dashboard (With Groups)
**Path:** Login → Dashboard (with groups)

```
┌─────────────────────────────────────┐
│  My Groups         [Join] [Create]  │
└─────────────────────────────────────┘
```
- Click **"Join Group"** button in header
- Modal opens immediately

#### 3. Direct URL
**Path:** `/groups/join`
- Navigate directly to this URL
- Modal opens automatically

### Redemption Steps

1. **Enter Code**
   - Type or paste the 8-character code
   - Code auto-converts to uppercase
   - Spaces are automatically removed

2. **Click "Join Group"**
   - System validates the code
   - Checks permissions (email match if restricted)
   - Verifies you're not already a member

3. **Success!**
   - Green checkmark appears
   - Shows group name: "Successfully Joined [Group Name]!"
   - Two options:
     - **"Close"** - Return to dashboard
     - **"Go to Group"** - Navigate to group immediately

---

## Error Scenarios

### For Members (Redemption)

| Error | Message | Resolution |
|-------|---------|------------|
| Invalid Code | "Invalid invitation code" | Check code with admin |
| Already Used | "This invitation has already been used" | Request new code |
| Email Mismatch | "This invitation is for a different email address" | Use correct account or request unrestricted code |
| Already Member | "You are already a member of this group" | Go to dashboard to access group |
| Group Full | "Group has reached maximum of 20 members" | Contact admin |

### For Admins (Code Creation)

| Error | Message | Resolution |
|-------|---------|------------|
| Invalid Email | "Invalid email format" | Enter valid email address |
| Already Member | "User is already a member of this group" | No action needed |
| Not Admin | "Only admins can create invitations" | Request admin promotion |

---

## Code Specifications

### Format
- **Length:** Exactly 8 characters
- **Characters:** Alphanumeric (A-Z, 0-9)
- **Case:** Always uppercase
- **Example:** `A7B9C2XZ`

### Properties
- **Uniqueness:** Globally unique across all groups
- **Security:** Cryptographically generated (not sequential)
- **Single-Use:** Cannot be reused after redemption
- **No Expiration:** Codes remain valid until used (future enhancement)

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN CREATES CODE                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Admin clicks "Code Invites" tab     │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Select: Any User OR Specific Email  │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Click "Generate Code"               │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Code displayed: A7B9C2XZ            │
        │  [Copy to Clipboard]                 │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Share code via any medium           │
        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   MEMBER REDEEMS CODE                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Member clicks "Join with Code"      │
        │  (from dashboard or direct URL)      │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Modal opens with code input         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Enter code: a7b9c2xz               │
        │  (auto-uppercase to A7B9C2XZ)        │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Click "Join Group"                  │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Backend validates:                  │
        │  • Code exists                       │
        │  • Code not used                     │
        │  • Email matches (if restricted)     │
        │  • User not already member           │
        │  • Group not full (<20 members)      │
        └──────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌──────────────┐              ┌──────────────┐
    │   SUCCESS    │              │    ERROR     │
    └──────────────┘              └──────────────┘
            │                             │
            ▼                             ▼
    ┌──────────────┐              ┌──────────────┐
    │ Add user to  │              │ Show error   │
    │    group     │              │   message    │
    └──────────────┘              └──────────────┘
            │
            ▼
    ┌──────────────┐
    │ Update invite│
    │ status=Used  │
    └──────────────┘
            │
            ▼
    ┌──────────────┐
    │ Show success │
    │   message    │
    └──────────────┘
            │
            ▼
    ┌──────────────┐
    │ [Go to Group]│
    │   [Close]    │
    └──────────────┘
```

---

## API Endpoints Used

### Admin Operations
- **POST** `/api/groups/{groupId}/code-invites` - Generate code
- **GET** `/api/groups/{groupId}/code-invites` - List invitations

### Member Operations
- **POST** `/api/code-invites/redeem` - Redeem code

---

## Security Features

✅ **Cryptographically Secure Generation** - Uses System.Security.Cryptography.RandomNumberGenerator  
✅ **Case-Insensitive Lookup** - Prevents typos (A7B9C2XZ = a7b9c2xz)  
✅ **Single-Use Enforcement** - Status changes to "Approved" after redemption  
✅ **Email Restriction** - Optional email validation  
✅ **Admin-Only Creation** - Only group admins can generate codes  
✅ **JWT Authentication** - All endpoints require valid authentication  
✅ **No Token Exposure** - Codes never stored in URLs or logs  

---

## Comparison: FR-025 vs FR-026

| Feature | FR-025 (Email) | FR-026 (Code) |
|---------|---------------|---------------|
| **Method** | Email link with token | Shareable 8-char code |
| **Target** | Always specific email | Any user OR specific email |
| **Sharing** | Automatic email | Manual (any medium) |
| **URL** | `/groups/join/{token}` | Enter code in modal |
| **Visibility** | Private (email only) | Can be public |
| **Use Case** | Formal invitation | Quick sharing |

---

## Tips & Best Practices

### For Admins
- **Use email restrictions** for sensitive/private groups
- **Use unrestricted codes** for open/public groups or team channels
- **Track invitations** regularly to see who joined
- **Generate new codes** if old ones are compromised
- **Communicate clearly** whether a code is restricted or not

### For Members
- **Copy-paste codes** to avoid typos
- **Check your email** matches if code doesn't work
- **Try uppercase/lowercase** variations if having issues (system normalizes)
- **Contact admin** if code is invalid or already used

---

## Future Enhancements (Not Yet Implemented)

🔮 **Expiration Dates** - Set TTL on codes (e.g., 7 days)  
🔮 **Multi-Use Codes** - Allow N redemptions per code  
🔮 **QR Codes** - Generate scannable QR codes for mobile  
🔮 **Analytics** - Track code usage stats  
🔮 **Bulk Generation** - Create multiple codes at once  
🔮 **Custom Prefixes** - Brand codes with prefixes (e.g., "TEAM-XXXX")  

---

## Support & Troubleshooting

**Q: Can I revoke a code?**  
A: Not currently. Generate a new code if needed. (Future enhancement)

**Q: How do I know if someone used my code?**  
A: Check the "Code Invites" tab - status changes to "Used"

**Q: Can I reuse a code?**  
A: No, codes are single-use only

**Q: What if I lose the code?**  
A: Check the invitations list in "Code Invites" tab - you can copy it again

**Q: Can I generate unlimited codes?**  
A: Yes, no limit on invitation creation

**Q: Do codes expire?**  
A: Not currently - they remain valid until used

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2025  
**Status:** Production Ready ✅
