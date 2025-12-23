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