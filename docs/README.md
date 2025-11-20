# YouthSCC Documentation

Complete documentation for the YouthSCC cell group management system.

## 📚 Documentation

### [GETTING_STARTED.md](GETTING_STARTED.md)
**Start here!** Complete setup from installation to first admin user.
- Firebase configuration
- Security rules
- Creating admin account
- Troubleshooting

### [FEATURES.md](FEATURES.md)
How to use cell groups, authentication, and roles.
- Cell group hooks and components
- Authentication API
- Role-based permissions
- Code examples

### [ARCHITECTURE.md](ARCHITECTURE.md)
Project structure and patterns.
- Folder organization
- Design patterns
- Adding new features
- Best practices

## 🚀 Quick Links

**First time setup:**
→ [GETTING_STARTED.md](GETTING_STARTED.md)

**Using the features:**
→ [FEATURES.md](FEATURES.md)

**Understanding the code:**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

## 🔍 Find What You Need

| I want to... | Go to |
|--------------|-------|
| Set up Firebase | [GETTING_STARTED.md](GETTING_STARTED.md#-firebase-setup) |
| Make someone admin | [GETTING_STARTED.md](GETTING_STARTED.md#-create-your-admin-account) |
| Use cell group hooks | [FEATURES.md](FEATURES.md#-cell-groups) |
| Check user roles | [FEATURES.md](FEATURES.md#-roles--permissions) |
| Add authentication | [FEATURES.md](FEATURES.md#-authentication) |
| Add new features | [ARCHITECTURE.md](ARCHITECTURE.md#adding-new-features) |
| Understand project structure | [ARCHITECTURE.md](ARCHITECTURE.md) |

## ⚡ Quick Start

```bash
# 1. Install
npm install

# 2. Run
npm run dev

# 3. Setup Firebase (IMPORTANT!)
# Follow GETTING_STARTED.md
```

## 🐛 Common Issues

**"Missing or insufficient permissions"**
→ Update Firestore rules in [GETTING_STARTED.md](GETTING_STARTED.md#2-update-firestore-security-rules)

**Can't create cell groups**
→ Make yourself admin in [GETTING_STARTED.md](GETTING_STARTED.md#step-2-make-yourself-admin)

**Auth not working**
→ Check [GETTING_STARTED.md](GETTING_STARTED.md#1-enable-emailpassword-authentication)

---

**Questions?** Check the troubleshooting sections in each guide.
