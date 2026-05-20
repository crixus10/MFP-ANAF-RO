# Installation and Setup Guide

## Complete Installation Guide for Invoicing System with ANAF Integration

This guide provides step-by-step instructions for setting up and deploying the invoicing system.

## Prerequisites

### System Requirements
- Node.js 14+ and npm 6+
- MySQL 5.7+ or PostgreSQL 10+
- Git
- OpenSSL (for certificate handling)
- 2GB RAM minimum
- 500MB disk space

### Required Accounts
1. ANAF Account with OAuth credentials
2. Digital Certificate (PFX format) from an authorized certification authority

## Part 1: Backend Setup

### 1.1 Environment Configuration

```bash
cd invoicing-system-anaf
cp .env.example .env
```

Edit `.env` with your configuration:
```
# Server
PORT=5000
NODE_ENV=development

# Database (MySQL example)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=invoicing_anaf
DB_USER=root
DB_PASSWORD=your_db_password
DB_DIALECT=mysql

# JWT
JWT_SECRET=generate-a-strong-random-string-here-min-32-chars

# ANAF Configuration
ANAF_BASE_URL=https://webservicesp.anaf.ro
ANAF_OAUTH_URL=https://oauth.anaf.gov.ro
ANAF_CLIENT_ID=your-client-id-from-anaf
ANAF_CLIENT_SECRET=your-client-secret-from-anaf

# Application
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### 1.2 Database Setup

#### MySQL Setup
```bash
# Create database
mysql -u root -p
> CREATE DATABASE invoicing_anaf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> CREATE USER 'invoicing_user'@'localhost' IDENTIFIED BY 'strong_password';
> GRANT ALL PRIVILEGES ON invoicing_anaf.* TO 'invoicing_user'@'localhost';
> FLUSH PRIVILEGES;
> EXIT;
```

Update `.env`:
```
DB_USER=invoicing_user
DB_PASSWORD=strong_password
```

#### PostgreSQL Setup (Alternative)
```bash
# Create database
psql -U postgres
> CREATE DATABASE invoicing_anaf;
> CREATE USER invoicing_user WITH PASSWORD 'strong_password';
> GRANT ALL PRIVILEGES ON DATABASE invoicing_anaf TO invoicing_user;
> \q
```

Update `.env`:
```
DB_DIALECT=postgres
DB_PORT=5432
```

### 1.3 Install Dependencies

```bash
npm install
```

### 1.4 Initialize Database

```bash
# The database will be automatically initialized when you start the server
# Sequelize will create all tables on first run
npm start
```

### 1.5 Verify Backend

```bash
# The server should start on http://localhost:5000
# Check API health:
curl http://localhost:5000/api/auth/verify
# Expected: 401 (no token) - which is correct
```

## Part 2: Frontend Setup

### 2.1 Install Frontend Dependencies

```bash
cd client
npm install
```

### 2.2 Environment Configuration

Create `.env` in the client directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 2.3 Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## Part 3: ANAF Configuration

### 3.1 Register with ANAF

1. Visit [ANAF Portal](https://www.anaf.ro)
2. Go to Services → Developer Registration
3. Register your application and obtain:
   - Client ID
   - Client Secret

### 3.2 Obtain Digital Certificate

1. Contact an authorized certification authority (e.g., CertDigital, GlobalTrust)
2. Request a PFX certificate for e-invoicing
3. Store the certificate securely
4. Remember the certificate password

### 3.3 Configure in Application

1. Login to the application
2. Create a company
3. Go to ANAF Settings
4. Enter:
   - Client ID
   - Client Secret
   - Upload certificate file
   - Enter certificate password
5. Click "Test Connection"

## Part 4: Verification and Testing

### 4.1 Create Test User

1. Visit http://localhost:3000/register
2. Create a test account
3. Login with the credentials

### 4.2 Create Test Company

1. Go to Companies
2. Click "Add Company"
3. Enter test company details:
   - Name: Test Company
   - Tax Number: 14399840 (or any valid CUI)
   - Address and other details
4. The system will verify with ANAF

### 4.3 Test Invoice Creation

1. Go to Invoices
2. Click "Create Invoice"
3. Select company and partner
4. Add line items
5. Save as draft
6. Generate XML
7. Send to ANAF (if ANAF is configured)

### 4.4 API Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"TestPassword123",
    "firstName":"Test",
    "lastName":"User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123"
  }'

# Create Company (use token from login response)
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name":"Test Corp",
    "taxNumber":"12345678",
    "email":"contact@test.com",
    "currency":"RON"
  }'
```

## Part 5: Production Deployment

### 5.1 Pre-Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Generate strong JWT_SECRET
- [ ] Configure real database credentials
- [ ] Setup HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Configure logging
- [ ] Setup monitoring and alerting

### 5.2 Environment Variables for Production

```
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-with-crypto-256bit>
DB_HOST=your-db-server
DB_USER=prod_user
DB_PASSWORD=<strong-password>
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### 5.3 Deploy with Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t invoicing-system .
docker run -p 5000:5000 --env-file .env invoicing-system
```

### 5.4 Setup Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Part 6: Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -h localhost -u root -p invoicing_anaf

# Check Sequelize logs in console
# Look for SQL errors in server output
```

### ANAF Configuration Problems
- Verify Client ID and Secret are correct
- Check certificate file is in PFX format
- Ensure certificate hasn't expired
- Test ANAF connectivity independently

### Frontend Cannot Connect to Backend
- Verify backend is running on correct port
- Check CORS configuration matches frontend origin
- Check network connectivity
- Review browser console for errors

### Invoice Upload to ANAF Fails
- Verify company is registered as VAT payer
- Check ANAF configuration is complete
- Ensure XML is generated before upload
- Check ANAF message log for details

## Part 7: Maintenance

### Database Backup

```bash
# MySQL backup
mysqldump -u root -p invoicing_anaf > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p invoicing_anaf < backup_20240101.sql
```

### Log Monitoring

```bash
# Backend logs
tail -f server.log

# Check for errors
grep ERROR server.log
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages carefully
npm update --save
```

## Part 8: Support Resources

- [ANAF Official Documentation](https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inreg_api)
- [e-Factura Guide](https://mfinante.gov.ro/static/10/Mfp/ghidE-FACTURA.pdf)
- [OAuth 2.0 Setup](https://static.anaf.ro/static/10/Anaf/Informatii_R/API/Oauth_procedura_inregistrare_aplicatii_portal_ANAF.pdf)
- [UBL Specification](http://docs.oasis-open.org/ubl/os-UBL-2.1/)

## Part 9: Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate JWT_SECRET** periodically
3. **Store certificates securely** (encrypted, restricted access)
4. **Enable CORS only for trusted domains**
5. **Use strong passwords** for all accounts
6. **Implement rate limiting** on API endpoints
7. **Regular security audits** of the application
8. **Keep dependencies updated** for security patches
9. **Monitor database access** logs
10. **Backup data regularly** and test restore procedures

## Next Steps

1. Read [README.md](./README.md) for feature overview
2. Review [API Documentation](./README.md#api-documentation) for integration
3. Check [ANAF Integration](./README.md#anaf-integration-setup) section for ANAF setup
4. Explore the codebase to understand the architecture

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs: `npm start` output
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Test API endpoints with curl to isolate issues
