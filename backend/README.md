# THRYVE Backend Service

This directory houses the backend codebase for THRYVE: Grow Through What You Go Through.

## Backend Architecture Pattern
This service is structured using a Layered Controller-Service-Repository architecture on top of Express.js:
- `src/config/`: Configuration setup for database connections, third-party API clients, and application keys.
- `src/models/`: Mongoose schemas outlining validation rules, data validation, and index structures.
- `src/controllers/`: Receives incoming HTTP requests, performs parameter checks, and hands requests over to the service layer.
- `src/services/`: Hosts core business rules (e.g., scoring sentiment, computing wellness analytics, communicating with Gemini API).
- `src/middlewares/`: Express interceptors for security guards, session validation (JWT parsing), rate limitation (daily prompt locks), and global error handlers.
- `src/routes/`: Route bindings connecting HTTP requests to controller operations.
- `src/utils/`: Standardized format helpers, global loggers, and time helpers.
