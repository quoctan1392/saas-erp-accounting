# 📖 Documentation Index

Welcome to the SaaS ERP/Accounting System documentation! This index will help you find what you need quickly.

## 🚀 Quick Navigation

### For Getting Started
- **[QUICK_START.md](QUICK_START.md)** - ⭐ START HERE! Quick setup in 5 minutes
- **[SUMMARY_VI.md](SUMMARY_VI.md)** - Tóm tắt dự án bằng tiếng Việt

### For Understanding the Project
- **[README.md](README.md)** - Complete project documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams & explanations
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Detailed file structure

### For Developers
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Commands, tips, debugging, best practices
- **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - What was created and how to use it

### For Reference
- **[saas-accounting-erp-system-design.md](saas-accounting-erp-system-design.md)** - Original system design document

---

## 📚 Documentation by Topic

### 🎯 Getting Started

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [QUICK_START.md](QUICK_START.md) | Fast setup guide | 5 min |
| [README.md](README.md) - Installation section | Detailed setup | 10 min |
| [SETUP_SUMMARY.md](SETUP_SUMMARY.md) | What was created | 5 min |

**Recommended Flow:**
1. Read QUICK_START.md
2. Run setup script
3. Test with Swagger UI
4. Come back for more details

---

### 🏗️ Architecture & Design

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Visual diagrams & flow | 15 min |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | File organization | 10 min |
| [saas-accounting-erp-system-design.md](saas-accounting-erp-system-design.md) | Complete design spec | 60 min |

**When to Read:**
- Before starting development
- When making architectural decisions
- When adding new services

---

### 💻 Development

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Commands & best practices | 20 min |
| [README.md](README.md) - API Section | API documentation | 15 min |
| Service-specific READMEs | Service details | Varies |

**Daily Reference:**
- Common commands
- API endpoints
- Debugging tips
- Code standards

---

### 🔧 Configuration

| Location | Purpose |
|----------|---------|
| `services/auth-service/.env.example` | Auth service config |
| `services/tenant-service/.env.example` | Tenant service config |
| `docker-compose.yml` | Infrastructure config |
| `scripts/` | Helper scripts |

---

### 📖 API Documentation

**Interactive (Swagger UI):**
- Auth Service: http://localhost:3001/api/v1/docs
- Tenant Service: http://localhost:3002/api/v1/docs

**Static Documentation:**
- [README.md](README.md) - Authentication Flow section
- [README.md](README.md) - Tenant Management section
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - API Testing section

---

## 🎓 Learning Path

### Path 1: Quick Start (30 minutes)
1. [QUICK_START.md](QUICK_START.md) - Setup project
2. Test APIs with Swagger
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) diagrams
4. Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Common Commands

### Path 2: Deep Dive (2-3 hours)
1. [README.md](README.md) - Full read
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Understand design
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Explore codebase
4. [saas-accounting-erp-system-design.md](saas-accounting-erp-system-design.md) - Complete spec
5. [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - All sections

### Path 3: Contributing (Ongoing)
1. Setup development environment
2. Review [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Code Standards
3. Pick a feature from roadmap
4. Develop & test
5. Submit PR

---

## 🔍 Find What You Need

### "How do I...?"

**Setup & Installation**
- Install the project → [QUICK_START.md](QUICK_START.md)
- Setup with Docker → [README.md](README.md#installation)
- Configure environment → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#environment-variables)

**Development**
- Start development → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#common-commands)
- Create a new service → [ARCHITECTURE.md](ARCHITECTURE.md) + [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- Follow code standards → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#code-standards)

**Testing**
- Test APIs → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#testing)
- Check health → `.\scripts\health-check.ps1`
- View logs → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#debugging)

**Understanding**
- Architecture overview → [ARCHITECTURE.md](ARCHITECTURE.md)
- How auth works → [README.md](README.md#authentication-flow)
- How tenants work → [README.md](README.md#tenant-management)
- Database schema → [ARCHITECTURE.md](ARCHITECTURE.md#database-architecture)

**Troubleshooting**
- Common issues → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#common-issues--solutions)
- Debug services → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#debugging)
- Clean restart → `.\scripts\clean.ps1`

---

## 📊 Document Statistics

| Document | Lines | Purpose |
|----------|-------|---------|
| README.md | 400+ | Main documentation |
| QUICK_START.md | 200+ | Fast setup guide |
| ARCHITECTURE.md | 350+ | System design |
| DEVELOPER_GUIDE.md | 450+ | Dev reference |
| PROJECT_STRUCTURE.md | 250+ | File organization |
| SETUP_SUMMARY.md | 400+ | Setup details |
| SUMMARY_VI.md | 450+ | Vietnamese summary |
| saas-accounting-erp-system-design.md | 2000+ | Original design |

**Total Documentation: ~4,500+ lines**

---

## 🎯 Quick Links

### Essential
- [Quick Start Guide](QUICK_START.md) ⚡
- [API Documentation](http://localhost:3001/api/v1/docs) 📚
- [Architecture Diagrams](ARCHITECTURE.md) 🏗️

### Development
- [Developer Guide](DEVELOPER_GUIDE.md) 💻
- [Code Structure](PROJECT_STRUCTURE.md) 📁
- [Setup Summary](SETUP_SUMMARY.md) ✅

### Vietnamese
- [Tóm Tắt Tiếng Việt](SUMMARY_VI.md) 🇻🇳
- [Thiết Kế Hệ Thống](saas-accounting-erp-system-design.md) 📋

---

## 📞 Getting Help

### Documentation Issues
If documentation is unclear:
1. Check if there's a newer version
2. Search in other docs (use Ctrl+F)
3. Check code comments
4. Review Swagger UI

### Technical Issues
1. Check [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#common-issues--solutions)
2. Run health check: `.\scripts\health-check.ps1`
3. Check logs: `docker-compose logs -f`
4. Review environment variables

### Feature Questions
1. Check [README.md](README.md) features section
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Look at original design: [saas-accounting-erp-system-design.md](saas-accounting-erp-system-design.md)

---

## 🔄 Document Updates

This documentation is living and will be updated as:
- New features are added
- Services are created
- Best practices evolve
- Issues are discovered

**Last Updated:** 2025-12-19  
**Version:** 1.0.0  
**Status:** Complete for Auth & Tenant Services

---

## ⭐ Most Important Documents

For 80% of your needs, these 3 documents are enough:

1. **[QUICK_START.md](QUICK_START.md)** - Get started fast
2. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Daily reference
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Understand the system

For everything else, use this index to navigate!

---

**Happy Coding! 🚀**
