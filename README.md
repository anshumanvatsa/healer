# 🏥 Healer

> A full-stack healthcare web application — connecting patients with doctors, enabling appointment booking, community posts, and medical record management. Built with Express.js, MongoDB, and a React frontend.

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-REST%20API-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtoken&logoColor=white)

---

## 📌 What This Project Does

Healer is a healthcare platform that brings together patients and doctors in a single web app. It supports:

- 👨‍⚕️ **Doctor profiles** — search, view, and connect with doctors
- 📅 **Appointment booking** — schedule and manage appointments
- 📝 **Patient records** — manage illness history and health data
- 💬 **Community posts & comments** — a social feed for health discussions
- 🔔 **Notifications** — alerts for appointments and interactions
- 👥 **Groups** — condition-specific community groups
- 🔐 **Authentication** — JWT-based auth with bcrypt password hashing
- 📎 **File uploads** — document/image upload via Multer

---

## 📁 Project Structure

```
healer/
├── backend/
│   ├── index.js              # Express server entry point
│   ├── utility.js            # Utility functions
│   ├── package.json          # Backend dependencies
│   └── models/
│       ├── appointment.model.js
│       ├── comment.model.js
│       ├── doctor.model.js
│       ├── group.model.js
│       ├── illness.model.js
│       ├── notification.model.js
│       ├── patient.models.js
│       └── post.model.js
└── frontend/                 # React frontend
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend
npm install
node index.js
```

> Create a `.env` file with your MongoDB URI, JWT secret, and any other required config.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

**Backend:**
| Package | Purpose |
|---------|---------|
| `express` | REST API framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT authentication |
| `bcrypt` | Password hashing |
| `multer` | File upload handling |
| `cors` | Cross-origin support |
| `dotenv` | Environment config |
| `cookie-parser` | Cookie handling |

**Frontend:** React (JavaScript)  
**Database:** MongoDB

---

## 👤 Author

**Anshuman Mishra** · [GitHub](https://github.com/anshumanvatsa)
