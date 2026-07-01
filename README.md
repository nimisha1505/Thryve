# THRYVE — Grow Through What You Go Through

A flagship, production-grade full-stack mental wellness sanctuary and emotional health platform powered by React, Node.js, and Google's Gemini AI.

THRYVE provides a safe, calming, and aesthetic digital workspace designed to help users track emotional patterns, write reflective journal entries, manage daily self-care habits, connect anonymously with a supportive community feed, and utilize deep sound therapy loops. At its core, the application integrates an empathetic AI chatbot helper with weighted analytics scorecards, moving-average mood predictors, and secure cookie-based session keys to deliver an exceptionally premium and private mental wellness dashboard.

---

## Project Highlights
- 🧠 **Context-Aware AI Companion**: Empathic chat sessions powered by Google Gemini with conversation history memory, dynamic titling, and automatic crisis redirection safeguards.
- 📊 **Dynamic Wellbeing Index**: A proprietary, multi-factor scoring engine (0–100) aggregating recent mood averages, score volatility (standard deviation), journal logs, and habits checked.
- 🔮 **WMA Next-Day Prediction**: Weighted moving average forecasting engine that projects next-day emotional states, outputs confidence percentiles, and isolates key behavioral influence triggers.
- 📅 **Interactive Wellness Heatmap**: A compact 28-day LeetCode-style activity grid visualizing daily moods, check-in history, notes, and habit progress on hover tooltips.
- 🔐 **Multi-Tier Cookie Security**: Bulletproof JWT session credentials stored inside secure, client-inaccessible, signed `HttpOnly` cookie stores with silent token refresh loops.

---

## Screenshots

*(Insert actual interface layouts and sanctuary dashboard walkthrough screens here)*

| Dashboard | Mood Tracker |
| --- | --- |
| *(Screenshot Placeholder)* | *(Screenshot Placeholder)* |
| **Personal Journal** | **Community Corner** |
| *(Screenshot Placeholder)* | *(Screenshot Placeholder)* |
| **AI Chat Companion** | **Wellness Resources** |
| *(Screenshot Placeholder)* | *(Screenshot Placeholder)* |

---

## Live Demo

| Service | Endpoint / Deployment URL |
| :--- | :--- |
| **Frontend Web App** | *(Deployment link pending)* |
| **Backend REST API** | *(Deployment link pending)* |

---

## Features

### Authentication & Security
- **Strict JWT Cookies**: User authentication relies on custom JWT access keys (`accessToken`) and refresh keys (`refreshToken`) stored in client-invisible `HttpOnly` and `SameSite=Lax` cookies.
- **Silent Session Renewal**: Front-end routing hooks silently request token extensions in the background prior to key expiration, securing continuous sessions.
- **Zod Data Sanitization**: Inputs on registration, profile edits, journal writes, and mood check-ins are validated via Zod schemas before database execution.
- **bcrypt Hashing**: Passwords are securely hashed with a salt factor of 10 prior to storage in MongoDB.

### Dashboard
- **Sanctuary Landing**: Greeted with local time-aware greetings ("Good Morning Sasha 🌼") and a randomized motivational quote.
- **Sanctuary Check-in**: A clean mood logging panel featuring 5 distinct, hover-animated emoji chips corresponding to wellness scores.
- **Stat Pills**: Clean visual badges displaying current reflection streaks, wellbeing index percentage, and habit completion stats.
- **Sanctuary Summary**: Integrates a short, text-based narrative summarizing recent logs and remaining tasks.

### Mood Tracker & Analytics
- **Granular Score Logger**: Select a wellness rating (1 to 10) matched to pre-set labels (*Struggling*, *Low*, *Okay*, *Good*, *Great*) with optional reflection notes.
- **Historical Timeline**: Search, filter, and review all previous daily logs chronologically.
- **Averages & Volatility**: Displays calculated 7-day and 30-day wellness averages.
- **Best / Worst Days**: Aggregates average mood values grouped by days of the week to reveal cyclical trends.

### Personal Journal
- **Reflective Timeline**: Private text editor supporting custom categories (e.g. *Reflections*, *Mindfulness*, *Gratitude*).
- **Interactive Calendar**: Map and browse entries directly from a calendar utility.
- **Search & Filters**: Instantly find previous reflections using full-text search, categories, or associated mood states.

### Habit Tracker
- **Positive Routines**: Add daily habits (e.g. *Drink water*, *Meditation*, *Exercise*) with custom frequencies.
- **Quick Completion**: Check off daily targets with single-click actions.
- **Streak Contribution**: Completed habits automatically boost the user's dashboard wellbeing metrics.

### AI Wellness Companion
- **Active Chat Companion**: Engaging, conversational UI to discuss thoughts, anxieties, and goals.
- **Semantic Title Generation**: Automatically creates short, appropriate conversation titles using Gemini, contextually identifying chat streams.
- **Robust Local Fallback**: When Gemini API quotas are exhausted or keys are absent, the engine falls back to supportive, preset messages to prevent app crashes.

### Community Corner
- **Support Forum**: Post encouraging messages anonymously to a shared discussion board.
- **Supportive Reactions**: React using custom icons: *Support* (❤️), *Hugs* (🤗), or *Stay Strong* (💪).
- **Comment Threads**: Exchange encouraging responses inside sub-comment feeds on individual posts.

### Wellness Resources
- **Relaxing Sound Sanctuary**: Play nature audios (Rain, Forest, Meditation, Breathing, Sleep loops) to calm the mind.
- **Resource Details**: Browse dedicated content details explaining guided mindfulness exercises.

---

## AI Features

The platform integrates Google Gemini API (`gemini-1.5-flash`) via the official `@google/generative-ai` package:
- **Reflection-Aware Conversations**: Listens empathetically and guides users using non-judgmental prompts and mindfulness routines.
- **Smart System Prompts**: Instructed with clear system constraints, explicitly clarifying it is an AI companion (not a licensed medical professional) and directing users away from clinical diagnoses.
- **Crisis Protection Guard**: Scans incoming inputs against crisis indicators (e.g., self-harm, suicidal ideation) and bypasses AI generation to immediately serve direct crisis hotline references (988 US/Canada, Samaritans UK, India support options).

---

## Analytics

THRYVE computes statistical wellness analytics directly in the database layer:
- **Proprietary Wellbeing Index**: A score (0–100) calculated by weighting:
  - Daily mood average (40%)
  - Score stability/standard deviation (20%)
  - Journaling frequency (15%)
  - Trajectory trends (15%)
  - AI companion chat volume (10%)
- **LeetCode-Style Mood Heatmap**: Renders a 28-day grid coloring cells based on mood check-ins (Sage Green for Great, Soft Peach for Good, Warm Cream for Okay, Muted Terracotta for Low/Struggling) with tooltips displaying notes and check-in stats.
- **Consecutive Activity Streaks**: Daily count of consecutive entries (logs or journals) mapped dynamically on calendar blocks.

---

## Security

THRYVE enforces robust API security protocols:
- **JWT & HttpOnly Cookies**: Credentials are stored exclusively in client-invisible cookies, nullifying Cross-Site Scripting (XSS) risks.
- **CORS & CSRF Defenses**: CORS configuration whitelists explicit frontend domains, with JSON request wrappers to protect endpoints.
- **Express Rate Limiting**: Limit API request volumes to prevent denial-of-service attempts.
- **Helmet Headers**: Configures security-focused HTTP headers to protect against web vulnerabilities.

---

## Tech Stack

### Frontend
- **Framework**: React.js, Vite
- **Styling**: Vanilla CSS Variables, Tailwind CSS
- **Routing**: React Router DOM (v7)
- **Charts & Icons**: Recharts, Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Node.js, Express.js
- **Logging & Errors**: Winston Logger, custom ApiError/ApiResponse middleware wrappers
- **Validation**: Zod Schemas

### Database
- **Provider**: MongoDB Atlas
- **Object Modeling**: Mongoose ODM

### AI Integration
- **Engine**: Google Gemini AI (`gemini-1.5-flash`)
- **SDK**: `@google/generative-ai`

---

## Architecture

```
                    React + Vite Web App (Port 5173)
                                │
                                ▼
                       Protected Router Guard
                                │
                                ▼
                           Axios Client
                                │
                     HTTPS Requests / JWT Cookies
                                │
                                ▼
                      Express API Port (5000)
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
Helmet & CORS           Rate Limiting           Zod Request Validation
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                                ▼
                       Controller Handlers
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
User Session (JWT)      Wellness Insights       Gemini AI Connector
       │                        │                        │
       ▼                        ▼                        ▼
MongoDB Database         Mongoose Models          Crisis-screening filter
```

---

## Repository Structure

```
THRYVE/
├── README.md                 # Project README instructions
├── LICENSE                   # MIT License
├── .gitignore                # Global git ignore configurations
├── package.json              # Monorepo scripts and dependencies
│
├── backend/                  # REST API server code
│   ├── src/                  # Server source
│   │   ├── controllers/      # Route handler controllers
│   │   ├── db/               # MongoDB driver connection setup
│   │   ├── middlewares/      # Authentication, CORS, error interceptors
│   │   ├── models/           # Mongoose schemas (User, Mood, Habit, Journal, Post)
│   │   ├── routes/           # REST Route configurations
│   │   ├── services/         # Custom services (git placeholder)
│   │   ├── utils/            # Winston loggers, custom error wrappers
│   │   └── app.js            # Express application setup
│   ├── tests/                # Custom API verification scripts
│   ├── scripts/              # Relocated developer utility scripts
│   │   ├── dns_test.js
│   │   ├── list_users.js
│   │   ├── test_local_mongo.js
│   │   └── verify_auth.js
│   ├── .env.example          # Server environment templates
│   ├── package.json          # Backend-specific package scripts
│   └── README.md             # Backend architecture details
│
├── frontend/                 # Vite client code
│   ├── public/               # Static icons, web manifest files
│   ├── src/                  # Client source
│   │   ├── assets/           # Client assets
│   │   ├── components/       # Custom React widgets & SVGs
│   │   ├── context/          # Global AuthContext providers
│   │   ├── hooks/            # Session helper hooks
│   │   ├── layouts/          # DashboardLayout container shells
│   │   ├── pages/            # View pages (Dashboard, Mood, AIChat, Journal)
│   │   ├── routes/           # Client protected/public router gates
│   │   ├── services/         # API fetch calls (axios wrappers)
│   │   ├── App.css           # Global component CSS rules
│   │   ├── App.jsx           # Root layout router setup
│   │   ├── index.css         # Global design tokens and styles
│   │   └── main.jsx          # Vite entrypoint renderer
│   ├── .env.example          # Client environment templates
│   ├── package.json          # Frontend-specific package scripts
│   └── README.md             # Vite template reference
│
└── docs/                     # Documentation files
    ├── architecture.md       # Directory architecture detail overview
    ├── api.md                # Route specifications and endpoints
    └── screenshots/          # Empty gitkeep folder placeholder
```

---

## Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB Community server)
- Google Gemini API Key (obtainable from Google AI Studio)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/THRYVE.git
   cd THRYVE
   ```
2. Install all dependencies across the monorepo:
   ```bash
   npm run install:all
   ```

### Environment Variables

#### Backend (`backend/.env`)
Create `backend/.env` matching the templates:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/thryve
JWT_SECRET=your_jwt_access_secret_128bitkey
JWT_REFRESH_SECRET=your_jwt_refresh_secret_256bitkey
GEMINI_API_KEY=your_google_gemini_api_studio_key
```

#### Frontend (`frontend/.env`)
Create `frontend/.env` matching the templates:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Running Locally
To launch both client and server concurrently, run:
```bash
npm run dev
```
- **Vite Web App**: [http://localhost:5173/](http://localhost:5173/)
- **Express Server**: [http://localhost:5000/](http://localhost:5000/)

### Testing
To run backend verification checks, execute:
```bash
npm run test
```

### Production Build
To generate production-ready client bundles inside `frontend/dist/`, run:
```bash
npm run build
```

---

## Future Enhancements
- 📈 **Emotion Analysis Trends**: Run natural language processing on journal entries to trace emotional keywords.
- ⏰ **In-App Notifications**: Support daily push alerts for meditation reminders and reflection habits.
- 📱 **PWA Integration**: Convert the frontend workspace into a progressive web application for native mobile access.
- 🌐 **Internationalization**: Implement multilingual support for localized mindfulness content.

---

## Why THRYVE?
THRYVE is engineered to transcend basic web app patterns by combining deep backend security protocols (multi-tier token rotation, rate limits, request verification) with complex database aggregations and artificial intelligence. Rather than relying on static dashboard visuals, THRYVE computes standard deviation curves to score emotional volatility, structures a 28-day LeetCode-style check-in tracker from MongoDB logs on the fly, and screens live text streams for crisis safety triggers prior to dispatching Gemini tokens. The resulting platform demonstrates a cohesive, clean-architecture approach to developing full-stack MERN products.

---

## Contributing
Contributions are welcome. Feel free to fork the repository, open issue threads, or submit a Pull Request.

---

## License
Licensed under the [MIT License](LICENSE).

---

## Author
**Nimisha Agarwal**  
*B.Tech Computer Science Engineering*  
*Institute of Engineering & Technology (IET), DAVV, Indore*  
*GitHub: [nimisha1505](https://github.com/nimisha1505)*  
