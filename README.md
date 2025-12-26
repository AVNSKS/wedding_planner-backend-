# 💍 WedVow Backend API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-5.x-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> The robust RESTful API powering the **WedVow** Wedding Operating System. Built for scalability, security, and seamless wedding planning experiences.

> **Note:** This is the backend repository. The frontend repository can be found [here](https://github.com/AVNSKS/wedding_planner-Frontend-.git).

---

## 🚀 Features

- **Multi-Role Authentication:** Secure JWT-based auth for both Couples and Vendors.
- **Wedding Management:** Comprehensive tools for tracking budgets, timelines, and hashtags.
- **Guest Management:** RSVP tracking, dietary requirements, and automated guest list stats.
- **Vendor Marketplace:** Booking systems, revenue tracking, and portfolio management.
- **Real-time Reminders:** Automated task and payment reminders.
- **Public Wedding Pages:** Dynamic public-facing pages for guests to view wedding details.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security:** [JWT](https://jwt.io/), [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **Email:** [Nodemailer](https://nodemailer.com/)
- **Utilities:** [UUID](https://github.com/uuidjs/uuid), [Dotenv](https://github.com/motdotla/dotenv)

---

## 📂 Project Structure

```text
.
├── src/
│   ├── config/      # Database & Mailer configurations
│   ├── controllers/ # Request handlers & Business logic
│   ├── middleware/  # Auth & Validation middlewares
│   ├── models/      # Mongoose schemas
│   ├── routers/     # API route definitions
│   └── utils/       # Helper functions & Email templates
├── docs/            # Detailed API documentation
└── server.js        # Application entry point
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AVNSKS/wedding_planner-backend-
   cd WedVow-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   CLIENT_URL=http://localhost:5173
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

---

## 🔌 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new Couple or Vendor |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/weddings/my-wedding` | Fetch wedding details for the logged-in couple |
| `GET` | `/api/guests` | List all guests for a wedding |
| `POST` | `/api/bookings` | Create a new vendor booking |
| `GET` | `/api/vendors` | Browse the vendor marketplace |

> For full documentation, see [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

---

## 🛡️ Security

- All sensitive routes are protected by JWT middleware.
- Passwords are hashed using Bcrypt with a salt factor of 10.
- CORS is configured to allow specific origins for production safety.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">Made with ❤️ for happy couples everywhere.</p>
