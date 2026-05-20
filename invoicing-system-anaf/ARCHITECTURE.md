# System Architecture

## Overview

The Invoicing System with ANAF Integration is built as a full-stack web application with a Node.js backend and React frontend, designed for managing invoices with automatic ANAF (Romanian Tax Authority) integration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Invoices, Companies, ANAF, etc   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Zustand Store (Auth, Company, Invoice State)        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Axios HTTP Client + JWT Interceptors                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes: auth, companies, invoices, anaf, users      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services:                                            │   │
│  │  - ANAF Service (API integration)                    │   │
│  │  - Invoice XML Service (UBL generation)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware:                                         │   │
│  │  - JWT Authentication                                │   │
│  │  - Role-based Access Control                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Models (Sequelize ORM):                             │   │
│  │  - User, Company, Invoice, InvoiceItem              │   │
│  │  - AnafConfig, AnafMessage, UserCompany             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                    SQL Query (MySQL/PostgreSQL)
                           │
┌─────────────────────────────────────────────────────────────┐
│                     Database                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MySQL 5.7+ or PostgreSQL 10+                        │   │
│  │  - Tables for all domain models                      │   │
│  │  - Indexes for performance                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTPS API Call
                           │
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ANAF API:                                            │   │
│  │  - Tax verification                                  │   │
│  │  - Invoice upload                                    │   │
│  │  - Status checking                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 14+
- **Framework**: Express.js 4.18+
- **Database ORM**: Sequelize 6.35+
- **Database**: MySQL 5.7+ / PostgreSQL 10+
- **Authentication**: JWT, bcryptjs
- **HTTP Client**: Axios
- **XML Processing**: xml2js
- **Utilities**: uuid, dotenv

### Frontend
- **Framework**: React 18.2+
- **Routing**: React Router 6.18+
- **UI Framework**: Material-UI 5.14+
- **State Management**: Zustand 4.4+
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **Date Handling**: dayjs

## Database Schema

### Core Tables

#### Users
```sql
- id (UUID, PK)
- username (STRING, UNIQUE)
- email (STRING, UNIQUE)
- password (STRING, hashed)
- firstName, lastName (STRING)
- language (ENUM: ro, en)
- role (ENUM: admin, manager, user)
- isActive (BOOLEAN)
- lastLogin (DATETIME)
- createdAt, updatedAt (DATETIME)
```

#### Companies
```sql
- id (UUID, PK)
- name (STRING)
- taxNumber (STRING, UNIQUE)
- registrationNumber, address, city, county (STRING)
- email, phone, fax, website (STRING)
- bank, iban (STRING)
- currency (ENUM: RON, EUR, USD, GBP)
- language (ENUM: ro, en)
- isTaxPayer (BOOLEAN)
- anafStatus (ENUM: pending, active, inactive, error)
- anafLastCheck (DATETIME)
- isActive (BOOLEAN)
- createdAt, updatedAt (DATETIME)
```

#### UserCompanies (Many-to-Many)
```sql
- id (UUID, PK)
- userId (UUID, FK -> Users)
- companyId (UUID, FK -> Companies)
- role (ENUM: owner, manager, accountant, viewer)
- isDefault (BOOLEAN)
- createdAt, updatedAt (DATETIME)
- UNIQUE(userId, companyId)
```

#### Invoices
```sql
- id (UUID, PK)
- invoiceNumber (STRING)
- companyId (UUID, FK -> Companies)
- type (ENUM: customer, supplier)
- partnerId (UUID, FK -> Companies)
- invoiceDate, dueDate (DATE)
- currency (STRING)
- subtotal, vatAmount, total (DECIMAL)
- notes (TEXT)
- status (ENUM: draft, issued, paid, cancelled)
- anafStatus (ENUM: pending, sent, confirmed, error)
- anafMessage (TEXT)
- anafUploadId (STRING)
- xmlContent (LONGTEXT)
- pdfPath (STRING)
- createdBy (UUID, FK -> Users)
- createdAt, updatedAt (DATETIME)
```

#### InvoiceItems
```sql
- id (UUID, PK)
- invoiceId (UUID, FK -> Invoices)
- description (TEXT)
- quantity (DECIMAL)
- unitPrice (DECIMAL)
- vatRate (DECIMAL)
- lineTotal, lineVat (DECIMAL)
- unit (STRING)
- createdAt, updatedAt (DATETIME)
```

#### AnafConfig
```sql
- id (UUID, PK)
- companyId (UUID, FK -> Companies, UNIQUE)
- clientId, clientSecret (STRING)
- certificatePath (STRING)
- certificatePassword (STRING)
- accessToken (TEXT)
- refreshToken (TEXT)
- tokenExpiresAt (DATETIME)
- isConfigured, isActive (BOOLEAN)
- lastSyncDate (DATETIME)
- createdAt, updatedAt (DATETIME)
```

#### AnafMessages
```sql
- id (UUID, PK)
- invoiceId (UUID, FK -> Invoices)
- messageType (ENUM: upload, status_check, download, error)
- direction (ENUM: sent, received)
- status (ENUM: pending, success, error, warning)
- anafCode, anafMessage (STRING/TEXT)
- uploadId (STRING)
- requestData, responseData (LONGTEXT)
- createdAt, updatedAt (DATETIME)
```

## API Architecture

### Authentication Flow
```
1. User registers/logs in
2. Backend verifies credentials
3. JWT token generated with 30-day expiration
4. Token stored in localStorage on client
5. All subsequent requests include Authorization header
6. Backend validates token on protected routes
```

### Multi-Company Access Control
```
1. User can be member of multiple companies
2. UserCompany junction table tracks membership
3. Each request filtered by company context
4. Role-based permissions per company
5. Users can switch between companies
```

### Invoice Processing Flow
```
1. User creates invoice (draft status)
2. Invoice items added with calculations
3. User generates UBL XML
4. Optionally: Digital signature added
5. User uploads to ANAF (if configured)
6. ANAF processes and returns status
7. Status tracked in AnafMessages table
```

### ANAF Integration Flow
```
1. Company configures OAuth credentials
2. Certificate and password stored securely
3. On invoice upload:
   a. Request access token from ANAF
   b. Generate signed XML invoice
   c. POST to ANAF upload endpoint
   d. Receive upload ID
   e. Store upload ID in invoice record
4. Periodic status checks:
   a. Use upload ID to query status
   b. Update invoice anafStatus
   c. Log response in AnafMessages
```

## API Routes

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify
```

### Companies
```
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PUT    /api/companies/:id
POST   /api/companies/:id/verify-tax-status
```

### Invoices
```
GET    /api/invoices/company/:companyId
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
POST   /api/invoices/:id/generate-xml
```

### ANAF
```
POST   /api/anaf/:companyId/configure
GET    /api/anaf/:companyId/config
POST   /api/anaf/:companyId/upload-invoice/:invoiceId
GET    /api/anaf/:companyId/invoice-status/:invoiceId
GET    /api/anaf/:companyId/messages/:invoiceId
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/company/:companyId
POST   /api/users/company/:companyId/invite
DELETE /api/users/company/:companyId/users/:userId
```

### Dashboard
```
GET    /api/dashboard
GET    /api/dashboard/company/:companyId
```

## Security Architecture

### Authentication
- JWT tokens with 30-day expiration
- Bcrypt password hashing (10 rounds)
- Token refresh mechanism
- Secure token storage in localStorage

### Authorization
- Role-based access control (RBAC)
- User → Company mapping with roles
- Per-route authorization checks
- Company-level data isolation

### Data Protection
- HTTPS for all communications
- Certificate-based ANAF authentication
- Encrypted sensitive fields (passwords, tokens)
- SQL injection prevention via ORM
- XSS protection via React escaping

### Audit Trail
- AnafMessages table logs all ANAF communications
- User activity timestamps
- Change history in created/updatedAt fields
- Digital signatures for invoices

## Performance Optimization

### Database
- Indexes on frequently queried fields
- Connection pooling (min 5, max 10)
- Query optimization via Sequelize
- Pagination for list endpoints

### Frontend
- Code splitting with React Router
- Lazy loading of pages
- Zustand for efficient state management
- Material-UI component memoization

### API
- Request/response compression
- JWT caching
- CORS for cross-origin requests
- Error handling and retry logic

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- JWT tokens eliminate session storage
- Database connection pooling
- Separate read/write databases possible

### Vertical Scaling
- Database optimization
- Caching layer (Redis)
- CDN for static assets
- Load balancing

### Future Enhancements
- Microservices architecture
- Message queue for ANAF uploads
- Webhook support for real-time updates
- GraphQL API layer
- Mobile app support

## Deployment Architecture

### Development
```
Frontend (React Dev Server) → Backend (Express) → Database (Local MySQL)
```

### Production
```
Client → CDN (Static Files)
         ↓
      Nginx/Load Balancer
         ↓
    Backend Cluster (Node.js)
         ↓
      Database Server (MySQL/PostgreSQL)
         ↓
      Backup & Replication
```

### Docker Deployment
```
Docker Container (Node.js + Express)
    ↓
Docker Network
    ↓
Database Container (MySQL)
```

## Integration Points

### ANAF API
- Base URL: https://webservicesp.anaf.ro
- Authentication: OAuth 2.0
- Operations: Tax verification, invoice upload, status check
- Data format: JSON (requests), XML (invoices)

### Digital Certificates
- Format: PFX (PKCS#12)
- Purpose: XML signature and OAuth authentication
- Storage: Encrypted in .env or certificate store
- Renewal: Manual update in company settings

### External Dependencies
- Material-UI for UI components
- i18next for translations
- Axios for HTTP requests
- Sequelize for database operations
- xml2js for XML processing

## Monitoring and Logging

### Backend Logging
- Request/response logging
- Error stack traces
- ANAF API interactions
- Database query performance

### Frontend Error Tracking
- Console error logging
- Network request logging
- User action tracking
- Performance metrics

### Alerts
- ANAF upload failures
- Database connection errors
- Authentication failures
- API response timeouts

## Disaster Recovery

### Backup Strategy
- Daily database backups
- Backup retention: 30 days
- Backup testing: Weekly
- Offsite storage: Yes

### Recovery Procedures
- RTO: 1 hour
- RPO: 1 day
- Recovery from backup: Documented
- Failover procedures: Automated

## Compliance

### Data Protection
- GDPR compliance for EU users
- Data encryption at rest
- Secure data deletion
- Privacy policy implementation

### Audit Requirements
- Complete transaction history
- ANAF communication logs
- User action audit trail
- Invoice version history

### Regulatory
- Romanian e-Factura compliance
- UBL 2.1 standard compliance
- ANAF API v8 compliance
- Digital signature requirements
