# THRYVE: Grow Through What You Go Through

THRYVE is a compassionate, premium self-care and mental health sanctuary platform. It provides tools for daily mood check-ins, reflective journaling, habits tracking, an empathetic AI chat companion powered by Gemini, emotional insights, community support, and sound therapy resources to anchor and support wellness journeys.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Recharts, HTML5, CSS3.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, Zod Validation, Winston Logging.
- **AI Integration**: Google Gemini API via `@google/generative-ai`.
- **Security & Rate Limiting**: bcryptjs, JSON Web Tokens (JWT) with HttpOnly cookies, Express Rate Limit, Helmet.

---

## Features
1. **Sanctuary Dashboard**: A warm, welcoming view displaying user wellness metrics (current streak, wellbeing score, habit completion rate, consistency heatmap) and a daily mood check-in.
2. **Mood Tracker**: Sentiment analytics, interactive charts, and logs detailing daily emotional patterns.
3. **Reflective Journal**: A private markdown-supported writing space to anchor feelings and insights.
4. **AI Companion**: Generative chatbot assistant that listens, analyzes entries (when requested), and offers supportive guidance.
5. **Habit Tracker**: Daily positive routines that users can check off to build wellness streaks.
6. **Community Corner**: An anonymous post feed to exchange words of hope, encouragement, and strength with others.
7. **Moments of Calm**: Nature loops and meditative audios to reduce anxiety and stress.

---

## Repository Structure

```
THRYVE/
├── README.md                 # Main project instructions
├── LICENSE                   # MIT License
├── .gitignore                # Global git ignore configurations
├── package.json              # Monorepo scripts and dependencies
│
├── backend/                  # Express REST API
│   ├── src/                  # Express controllers, services, models, routes
│   ├── tests/                # Jest integration and unit tests
│   ├── scripts/              # Developer utility and DB check scripts
│   ├── .env.example          # Template environment configurations
│   ├── package.json          # Backend-specific package scripts
│   └── README.md             # Backend architecture details
│
├── frontend/                 # Vite + React Single Page App
│   ├── public/               # Static assets & files
│   ├── src/                  # React UI components, page layouts, services
│   ├── .env.example          # Template client environment configurations
│   ├── package.json          # Frontend-specific package scripts
│   └── README.md             # Vite template reference
│
└── docs/                     # Architectural and API documentation
    ├── architecture.md       # High-level component description
    ├── api.md                # Endpoint documentation reference
    └── screenshots/          # Design walkthrough assets
```

---

## Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas instance URI)

### 2. Installation
From the root workspace folder, run:
```bash
npm run install:all
```
This restores top-level dev dependencies, backend packages, and frontend clients.

### 3. Environment Setup

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory referencing `backend/.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory referencing `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Running the Project Locally
To run both backend and frontend servers simultaneously in development mode, run:
```bash
npm run dev
```
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Frontend SPA**: [http://localhost:5173](http://localhost:5173)

---

## Testing & Verification
- **Run Backend Tests**: `npm run test`
- **Build Frontend Bundle**: `npm run build`

---

## Screenshots
*(Insert interface walkthrough and premium visual sanctuary designs here)*
