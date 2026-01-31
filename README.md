# 🚀 Project Setup Guide - Aurasync

This repository contains both the **frontend** and **backend** for the project. Follow the steps below to run the entire application locally.

---

## 📦 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18.20.8 and V20.20.0)
- **npm** (comes with Node.js)
- **Git**

---

## 📁 Project Structure

```text
root
├── backend
├── docs
├── extension
├── frontend
└── README.md
```

---

## 🔧 Backend Setup

### 1️⃣ Navigate to the backend directory

```bash
cd backend

```

### 2️⃣ Install backend dependencies

```bash
npm install
npm run first
```

*Note: This command installs all required backend libraries.*

### 3️⃣ Setup environment variables

Create a `.env` file using the example:

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

```env
PORT=3000
---------------------Ask In Messages-------------------
# Api endpoints
ONBOARDING_API=

# Ask the maintainer for the shared dev MongoDB URI
MONGODB_URL=

# Gemini API key (use your own or the shared one)
GEMINI_API_KEY=
```

> 🔐 **Note:** `.env` files are not committed to GitHub. Ask the project maintainer for required secrets.

### 4️⃣ Start the backend server

```bash
npm run dev
```

If successful, you should see logs similar to:
`DB Connected`

`Server listening on port 3000`

**Backend runs at:** `http://localhost:3000`

---

## 🎨 Frontend Setup

### 1️⃣ Navigate to the frontend directory

```bash
cd ../frontend
```

### 2️⃣ Install frontend dependencies

```bash
npm install
npm run first
```

*This command installs all required frontend libraries (React, Tailwind, lucide-react, etc.).*

### 3️⃣ Start the frontend development server

```bash
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 🔁 Running the Project

1. Start the **backend** first.
2. Then start the **frontend**.
3. Frontend communicates with backend at `http://localhost:3000`.

---

## 🧪 Common Issues

❓ **404 Error on onboarding API**

* Ensure `.env` contains: `ONBOARDING_API`
* Restart the backend after editing `.env`

❓ **MongoDB connection issues**

* Ensure `MONGODB_URL` is set correctly.
* Ask the maintainer for the shared development database URI.

---

## 🧠 Notes for Collaborators

* **Do NOT commit .env files.**
* **Write Secrets in `.env` file NOT IN `.env.example.`**
* Always use `.env.example` as a reference.
* You **do NOT** need to install React or Fastify globally; all dependencies are handled via npm scripts.

---

## ✅ Tech Stack

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Fastify
* **Database:** MongoDB
* **AI:** Gemini API

---

## 🎯 Ready to Go

Once both servers are running, the project should be fully functional. If anything breaks, double-check your Node.js version and `.env` values.

**Happy hacking! 🚀**