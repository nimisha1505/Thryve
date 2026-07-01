# THRYVE Backend REST API Specification

This document lists all active REST API routes, methods, payloads, and structures available on the THRYVE backend service.

## Global Headers & Authentication
- **Content-Type**: `application/json`
- **Session Auth**: State is managed via secure, client-inaccessible `HttpOnly` JWT cookie credentials (`accessToken` & `refreshToken`).

---

## 1. Authentication Endpoints
Base path: `/api/v1/auth`

### POST `/register`
Registers a new user account.
- **Payload**:
  ```json
  {
    "name": "Sasha",
    "email": "sasha@example.com",
    "password": "password123",
    "bio": "Reflective thinker"
  }
  ```
- **Response (201 Created)**: Success envelope containing registered user data.

### POST `/login`
Authenticates credentials and sets session cookies.
- **Payload**:
  ```json
  {
    "email": "sasha@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**: Success envelope with user details.

### POST `/logout`
Clears session cookies and terminates connection.
- **Response (200 OK)**: Successful cookie deletion message.

---

## 2. Mood Logging Endpoints
Base path: `/api/v1/moods`

### GET `/`
Retrieves paginated history of user mood logs.
- **Query Params**: `page` (default `1`), `limit` (default `10`).

### POST `/`
Creates a daily check-in log.
- **Payload**:
  ```json
  {
    "moodScore": 8,
    "moodTags": ["Hopeful", "Calm"],
    "notes": "Had a relaxing walking session by the lake."
  }
  ```

### GET `/stats`
Returns aggregated stats including 7-day average, total logs, and streak counts.

---

## 3. Reflection Journal Endpoints
Base path: `/api/v1/journal`

### GET `/`
Retrieves journal entries.

### POST `/`
Creates a reflective entry.
- **Payload**:
  ```json
  {
    "title": "Morning Serenity",
    "content": "Woke up feeling grounded. The coffee was warm..."
  }
  ```

### GET `/stats`
Returns total logs and journal streaks.

---

## 4. Habit Tracking Endpoints
Base path: `/api/v1/habits`

### GET `/`
Retrieves user habits.

### POST `/`
Creates a custom habit to track.
- **Payload**:
  ```json
  {
    "name": "Water plants",
    "frequency": "daily"
  }
  ```

### POST `/:id/toggle`
Toggles habit completion state for the current date.

---

## 5. Community Corners
Base path: `/api/v1/community`

### GET `/posts`
Retrieves anonymous posts from other users.

### POST `/posts`
Creates a post on the support forum.
- **Payload**:
  ```json
  {
    "title": "You are not alone",
    "content": "Sending love to anyone struggling today.",
    "moodTag": "Calm"
  }
  ```

### POST `/posts/:id/react`
Reacts to an anonymous post.
- **Payload**:
  ```json
  {
    "reactionType": "support" // "support" | "hug" | "stayStrong"
  }
  ```

---

## 6. Moments of Calm Resources
Base path: `/api/v1/resources`

### GET `/`
Retrieves relaxation audios, nature sounds, and guide assets.

### GET `/:id`
Retrieves specific resource details.
