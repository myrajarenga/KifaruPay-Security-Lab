# AUTH-001: Plaintext Password Storage

## Finding Summary

| Field              | Details                                   |
| ------------------ | ----------------------------------------- |
| Finding ID         | AUTH-001                                  |
| Severity           | High                                      |
| Category           | Cryptographic Failures / Authentication   |
| Affected Component | `app/backend/data/users.json`             |
| Application        | KifaruPay FinTech Security Assessment Lab |
| Status             | Remediated - Retested                     |
| Environment        | Local isolated security lab               |

---

## 1. Description

The KifaruPay application initially stored user passwords in plaintext within the application's local user data file.

Example:

```json
{
  "email": "amina@kifaru.test",
  "password": "Amina123!"
}
```

Passwords should not be stored in plaintext because anyone who gains unauthorized access to the user data store could immediately obtain credentials that may be usable to authenticate as those users.

---

## 2. Initial Evidence

The initial assessment confirmed that plaintext passwords were stored in:

```text
app/backend/data/users.json
```

The initial plaintext password storage was captured during the recorded assessment before remediation.

**Evidence:** `AUTH-001-plaintext-password-storage-before.PNG`

---

## 3. Security Impact

If an attacker obtained unauthorized access to the user data store, plaintext passwords could be directly exposed.

This could allow an attacker to authenticate as affected users and potentially gain access to functionality available to those accounts.

In a real financial application, credential compromise could have significant confidentiality and account-security implications.

---

## 4. Root Cause

The original authentication implementation compared the submitted password directly against the password stored in the user data file:

```javascript
item.password === password
```

No password hashing mechanism was applied.

---

## 5. Remediation

The application was changed to use bcrypt password hashing.

The remediation included:

1. Replacing plaintext passwords with bcrypt password hashes.
2. Adding the `bcryptjs` dependency.
3. Changing the login process to use `bcrypt.compare()`.
4. Removing plaintext password comparison.
5. Changing the stored password field from `password` to `passwordHash`.
6. Ensuring plaintext passwords are no longer stored in the user data file.

The resulting authentication flow is:

```text
User enters password
        ↓
bcrypt.compare()
        ↓
Stored bcrypt hash
        ↓
Password match?
   ↓           ↓
 YES          NO
  ↓            ↓
200 OK       401
JWT issued   Unauthorized
```

---

## 6. Retesting

### Test 1: Correct Password

Amina authenticated using the correct password.

**Result:**

```text
Login successful
HTTP 200
JWT issued
```

**Status:** PASS

---

### Test 2: Incorrect Password

An incorrect password was submitted for Amina's account.

**Result:**

```text
Invalid email or password
HTTP 401
```

**Status:** PASS

---

### Test 3: Password Storage

The updated `users.json` file was inspected after remediation.

The original plaintext passwords were replaced with bcrypt hashes using the `passwordHash` property.

Example:

```json
{
  "email": "amina@kifaru.test",
  "passwordHash": "$2b$12$..."
}
```

No plaintext passwords were present in the updated user data.

**Status:** PASS

---

### Test 4: Authenticated Application Functionality

A successful login produced a valid JWT.

The JWT was then used to access an authenticated transaction endpoint.

**Result:**

```text
HTTP 200
Authenticated transaction returned successfully
```

**Status:** PASS

---

## 7. Evidence Files

The assessment evidence includes:

* `AUTH-001-plaintext-password-storage-before.PNG`
* `AUTH-001-retest-authenticated-access.PNG`

The password hashing remediation was verified by inspecting the updated `users.json` file and confirming that plaintext passwords were replaced with bcrypt hashes.

No additional screenshot is required for the password hashes because the remediation was verified directly through the application data and recorded during the assessment.

---

## 8. Final Status

**Remediated - Retested**

The plaintext password storage vulnerability was successfully remediated.

Authentication was retested using both valid and invalid credentials. The user data store was verified to contain bcrypt password hashes instead of plaintext passwords, and authenticated API functionality continued to operate successfully after remediation.
