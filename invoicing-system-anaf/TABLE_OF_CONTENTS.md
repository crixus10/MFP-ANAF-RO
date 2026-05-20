# 📑 Table of Contents - Invoicing System with ANAF Integration

Welcome to the complete invoicing system with automatic ANAF integration! This document serves as your navigation guide.

## 🚀 Getting Started

### New to the project?
Start here:

1. **[QUICK_START.md](./QUICK_START.md)** (5 minutes)
   - Quick setup instructions
   - First steps in the application
   - Common troubleshooting

2. **[README.md](./README.md)** (15 minutes)
   - Complete feature overview
   - Technology stack details
   - Installation basics
   - User roles and permissions

## 📚 Documentation

### For Developers

#### Setup & Installation
- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Complete setup guide
  - Part 1: Backend setup
  - Part 2: Frontend setup
  - Part 3: ANAF configuration
  - Part 4: Verification and testing
  - Part 5: Production deployment

#### Understanding the System
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
  - Architecture diagram
  - Technology stack details
  - Database schema (7 tables, 74 fields)
  - API architecture and flows
  - Security architecture
  - Performance optimization
  - Scalability considerations

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project statistics and overview
  - 50 files, 4,200+ lines of code
  - Technology stack matrix
  - Complete file structure
  - Feature checklist (35+ features)
  - API endpoints summary (37 endpoints)
  - Database statistics
  - Development workflow

#### API Reference
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Complete API usage guide
  - 8 major workflow examples
  - Complete curl commands
  - JSON request/response examples
  - Error handling samples
  - Best practices
  - Complete invoice workflow

### For Managers/Stakeholders
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Statistics and deliverables
- [README.md](./README.md#features) - Feature list

## 🏗️ Architecture Overview

```
Frontend (React)
    ↓
    ↓ (HTTP/REST API)
    ↓
Backend (Node.js/Express)
    ↓
    ↓ (SQL)
    ↓
Database (MySQL/PostgreSQL)
    ↓
    ↓ (HTTPS)
    ↓
ANAF API
```

## 📋 File Structure

```
invoicing-system-anaf/
├── Backend (Node.js/Express)
│   ├── models/          - Database models (7 tables)
│   ├── routes/          - API endpoints (37 routes)
│   ├── services/        - Business logic (ANAF, XML generation)
│   ├── middleware/      - Authentication & RBAC
│   ├── config/          - Database setup
│   ├── server.js        - Main entry point
│   └── package.json     - Dependencies
│
├── Frontend (React)
│   ├── pages/           - Page components (8 pages)
│   ├── components/      - Reusable components
│   ├── store/           - State management (Zustand)
│   ├── api/             - HTTP client
│   ├── i18n/            - Translations (RO, EN)
│   └── public/          - Static files
│
└── Documentation
    ├── README.md                - Main documentation
    ├── QUICK_START.md           - 5-minute guide
    ├── INSTALLATION_GUIDE.md    - Detailed setup
    ├── ARCHITECTURE.md          - System design
    ├── API_EXAMPLES.md          - API usage
    ├── PROJECT_SUMMARY.md       - Statistics
    └── TABLE_OF_CONTENTS.md     - This file
```

## 🎯 Quick Navigation

### I want to...

#### **Get the system running**
→ [QUICK_START.md](./QUICK_START.md)

#### **Set it up properly**
→ [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

#### **Use the API**
→ [API_EXAMPLES.md](./API_EXAMPLES.md)

#### **Understand the architecture**
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

#### **See feature list**
→ [README.md#features](./README.md#features)

#### **Deploy to production**
→ [INSTALLATION_GUIDE.md#part-5-production-deployment](./INSTALLATION_GUIDE.md#part-5-production-deployment)

#### **Configure ANAF**
→ [INSTALLATION_GUIDE.md#part-3-anaf-configuration](./INSTALLATION_GUIDE.md#part-3-anaf-configuration)

#### **Troubleshoot issues**
→ [INSTALLATION_GUIDE.md#part-6-troubleshooting](./INSTALLATION_GUIDE.md#part-6-troubleshooting)

#### **See project statistics**
→ [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

## 📊 System Highlights

| Aspect | Details |
|--------|---------|
| **Total Files** | 50 |
| **Lines of Code** | 4,200+ |
| **API Endpoints** | 37 |
| **Database Tables** | 7 |
| **Database Fields** | 74 |
| **Features** | 35+ |
| **Languages** | Romanian, English |
| **User Roles** | 4 (Owner, Manager, Accountant, Viewer) |
| **Supported Companies** | Unlimited per user |
| **Currencies** | RON, EUR, USD, GBP |

## ✨ Key Features

### User & Company Management
- ✅ Multi-user authentication (JWT)
- ✅ Multi-company support
- ✅ Role-based access control
- ✅ Multi-language interface

### Invoicing
- ✅ Customer invoices
- ✅ Supplier invoices
- ✅ Draft → Issued → Paid workflow
- ✅ Tax calculations
- ✅ Multi-currency support

### ANAF Integration
- ✅ Company tax verification
- ✅ OAuth 2.0 authentication
- ✅ UBL/XML invoice generation
- ✅ Automatic upload to ANAF
- ✅ Status tracking
- ✅ Complete message logging

### Technical
- ✅ RESTful API (37 endpoints)
- ✅ Responsive UI (Material-UI)
- ✅ State management (Zustand)
- ✅ Internationalization (i18next)
- ✅ Database ORM (Sequelize)
- ✅ JWT authentication
- ✅ Error handling
- ✅ Input validation

## 🛠️ Technology Stack

**Backend**: Node.js 14+, Express 4.18+, Sequelize 6.35+
**Database**: MySQL 5.7+ or PostgreSQL 10+
**Frontend**: React 18.2+, Material-UI 5.14+, Zustand 4.4+
**Authentication**: JWT, Bcryptjs

## 📖 Reading Order

### For First-Time Setup
1. [QUICK_START.md](./QUICK_START.md) - Get running in 5 minutes
2. [README.md](./README.md) - Understand features
3. [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - Full setup

### For Development
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand design
2. [API_EXAMPLES.md](./API_EXAMPLES.md) - See how to use API
3. Code files in `models/`, `routes/`, `services/`

### For Operations/DevOps
1. [INSTALLATION_GUIDE.md#part-5](./INSTALLATION_GUIDE.md#part-5-production-deployment) - Production setup
2. [ARCHITECTURE.md#deployment-architecture](./ARCHITECTURE.md#deployment-architecture)
3. [INSTALLATION_GUIDE.md#part-7](./INSTALLATION_GUIDE.md#part-7-maintenance) - Maintenance

## 🔐 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control
- Company-level data isolation
- HTTPS support
- Digital certificate support
- SQL injection prevention
- XSS protection
- Complete audit trail

## 🚀 Quick Commands

```bash
# Setup
npm install
cd client && npm install
cp .env.example .env

# Run development
npm start              # Backend on :5000
cd client && npm start # Frontend on :3000

# Build for production
npm run build

# Test API
curl http://localhost:5000/api/auth/verify

# View logs
tail -f server.log
```

## 📞 Getting Help

1. **Quick issues?** → Check [QUICK_START.md](./QUICK_START.md)
2. **Setup problems?** → See [INSTALLATION_GUIDE.md#part-6](./INSTALLATION_GUIDE.md#part-6-troubleshooting)
3. **API questions?** → Review [API_EXAMPLES.md](./API_EXAMPLES.md)
4. **Architecture questions?** → Read [ARCHITECTURE.md](./ARCHITECTURE.md)
5. **ANAF issues?** → Check [INSTALLATION_GUIDE.md#part-3](./INSTALLATION_GUIDE.md#part-3-anaf-configuration)

## 📝 Documentation Statistics

| Document | Lines | Topics |
|----------|-------|--------|
| README.md | 239 | Features, API, Setup, References |
| QUICK_START.md | 57 | Setup, Testing, Troubleshooting |
| INSTALLATION_GUIDE.md | 303 | Step-by-step Setup & Deployment |
| ARCHITECTURE.md | 349 | Design, Database, API, Security |
| API_EXAMPLES.md | 678 | 8+ Complete Workflows |
| PROJECT_SUMMARY.md | 457 | Statistics, Structure, Roadmap |
| **TOTAL** | **2,083** | **Complete Reference** |

## 🎓 Learning Path

### Beginner
1. QUICK_START.md
2. README.md (Features section)
3. Try registering and creating invoice in UI

### Intermediate
4. INSTALLATION_GUIDE.md (for local setup)
5. API_EXAMPLES.md (for API understanding)
6. Explore frontend code in `client/src/`

### Advanced
7. ARCHITECTURE.md (for deep understanding)
8. Explore backend code in `models/`, `routes/`, `services/`
9. Review database schema
10. Plan enhancements from PROJECT_SUMMARY.md

## 🔄 Latest Commits

All work has been committed to branch: `claude/invoicing-system-anaf-TXmH7`

Commits include:
- Initial implementation (45 files, 4,200 LOC)
- Complete documentation (5 files, 2,000 LOC)
- API examples and project summary

## ✅ Checklist for New Users

- [ ] Read QUICK_START.md
- [ ] Run `npm install` in root and `client/`
- [ ] Configure `.env` file
- [ ] Start backend: `npm start`
- [ ] Start frontend: `cd client && npm start`
- [ ] Open http://localhost:3000
- [ ] Register a test account
- [ ] Create a test company
- [ ] Create a test invoice
- [ ] Read API_EXAMPLES.md for next steps

## 📞 Support Resources

- **ANAF Documentation**: https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inreg_api
- **e-Factura Guide**: https://mfinante.gov.ro/static/10/Mfp/ghidE-FACTURA.pdf
- **UBL Standard**: http://docs.oasis-open.org/ubl/os-UBL-2.1/
- **OAuth 2.0**: https://static.anaf.ro/static/10/Anaf/Informatii_R/API/Oauth_procedura_inregistrare_aplicatii_portal_ANAF.pdf

---

**Last Updated**: 2024
**Project Version**: 1.0.0
**Status**: Production Ready
**License**: MIT (recommended)

Start with [QUICK_START.md](./QUICK_START.md) → Enjoy building! 🚀
