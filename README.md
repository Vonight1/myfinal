# 🎯 PartTime Job Laos

ເວັບໄຊຊອກບ່ອນເຮັດວຽກ Part-time ໃນ ສປປ ລາວ

ໂປຣເຈັກຈົບການສຶກສາ - **ສະຖາບັນເຕັກໂນໂລຊີ ສຸດສະກະ ຮຸ່ນທີ 09**

---

## 📋 ສາລະບານ

- [ຄຸນສົມບັດ](#-ຄຸນສົມບັດ)
- [Tech Stack](#-tech-stack)
- [ໂຄງສ້າງໂປຣເຈັກ](#-ໂຄງສ້າງໂປຣເຈັກ)
- [ການຕິດຕັ້ງ](#-ການຕິດຕັ້ງ)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Roles & Permissions](#-roles--permissions)
- [Security](#-security)
- [ທີມງານ](#-ທີມງານພັດທະນາ)

---

## ✨ ຄຸນສົມບັດ

### 👤 ສຳລັບຜູ້ຊອກວຽກ (Applicant)
- ✅ ສະໝັກສະມາຊິກ + Login + ລືມລະຫັດຜ່ານ
- ✅ ຄົ້ນຫາວຽກ ດ້ວຍ keyword, ໝວດໝູ່, ສະຖານທີ່, ປະເພດ
- ✅ ກອງວຽກຕາມເງິນເດືອນ (range slider + presets)
- ✅ ສະໝັກວຽກ + ອັບໂຫຼດ CV (PDF, DOC, JPG, PNG)
- ✅ ບັນທຶກວຽກ (Save Jobs ❤️)
- ✅ ເບິ່ງ profile ບໍລິສັດ
- ✅ ໃຫ້ Review + ຄະແນນ
- ✅ ຮັບ Notification ເມື່ອປ່ຽນ status

### 🏢 ສຳລັບບໍລິສັດ (Company)
- ✅ ປະກາດວຽກໃໝ່
- ✅ ຈັດການ profile (cover, logo, ຂໍ້ມູນບໍລິສັດ)
- ✅ ເບິ່ງລາຍຊື່ຜູ້ສະໝັກ + ດາວໂຫຼດ CV
- ✅ ອະນຸມັດ/ປະຕິເສດຜູ້ສະໝັກ
- ✅ ຮັບ Notification ເມື່ອມີຄົນສະໝັກ

### 👨‍💼 ສຳລັບ Admin
- ✅ Dashboard ມີ Charts (Bar, Donut)
- ✅ ຈັດການຜູ້ໃຊ້ - Ban/Unban
- ✅ ອະນຸມັດ/ປະຕິເສດວຽກ
- ✅ ຈັດການ Categories, Settings, Notifications
- ✅ ດູ Login logs + Complaints
- ✅ Export ລາຍງານ PDF

### 🌐 Features ທົ່ວໄປ
- ✅ Mobile responsive (Hamburger menu)
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Job sharing (Facebook, LINE, WhatsApp, Telegram)
- ✅ Confirmation modals
- ✅ Rate limiting + XSS protection

---

## 🛠 Tech Stack

### Backend
- **Go 1.21+** with Gin Web Framework
- **PostgreSQL 14+**
- **JWT** authentication
- **bcrypt** password hashing
- Custom middleware: Rate limiting, XSS sanitization

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Axios** for HTTP
- **js-cookie** for token storage
- Custom components: Toast, Confirm Modal, Skeleton, Charts (pure SVG)

---

## 📁 ໂຄງສ້າງໂປຣເຈັກ

```
parttime_job/
├── backend/
│   ├── config/          # Database connection
│   ├── handlers/        # API handlers
│   │   ├── auth.go
│   │   ├── jobs.go
│   │   ├── applications.go
│   │   ├── companies.go
│   │   ├── users.go
│   │   ├── reviews.go
│   │   ├── admin.go
│   │   ├── admin_extras.go
│   │   ├── saved_jobs.go
│   │   ├── password_reset.go
│   │   └── notification_helpers.go
│   ├── middleware/      # Auth, Rate Limit, XSS
│   ├── models/          # Data models
│   ├── migrations/      # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_features.sql
│   │   └── 003_seed_demo_data.sql
│   ├── uploads/         # User uploads (logo, cover, CV)
│   ├── .env
│   ├── go.mod
│   └── main.go
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── CompanyAvatar.jsx
        │   ├── SaveJobButton.jsx
        │   ├── ShareButton.jsx
        │   ├── NotificationBell.jsx
        │   ├── Charts.jsx
        │   └── Skeleton.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── ToastContext.jsx
        │   └── ConfirmContext.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── JobsPage.jsx
        │   ├── JobDetailPage.jsx
        │   ├── CompaniesPage.jsx
        │   ├── UserProfilePage.jsx
        │   ├── SavedJobsPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── ResetPasswordPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── CompanyPage.jsx
        │   ├── CompanyProfilePage.jsx
        │   ├── AdminPage.jsx
        │   ├── AboutPage.jsx
        │   ├── ContactPage.jsx
        │   └── FAQPage.jsx
        ├── lib/
        │   ├── api.js
        │   └── utils.js
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 ການຕິດຕັ້ງ

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL 14+

### 1. Clone & ຕິດຕັ້ງ Database
```bash
# ສ້າງ database ໃໝ່
createdb parttime_job_db

# Run migrations ຕາມລຳດັບ
psql -U postgres -d parttime_job_db -f backend/migrations/001_initial_schema.sql
psql -U postgres -d parttime_job_db -f backend/migrations/002_add_features.sql
psql -U postgres -d parttime_job_db -f backend/migrations/003_seed_demo_data.sql  # optional: ຂໍ້ມູນ demo
```

### 2. Backend
```bash
cd backend

# ປ່ຽນ .env ໃຫ້ຕົງກັບ database
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=parttime_job_db

go mod download
go run main.go
# Server: http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Web: http://localhost:3000
```

### 4. Login Demo Accounts (ຫຼັງ seed)
ລະຫັດຜ່ານທັງໝົດ: `12345678`

| Email | Role |
|-------|------|
| `admin@parttimejob.la` | Admin |
| `tech@demo.la` | Company (TechWave) |
| `coffee@demo.la` | Company (Lao Coffee) |
| `somsamphan@demo.la` | Applicant |
| `manychan@demo.la` | Applicant |

---

## 🗄 Database Schema

ມີ **12 tables** ຫຼັກ:

```
users               -- ຜູ້ໃຊ້ທັງໝົດ (admin/company/applicant)
categories          -- ໝວດໝູ່ວຽກ
jobs                -- ປະກາດວຽກ
applications        -- ການສະໝັກວຽກ
reviews             -- ການໃຫ້ຄະແນນ
notifications       -- ການແຈ້ງເຕືອນ
complaints          -- ການຮ້ອງຮຽນ
settings            -- ການຕັ້ງຄ່າລະບົບ
login_logs          -- ປະຫວັດການ login
reports             -- ລາຍງານ
saved_jobs          -- ວຽກທີ່ບັນທຶກ
password_resets     -- token ສຳລັບ reset password
```

ER Diagram ມີໃນ `docs/er-diagram.png` (ຕ້ອງເພີ່ມເອງ)

---

## 🌐 API Endpoints

### Public (ບໍ່ຕ້ອງ login)
```
POST   /api/register
POST   /api/login
POST   /api/forgot-password
GET    /api/reset-password/:token/validate
POST   /api/reset-password
GET    /api/jobs                    # ມີ filter
GET    /api/jobs/:id
GET    /api/jobs/:id/reviews
GET    /api/categories
GET    /api/companies               # listing
GET    /api/companies/:id
GET    /api/stats
```

### Authenticated (ຕ້ອງ login)
```
GET    /api/profile
PUT    /api/profile
GET    /api/users/:id               # ເບິ່ງ profile ຄົນອື່ນ
GET    /api/notifications
GET    /api/notifications/unread-count
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
GET    /api/saved-jobs
POST   /api/saved-jobs/:job_id/toggle
POST   /api/jobs/:id/reviews
POST   /api/complaints
POST   /api/upload-logo
POST   /api/upload-cover
```

### Applicant only
```
POST   /api/applicant/jobs/:id/apply
GET    /api/applicant/my-applications
```

### Company only
```
POST   /api/company/jobs
PUT    /api/company/jobs/:id
GET    /api/company/my-jobs
GET    /api/company/jobs/:id/applicants
PUT    /api/company/applications/:id/status
```

### Admin only
```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/ban
GET    /api/admin/jobs
PUT    /api/admin/jobs/:id/verify
... (ແລະອື່ນໆ)
```

---

## 👥 Roles & Permissions

| Action | Public | Applicant | Company | Admin |
|--------|--------|-----------|---------|-------|
| ເບິ່ງວຽກ | ✅ | ✅ | ✅ | ✅ |
| ຊອກວຽກ | ✅ | ✅ | ✅ | ✅ |
| ສະໝັກວຽກ | ❌ | ✅ | ❌ | ❌ |
| ບັນທຶກວຽກ | ❌ | ✅ | ❌ | ❌ |
| ປະກາດວຽກ | ❌ | ❌ | ✅ | ❌ |
| ເບິ່ງຜູ້ສະໝັກ | ❌ | ❌ | ✅ (ຂອງຕົນ) | ✅ |
| ອະນຸມັດວຽກ | ❌ | ❌ | ❌ | ✅ |
| Ban user | ❌ | ❌ | ❌ | ✅ |

---

## 🔐 Security

- **JWT** tokens ສຳລັບ authentication
- **bcrypt** ສຳລັບ password hashing
- **Rate limiting**: 100 req/min (global), 10 req/min (auth endpoints), 5 req/min (password reset)
- **XSS sanitization** ໃນ user input (title, description, comment)
- **SQL injection** ປ້ອງກັນດ້ວຍ parameterized queries
- **CORS** ຈຳກັດ origin ໃນ production
- **Password reset tokens** ໝົດອາຍຸໃນ 1 ຊົ່ວໂມງ
- **File upload validation** (type + size 10MB max)

---

## 👨‍💻 ທີມງານພັດທະນາ

ນັກສຶກສາ **ສະຖາບັນເຕັກໂນໂລຊີ ສຸດສະກະ - ຮຸ່ນທີ 09**

- **ສຸກຈະເລີນ ຈະເລີນຜົນ** - Full-stack Developer
- **ສິດທິພອນ ສຸພັນໄຄສີ** - Full-stack Developer
- **ໄພປະດິດ ສຸຂະທຳມະວົງ** - Full-stack Developer

---

## 📄 License

© 2026 ສະຖາບັນເຕັກໂນໂລຊີ ສຸດສະກະ - ຮຸ່ນທີ 09. ສະຫງວນລິຂະສິດ.

---

## 🙏 Acknowledgements

- React, Vite, Tailwind CSS
- Go, Gin Framework
- PostgreSQL
- Lucide Icons (SVG)
- Unsplash (default images)
