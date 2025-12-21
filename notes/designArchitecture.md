# Idempotency 
## My Notes

idempotency in backend is the operation when u repeat a request many times it sends the same result 
meaning that these methods are idempotent : Get , put , delete , head , patch (if the u set the changed value as a value ) 
non-idempotent : Post , Patch (if u set the changed value as an expression ) 
when the connection might delay or the user did a mistake (double click) a dangeerous problem when it comes to buying stuff or something like that so to fix that we create a idempotent-key and attach it to the post request header 'Idempotency-Key'

## Professor Notes

An operation is idempotent if making the same request multiple times results in the same state on the server as making it once.

Important detail:
Same state, not necessarily the same response body every time.

### HTTP methods & idempotency
#### Idempotent methods
GET : Reads data only  , No state change
PUT : Replaces the resource with a specific value , Repeating it keeps the same state
DELETE : Deleting the same resource multiple times still results in “deleted”
HEAD : Same as GET but without body
PATCH (conditionally) : Idempotent if you set a value explicitly

``` json 
{ "status": "paid" }
```
Repeating it keeps the same result

#### non-Idempotent methods

POST : Usually creates a new resource , Repeating it → creates multiple resources
PATCH (conditionally) : Non-idempotent if it applies an operation or expression

``` json 
{ "balance": "+100" }
```
Repeating it changes the state each time

### The real problem (why idempotency matters)
Problems happen when:

  * Network latency
  * Client timeout
  * User double-clicks
  * Mobile app retries automatically

``` JavaScript  
 router.post("/purchase")
```
If this request is sent twice:
  * User gets charged twice
  * Two orders are created
  * Financial loss + angry users 😬

### The solution: Idempotency Key

 1. Client generates a unique key (UUID)
 2. Sends it in the request header
 3. Server stores the result for that key
 4. If the same key is received again:
    * Server returns the previous result
    * Does NOT execute the operation again


# User Enumeration
## Definition 
Attackers discover which emails/usernames exist in your system. (Backend should be vague. Frontend can be helpful.)
```TypeScript
// Different responses leak information
POST /login { email: "exists@x.com" }     → 401 "Invalid credentials"
POST /login { email: "notexists@x.com" }  → 404 "User not found"
//                                            ↑ Different = leak
```
## Fix 
```TypeScript

// Same status + same message for both cases
if (!user) {
    return apiErrorHandler(res, 401, "Invalid credentials");
}
if (!passwordMatch) {
    return apiErrorHandler(res, 401, "Invalid credentials");
}
```
## What frontEnd can do 
       Action	                          Safe?	                         Example
Format validation before submit	           ✅	              "Please enter a valid email"
Suggest common typos	                   ✅	              "Did you mean gmail.com?"
Show password requirements	               ✅	              "Must be 8+ characters"
Confirm email exists	                   ❌	              "No account with this email"

## Decision 
        App type	                                 Enumeration protection
Banking, healthcare, sensitive	            Strict — never reveal
Social media, public profiles	            Relaxed — emails are public anyway
E-commerce	                                Middle ground — rate limit heavily

# Race Conditions
## Definition
Two operations "race" each other, and the result depends on timing.

``` TypeScript
// ❌ Gap between check and create
const emailExists = await UserModel.findOne({ email })  // Both requests see null
if (emailExists) { return error }
const newUser = await UserModel.create({ ... })          // Both try to create
```

Request A                         Request B
────────────►                     ────────────►
findOne → null                    findOne → null
    │                                 │
    ▼                                 ▼
create(user)                      create(user)
SUCCESS                           💥 CRASH or DUPLICATE

## fix

Make it atomic with database constraints
``` TypeScript
// Schema
email: { type: String, unique: true }

// Controller
try {
    newUser = await UserModel.create({ ... });
} catch (err: any) {
    if (err.code === 11000) {  // MongoDB duplicate key
        return apiErrorHandler(res, 409, "Email already registered");
    }
    throw err;
}

```
or you can handle it in  a error middleware also notes 11000 is mongodb error code 

## Where race conditions appear:

* Bank transfers (check balance → withdraw)
* Inventory systems (check stock → purchase)
* Booking systems (check availability → reserve)
* Any check-then-act pattern
