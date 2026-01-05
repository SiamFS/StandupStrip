# Quick Reference: Database Configuration

## 🔄 Switch Database

### Use Cloud (Neon DB)
```env
DB_STATUS=cloud
```

### Use Local PostgreSQL
```env
DB_STATUS=local
```

## 🚀 Start Backend

### Method 1: Native Maven Command (Recommended)
```powershell
cd f:\Trainee_Siam\backend
./mvnw spring-boot:run
```

### Method 2: Using run.ps1 Script
```powershell
cd f:\Trainee_Siam\backend
.\run.ps1
```

**Both methods now automatically load `.env` and handle `DB_STATUS` switching!**

## 📋 Current Configuration

### Cloud Database (Neon DB)
- **Host:** ep-billowing-wave-a1xwoegt-pooler.ap-southeast-1.aws.neon.tech
- **Database:** neondb
- **Username:** neondb_owner
- **Status:** ✅ Connected & Tested

### Local Database
- **Host:** localhost
- **Database:** standupdb
- **Username:** postgres

## 📁 Important Files
- **`.env`** - Your environment variables (NOT in git)
- **`.env.example`** - Template for new developers
- **`run.ps1`** - Enhanced startup script with auto-switching

## ⚠️ Remember
- `.env` is protected by `.gitignore`
- Always use `.\run.ps1` to start the backend
- Check console output to confirm which database is being used
