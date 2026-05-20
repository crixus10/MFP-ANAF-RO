# API Examples and Workflows

Complete examples of common workflows using the Invoicing System API.

## Base Configuration

```bash
API_BASE_URL="http://localhost:5000/api"
TOKEN=""  # Will be filled after login
COMPANY_ID=""  # Will be filled after company creation
INVOICE_ID=""  # Will be filled after invoice creation
```

## 1. User Authentication Workflow

### 1.1 Register New User

```bash
curl -X POST ${API_BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "language": "ro"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john.doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Login

```bash
TOKEN=$(curl -s -X POST ${API_BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

### 1.3 Verify Token

```bash
curl -X GET ${API_BASE_URL}/auth/verify \
  -H "Authorization: Bearer ${TOKEN}"
```

## 2. Company Management Workflow

### 2.1 Create Company

```bash
COMPANY_RESPONSE=$(curl -s -X POST ${API_BASE_URL}/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "Example Company SRL",
    "taxNumber": "12345678",
    "registrationNumber": "J40/1234/2020",
    "address": "Str. Exemplu nr. 123",
    "city": "Bucuresti",
    "county": "Bucuresti",
    "postalCode": "010101",
    "email": "contact@example.com",
    "phone": "+40212345678",
    "bank": "BCR",
    "iban": "RO89BCRL0123456789012345",
    "currency": "RON",
    "language": "ro"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.data.id')
echo "Company ID: $COMPANY_ID"
```

### 2.2 Get Company Details

```bash
curl -X GET ${API_BASE_URL}/companies/${COMPANY_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

### 2.3 List User's Companies

```bash
curl -X GET ${API_BASE_URL}/companies \
  -H "Authorization: Bearer ${TOKEN}"
```

### 2.4 Update Company

```bash
curl -X PUT ${API_BASE_URL}/companies/${COMPANY_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "phone": "+40212345679",
    "fax": "+40212345680"
  }'
```

### 2.5 Verify Company with ANAF

```bash
curl -X POST ${API_BASE_URL}/companies/${COMPANY_ID}/verify-tax-status \
  -H "Authorization: Bearer ${TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "isTaxPayer": true,
    "companyData": {
      "date_generale": {
        "cui": 12345678,
        "denumire": "Example Company SRL",
        "adresa": "Str. Exemplu nr. 123",
        "...": "..."
      }
    }
  }
}
```

## 3. Supplier Management Workflow

### 3.1 Add Supplier

```bash
SUPPLIER_RESPONSE=$(curl -s -X POST ${API_BASE_URL}/suppliers/company/${COMPANY_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "Supplier Company Ltd",
    "taxNumber": "87654321",
    "email": "supplier@example.com",
    "phone": "+40212345678",
    "address": "Str. Supplier nr. 456",
    "city": "Bucuresti",
    "county": "Bucuresti",
    "postalCode": "020202",
    "iban": "RO89BCRL9876543210987654"
  }')

SUPPLIER_ID=$(echo $SUPPLIER_RESPONSE | jq -r '.data.id')
echo "Supplier ID: $SUPPLIER_ID"
```

## 4. Invoice Management Workflow

### 4.1 Create Customer Invoice

```bash
# First, create a customer company
CUSTOMER_RESPONSE=$(curl -s -X POST ${API_BASE_URL}/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "Customer Company Ltd",
    "taxNumber": "11111111",
    "address": "Str. Customer nr. 789",
    "city": "Cluj",
    "county": "Cluj",
    "postalCode": "400000",
    "email": "customer@example.com"
  }')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.data.id')

# Then create invoice
INVOICE_RESPONSE=$(curl -s -X POST ${API_BASE_URL}/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"companyId\": \"${COMPANY_ID}\",
    \"type\": \"customer\",
    \"partnerId\": \"${CUSTOMER_ID}\",
    \"invoiceDate\": \"2024-01-15\",
    \"dueDate\": \"2024-02-15\",
    \"currency\": \"RON\",
    \"notes\": \"Invoice for consulting services\",
    \"items\": [
      {
        \"description\": \"Consulting Services - January\",
        \"quantity\": 1,
        \"unitPrice\": 5000,
        \"vatRate\": 19,
        \"unit\": \"buc\"
      },
      {
        \"description\": \"Technical Support\",
        \"quantity\": 5,
        \"unitPrice\": 200,
        \"vatRate\": 19,
        \"unit\": \"hr\"
      }
    ]
  }")

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.data.id')
echo "Invoice ID: $INVOICE_ID"
```

### 4.2 Create Supplier Invoice

```bash
SUPPLIER_INVOICE=$(curl -s -X POST ${API_BASE_URL}/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"companyId\": \"${COMPANY_ID}\",
    \"type\": \"supplier\",
    \"partnerId\": \"${SUPPLIER_ID}\",
    \"invoiceDate\": \"2024-01-15\",
    \"dueDate\": \"2024-02-15\",
    \"currency\": \"RON\",
    \"notes\": \"Invoice for office supplies\",
    \"items\": [
      {
        \"description\": \"Office Supplies\",
        \"quantity\": 10,
        \"unitPrice\": 50,
        \"vatRate\": 19,
        \"unit\": \"buc\"
      }
    ]
  }")

SUPPLIER_INVOICE_ID=$(echo $SUPPLIER_INVOICE | jq -r '.data.id')
```

### 4.3 Get Invoice Details

```bash
curl -X GET ${API_BASE_URL}/invoices/${INVOICE_ID} \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.'
```

### 4.4 List Company Invoices

```bash
# All invoices
curl -X GET "${API_BASE_URL}/invoices/company/${COMPANY_ID}" \
  -H "Authorization: Bearer ${TOKEN}"

# Filtered by type
curl -X GET "${API_BASE_URL}/invoices/company/${COMPANY_ID}?type=customer" \
  -H "Authorization: Bearer ${TOKEN}"

# Filtered by status
curl -X GET "${API_BASE_URL}/invoices/company/${COMPANY_ID}?status=issued" \
  -H "Authorization: Bearer ${TOKEN}"

# Pagination
curl -X GET "${API_BASE_URL}/invoices/company/${COMPANY_ID}?page=1&limit=10" \
  -H "Authorization: Bearer ${TOKEN}"

# Date range
curl -X GET "${API_BASE_URL}/invoices/company/${COMPANY_ID}?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 4.5 Update Invoice (Draft Only)

```bash
curl -X PUT ${API_BASE_URL}/invoices/${INVOICE_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "notes": "Updated note"
  }'
```

### 4.6 Generate XML

```bash
XML_RESPONSE=$(curl -s -X POST ${API_BASE_URL}/invoices/${INVOICE_ID}/generate-xml \
  -H "Authorization: Bearer ${TOKEN}")

XML_CONTENT=$(echo $XML_RESPONSE | jq -r '.data.xmlContent')
echo "$XML_CONTENT" > invoice_${INVOICE_ID}.xml
```

## 5. ANAF Integration Workflow

### 5.1 Configure ANAF

```bash
# Prepare certificate file path and password
CERT_PATH="/path/to/certificate.pfx"
CERT_PASSWORD="your_certificate_password"
CLIENT_ID="your_anaf_client_id"
CLIENT_SECRET="your_anaf_client_secret"

curl -X POST ${API_BASE_URL}/anaf/${COMPANY_ID}/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"clientId\": \"${CLIENT_ID}\",
    \"clientSecret\": \"${CLIENT_SECRET}\",
    \"certificatePath\": \"${CERT_PATH}\",
    \"certificatePassword\": \"${CERT_PASSWORD}\"
  }"
```

### 5.2 Get ANAF Configuration

```bash
curl -X GET ${API_BASE_URL}/anaf/${COMPANY_ID}/config \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5.3 Upload Invoice to ANAF

```bash
curl -X POST ${API_BASE_URL}/anaf/${COMPANY_ID}/upload-invoice/${INVOICE_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

Response:
```json
{
  "success": true,
  "message": "Invoice uploaded to ANAF",
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 5.4 Check Invoice Status

```bash
curl -X GET ${API_BASE_URL}/anaf/${COMPANY_ID}/invoice-status/${INVOICE_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "CONFIRMED",
    "message": "Invoice has been received and processed",
    "details": {
      "downloadId": "xyz123",
      "processingTime": "5 minutes"
    }
  }
}
```

### 5.5 Get ANAF Messages

```bash
curl -X GET ${API_BASE_URL}/anaf/${COMPANY_ID}/messages/${INVOICE_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-1",
      "messageType": "upload",
      "direction": "sent",
      "status": "success",
      "anafMessage": "OK",
      "uploadId": "upload-1",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "msg-2",
      "messageType": "status_check",
      "direction": "received",
      "status": "success",
      "anafMessage": "CONFIRMED",
      "createdAt": "2024-01-15T10:15:00Z"
    }
  ]
}
```

## 6. Dashboard Workflow

### 6.1 Get User Dashboard

```bash
curl -X GET ${API_BASE_URL}/dashboard \
  -H "Authorization: Bearer ${TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "...",
        "name": "Example Company SRL",
        "taxNumber": "12345678",
        "role": "owner"
      }
    ],
    "stats": [
      {
        "companyId": "...",
        "companyName": "Example Company SRL",
        "totalInvoices": 25,
        "totalRevenue": 125000
      }
    ]
  }
}
```

### 6.2 Get Company Dashboard

```bash
curl -X GET ${API_BASE_URL}/dashboard/company/${COMPANY_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "invoices": {
      "total": 25,
      "draft": 5,
      "issued": 15,
      "paid": 5
    },
    "revenue": {
      "thisMonth": 25000,
      "lastMonth": 22000
    },
    "anaf": {
      "pending": 2,
      "errors": 0
    },
    "recentInvoices": [...]
  }
}
```

## 7. User Management Workflow

### 7.1 Get Current User Profile

```bash
curl -X GET ${API_BASE_URL}/users/profile \
  -H "Authorization: Bearer ${TOKEN}"
```

### 7.2 Update User Profile

```bash
curl -X PUT ${API_BASE_URL}/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "firstName": "John",
    "lastName": "Doe Updated",
    "language": "en"
  }'
```

### 7.3 List Company Users (Owner Only)

```bash
curl -X GET ${API_BASE_URL}/users/company/${COMPANY_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

### 7.4 Invite User to Company (Owner Only)

```bash
curl -X POST ${API_BASE_URL}/users/company/${COMPANY_ID}/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "email": "colleague@example.com",
    "role": "accountant"
  }'
```

### 7.5 Remove User from Company (Owner Only)

```bash
curl -X DELETE ${API_BASE_URL}/users/company/${COMPANY_ID}/users/${USER_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

## 8. Complete Invoice Workflow

Step-by-step complete process:

```bash
#!/bin/bash

# 1. Register and login
TOKEN=$(curl -s -X POST ${API_BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }' | jq -r '.data.token')

# 2. Create company
COMPANY=$(curl -s -X POST ${API_BASE_URL}/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"name":"My Company","taxNumber":"12345678",...}')
COMPANY_ID=$(echo $COMPANY | jq -r '.data.id')

# 3. Create customer
CUSTOMER=$(curl -s -X POST ${API_BASE_URL}/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"name":"Customer","taxNumber":"11111111",...}')
CUSTOMER_ID=$(echo $CUSTOMER | jq -r '.data.id')

# 4. Create invoice
INVOICE=$(curl -s -X POST ${API_BASE_URL}/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"companyId":"'"${COMPANY_ID}"'","type":"customer",...}')
INVOICE_ID=$(echo $INVOICE | jq -r '.data.id')

# 5. Generate XML
curl -s -X POST ${API_BASE_URL}/invoices/${INVOICE_ID}/generate-xml \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.xmlContent' > invoice.xml

# 6. Configure ANAF
curl -s -X POST ${API_BASE_URL}/anaf/${COMPANY_ID}/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"clientId":"...","clientSecret":"...",...}'

# 7. Upload to ANAF
curl -s -X POST ${API_BASE_URL}/anaf/${COMPANY_ID}/upload-invoice/${INVOICE_ID} \
  -H "Authorization: Bearer ${TOKEN}"

# 8. Check status
curl -s -X GET ${API_BASE_URL}/anaf/${COMPANY_ID}/invoice-status/${INVOICE_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

## Error Handling Examples

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Access denied to this company"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### ANAF Error
```json
{
  "success": false,
  "message": "Failed to upload invoice",
  "data": {
    "error": "Company is not registered as VAT payer"
  }
}
```

## Best Practices

1. **Always validate response status** before using data
2. **Store token securely** - never expose in logs or version control
3. **Use pagination** for list endpoints to avoid large responses
4. **Handle errors gracefully** - implement retry logic for transient failures
5. **Test with ANAF sandbox** before production
6. **Keep digital certificates secure** - use environment variables
7. **Log all ANAF interactions** for audit purposes
8. **Implement rate limiting** to prevent API abuse
9. **Use HTTPS** for all API calls in production
10. **Monitor ANAF API status** for any outages or changes
