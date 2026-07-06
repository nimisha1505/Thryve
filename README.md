# THRYVE — Grow Through What You Go Through

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=google&logoColor=white)
![JWT Authentication](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

THRYVE is a full-stack mental wellness application and emotional health platform engineered using the MERN stack (React, Node.js, Express, MongoDB) and Google Gemini AI. Designed for individuals seeking a structured and private space to monitor their mental wellbeing, THRYVE enables users to track emotional patterns, maintain reflective journals, build self-care habits, and engage anonymously in a supportive community forum. By integrating Google's Gemini AI, the platform provides context-aware conversational guidance, automated sentiment insights, and intelligent habit recommendations, offering an active digital companion to help users understand their behavioral trends and navigate daily emotional challenges.

---

## 🌐 Live Project

Access the live production instances of the THRYVE platform using the links below:

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [https://thryve-tau.vercel.app](https://thryve-tau.vercel.app) |
| **Backend REST API** | Render | [https://thryve-backend-e8qn.onrender.com](https://thryve-backend-e8qn.onrender.com) |
| **GitHub Repository** | GitHub | [https://github.com/nimisha1505/Thryve](https://github.com/nimisha1505/Thryve) |

---

## ✨ Key Features

- **🔐 Secure JWT Authentication**: Robust user session security using HttpOnly cookies with automated refresh token rotation.
- **🧠 Google Gemini AI Companion**: Context-aware wellness chat sessions with persistent memory, dynamic title generation, and robust local fallbacks.
- **📊 Mood Tracking**: Granular emotional state logging with timeline filters, daily notes, and statistical summaries.
- **📝 Reflective Journaling**: Private markdown-friendly text editor with custom categorization, date filtering, and text search.
- **📅 Habit Tracker**: Custom routine creation with streak tracking, frequency management, and wellness metrics contribution.
- **📈 Interactive Analytics**: Multi-factor wellbeing scoring, weekly activity trends, and LeetCode-style activity heatmaps.
- **💬 Community Support**: Anonymous support forum with post comment threads and quick empathy reactions.
- **🎵 Wellness Resources**: Ambient nature audio looping system and guided mindfulness instructions.
- **📱 Responsive UI**: Responsive interface tailored for both desktop displays and mobile screen layouts.
- **🚀 Production Deployment**: Automated continuous integration and deployment pipelines using Vercel (frontend) and Render (backend).

---

## 🧠 Project Highlights

- 🧠 **Context-Aware AI Companion**: Stateful chat sessions integrated with Google Gemini API (`gemini-2.5-flash`) using thread history tracking, automated title generation, and crisis keyword interception safeguards.
- 📊 **Weighted Wellbeing Index**: Algorithmic wellness scoring engine (0–100) computed in real-time by weighting recent mood averages, score volatility (standard deviation), journaling frequency, and habit completion rates.
- 🔮 **WMA Next-Day Prediction**: Weighted moving average forecasting model projecting next-day emotional trends with confidence scores based on activity frequency and mood trajectory patterns.
- 📅 **Interactive Wellness Heatmap**: Dynamic 28-day grid visualizing daily moods, check-in notes, and habit logs using color-coded CSS states and tooltips.
- 🔐 **Secure Session Credentials**: JWT-based session state management utilizing secure, client-inaccessible `HttpOnly` and `SameSite=Lax` cookie storage with background silent refresh loops.

---

## 📸 Screenshots

<!-- Note: Recommended screenshot resolution is 1920x1080 for desktop layouts and 1080x1920 for mobile views. Store images in the 'docs/screenshots/' directory. -->

| Dashboard | Mood Tracker |
| --- | --- |
| <!-- INSERT SCREENSHOT: docs/screenshots/dashboard.png (Dashboard overview showing widgets, wellbeing score, and streaks) --> ![Dashboard Placeholder](https://via.placeholder.com/600x338?text=THRYVE+Dashboard+Mockup) | <!-- INSERT SCREENSHOT: docs/screenshots/mood_tracker.png (Mood logger and historical check-in timeline) --> ![Mood Tracker Placeholder](https://via.placeholder.com/600x338?text=THRYVE+Mood+Tracker+Mockup) |
| **Personal Journal** | **Community Corner** |
| <!-- INSERT SCREENSHOT: docs/screenshots/journal.png (Reflective journal editor and calendar view) --> ![Journal Placeholder](https://via.placeholder.com/600x338?text=THRYVE+Journal+Mockup) | <!-- INSERT SCREENSHOT: docs/screenshots/community.png (Support forum feed and commenter threads) --> ![Community Corner Placeholder](https://via.placeholder.com/600x338?text=THRYVE+Community+Forum+Mockup) |
| **AI Chat Companion** | **Wellness Resources** |
| <!-- INSERT SCREENSHOT: docs/screenshots/ai_companion.png (Empathetic AI conversation interface) --> ![AI Companion Placeholder](https://via.placeholder.com/600x338?text=THRYVE+AI+Companion+Mockup) | <!-- INSERT SCREENSHOT: docs/screenshots/resources.png (Nature audio loops and guided mindfulness articles) --> ![Wellness Resources Placeholder](https://via.placeholder.com/600x338?text=THRYVE+Wellness+Resources+Mockup) |

---

## 🚀 Deployment

The platform is designed with a decoupled architecture and is fully deployed to production hosting services:

- **Frontend**: Hosted on [Vercel](https://vercel.com/) with automated preview deployments from GitHub commits.
- **Backend API**: Hosted on [Render](https://render.com/) running as a long-running web service connected to continuous integration pipelines.
- **Database**: Fully managed [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) cluster with secure IP access controls.
- **AI Core**: Powered by Google Generative AI using the [Gemini API](https://ai.google.dev/) configured via environment credentials.

---

## 🛠 Tech Stack

### Frontend
- **Library**: React.js (v19)
- **Bundler**: Vite (v8)
- **Styling**: Tailwind CSS & Custom CSS Variables (Vanilla CSS)
- **Routing**: React Router DOM (v7)
- **State & Data Fetching**: React Context API & Axios
- **Visualization**: Recharts & Lucide React

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Validation**: Zod Schemas
- **Logging**: Winston Logger

### Database
- **Provider**: MongoDB (Atlas Cloud)
- **Object Modeling**: Mongoose ODM

### Authentication
- **Mechanism**: JSON Web Tokens (JWT)
- **Storage**: Secure HTTP-Only Cookies (accessToken, refreshToken)
- **Hashing**: bcryptjs

### AI
- **Engine**: Google Gemini AI (`gemini-2.5-flash`)
- **SDK**: `@google/generative-ai` (v0.24)

### Deployment
- **Client Hosting**: Vercel
- **Server Hosting**: Render
- **Database Hosting**: MongoDB Atlas Cloud Cluster

### Developer Tools
- **Linter**: Oxlint
- **Process Manager**: Nodemon
- **API Testing**: Supertest & Jest

---

## 🔒 Security Features

THRYVE implements multi-layer defense mechanisms to protect user data and secure APIs:

- **JWT Session Tokens**: Incorporates dual-token authentication structure utilizing short-lived access tokens (`15m`) and longer-lived refresh tokens (`7d`) to limit replay attack windows.
- **HttpOnly & SameSite Cookies**: JWT tokens are transmitted solely via `HttpOnly`, `Secure` (in production), and `SameSite=Lax` cookies, preventing unauthorized access from client-side scripts and neutralizing Cross-Site Scripting (XSS) extraction vectors.
- **Password Hashing**: User credentials are encrypted at rest using `bcryptjs` with an adaptive workload salt factor of `10` before insertion into the database.
- **Helmet Middleware**: Express server is hardened using `helmet` headers to set security controls, disabling DNS prefetching, sniffing attacks, and enforcing Clickjacking defense.
- **API Rate Limiting**: Employs global request limiting configurations (`express-rate-limit`) to prevent brute-force attacks and denial-of-service (DoS) attempts.
- **Zod Schema Validation**: Sanitizes all input payloads (registration, logins, mood tracker logs, journal logs) at the server border, rejecting malformed requests prior to database executions.
- **Strict CORS Policies**: Cross-Origin Resource Sharing (CORS) is configured to explicitly whitelist client origins, blocking unauthorized cross-domain fetch attempts.
- **Environment Separation**: Sensitive credentials (API keys, database strings, signatures) are fully decoupled from version control and loaded dynamically.
- **Protected Routes & Middleware**: Both frontend views and backend REST controllers enforce route guards, validating cookies and access states before returning resources.

---

## 📊 Analytics Engine

THRYVE includes an integrated analytics engine that runs directly in the backend and database layer to synthesize wellness logs into feedback loops:

1. **Wellbeing Index Calculation**: Formulates a weighted wellness score (0–100) aggregating:
   - **Mood Average (40%)**: The base level of logged mood ratings over the past month.
   - **Mood Volatility (20%)**: Standard deviation metric evaluating emotional score fluctuations.
   - **Journal Frequency (15%)**: Active self-reflection rates calculated from journal database entries.
   - **Mood Trajectory Trends (15%)**: Weighted moving average trend lines measuring path updates.
   - **AI Companion Engagement (10%)**: Chat volume records with the AI helper.
2. **Habit-Mood Correlation**: Explores behavioral impacts by cross-referencing habit completions against daily mood log averages, calculating whether specific routines correlate with positive emotional outcomes.
3. **Contribution Heatmap**: Dynamically builds a 28-day LeetCode-style check-in grid displaying logged data using color states (sage green, peach, terracotta) with tooltips displaying notes.
4. **Weekly Trend Analysis**: Aggregates mood scores grouped by days of the week, helping users isolate weekly triggers or cycles.
5. **AI Insights Generator**: Generates customized wellness recommendation structures (actions, prompts, habit adjustments) using Google Gemini (`gemini-2.5-flash`) by reading raw, structured logs of the past 30 days.

---

## 🏗 Architecture

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

### Request Execution Flow
The path of an API request through the system is structured as follows:
1. **Browser**: User initiates an interaction on the React web client.
2. **React**: Application state updates, invoking corresponding actions.
3. **Axios**: Dispatches an asynchronous HTTP request containing credentials (secure cookies).
4. **Express**: The backend router maps the URL endpoint to its registered route handler.
5. **JWT Middleware**: Validates the session state by parsing client-invisible HttpOnly cookies, rejecting unauthenticated requests.
6. **Controllers**: Coordinates the execution logic (e.g. validating payload, fetching datasets, calculations).
7. **MongoDB**: Performs queries, reads/writes via Mongoose models.
8. **Gemini API**: Invoked contextually by the controller when smart features (insights, chat responses, title generation) are needed.

---

## 📂 Repository Structure

```
THRYVE/
├── README.md                 # Project primary configuration and overview
├── LICENSE                   # MIT License
├── .gitignore                # Global git ignore rules
├── package.json              # Monorepo workspace orchestration settings
│
├── backend/                  # REST API server code
│   ├── src/                  # Server source files
│   │   ├── controllers/      # Route handler controllers (business logic)
│   │   ├── db/               # MongoDB driver connection configuration
│   │   ├── middlewares/      # Express middleware utilities (auth, CORS, validation)
│   │   ├── models/           # Mongoose schemas (User, Mood, Habit, Journal, Post)
│   │   ├── routes/           # REST API endpoint route definitions
│   │   ├── services/         # Custom database helper services
│   │   ├── utils/            # Shared utilities (Winston logger, API error classes)
│   │   └── app.js            # Express server initialization setup
│   ├── tests/                # Automated verification and integration scripts
│   ├── scripts/              # Developer utility and database seeding scripts
│   ├── .env.example          # Server environment variable template
│   ├── package.json          # Backend project dependencies and scripts
│   └── README.md             # Backend detailed developer instructions
│
├── frontend/                 # React client application code
│   ├── public/               # Static public assets (icons, web manifests)
│   ├── src/                  # Client source code
│   │   ├── assets/           # UI images and styling resources
│   │   ├── components/       # Reusable React components and SVGs
│   │   ├── context/          # React AuthContext global state providers
│   │   ├── hooks/            # Custom React helper hooks
│   │   ├── layouts/          # Container layout components (DashboardLayout)
│   │   ├── pages/            # View pages (Dashboard, MoodTracker, AIChat, Journal)
│   │   ├── routes/           # React Router route definitions and guards
│   │   ├── services/         # Axios API connection endpoints
│   │   ├── App.css           # Global custom CSS rules
│   │   ├── App.jsx           # Root router definition component
│   │   ├── index.css         # Typography, global variables, and Tailwind base imports
│   │   └── main.jsx          # React renderer entrypoint
│   ├── .env.example          # Frontend environment variables template
│   ├── package.json          # Frontend project dependencies and scripts
│   └── README.md             # Frontend detailed setup instructions
│
└── docs/                     # Global project design documentation
    ├── architecture.md       # Directory architecture detail overview
    ├── api.md                # API route and parameter specifications
    └── screenshots/          # Application screenshot directory
```

---

## ⚙ Environment Variables

To run THRYVE locally, you need to configure the following environment files in their respective folders:

### Backend Configuration (`backend/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Local server port for Express application | `5000` |
| `NODE_ENV` | Running node environment state | `development` |
| `CLIENT_ORIGIN` | Allowed client URL origin for CORS policy | `http://localhost:5173` |
| `MONGODB_URI` | Connection URI string for MongoDB database instance | `mongodb+srv://<user>:<password>@cluster.mongodb.net/thryve` |
| `JWT_SECRET` | Secret signature key for JWT access tokens (128-bit) | `your_jwt_access_secret_key_128bit` |
| `JWT_LIFETIME` | Lifespan duration for active JWT access tokens | `15m` |
| `JWT_REFRESH_SECRET` | Secret signature key for JWT refresh tokens (256-bit) | `your_jwt_refresh_secret_key_256bit` |
| `JWT_REFRESH_LIFETIME`| Lifespan duration for JWT refresh tokens | `7d` |
| `RATE_LIMIT_WINDOW_MS`| Rate limit time window duration in milliseconds | `900000` |
| `RATE_LIMIT_MAX_REQUESTS`| Max request rate allowed per window per IP | `100` |
| `GEMINI_API_KEY` | Google AI Studio developer API Key for Gemini | `AIzaSyD...` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base REST API server URL endpoint | `http://localhost:5000/api/v1` |

---

## 🛠 Skills Demonstrated

This project demonstrates proficiency across the following technical skill areas:

- **Full-Stack Development**: MERN application orchestration, client-server decoupling, and monorepo script workflows.
- **AI API Integration**: Google Gemini integration using `@google/generative-ai` SDK, custom prompt engineering, conversation memory, and crash-proof local fallback strategies.
- **RESTful API Engineering**: Clean router-controller-model patterns in Express with consistent JSON structures (`ApiError`, `ApiResponse`).
- **Data Modeling & Modeling Tools**: Schema definitions, indexes, validation rules, and relational references using Mongoose ODM.
- **Session Security & Cryptography**: Advanced JWT session management with HttpOnly cookies, silent token refresh loops, and `bcryptjs` password hashing.
- **Frontend State & Routing**: Global application states (React Context), session hooks, and protected route routing blocks.
- **Data Analysis & Visualization**: Real-time statistical computations (moving averages, standard deviation) and charting using Recharts.
- **Responsive Layout Design**: CSS variables, media queries, and Tailwind CSS.
- **API Performance & Reliability**: Global request rate limiting, input sanitation (Zod), and structured Express error handler middleware.
- **CI/CD & DevOps**: Deployment management across cloud hosting platforms (Vercel, Render, MongoDB Atlas).
- **Source Control & Git workflows**: Monorepo structuring, configuration templates, and commit management.

---

## ⚠ Known Limitations

- **Render Free Tier Cold Starts**: Since the backend is hosted on Render's free tier, the web service enters an idle state after inactivity. Initial API calls may experience a latency of 50–90 seconds while the container spins back up.
- **Gemini Free Tier Rate Limits**: Google Gemini API is bound to free-tier quotas (e.g. requests per minute/day limits). If exceeded, the backend gracefully falls back to structured offline responses to preserve app stability.
- **Basic Keyword Moderation**: Safety screening in chat sessions uses local keyword patterns to detect crisis events. It is not a replacement for a clinical evaluation or an active NLP moderation service.

---

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB Community server)
- Google Gemini API Key (obtainable from Google AI Studio)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/nimisha1505/Thryve.git
   cd THRYVE
   ```
2. Install all dependencies across the monorepo:
   ```bash
   npm run install:all
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

## 🔮 Future Enhancements

- 📈 **Emotion & Sentiment Detection**: Run Natural Language Processing (NLP) models on journal entries to extract emotional tags and sentiment trends automatically.
- 📱 **Progressive Web App (PWA)**: Implement service workers and manifest profiles to enable offline support and native app installation experiences on mobile devices.
- ⏰ **Push Notifications**: Enable daily reminders for habit completions, mindfulness exercises, and journal reflections.
- 🎙 **Voice Journaling**: Integrate Speech-to-Text APIs to allow users to log journal entries via voice recordings.
- ⌚ **Wearable Device Integration**: Import biometric sleep and heart rate data from fitness devices (Apple Health, Fitbit) to correlate physical metrics with logged mood scores.
- 📊 **Administrative Dashboard**: Provide an analytical portal for administrators to monitor engagement indices and manage anonymous community post listings.
- 🌐 **Multi-Language Support**: Localize the platform's user interface and mindfulness resources for multiple languages.

---

## 💡 Why THRYVE?

THRYVE is engineered to transcend basic web app patterns by combining deep backend security protocols (multi-tier token rotation, rate limits, request verification) with complex database aggregations and artificial intelligence. Rather than relying on static dashboard visuals, THRYVE computes standard deviation curves to score emotional volatility, structures a 28-day LeetCode-style check-in tracker from MongoDB logs on the fly, and screens live text streams for crisis safety triggers prior to dispatching Gemini tokens. The resulting platform demonstrates a cohesive, clean-architecture approach to developing full-stack MERN products.

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository, open issue threads, or submit a Pull Request.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## ✒ Author

**Nimisha Agarwal**
- **Degree**: Bachelor of Technology (B.Tech) in Computer Science & Engineering
- **College**: Institute of Engineering & Technology (IET), DAVV, Indore
- **GitHub**: [@nimisha1505](https://github.com/nimisha1505)
- **LinkedIn**: [linkedin.com/in/nimisha-agarwal-placeholder](https://linkedin.com)
- **Email**: [agarwalnimisha1505@gmail.com](mailto:agarwalnimisha1505@gmail.com)
