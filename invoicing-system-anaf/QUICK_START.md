# Quick Start Guide

Get up and running in 5 minutes!

## 1. Clone and Setup

```bash
cd invoicing-system-anaf
cp .env.example .env
npm install
cd client && npm install && cd ..
```

## 2. Configure Database

Edit `.env`:
```
DB_NAME=invoicing_anaf
DB_USER=root
DB_PASSWORD=your_db_password
```

Create database:
```bash
mysql -u root -p -e "CREATE DATABASE invoicing_anaf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 3. Start Both Servers

Terminal 1 - Backend:
```bash
npm start
# Server runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd client
npm start
# Frontend runs on http://localhost:3000
```

## 4. First Steps

1. Open http://localhost:3000
2. Register a new account
3. Login
4. Create a company (enter any valid CUI or use: 14399840)
5. Create an invoice
6. Generate XML
7. (Optional) Configure ANAF and upload

## Test Credentials

For testing company information:
```
Name: DANTE INTERNATIONAL SA
Tax Number: 14399840
```

## Common Endpoints

```
GET    /api/auth/verify              - Verify token
POST   /api/auth/login               - Login
POST   /api/auth/register            - Register
GET    /api/companies                - List companies
POST   /api/companies                - Create company
GET    /api/invoices/company/:id     - List invoices
POST   /api/invoices                 - Create invoice
POST   /api/invoices/:id/generate-xml - Generate XML
POST   /api/anaf/:cid/upload-invoice/:iid - Upload to ANAF
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check .env DB settings and MySQL is running |
| Port 5000 already in use | Change PORT in .env or kill process using port |
| CORS error | Check CORS_ORIGIN in .env matches frontend URL |
| Cannot login | Verify user exists, check password |

## Next Steps

- Read full [README.md](./README.md)
- Follow [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for production setup
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Configure ANAF integration in company settings

## Support

See [README.md](./README.md#references) for documentation links.
