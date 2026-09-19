# BOLA-001: Broken Object Level Authorization

## Finding Summary

| Field              | Details                                   |
| ------------------ | ----------------------------------------- |
| Finding ID         | BOLA-001                                  |
| Severity           | High                                      |
| Category           | Broken Access Control                     |
| OWASP API Category | API1: Broken Object Level Authorization   |
| Affected Endpoint  | `GET /api/transactions/:id`               |
| Application        | KifaruPay FinTech Security Assessment Lab |
| Status             | Remediated - Retested                     |
| Environment        | Local isolated security lab               |

---

## 1. Description

The KifaruPay API uses JWT authentication to verify that a user is logged in.

During the initial security assessment, the transaction endpoint did not verify that the authenticated user was authorized to access the requested transaction.

An authenticated user could therefore change the transaction ID in the request and access another user's transaction data.

This constituted a Broken Object Level Authorization (BOLA) vulnerability.

---

## 2. Test Scenario

Two fictional KifaruPay users were used for testing:

* Amina Otieno - User ID `1`
* Brian Kamau - User ID `2`

Transaction `1002` belongs to Brian:

```json
{
  "id": 1002,
  "userId": 2,
  "type": "payment",
  "amount": 12000,
  "description": "School Fees",
  "status": "completed"
}
```

### Original Test

Amina authenticated successfully and received a valid JWT.

The JWT was then used to request Brian's transaction:

```text
GET /api/transactions/1002
Authorization: Bearer <Amina JWT>
```

### Original Result

The API returned Brian's transaction:

```json
{
  "id": 1002,
  "userId": 2,
  "type": "payment",
  "amount": 12000,
  "description": "School Fees",
  "status": "completed"
}
```

This demonstrated that authentication was present, but object-level authorization was missing.

**Initial Result:** FAIL

**Evidence:** `BOLA-001-unauthorized-access.png`

---

## 3. Security Impact

An attacker with a valid KifaruPay user account could potentially modify transaction IDs and access transaction records belonging to other users.

Depending on the data exposed and the functionality connected to the endpoint, this type of vulnerability could result in unauthorized disclosure of financial information and loss of customer confidentiality.

The severity was assessed as High for this isolated lab scenario because authenticated users could access another user's financial transaction data.

---

## 4. Root Cause

The original endpoint verified that the requester possessed a valid JWT but did not verify whether the requested transaction belonged to that authenticated user.

Authentication and authorization were therefore treated as separate controls, with authentication implemented but object-level authorization missing.

---

## 5. Remediation

Object-level authorization was added to:

```text
GET /api/transactions/:id
```

The API now verifies that:

* A normal user can only access transactions belonging to their own user ID.
* An administrator can access transactions belonging to other users.
* Requests attempting to access another user's transaction return HTTP 403 Forbidden.

### Authorization Logic

```javascript
if (
  req.user.role !== "admin" &&
  transaction.userId !== req.user.userId
) {
  return res.status(403).json({
    error: "Access denied"
  });
}
```

---

## 6. Retest

### Test 1: Unauthorized Object Access

**User:** Amina Otieno
**Authenticated User ID:** `1`
**Target Transaction:** `1002`
**Transaction Owner:** User ID `2`

Request:

```text
GET /api/transactions/1002
Authorization: Bearer <Amina JWT>
```

### Retest Result

The API returned:

```json
{
  "error": "Access denied"
}
```

**HTTP Status:** `403 Forbidden`

**Result:** PASS

The authenticated user can no longer access another user's transaction.

**Evidence:** `BOLA-001-retest-unauthorized-access-blocked.png`

---

### Test 2: Authorized Object Access

**User:** Amina Otieno
**User ID:** `1`
**Transaction:** `1001`
**Transaction Owner:** User ID `1`

Request:

```text
GET /api/transactions/1001
Authorization: Bearer <Amina JWT>
```

### Retest Result

The API returned Amina's transaction successfully.

**HTTP Status:** `200 OK`

**Result:** PASS

The authorization control does not prevent legitimate access to resources owned by the authenticated user.

**Evidence:** `BOLA-001-retest-authorized-access-success.png`

---

## 7. Retest Conclusion

The previously identified Broken Object Level Authorization vulnerability was successfully remediated and retested.

The API now performs object-level authorization before returning individual transaction records.

The retest confirmed that:

* Amina can access her own transaction.
* Amina cannot access Brian's transaction.
* Unauthorized cross-user access is blocked with HTTP 403.
* Legitimate object access continues to function.

**Final Status: Remediated - Retested**
