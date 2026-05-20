# Invoicing System with ANAF Integration

A comprehensive multi-user, multi-language, multi-company web application for managing customer and supplier invoices with automatic ANAF (Romanian Tax Authority) integration.

## Features

### Core Features
- **Multi-user Support**: User authentication with role-based access control
- **Multi-language**: Support for Romanian and English interfaces
- **Multi-company**: Single user can manage multiple companies
- **Customer Invoicing**: Create and manage customer invoices
- **Supplier Invoicing**: Register and track supplier invoices
- **Invoice Management**: Draft, issue, and track invoice status

### ANAF Integration
- **Company Verification**: Verify companies with ANAF tax database
- **Automatic Upload**: Send invoices to ANAF in UBL/XML format
- **Status Tracking**: Monitor invoice confirmation status with ANAF
- **OAuth 2.0**: Secure authentication with ANAF API
- **Digital Signature**: Support for digital certificate signing
- **Message History**: Complete audit trail of all ANAF communications

### Additional Features
- **Dashboard**: Real-time overview of invoicing activity
- **Multi-currency Support**: Handle RON, EUR, USD, GBP
- **Tax Management**: VAT calculation and tracking
- **User Roles**: Owner, Manager, Accountant, Viewer roles
- **Company Management**: Add and manage multiple companies

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Sequelize** ORM for database
- **MySQL** database (can be adapted for PostgreSQL)
- **JWT** for authentication
- **Axios** for HTTP requests to ANAF API

### Frontend (To be implemented)
- React with TypeScript
- Redux for state management
- Material-UI for components
- Responsive design

## Installation

### Prerequisites
- Node.js 14+ and npm
- MySQL 5.7+ or PostgreSQL
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd invoicing-system-anaf
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run db:migrate
```

5. Start the server:
```bash
npm start
# For development with auto-reload:
npm run dev
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "language": "ro"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

### Company Endpoints

#### Create Company
```
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "taxNumber": "12345678",
  "registrationNumber": "J40/1234/2020",
  "address": "Str. Exemplu, nr. 123",
  "city": "Bucuresti",
  "county": "Bucuresti",
  "postalCode": "010101",
  "email": "contact@acme.ro",
  "phone": "+40212345678",
  "currency": "RON",
  "language": "ro"
}
```

#### Get Company
```
GET /api/companies/:companyId
Authorization: Bearer <token>
```

#### Update Company
```
PUT /api/companies/:companyId
Authorization: Bearer <token>
Content-Type: application/json
```

#### Verify Tax Status
```
POST /api/companies/:companyId/verify-tax-status
Authorization: Bearer <token>
```

### Invoice Endpoints

#### Create Invoice
```
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "uuid",
  "type": "customer",
  "partnerId": "uuid",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "currency": "RON",
  "notes": "Invoice for services",
  "items": [
    {
      "description": "Service 1",
      "quantity": 1,
      "unitPrice": 1000,
      "vatRate": 19,
      "unit": "buc"
    }
  ]
}
```

#### Get Invoices
```
GET /api/invoices/company/:companyId?type=customer&status=issued&page=1&limit=20
Authorization: Bearer <token>
```

#### Generate XML
```
POST /api/invoices/:invoiceId/generate-xml
Authorization: Bearer <token>
```

### ANAF Endpoints

#### Configure ANAF
```
POST /api/anaf/:companyId/configure
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "certificatePath": "/path/to/cert.pfx",
  "certificatePassword": "password"
}
```

#### Upload Invoice
```
POST /api/anaf/:companyId/upload-invoice/:invoiceId
Authorization: Bearer <token>
```

#### Check Invoice Status
```
GET /api/anaf/:companyId/invoice-status/:invoiceId
Authorization: Bearer <token>
```

#### Get ANAF Messages
```
GET /api/anaf/:companyId/messages/:invoiceId
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Company Dashboard
```
GET /api/dashboard/company/:companyId
Authorization: Bearer <token>
```

#### Get User Dashboard
```
GET /api/dashboard
Authorization: Bearer <token>
```

## Database Schema

### Tables
- **Users**: User accounts with authentication
- **Companies**: Company information including tax details
- **UserCompanies**: User-company relationships with roles
- **Invoices**: Invoice master records
- **InvoiceItems**: Individual invoice line items
- **AnafConfig**: ANAF configuration and OAuth tokens
- **AnafMessages**: Communication logs with ANAF

## User Roles and Permissions

### Owner
- Full control over company
- Add/remove users
- Configure ANAF
- Upload invoices to ANAF

### Manager
- Create and manage invoices
- View reports
- Cannot configure ANAF

### Accountant
- Create and manage invoices
- View invoices
- Cannot configure ANAF or user management

### Viewer
- View-only access
- Cannot create or modify

## ANAF Integration Setup

### Prerequisites
1. Register with ANAF and obtain:
   - Client ID and Client Secret
   - Digital certificate (PFX format)

2. Configure OAuth 2.0:
   - Visit ANAF OAuth registration page
   - Register your application
   - Obtain credentials

### Configuration
1. In the application, navigate to ANAF Settings
2. Enter Client ID and Client Secret
3. Upload digital certificate
4. Test connection by clicking "Verify Configuration"
5. Once confirmed, you can start uploading invoices

## Currency Support
- **RON** (Romanian Lei) - Default
- **EUR** (Euro)
- **USD** (US Dollar)
- **GBP** (British Pound)

## Language Support
- **ro** (Română)
- **en** (English)

## Security Considerations

1. **Authentication**: JWT-based token authentication
2. **Authorization**: Role-based access control
3. **Password Security**: Bcrypt hashing
4. **HTTPS**: All ANAF communications use HTTPS
5. **Certificate Storage**: Digital certificates should be stored securely
6. **Token Management**: OAuth tokens are encrypted and refreshed automatically

## Deployment

### Production Setup
1. Use a production-grade database server (MySQL 5.7+)
2. Set appropriate environment variables
3. Use HTTPS for all connections
4. Implement rate limiting
5. Set up backup and recovery procedures
6. Configure logging and monitoring

### Environment Variables for Production
```
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
DB_HOST=<production-db-host>
DB_USER=<db-user>
DB_PASSWORD=<strong-password>
ANAF_CLIENT_ID=<your-id>
ANAF_CLIENT_SECRET=<your-secret>
```

## Error Handling

The API returns standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push to the repository
5. Create a pull request

## License

MIT License

## Support

For issues and questions, please open a GitHub issue or contact the development team.

## References

- [ANAF E-Factura Documentation](https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inreg_api)
- [UBL 2.1 Specification](http://docs.oasis-open.org/ubl/os-UBL-2.1/)
- [Romanian E-Factura Guide](https://mfinante.gov.ro/static/10/Mfp/ghidE-FACTURA.pdf)
- [OAuth 2.0 Documentation](https://static.anaf.ro/static/10/Anaf/Informatii_R/API/Oauth_procedura_inregistrare_aplicatii_portal_ANAF.pdf)

## Changelog

### Version 1.0.0 (Initial Release)
- User authentication and authorization
- Multi-company support
- Invoice creation and management
- ANAF integration
- Dashboard and reporting
