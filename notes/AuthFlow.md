# JWT MiddleWare Flow

┌─────────────────────────────────────────────────────────┐
│  1. Check header exists + format                        │
│                                                         │
│     "Bearer eyJhbG..." → valid format                   │
│     "eyJhbG..."        → missing Bearer                 │
│     undefined          → no header                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. Extract token                                       │
│                                                         │
│     "Bearer eyJhbG...".split(" ") → ["Bearer", "eyJ..."]│
│                                          [0]      [1]   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. Verify + decode                                     │
│                                                         │
│     jwt.verify(token, secret)                           │
│         │                                               │
│         ▼                                               │
│     { id: "abc123", iat: 1234, exp: 5678 }              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. Attach to request                                   │
│                                                         │
│     req.user = decoded                                  │
│                                                         │
│     Now every controller after this can access req.user │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  5. next()                                              │
│                                                         │
│     Pass control to the next middleware or controller   │
└─────────────────────────────────────────────────────────┘

Signature valid?	                 Throws JsonWebTokenError
Token expired?	                     Throws TokenExpiredError
Token structure valid?	             Throws JsonWebTokenError

┌─────────────────────────────────────────────────────────────┐
│  ACCESS TOKEN                                               │
│  ├── Short-lived (15 minutes)                               │
│  ├── JWT (self-contained)                                   │
│  ├── Sent in Authorization header                           │
│  ├── Stored in memory (JavaScript variable)                 │
│  └── Used for: authenticating every API request             │
├─────────────────────────────────────────────────────────────┤
│  REFRESH TOKEN                                              │
│  ├── Long-lived (15 days)                                   │
│  ├── Random string (crypto.randomBytes)                     │
│  ├── Stored in database (for revocation)                    │
│  ├── Sent in httpOnly cookie                                │
│  └── Used for: getting new access tokens                    │
├─────────────────────────────────────────────────────────────┤
│  SECURITY                                                   │
│  ├── httpOnly     → Blocks XSS (JavaScript can't read)      │
│  ├── sameSite     → Blocks CSRF (cross-site blocked)        │
│  ├── secure       → HTTPS only in production                │
│  └── randomBytes  → Unpredictable tokens                    │
├─────────────────────────────────────────────────────────────┤
│  DATABASE INDEX                                             │
│  ├── Without index → Scan all documents (slow)              │
│  ├── With index    → Direct lookup (fast)                   │
│  └── Use on fields you search frequently                    │
├─────────────────────────────────────────────────────────────┤
│  ATOMICITY                                                  │
│  ├── Multiple steps must all succeed                        │
│  ├── If any step fails → Undo all previous steps            │
│  └── Database never left in broken state                    │
└─────────────────────────────────────────────────────────────┘

# Token Rotation

## What It Is
Each refresh creates NEW token and REVOKES old token.
Old token points to new token via `replacedBy`.

## Why It Matters
- Limits damage window if token stolen
- Detects token theft when old token reused
- Creates audit trail for security investigation

## Flow
1. User sends old refresh token
2. Server validates → creates new token
3. Server revokes old token (isRevoked: true)
4. Server links old → new (replacedBy: newToken)
5. User gets new token

## Attack Detection
If revoked token is used:
├── Someone has an old token
├── Could be attacker
├── Revoke ALL tokens for user
└── Force re-login (only real user can)



# Token Lifecycle - Complete Flow

## Scenario
User registers → Access token expires twice → Logout → Login again

---

## MINUTE 0: User Registers

**Tokens Created:**
- Access Token: AT-1 (expires in 15 min)
- Refresh Token: RT-1 (expires in 15 days)

**Database:**
| Token | userId | isRevoked | replacedBy |
|-------|--------|-----------|------------|
| RT-1  | 123    | false     | -          |

**Storage:**
- Cookie: RT-1
- Client memory: AT-1

---

## MINUTE 15: Access Token Expires (First Time)

**Client calls:** `POST /refresh` (cookie sends RT-1)

**Server actions:**
1. Find RT-1 in database ✓
2. Is revoked? NO ✓
3. Is expired? NO ✓
4. Revoke RT-1 (rotation)
5. Create RT-2
6. Create AT-2

**Database:**
| Token | userId | isRevoked | replacedBy |
|-------|--------|-----------|------------|
| RT-1  | 123    | **TRUE**  | RT-2       |
| RT-2  | 123    | false     | -          |

**Storage:**
- Cookie: RT-2
- Client memory: AT-2

---

## MINUTE 30: Access Token Expires (Second Time)

**Client calls:** `POST /refresh` (cookie sends RT-2)

**Server actions:**
1. Find RT-2 in database ✓
2. Is revoked? NO ✓
3. Is expired? NO ✓
4. Revoke RT-2 (rotation)
5. Create RT-3
6. Create AT-3

**Database:**
| Token | userId | isRevoked | replacedBy |
|-------|--------|-----------|------------|
| RT-1  | 123    | TRUE      | RT-2       |
| RT-2  | 123    | **TRUE**  | RT-3       |
| RT-3  | 123    | false     | -          |

**Storage:**
- Cookie: RT-3
- Client memory: AT-3

---

## MINUTE 35: User Clicks Logout

**Client calls:** `POST /logout` (cookie sends RT-3)

**Server actions:**
1. Find RT-3 in database ✓
2. Revoke RT-3
3. Clear cookie
4. **NO new tokens created**

**Database:**
| Token | userId | isRevoked | replacedBy |
|-------|--------|-----------|------------|
| RT-1  | 123    | TRUE      | RT-2       |
| RT-2  | 123    | TRUE      | RT-3       |
| RT-3  | 123    | **TRUE**  | -          |

**Storage:**
- Cookie: (empty)
- Client memory: (cleared)

---

## MINUTE 40: User Logs In Again

**Client calls:** `POST /login` (email + password)

**Server actions:**
1. Verify password ✓
2. Create RT-4 (new session)
3. Create AT-4

**Database:**
| Token | userId | isRevoked | replacedBy |
|-------|--------|-----------|------------|
| RT-1  | 123    | TRUE      | RT-2       |
| RT-2  | 123    | TRUE      | RT-3       |
| RT-3  | 123    | TRUE      | -          |
| RT-4  | 123    | false     | -          |

**Storage:**
- Cookie: RT-4
- Client memory: AT-4

---

## Summary Table

| Event          | Access Token | Refresh Token | Database Change                |
|----------------|--------------|---------------|--------------------------------|
| Register       | AT-1 created | RT-1 created  | RT-1 added                     |
| First refresh  | AT-2 created | RT-2 created  | RT-1 revoked, RT-2 added       |
| Second refresh | AT-3 created | RT-3 created  | RT-2 revoked, RT-3 added       |
| Logout         | AT-3 cleared | RT-3 revoked  | RT-3 revoked, nothing added    |
| Login          | AT-4 created | RT-4 created  | RT-4 added                     |

---

## Key Points

1. **Access tokens** are NEVER stored in database
   - They live in client memory only
   - They are self-validated (JWT signature)

2. **Refresh tokens** are ALWAYS stored in database
   - This allows revocation
   - This allows tracking

3. **Each refresh creates a chain**
   - RT-1 → RT-2 → RT-3
   - You can trace the history via `replacedBy`

4. **Logout breaks the chain**
   - No replacement token
   - User must authenticate again

5. **Login starts a new chain**
   - Fresh token, no connection to old ones