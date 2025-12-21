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